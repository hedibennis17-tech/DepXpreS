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
  onSnapshot,
  Timestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type DriverStatus = "online" | "offline" | "delivering" | "suspended";
export type DocumentStatus = "pending" | "approved" | "rejected" | "expired";
export type ApplicationStatus = "pending" | "under_review" | "approved" | "rejected";

export interface DriverProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  status: DriverStatus;
  isOnline: boolean;
  rating: number;
  totalDeliveries: number;
  totalEarnings: number;
  zoneId?: string;
  zoneName?: string;
  currentOrderId?: string;
  lastLocation?: {
    lat: number;
    lng: number;
    updatedAt: Timestamp;
  };
  joinedAt: Timestamp;
  suspendedAt?: Timestamp;
  suspendedReason?: string;
  notes?: string;
}

export interface DriverDocument {
  id: string;
  driverId: string;
  type: "drivers_license" | "insurance" | "vehicle_registration" | "background_check" | "profile_photo";
  label: string;
  status: DocumentStatus;
  fileUrl?: string;
  expiryDate?: Timestamp;
  verifiedBy?: string;
  verifiedAt?: Timestamp;
  rejectionReason?: string;
  uploadedAt: Timestamp;
}

export interface DriverVehicle {
  id: string;
  driverId: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  type: "car" | "bicycle" | "motorcycle" | "scooter";
  isActive: boolean;
  createdAt: Timestamp;
}

export interface DriverEarning {
  id: string;
  driverId: string;
  orderId: string;
  amount: number;
  type: "delivery" | "tip" | "bonus" | "adjustment";
  description: string;
  createdAt: Timestamp;
}

export interface DriverFilters {
  status?: DriverStatus | "all";
  zoneId?: string;
  search?: string;
  isOnline?: boolean;
}

export async function fetchDrivers(filters: DriverFilters = {}): Promise<DriverProfile[]> {
  const constraints: QueryConstraint[] = [];

  if (filters.status && filters.status !== "all") {
    constraints.push(where("status", "==", filters.status));
  }
  if (filters.isOnline !== undefined) {
    constraints.push(where("isOnline", "==", filters.isOnline));
  }
  if (filters.zoneId) {
    constraints.push(where("zoneId", "==", filters.zoneId));
  }

  constraints.push(orderBy("joinedAt", "desc"));
  constraints.push(limit(100));

  const q = query(collection(db, "driver_profiles"), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as DriverProfile[];
}

export async function fetchDriverById(driverId: string): Promise<DriverProfile | null> {
  const ref = doc(db, "driver_profiles", driverId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as DriverProfile;
}

export async function fetchDriverDocuments(driverId: string): Promise<DriverDocument[]> {
  const q = query(
    collection(db, "driver_profiles", driverId, "documents"),
    orderBy("uploadedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, driverId, ...d.data() })) as DriverDocument[];
}

export async function fetchDriverVehicles(driverId: string): Promise<DriverVehicle[]> {
  const q = query(
    collection(db, "driver_profiles", driverId, "vehicles"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, driverId, ...d.data() })) as DriverVehicle[];
}

export async function fetchDriverEarnings(driverId: string, limitCount = 50): Promise<DriverEarning[]> {
  const q = query(
    collection(db, "driver_profiles", driverId, "earnings"),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, driverId, ...d.data() })) as DriverEarning[];
}

export async function fetchDriverOrders(driverId: string, limitCount = 20) {
  const q = query(
    collection(db, "orders"),
    where("driverId", "==", driverId),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateDriverStatus(
  driverId: string,
  status: DriverStatus,
  adminId: string,
  reason?: string
) {
  const ref = doc(db, "driver_profiles", driverId);
  const updateData: Record<string, unknown> = {
    status,
    updatedAt: serverTimestamp(),
  };
  if (status === "suspended") {
    updateData.suspendedAt = serverTimestamp();
    updateData.suspendedReason = reason || "";
  }
  await updateDoc(ref, updateData);
}

export async function verifyDriverDocument(
  driverId: string,
  documentId: string,
  status: DocumentStatus,
  adminId: string,
  rejectionReason?: string
) {
  const ref = doc(db, "driver_profiles", driverId, "documents", documentId);
  const updateData: Record<string, unknown> = {
    status,
    verifiedBy: adminId,
    verifiedAt: serverTimestamp(),
  };
  if (rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }
  await updateDoc(ref, updateData);
}

export async function fetchAllDriverDocuments(): Promise<(DriverDocument & { driverName: string })[]> {
  const driversSnap = await getDocs(collection(db, "driver_profiles"));
  const allDocs: (DriverDocument & { driverName: string })[] = [];

  for (const driverDoc of driversSnap.docs) {
    const driver = driverDoc.data() as DriverProfile;
    const docsSnap = await getDocs(
      query(collection(db, "driver_profiles", driverDoc.id, "documents"))
    );
    docsSnap.docs.forEach((d) => {
      allDocs.push({
        id: d.id,
        driverId: driverDoc.id,
        driverName: `${driver.firstName} ${driver.lastName}`,
        ...d.data(),
      } as DriverDocument & { driverName: string });
    });
  }

  return allDocs;
}

export async function getDriverStats() {
  const [allSnap, onlineSnap, deliveringSnap] = await Promise.all([
    getDocs(query(collection(db, "driver_profiles"), limit(1000))),
    getDocs(query(collection(db, "driver_profiles"), where("isOnline", "==", true))),
    getDocs(query(collection(db, "driver_profiles"), where("status", "==", "delivering"))),
  ]);

  return {
    total: allSnap.size,
    online: onlineSnap.size,
    delivering: deliveringSnap.size,
    offline: allSnap.size - onlineSnap.size,
  };
}

export function subscribeToOnlineDrivers(callback: (drivers: DriverProfile[]) => void) {
  const q = query(
    collection(db, "driver_profiles"),
    where("isOnline", "==", true),
    limit(50)
  );
  return onSnapshot(q, (snap) => {
    const drivers = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as DriverProfile[];
    callback(drivers);
  });
}
