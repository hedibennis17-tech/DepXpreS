// ═══════════════════════════════════════════════════════════════════════════
// MOTEUR CENTRAL DE TRANSACTIONS
// Appelé automatiquement à chaque livraison complétée
// Enregistre: wallet chauffeur, wallet client, revenus store, revenus admin
// ═══════════════════════════════════════════════════════════════════════════
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export interface OrderFinancials {
  orderId: string;
  orderNumber: string;
  // IDs
  driverId: string;
  driverName: string;
  clientId: string;
  clientName: string;
  storeId: string;
  storeName: string;
  // Montants
  subtotal: number;
  deliveryFee: number;
  tip: number;
  tps: number;
  tvq: number;
  total: number;
  paymentMethod: string;
  // Dates
  deliveredAt: Date;
}

// Taux de commission (configurable)
const PLATFORM_COMMISSION = 0.20; // 20% plateforme
const DRIVER_SHARE = 0.80;        // 80% pour le chauffeur

export async function recordDeliveryTransactions(f: OrderFinancials) {
  const batch = adminDb.batch();
  const now = FieldValue.serverTimestamp();
  const deliveredAt = f.deliveredAt || new Date();

  // ── Calculs financiers ──────────────────────────────────────────────────
  const driverEarnings = Math.round((f.deliveryFee * DRIVER_SHARE + f.tip) * 100) / 100;
  const platformRevenue = Math.round((f.deliveryFee * PLATFORM_COMMISSION) * 100) / 100;
  const storeRevenue = Math.round(f.subtotal * 100) / 100;

  // ══════════════════════════════════════════════════════════════════════
  // 1. TRANSACTION CHAUFFEUR — gains de la livraison
  // ══════════════════════════════════════════════════════════════════════
  const driverTxRef = adminDb.collection("transactions").doc();
  batch.set(driverTxRef, {
    id: driverTxRef.id,
    type: "driver_earning",
    userId: f.driverId,
    userName: f.driverName,
    userType: "driver",
    orderId: f.orderId,
    orderNumber: f.orderNumber,
    // Détail
    deliveryFee: f.deliveryFee,
    driverShare: DRIVER_SHARE,
    tip: f.tip,
    amount: driverEarnings,
    currency: "CAD",
    status: "completed",
    paymentMethod: f.paymentMethod,
    description: `Livraison #${f.orderNumber} — ${f.storeName} → ${f.clientName}`,
    // Parties
    storeId: f.storeId,
    storeName: f.storeName,
    clientId: f.clientId,
    clientName: f.clientName,
    createdAt: now,
    completedAt: now,
  });

  // Mettre à jour le wallet chauffeur
  const driverWalletRef = adminDb.collection("wallets").doc(f.driverId);
  const driverWalletSnap = await driverWalletRef.get();
  if (driverWalletSnap.exists) {
    batch.update(driverWalletRef, {
      balance: FieldValue.increment(driverEarnings),
      totalEarnings: FieldValue.increment(driverEarnings),
      deliveriesCount: FieldValue.increment(1),
      lastEarningAt: now,
      updatedAt: now,
    });
  } else {
    batch.set(driverWalletRef, {
      userId: f.driverId,
      userType: "driver",
      balance: driverEarnings,
      pendingBalance: 0,
      totalEarnings: driverEarnings,
      totalWithdrawn: 0,
      deliveriesCount: 1,
      lastEarningAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Mettre à jour les stats du profil chauffeur
  const driverProfileRef = adminDb.collection("driver_profiles").doc(f.driverId);
  batch.update(driverProfileRef, {
    total_earnings: FieldValue.increment(driverEarnings),
    total_deliveries: FieldValue.increment(1),
    deliveries_today: FieldValue.increment(1),
    current_order_id: null,
    availability_status: "available",
    updatedAt: now,
  });

  // ══════════════════════════════════════════════════════════════════════
  // 2. TRANSACTION CLIENT — paiement de la commande
  // ══════════════════════════════════════════════════════════════════════
  const clientTxRef = adminDb.collection("transactions").doc();
  batch.set(clientTxRef, {
    id: clientTxRef.id,
    type: "client_payment",
    userId: f.clientId,
    userName: f.clientName,
    userType: "client",
    orderId: f.orderId,
    orderNumber: f.orderNumber,
    amount: -f.total, // Négatif = dépense
    subtotal: f.subtotal,
    deliveryFee: f.deliveryFee,
    tip: f.tip,
    tps: f.tps,
    tvq: f.tvq,
    total: f.total,
    currency: "CAD",
    status: "completed",
    paymentMethod: f.paymentMethod,
    description: `Commande #${f.orderNumber} — ${f.storeName}`,
    storeId: f.storeId,
    storeName: f.storeName,
    driverId: f.driverId,
    driverName: f.driverName,
    createdAt: now,
    completedAt: now,
  });

  // Mettre à jour le wallet/historique client
  const clientWalletRef = adminDb.collection("wallets").doc(f.clientId);
  const clientWalletSnap = await clientWalletRef.get();
  if (clientWalletSnap.exists) {
    batch.update(clientWalletRef, {
      totalSpent: FieldValue.increment(f.total),
      ordersCount: FieldValue.increment(1),
      lastOrderAt: now,
      updatedAt: now,
    });
  } else {
    batch.set(clientWalletRef, {
      userId: f.clientId,
      userType: "client",
      balance: 0,
      totalSpent: f.total,
      ordersCount: 1,
      loyaltyPoints: Math.floor(f.total),
      lastOrderAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Points de fidélité client (1 point par dollar)
  const loyaltyPoints = Math.floor(f.total);
  const clientAppUserRef = adminDb.collection("app_users").doc(f.clientId);
  batch.update(clientAppUserRef, {
    total_orders: FieldValue.increment(1),
    total_spent: FieldValue.increment(f.total),
    loyalty_points: FieldValue.increment(loyaltyPoints),
    updatedAt: now,
  });

  // ══════════════════════════════════════════════════════════════════════
  // 3. TRANSACTION STORE — revenus de la commande
  // ══════════════════════════════════════════════════════════════════════
  const storeTxRef = adminDb.collection("transactions").doc();
  batch.set(storeTxRef, {
    id: storeTxRef.id,
    type: "store_revenue",
    userId: f.storeId,
    userName: f.storeName,
    userType: "store",
    orderId: f.orderId,
    orderNumber: f.orderNumber,
    amount: storeRevenue,
    subtotal: f.subtotal,
    currency: "CAD",
    status: "pending_payout", // En attente de virement
    paymentMethod: f.paymentMethod,
    description: `Vente #${f.orderNumber} — ${f.clientName}`,
    clientId: f.clientId,
    clientName: f.clientName,
    driverId: f.driverId,
    createdAt: now,
    completedAt: now,
  });

  // Mettre à jour les stats du store
  const storeRef = adminDb.collection("stores").doc(f.storeId);
  batch.update(storeRef, {
    total_revenue: FieldValue.increment(storeRevenue),
    total_orders: FieldValue.increment(1),
    orders_today: FieldValue.increment(1),
    pending_payout: FieldValue.increment(storeRevenue),
    updatedAt: now,
  });

  // ══════════════════════════════════════════════════════════════════════
  // 4. TRANSACTION PLATEFORME — commission admin
  // ══════════════════════════════════════════════════════════════════════
  const platformTxRef = adminDb.collection("transactions").doc();
  batch.set(platformTxRef, {
    id: platformTxRef.id,
    type: "platform_commission",
    userType: "platform",
    orderId: f.orderId,
    orderNumber: f.orderNumber,
    amount: platformRevenue,
    commissionRate: PLATFORM_COMMISSION,
    deliveryFee: f.deliveryFee,
    total: f.total,
    currency: "CAD",
    status: "completed",
    description: `Commission #${f.orderNumber} — ${f.storeName}`,
    driverId: f.driverId,
    storeId: f.storeId,
    clientId: f.clientId,
    createdAt: now,
  });

  // Stats globales plateforme
  const platformStatsRef = adminDb.collection("platform_stats").doc("global");
  batch.set(platformStatsRef, {
    totalRevenue: FieldValue.increment(f.total),
    totalCommission: FieldValue.increment(platformRevenue),
    totalDeliveries: FieldValue.increment(1),
    totalDriverPayouts: FieldValue.increment(driverEarnings),
    totalStoreRevenue: FieldValue.increment(storeRevenue),
    updatedAt: now,
  }, { merge: true });

  // Stats journalières
  const today = deliveredAt instanceof Date
    ? deliveredAt.toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];
  const dailyStatsRef = adminDb.collection("platform_stats").doc(`daily_${today}`);
  batch.set(dailyStatsRef, {
    date: today,
    revenue: FieldValue.increment(f.total),
    commission: FieldValue.increment(platformRevenue),
    deliveries: FieldValue.increment(1),
    driverPayouts: FieldValue.increment(driverEarnings),
    storeRevenue: FieldValue.increment(storeRevenue),
    updatedAt: now,
  }, { merge: true });

  await batch.commit();

  return {
    driverEarnings,
    platformRevenue,
    storeRevenue,
    loyaltyPoints,
  };
}
