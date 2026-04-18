export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      commerceName, commerceTypeId, commerceTypeName, phone,
      address, city, postalCode, zone,
      managerName, email, password,
    } = body;

    // Validation
    if (!email || !password || !commerceName || !phone || !address) {
      return NextResponse.json({ ok: false, error: "Champs requis manquants." }, { status: 400 });
    }

    // 1. Créer le compte Firebase Auth via Admin SDK
    let uid: string;
    try {
      const user = await adminAuth.createUser({
        email: email.trim(),
        password,
        displayName: managerName.trim(),
      });
      uid = user.uid;
    } catch (e: unknown) {
      const code = (e as { code?: string }).code;
      if (code === "auth/email-already-exists") {
        return NextResponse.json({ ok: false, error: "Ce courriel est déjà utilisé." }, { status: 400 });
      }
      throw e;
    }

    // 2. Créer le document store dans Firestore
    const storeRef = adminDb.collection("stores").doc(uid);
    await storeRef.set({
      id: uid,
      name: commerceName.trim(),
      commerceTypeId: commerceTypeId || "",
      commerceTypeName: commerceTypeName || "",
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
      zoneName: zone || "",
      ownerName: managerName.trim(),
      ownerEmail: email.trim(),
      ownerId: uid,
      status: "pending",
      isOpen: false,
      rating: 0,
      totalOrders: 0,
      totalRevenue: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // 3. Créer le document app_users
    await adminDb.collection("app_users").doc(uid).set({
      uid,
      email: email.trim(),
      role: "store_owner",
      primary_role: "store_owner",
      storeId: uid,
      storeName: commerceName.trim(),
      display_name: managerName.trim(),
      status: "active",
      createdAt: FieldValue.serverTimestamp(),
    });

    // 4. Mettre les custom claims
    await adminAuth.setCustomUserClaims(uid, { role: "store_owner", storeId: uid });

    return NextResponse.json({
      ok: true,
      uid,
      message: "Compte créé avec succès. En attente de validation."
    });

  } catch (e) {
    console.error("[store signup]", e);
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
