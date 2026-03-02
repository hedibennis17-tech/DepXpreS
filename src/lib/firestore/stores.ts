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
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type StoreStatus = "active" | "inactive" | "suspended" | "pending";

export interface StoreHours {
  day: number; // 0=Sunday
  open: string; // "08:00"
  close: string; // "23:00"
  isClosed: boolean;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email?: string;
  status: StoreStatus;
  zoneId?: string;
  zoneName?: string;
  ownerId?: string;
  ownerName?: string;
  logoUrl?: string;
  coverUrl?: string;
  rating: number;
  totalOrders: number;
  totalRevenue: number;
  isOpen: boolean;
  hours?: StoreHours[];
  lat?: number;
  lng?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  productCount?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  productCount?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  format: string;
  description?: string;
  price: number;
  comparePrice?: number;
  cost?: number;
  stock: "in_stock" | "low_stock" | "out_of_stock";
  stockQuantity?: number;
  tags: string[];
  imageUrl?: string;
  isActive: boolean;
  isRestricted: boolean;
  minAge?: number;
  barcode?: string;
  sku?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface StoreCatalogItem {
  id: string;
  storeId: string;
  productId: string;
  productName?: string;
  price: number;
  stock: "in_stock" | "low_stock" | "out_of_stock";
  stockQuantity?: number;
  isAvailable: boolean;
  updatedAt: Timestamp;
}

// ---- STORES ----

export async function fetchStores(filters: { status?: StoreStatus | "all"; zoneId?: string } = {}): Promise<Store[]> {
  const constraints: QueryConstraint[] = [];
  if (filters.status && filters.status !== "all") {
    constraints.push(where("status", "==", filters.status));
  }
  if (filters.zoneId) {
    constraints.push(where("zoneId", "==", filters.zoneId));
  }
  constraints.push(orderBy("createdAt", "desc"));
  constraints.push(limit(100));

  const q = query(collection(db, "stores"), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Store[];
}

export async function fetchStoreById(storeId: string): Promise<Store | null> {
  const ref = doc(db, "stores", storeId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Store;
}

export async function updateStore(storeId: string, data: Partial<Store>) {
  const ref = doc(db, "stores", storeId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function createStore(data: Omit<Store, "id" | "createdAt" | "updatedAt">) {
  const ref = await addDoc(collection(db, "stores"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

// ---- CATEGORIES ----

export async function fetchCategories(): Promise<Category[]> {
  const q = query(collection(db, "categories"), orderBy("sortOrder", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Category[];
}

export async function createCategory(data: Omit<Category, "id" | "createdAt" | "updatedAt">) {
  const ref = await addDoc(collection(db, "categories"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCategory(categoryId: string, data: Partial<Category>) {
  const ref = doc(db, "categories", categoryId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteCategory(categoryId: string) {
  await deleteDoc(doc(db, "categories", categoryId));
}

// ---- SUBCATEGORIES ----

export async function fetchSubcategories(categoryId?: string): Promise<Subcategory[]> {
  const constraints: QueryConstraint[] = [];
  if (categoryId) {
    constraints.push(where("categoryId", "==", categoryId));
  }
  constraints.push(orderBy("sortOrder", "asc"));

  const q = query(collection(db, "subcategories"), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Subcategory[];
}

export async function createSubcategory(data: Omit<Subcategory, "id" | "createdAt" | "updatedAt">) {
  const ref = await addDoc(collection(db, "subcategories"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateSubcategory(subcategoryId: string, data: Partial<Subcategory>) {
  const ref = doc(db, "subcategories", subcategoryId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteSubcategory(subcategoryId: string) {
  await deleteDoc(doc(db, "subcategories", subcategoryId));
}

// ---- PRODUCTS ----

export async function fetchProducts(filters: {
  categoryId?: string;
  subcategoryId?: string;
  stock?: string;
  isActive?: boolean;
} = {}): Promise<Product[]> {
  const constraints: QueryConstraint[] = [];
  if (filters.categoryId) {
    constraints.push(where("categoryId", "==", filters.categoryId));
  }
  if (filters.subcategoryId) {
    constraints.push(where("subcategoryId", "==", filters.subcategoryId));
  }
  if (filters.stock) {
    constraints.push(where("stock", "==", filters.stock));
  }
  if (filters.isActive !== undefined) {
    constraints.push(where("isActive", "==", filters.isActive));
  }
  constraints.push(orderBy("createdAt", "desc"));
  constraints.push(limit(200));

  const q = query(collection(db, "products"), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[];
}

export async function fetchProductById(productId: string): Promise<Product | null> {
  const ref = doc(db, "products", productId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Product;
}

export async function createProduct(data: Omit<Product, "id" | "createdAt" | "updatedAt">) {
  const ref = await addDoc(collection(db, "products"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProduct(productId: string, data: Partial<Product>) {
  const ref = doc(db, "products", productId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteProduct(productId: string) {
  await deleteDoc(doc(db, "products", productId));
}

// ---- STORE CATALOG ----

export async function fetchStoreCatalog(storeId: string): Promise<StoreCatalogItem[]> {
  const q = query(
    collection(db, "stores", storeId, "catalog"),
    orderBy("updatedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, storeId, ...d.data() })) as StoreCatalogItem[];
}

export async function updateStoreCatalogItem(
  storeId: string,
  itemId: string,
  data: Partial<StoreCatalogItem>
) {
  const ref = doc(db, "stores", storeId, "catalog", itemId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function getStoreStats() {
  const [allSnap, activeSnap] = await Promise.all([
    getDocs(query(collection(db, "stores"), limit(1000))),
    getDocs(query(collection(db, "stores"), where("status", "==", "active"))),
  ]);

  return {
    total: allSnap.size,
    active: activeSnap.size,
    inactive: allSnap.size - activeSnap.size,
  };
}
