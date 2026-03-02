"use client";

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "en_route"
  | "delivered"
  | "cancelled"
  | "disputed";

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  driverId?: string;
  driverName?: string;
  storeId: string;
  storeName: string;
  zoneId?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  total: number;
  promoCode?: string;
  promoDiscount?: number;
  deliveryAddress: {
    street: string;
    city: string;
    postalCode: string;
    instructions?: string;
  };
  paymentMethod: "card" | "cash" | "wallet";
  paymentStatus: "pending" | "paid" | "refunded" | "failed";
  paymentId?: string;
  estimatedDeliveryTime?: number;
  actualDeliveryTime?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  notes?: string;
}

export interface OrderFilters {
  status?: OrderStatus | "all";
  storeId?: string;
  driverId?: string;
  clientId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface PaginatedOrders {
  orders: Order[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
  total?: number;
}

const PAGE_SIZE = 20;

export async function fetchOrders(
  filters: OrderFilters = {},
  lastDocument?: QueryDocumentSnapshot<DocumentData> | null,
  pageSize = PAGE_SIZE
): Promise<PaginatedOrders> {
  const constraints: QueryConstraint[] = [];

  if (filters.status && filters.status !== "all") {
    constraints.push(where("status", "==", filters.status));
  }
  if (filters.storeId) {
    constraints.push(where("storeId", "==", filters.storeId));
  }
  if (filters.driverId) {
    constraints.push(where("driverId", "==", filters.driverId));
  }
  if (filters.clientId) {
    constraints.push(where("clientId", "==", filters.clientId));
  }

  constraints.push(orderBy("createdAt", "desc"));
  constraints.push(limit(pageSize + 1));

  if (lastDocument) {
    constraints.push(startAfter(lastDocument));
  }

  const q = query(collection(db, "orders"), ...constraints);
  const snapshot = await getDocs(q);

  const docs = snapshot.docs;
  const hasMore = docs.length > pageSize;
  const pageDocs = hasMore ? docs.slice(0, pageSize) : docs;

  const orders = pageDocs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Order[];

  return {
    orders,
    lastDoc: pageDocs.length > 0 ? pageDocs[pageDocs.length - 1] : null,
    hasMore,
  };
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  const ref = doc(db, "orders", orderId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Order;
}

export async function fetchOrderTimeline(orderId: string) {
  const q = query(
    collection(db, "orders", orderId, "status_history"),
    orderBy("timestamp", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchOrderMessages(orderId: string) {
  const q = query(
    collection(db, "orders", orderId, "messages"),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchOrderTracking(orderId: string) {
  const q = query(
    collection(db, "orders", orderId, "tracking"),
    orderBy("timestamp", "desc"),
    limit(1)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  adminId: string,
  note?: string
) {
  const orderRef = doc(db, "orders", orderId);
  await updateDoc(orderRef, {
    status: newStatus,
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(db, "orders", orderId, "status_history"), {
    status: newStatus,
    changedBy: adminId,
    changedByRole: "admin",
    note: note || "",
    timestamp: serverTimestamp(),
  });
}

export async function assignDriverToOrder(
  orderId: string,
  driverId: string,
  driverName: string,
  adminId: string
) {
  const orderRef = doc(db, "orders", orderId);
  await updateDoc(orderRef, {
    driverId,
    driverName,
    status: "en_route",
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(db, "orders", orderId, "status_history"), {
    status: "en_route",
    changedBy: adminId,
    changedByRole: "admin",
    note: `Chauffeur assigné: ${driverName}`,
    timestamp: serverTimestamp(),
  });
}

export async function cancelOrder(
  orderId: string,
  reason: string,
  adminId: string
) {
  await updateOrderStatus(orderId, "cancelled", adminId, reason);
}

export function subscribeToOrders(
  filters: OrderFilters,
  callback: (orders: Order[]) => void
) {
  const constraints: QueryConstraint[] = [];

  if (filters.status && filters.status !== "all") {
    constraints.push(where("status", "==", filters.status));
  }

  constraints.push(orderBy("createdAt", "desc"));
  constraints.push(limit(50));

  const q = query(collection(db, "orders"), ...constraints);

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Order[];
    callback(orders);
  });
}

export async function getOrderStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTs = Timestamp.fromDate(today);

  const [allSnap, todaySnap, pendingSnap, enRouteSnap] = await Promise.all([
    getDocs(query(collection(db, "orders"), limit(1000))),
    getDocs(query(collection(db, "orders"), where("createdAt", ">=", todayTs))),
    getDocs(query(collection(db, "orders"), where("status", "==", "pending"))),
    getDocs(query(collection(db, "orders"), where("status", "==", "en_route"))),
  ]);

  const todayOrders = todaySnap.docs.map((d) => d.data() as Order);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  return {
    total: allSnap.size,
    today: todaySnap.size,
    pending: pendingSnap.size,
    enRoute: enRouteSnap.size,
    todayRevenue,
  };
}
