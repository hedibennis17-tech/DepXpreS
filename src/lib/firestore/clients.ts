"use client";

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type ClientStatus = "active" | "blocked" | "suspended";

export interface ClientProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  status: ClientStatus;
  totalOrders: number;
  totalSpent: number;
  walletBalance?: number;
  preferredAddress?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastOrderAt?: Timestamp;
  notes?: string;
}

export interface ClientFilters {
  status?: ClientStatus | "all";
  search?: string;
}

export async function fetchClients(filters: ClientFilters = {}): Promise<ClientProfile[]> {
  const constraints: QueryConstraint[] = [];

  if (filters.status && filters.status !== "all") {
    constraints.push(where("status", "==", filters.status));
  }

  constraints.push(orderBy("createdAt", "desc"));
  constraints.push(limit(100));

  const q = query(collection(db, "client_profiles"), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ClientProfile[];
}

export async function fetchClientById(clientId: string): Promise<ClientProfile | null> {
  const ref = doc(db, "client_profiles", clientId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as ClientProfile;
}

export async function fetchClientOrders(clientId: string, limitCount = 20) {
  const q = query(
    collection(db, "orders"),
    where("clientId", "==", clientId),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateClientStatus(
  clientId: string,
  status: ClientStatus,
  reason?: string
) {
  const ref = doc(db, "client_profiles", clientId);
  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
    ...(reason ? { statusReason: reason } : {}),
  });
}

export async function getClientStats() {
  const [allSnap, activeSnap, blockedSnap] = await Promise.all([
    getDocs(query(collection(db, "client_profiles"), limit(1000))),
    getDocs(query(collection(db, "client_profiles"), where("status", "==", "active"))),
    getDocs(query(collection(db, "client_profiles"), where("status", "==", "blocked"))),
  ]);

  const allClients = allSnap.docs.map((d) => d.data() as ClientProfile);
  const totalRevenue = allClients.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

  return {
    total: allSnap.size,
    active: activeSnap.size,
    blocked: blockedSnap.size,
    totalRevenue,
  };
}
