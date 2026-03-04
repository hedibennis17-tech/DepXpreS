export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/firestore-serialize";

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });
  try {
    // Lire les deux collections et fusionner
    const [profileDoc, userDoc] = await Promise.all([
      adminDb.collection("client_profiles").doc(uid).get(),
      adminDb.collection("app_users").doc(uid).get(),
    ]);

    const profileData = profileDoc.exists ? serializeDoc(profileDoc.data()!) : {};
    const userData = userDoc.exists ? serializeDoc(userDoc.data()!) : {};

    // Fusionner avec priorité à client_profiles, fallback sur app_users
    const merged = {
      id: uid,
      uid,
      // Nom
      display_name: profileData.display_name || profileData.full_name || userData.display_name || `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || "",
      first_name: profileData.first_name || userData.first_name || "",
      last_name: profileData.last_name || userData.last_name || "",
      // Contact
      email: profileData.email || userData.email || "",
      phone: profileData.phone || userData.phone || "",
      // Photo
      photo_url: profileData.photo_url || profileData.photoURL || userData.photo_url || "",
      // Adresse
      default_address: profileData.default_address || profileData.defaultAddress || "",
      // Stats
      total_orders: Number(profileData.total_orders || profileData.totalOrders || 0),
      total_spent: Number(profileData.total_spent || profileData.totalSpent || 0),
      loyalty_points: Number(profileData.loyalty_points || profileData.loyaltyPoints || 0),
      wallet_balance: Number(profileData.wallet_balance || profileData.walletBalance || 0),
      // Statut
      status: profileData.status || userData.status || "active",
      is_email_verified: Boolean(profileData.is_email_verified || profileData.isEmailVerified || userData.is_email_verified || false),
      // Dates
      created_at: profileData.created_at || profileData.createdAt || userData.created_at || userData.createdAt || "",
    };

    return NextResponse.json(merged);
  } catch (err) {
    console.error("Profile GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, display_name, phone, default_address, ...rest } = body;
    if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });

    const now = new Date().toISOString();
    const profileRef = adminDb.collection("client_profiles").doc(uid);
    const userRef = adminDb.collection("app_users").doc(uid);

    const profileSnap = await profileRef.get();
    const userSnap = await userRef.get();

    const profileUpdate: Record<string, unknown> = { updatedAt: now };
    const userUpdate: Record<string, unknown> = { updated_at: now };

    if (display_name !== undefined) {
      profileUpdate.full_name = display_name;
      profileUpdate.display_name = display_name;
      userUpdate.display_name = display_name;
    }
    if (phone !== undefined) {
      profileUpdate.phone = phone;
      userUpdate.phone = phone;
    }
    if (default_address !== undefined) {
      profileUpdate.default_address = default_address;
    }

    // Mettre à jour les deux collections
    const batch = adminDb.batch();
    if (profileSnap.exists) {
      batch.update(profileRef, profileUpdate);
    } else {
      batch.set(profileRef, { uid, role: "client", status: "active", createdAt: now, ...profileUpdate });
    }
    if (userSnap.exists) {
      batch.update(userRef, userUpdate);
    }
    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Profile PUT error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
