export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/firestore-serialize";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "25");

    // Récupérer les profils clients
    let query: FirebaseFirestore.Query = adminDb.collection("client_profiles");
    if (status) query = query.where("status", "==", status);
    const snap = await query.get();

    // Récupérer aussi les app_users pour les clients qui n'ont pas de client_profile complet
    const appUsersSnap = await adminDb.collection("app_users")
      .where("primary_role", "==", "client")
      .get();
    const appUsersMap: Record<string, Record<string, unknown>> = {};
    appUsersSnap.docs.forEach(doc => {
      appUsersMap[doc.id] = serializeDoc(doc.data());
    });

    // Fusionner les données
    let clients = snap.docs.map((doc) => {
      const d = serializeDoc(doc.data());
      const appUser = appUsersMap[doc.id] || {};

      // Normaliser les champs (supporter les deux formats camelCase et snake_case)
      const firstName = (d.firstName || d.first_name || (appUser.first_name as string) || "").toString();
      const lastName = (d.lastName || d.last_name || (appUser.last_name as string) || "").toString();
      const fullName = (d.fullName || d.full_name || d.display_name || (appUser.display_name as string) || `${firstName} ${lastName}`.trim() || "").toString();
      const email = (d.email || appUser.email || "").toString();
      const phone = (d.phone || d.phoneNumber || appUser.phone || "").toString();
      const photoURL = (d.photoURL || d.photo_url || appUser.photo_url || "").toString();

      return {
        id: doc.id,
        firstName: firstName || fullName.split(" ")[0] || "Client",
        lastName: lastName || fullName.split(" ").slice(1).join(" ") || "",
        fullName,
        email,
        phone,
        photoURL,
        status: (d.status || appUser.status || "active").toString(),
        totalOrders: Number(d.totalOrders || d.total_orders || 0),
        totalSpent: Number(d.totalSpent || d.total_spent || 0),
        loyaltyPoints: Number(d.loyaltyPoints || d.loyalty_points || 0),
        walletBalance: Number(d.walletBalance || d.wallet_balance || 0),
        isEmailVerified: Boolean(d.isEmailVerified || d.is_email_verified || appUser.is_email_verified || false),
        createdAt: (d.createdAt || d.created_at || appUser.created_at || "").toString(),
        lastOrderAt: (d.lastOrderAt || d.last_order_at || "").toString(),
      };
    });

    // Ajouter les clients qui sont dans app_users mais pas dans client_profiles
    const existingIds = new Set(snap.docs.map(d => d.id));
    for (const [uid, appUser] of Object.entries(appUsersMap)) {
      if (!existingIds.has(uid)) {
        const firstName = (appUser.first_name || "").toString();
        const lastName = (appUser.last_name || "").toString();
        clients.push({
          id: uid,
          firstName: firstName || "Client",
          lastName: lastName || "",
          fullName: (appUser.display_name || `${firstName} ${lastName}`.trim() || "Client").toString(),
          email: (appUser.email || "").toString(),
          phone: (appUser.phone || "").toString(),
          photoURL: (appUser.photo_url || "").toString(),
          status: (appUser.status || "active").toString(),
          totalOrders: 0,
          totalSpent: 0,
          loyaltyPoints: 0,
          walletBalance: 0,
          isEmailVerified: Boolean(appUser.is_email_verified || false),
          createdAt: (appUser.created_at || "").toString(),
          lastOrderAt: "",
        });
      }
    }

    // Filtrer par recherche
    if (search) {
      const s = search.toLowerCase();
      clients = clients.filter((c) =>
        c.firstName?.toLowerCase().includes(s) ||
        c.lastName?.toLowerCase().includes(s) ||
        c.fullName?.toLowerCase().includes(s) ||
        c.email?.toLowerCase().includes(s) ||
        c.phone?.toLowerCase().includes(s)
      );
    }

    // Filtrer par statut
    if (status) {
      clients = clients.filter((c) => c.status === status);
    }

    // Trier par date de création (plus récent en premier)
    clients.sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    });

    const total = clients.length;
    const offset = (page - 1) * pageSize;
    const paginatedClients = clients.slice(offset, offset + pageSize);

    return NextResponse.json({
      clients: paginatedClients,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("GET /api/admin/clients error:", error);
    return NextResponse.json({ error: "Failed to fetch clients", clients: [], total: 0 }, { status: 500 });
  }
}
