/**
 * Script de seed Firestore pour DepXpreS
 * Peuple toutes les collections avec des données réalistes
 * Usage: npx ts-node src/lib/firestore/seed.ts
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAmDwm43D52jpgDp1MiNg_TvLBn_fDTsU8",
  authDomain: "studio-1471071484-26917.firebaseapp.com",
  projectId: "studio-1471071484-26917",
  storageBucket: "studio-1471071484-26917.firebasestorage.app",
  messagingSenderId: "4728432828",
  appId: "1:4728432828:web:4ef7796d15d6464cdc48b9",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return Timestamp.fromDate(d);
}

function hoursAgo(n: number) {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return Timestamp.fromDate(d);
}

async function seedCategories() {
  console.log("Seeding categories...");
  const categories = [
    { name: "Bière & alcool", slug: "biere-alcool", iconName: "Beer", isActive: true, sortOrder: 1, description: "Bières, vins, spiritueux et alcools" },
    { name: "Boissons", slug: "boissons", iconName: "GlassWater", isActive: true, sortOrder: 2, description: "Boissons gazeuses, jus, eau, énergie" },
    { name: "Tabagisme", slug: "tabagisme", iconName: "Cigarette", isActive: true, sortOrder: 3, description: "Cigarettes, cigares, tabac à rouler" },
    { name: "Vapotage", slug: "vapotage", iconName: "Flame", isActive: true, sortOrder: 4, description: "Vapes jetables, e-liquides, pods" },
    { name: "Craquelins & chips", slug: "chips", iconName: "Cookie", isActive: true, sortOrder: 5, description: "Chips, craquelins, noix, popcorn" },
    { name: "Chocolat & bonbons", slug: "chocolat", iconName: "Gift", isActive: true, sortOrder: 6, description: "Chocolats, bonbons, gummies" },
    { name: "Café & boissons glacées", slug: "cafe", iconName: "Coffee", isActive: true, sortOrder: 7, description: "Café, thé, boissons glacées" },
    { name: "Pain & lait", slug: "pain-lait", iconName: "Sandwich", isActive: true, sortOrder: 8, description: "Pain, lait, céréales, beurre" },
    { name: "Produits laitiers", slug: "produits-laitiers", iconName: "Milk", isActive: true, sortOrder: 9, description: "Fromage, yogourt, crème, œufs" },
    { name: "Congelé", slug: "congele", iconName: "Snowflake", isActive: true, sortOrder: 10, description: "Repas congelés, crème glacée" },
    { name: "Articles ménagers", slug: "menagers", iconName: "Home", isActive: true, sortOrder: 11, description: "Nettoyage, papier, sacs poubelle" },
    { name: "Hygiène & toilette", slug: "hygiene", iconName: "Bath", isActive: true, sortOrder: 12, description: "Savon, dentifrice, shampooing" },
    { name: "Lotto / billets", slug: "lotto", iconName: "Ticket", isActive: true, sortOrder: 13, description: "Billets de loterie, gratteux" },
    { name: "Dépannage express", slug: "express", iconName: "Zap", isActive: true, sortOrder: 14, description: "Piles, ampoules, câbles, divers" },
  ];

  const catIds: Record<string, string> = {};
  for (const cat of categories) {
    const ref = await addDoc(collection(db, "categories"), {
      ...cat,
      productCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    catIds[cat.slug] = ref.id;
    console.log(`  Category: ${cat.name} -> ${ref.id}`);
  }
  return catIds;
}

async function seedProducts(catIds: Record<string, string>) {
  console.log("Seeding products...");
  const products = [
    { name: "Heineken 6 pack", categoryId: catIds["biere-alcool"], format: "6 x 330ml", price: 14.99, stock: "in_stock", tags: ["popular", "age_required"], isRestricted: true, minAge: 18, isActive: true, imageUrl: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400" },
    { name: "Corona 6 pack", categoryId: catIds["biere-alcool"], format: "6 x 355ml", price: 15.49, stock: "in_stock", tags: ["age_required"], isRestricted: true, minAge: 18, isActive: true, imageUrl: "https://images.unsplash.com/photo-1566633806827-0a7a9d2e2b9c?w=400" },
    { name: "Vin rouge 750ml", categoryId: catIds["biere-alcool"], format: "750ml", price: 18.99, stock: "low_stock", tags: ["age_required"], isRestricted: true, minAge: 18, isActive: true, imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400" },
    { name: "Vodka mini format", categoryId: catIds["biere-alcool"], format: "50ml", price: 5.99, stock: "in_stock", tags: ["age_required"], isRestricted: true, minAge: 18, isActive: true, imageUrl: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400" },
    { name: "Coca-Cola", categoryId: catIds["boissons"], format: "355ml", price: 1.79, stock: "in_stock", tags: ["popular"], isRestricted: false, isActive: true, imageUrl: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400" },
    { name: "Red Bull", categoryId: catIds["boissons"], format: "250ml", price: 3.49, stock: "in_stock", tags: [], isRestricted: false, isActive: true, imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400" },
    { name: "Eau Evian 1.5L", categoryId: catIds["boissons"], format: "1.5L", price: 2.29, stock: "in_stock", tags: [], isRestricted: false, isActive: true, imageUrl: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400" },
    { name: "Doritos Nacho", categoryId: catIds["chips"], format: "255g", price: 4.29, stock: "in_stock", tags: ["popular", "promo"], isRestricted: false, isActive: true, imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400" },
    { name: "Lays Original", categoryId: catIds["chips"], format: "235g", price: 3.99, stock: "in_stock", tags: [], isRestricted: false, isActive: true, imageUrl: "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400" },
    { name: "Paquet de cigarettes", categoryId: catIds["tabagisme"], format: "20 unités", price: 16.50, stock: "in_stock", tags: ["age_required"], isRestricted: true, minAge: 18, isActive: true, imageUrl: "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=400" },
    { name: "Vape jetable", categoryId: catIds["vapotage"], format: "1 unité", price: 12.99, stock: "in_stock", tags: ["age_required"], isRestricted: true, minAge: 18, isActive: true, imageUrl: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=400" },
    { name: "Barre de chocolat", categoryId: catIds["chocolat"], format: "45g", price: 1.99, stock: "in_stock", tags: ["popular"], isRestricted: false, isActive: true, imageUrl: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400" },
    { name: "Café Tim Hortons", categoryId: catIds["cafe"], format: "473ml", price: 2.49, stock: "in_stock", tags: ["popular"], isRestricted: false, isActive: true, imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400" },
    { name: "Pain tranché", categoryId: catIds["pain-lait"], format: "675g", price: 3.99, stock: "in_stock", tags: [], isRestricted: false, isActive: true, imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400" },
    { name: "Lait 2%", categoryId: catIds["pain-lait"], format: "2L", price: 5.49, stock: "in_stock", tags: [], isRestricted: false, isActive: true, imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400" },
    { name: "Papier toilette", categoryId: catIds["menagers"], format: "6 rouleaux", price: 8.99, stock: "low_stock", tags: [], isRestricted: false, isActive: true, imageUrl: "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=400" },
    { name: "Dentifrice Colgate", categoryId: catIds["hygiene"], format: "90ml", price: 3.29, stock: "in_stock", tags: [], isRestricted: false, isActive: true, imageUrl: "https://images.unsplash.com/photo-1559591937-abc3a0c6a3e0?w=400" },
    { name: "Billet de lotto", categoryId: catIds["lotto"], format: "1 billet", price: 5.00, stock: "in_stock", tags: [], isRestricted: false, isActive: true, imageUrl: "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=400" },
  ];

  const prodIds: string[] = [];
  for (const prod of products) {
    const ref = await addDoc(collection(db, "products"), {
      ...prod,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    prodIds.push(ref.id);
    console.log(`  Product: ${prod.name} -> ${ref.id}`);
  }
  return prodIds;
}

async function seedZones() {
  console.log("Seeding zones...");
  const zones = [
    { id: "zone-laval", name: "Laval", slug: "laval", isActive: true, deliveryFee: 4.99, minOrderAmount: 10, estimatedTime: 25 },
    { id: "zone-mtl-centre", name: "Montréal Centre-Ville", slug: "mtl-centre", isActive: true, deliveryFee: 5.99, minOrderAmount: 15, estimatedTime: 30 },
    { id: "zone-mtl-nord", name: "Montréal Nord", slug: "mtl-nord", isActive: true, deliveryFee: 5.49, minOrderAmount: 12, estimatedTime: 28 },
    { id: "zone-longueuil", name: "Longueuil", slug: "longueuil", isActive: true, deliveryFee: 6.49, minOrderAmount: 15, estimatedTime: 35 },
  ];

  for (const zone of zones) {
    await setDoc(doc(db, "zones", zone.id), {
      ...zone,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log(`  Zone: ${zone.name}`);
  }
  return zones.map((z) => z.id);
}

async function seedStores(zoneIds: string[]) {
  console.log("Seeding stores...");
  const stores = [
    {
      name: "Dépanneur Chomedey Express",
      address: "123 Boul. Chomedey",
      city: "Laval",
      postalCode: "H7W 2E8",
      phone: "450-555-0101",
      email: "chomedey@depxpres.com",
      status: "active",
      zoneId: zoneIds[0],
      zoneName: "Laval",
      rating: 4.8,
      totalOrders: 342,
      totalRevenue: 8750.50,
      isOpen: true,
      lat: 45.5586,
      lng: -73.7553,
    },
    {
      name: "Dépanneur St-Martin",
      address: "456 Boul. St-Martin O.",
      city: "Laval",
      postalCode: "H7M 1Y3",
      phone: "450-555-0202",
      email: "stmartin@depxpres.com",
      status: "active",
      zoneId: zoneIds[0],
      zoneName: "Laval",
      rating: 4.6,
      totalOrders: 218,
      totalRevenue: 5420.25,
      isOpen: true,
      lat: 45.5725,
      lng: -73.7412,
    },
    {
      name: "Dépanneur Centre-Ville 24h",
      address: "789 Rue Ste-Catherine O.",
      city: "Montréal",
      postalCode: "H3B 1C9",
      phone: "514-555-0303",
      email: "centreville@depxpres.com",
      status: "active",
      zoneId: zoneIds[1],
      zoneName: "Montréal Centre-Ville",
      rating: 4.5,
      totalOrders: 891,
      totalRevenue: 22340.75,
      isOpen: true,
      lat: 45.5048,
      lng: -73.5772,
    },
    {
      name: "Dépanneur Montréal-Nord",
      address: "321 Boul. Henri-Bourassa E.",
      city: "Montréal",
      postalCode: "H1G 2T5",
      phone: "514-555-0404",
      email: "mtlnord@depxpres.com",
      status: "inactive",
      zoneId: zoneIds[2],
      zoneName: "Montréal Nord",
      rating: 4.2,
      totalOrders: 156,
      totalRevenue: 3890.00,
      isOpen: false,
      lat: 45.5978,
      lng: -73.6241,
    },
  ];

  const storeIds: string[] = [];
  for (const store of stores) {
    const ref = await addDoc(collection(db, "stores"), {
      ...store,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    storeIds.push(ref.id);
    console.log(`  Store: ${store.name} -> ${ref.id}`);
  }
  return storeIds;
}

async function seedDrivers(zoneIds: string[]) {
  console.log("Seeding drivers...");
  const drivers = [
    {
      id: "driver-001",
      userId: "driver-001",
      firstName: "Marc-André",
      lastName: "Tremblay",
      email: "marc.tremblay@depxpres.com",
      phone: "514-555-1001",
      status: "online",
      isOnline: true,
      rating: 4.9,
      totalDeliveries: 342,
      totalEarnings: 8750.50,
      zoneId: zoneIds[0],
      zoneName: "Laval",
      avatarUrl: "https://picsum.photos/seed/driver-marc/200/200",
    },
    {
      id: "driver-002",
      userId: "driver-002",
      firstName: "Jean-Philippe",
      lastName: "Gagnon",
      email: "jp.gagnon@depxpres.com",
      phone: "514-555-1002",
      status: "delivering",
      isOnline: true,
      rating: 4.7,
      totalDeliveries: 218,
      totalEarnings: 5420.25,
      zoneId: zoneIds[1],
      zoneName: "Montréal Centre-Ville",
      avatarUrl: "https://picsum.photos/seed/driver-jp/200/200",
    },
    {
      id: "driver-003",
      userId: "driver-003",
      firstName: "Amina",
      lastName: "Diallo",
      email: "amina.diallo@depxpres.com",
      phone: "438-555-1003",
      status: "online",
      isOnline: true,
      rating: 5.0,
      totalDeliveries: 89,
      totalEarnings: 2340.00,
      zoneId: zoneIds[0],
      zoneName: "Laval",
      avatarUrl: "https://picsum.photos/seed/driver-amina/200/200",
    },
    {
      id: "driver-004",
      userId: "driver-004",
      firstName: "Luc",
      lastName: "Bergeron",
      email: "luc.bergeron@depxpres.com",
      phone: "514-555-1004",
      status: "offline",
      isOnline: false,
      rating: 4.6,
      totalDeliveries: 156,
      totalEarnings: 3890.75,
      zoneId: zoneIds[2],
      zoneName: "Montréal Nord",
      avatarUrl: "https://picsum.photos/seed/driver-luc/200/200",
    },
    {
      id: "driver-005",
      userId: "driver-005",
      firstName: "Sofia",
      lastName: "Martinez",
      email: "sofia.martinez@depxpres.com",
      phone: "514-555-1005",
      status: "online",
      isOnline: true,
      rating: 4.8,
      totalDeliveries: 201,
      totalEarnings: 5100.00,
      zoneId: zoneIds[3],
      zoneName: "Longueuil",
      avatarUrl: "https://picsum.photos/seed/driver-sofia/200/200",
    },
  ];

  for (const driver of drivers) {
    const { id, ...data } = driver;
    await setDoc(doc(db, "driver_profiles", id), {
      ...data,
      joinedAt: daysAgo(Math.floor(Math.random() * 180 + 30)),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Add documents
    const docTypes = [
      { type: "drivers_license", label: "Permis de conduire", status: "approved", expiryDate: Timestamp.fromDate(new Date("2026-12-31")) },
      { type: "insurance", label: "Assurance véhicule", status: id === "driver-004" ? "expired" : "approved", expiryDate: id === "driver-004" ? Timestamp.fromDate(new Date("2025-01-01")) : Timestamp.fromDate(new Date("2026-06-30")) },
      { type: "vehicle_registration", label: "Immatriculation", status: "approved", expiryDate: Timestamp.fromDate(new Date("2026-03-31")) },
    ];

    for (const docData of docTypes) {
      await addDoc(collection(db, "driver_profiles", id, "documents"), {
        ...docData,
        driverId: id,
        uploadedAt: daysAgo(Math.floor(Math.random() * 60 + 10)),
        createdAt: serverTimestamp(),
      });
    }

    // Add vehicle
    await addDoc(collection(db, "driver_profiles", id, "vehicles"), {
      driverId: id,
      make: ["Toyota", "Honda", "Ford", "Hyundai", "Kia"][Math.floor(Math.random() * 5)],
      model: ["Corolla", "Civic", "Focus", "Elantra", "Rio"][Math.floor(Math.random() * 5)],
      year: 2018 + Math.floor(Math.random() * 6),
      color: ["Blanc", "Noir", "Gris", "Rouge", "Bleu"][Math.floor(Math.random() * 5)],
      licensePlate: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 900 + 100)}`,
      type: "car",
      isActive: true,
      createdAt: serverTimestamp(),
    });

    // Add earnings
    for (let i = 0; i < 7; i++) {
      const amount = Math.round((Math.random() * 80 + 20) * 100) / 100;
      await addDoc(collection(db, "driver_profiles", id, "earnings"), {
        driverId: id,
        orderId: `FDC-${Math.floor(Math.random() * 90000 + 10000)}`,
        amount,
        type: "delivery",
        description: "Livraison complétée",
        createdAt: daysAgo(i),
      });
    }

    console.log(`  Driver: ${driver.firstName} ${driver.lastName} -> ${id}`);
  }

  return drivers.map((d) => d.id);
}

async function seedClients() {
  console.log("Seeding clients...");
  const clients = [
    { id: "client-001", userId: "client-001", firstName: "Sophie", lastName: "Martin", email: "sophie.martin@gmail.com", phone: "514-555-2001", status: "active", totalOrders: 24, totalSpent: 387.50, avatarUrl: "https://picsum.photos/seed/client-sophie/200/200" },
    { id: "client-002", userId: "client-002", firstName: "Jean-Pierre", lastName: "Tremblay", email: "jp.tremblay@gmail.com", phone: "514-555-2002", status: "active", totalOrders: 8, totalSpent: 142.00, avatarUrl: "https://picsum.photos/seed/client-jp/200/200" },
    { id: "client-003", userId: "client-003", firstName: "Marie", lastName: "Gagnon", email: "marie.gagnon@gmail.com", phone: "450-555-2003", status: "active", totalOrders: 45, totalSpent: 892.75, avatarUrl: "https://picsum.photos/seed/client-marie/200/200" },
    { id: "client-004", userId: "client-004", firstName: "Carlos", lastName: "Rodriguez", email: "carlos.rodriguez@gmail.com", phone: "514-555-2004", status: "blocked", totalOrders: 3, totalSpent: 56.25, avatarUrl: "https://picsum.photos/seed/client-carlos/200/200" },
    { id: "client-005", userId: "client-005", firstName: "Fatima", lastName: "Benali", email: "fatima.benali@gmail.com", phone: "438-555-2005", status: "active", totalOrders: 17, totalSpent: 298.90, avatarUrl: "https://picsum.photos/seed/client-fatima/200/200" },
    { id: "client-006", userId: "client-006", firstName: "Alex", lastName: "Bouchard", email: "alex.bouchard@gmail.com", phone: "514-555-2006", status: "active", totalOrders: 31, totalSpent: 542.00, avatarUrl: "https://picsum.photos/seed/client-alex/200/200" },
  ];

  for (const client of clients) {
    const { id, ...data } = client;
    await setDoc(doc(db, "client_profiles", id), {
      ...data,
      createdAt: daysAgo(Math.floor(Math.random() * 365 + 30)),
      updatedAt: serverTimestamp(),
      lastOrderAt: daysAgo(Math.floor(Math.random() * 14)),
    });
    console.log(`  Client: ${client.firstName} ${client.lastName} -> ${id}`);
  }

  return clients.map((c) => c.id);
}

async function seedOrders(clientIds: string[], driverIds: string[], storeIds: string[]) {
  console.log("Seeding orders...");

  const statuses = ["pending", "confirmed", "preparing", "en_route", "delivered", "cancelled"];
  const paymentMethods = ["card", "cash", "wallet"];

  const orderData = [
    { clientId: clientIds[0], clientName: "Sophie Martin", driverId: driverIds[0], driverName: "Marc-André Tremblay", storeId: storeIds[0], storeName: "Dépanneur Chomedey Express", status: "en_route", total: 25.74, subtotal: 18.28, deliveryFee: 4.99, taxes: 2.47, hoursBack: 1 },
    { clientId: clientIds[1], clientName: "Jean-Pierre Tremblay", driverId: driverIds[1], driverName: "Jean-Philippe Gagnon", storeId: storeIds[2], storeName: "Dépanneur Centre-Ville 24h", status: "delivered", total: 42.50, subtotal: 33.00, deliveryFee: 5.99, taxes: 3.51, hoursBack: 5 },
    { clientId: clientIds[2], clientName: "Marie Gagnon", driverId: null, driverName: null, storeId: storeIds[0], storeName: "Dépanneur Chomedey Express", status: "pending", total: 18.75, subtotal: 13.50, deliveryFee: 4.99, taxes: 0.26, hoursBack: 0.5 },
    { clientId: clientIds[4], clientName: "Fatima Benali", driverId: driverIds[2], driverName: "Amina Diallo", storeId: storeIds[1], storeName: "Dépanneur St-Martin", status: "preparing", total: 31.20, subtotal: 23.50, deliveryFee: 4.99, taxes: 2.71, hoursBack: 0.3 },
    { clientId: clientIds[5], clientName: "Alex Bouchard", driverId: driverIds[0], driverName: "Marc-André Tremblay", storeId: storeIds[2], storeName: "Dépanneur Centre-Ville 24h", status: "delivered", total: 67.80, subtotal: 55.00, deliveryFee: 5.99, taxes: 6.81, hoursBack: 24 },
    { clientId: clientIds[0], clientName: "Sophie Martin", driverId: null, driverName: null, storeId: storeIds[0], storeName: "Dépanneur Chomedey Express", status: "cancelled", total: 22.50, subtotal: 16.50, deliveryFee: 4.99, taxes: 1.01, hoursBack: 48 },
    { clientId: clientIds[2], clientName: "Marie Gagnon", driverId: driverIds[4], driverName: "Sofia Martinez", storeId: storeIds[3], storeName: "Dépanneur Montréal-Nord", status: "delivered", total: 38.90, subtotal: 29.50, deliveryFee: 6.49, taxes: 2.91, hoursBack: 72 },
    { clientId: clientIds[1], clientName: "Jean-Pierre Tremblay", driverId: null, driverName: null, storeId: storeIds[1], storeName: "Dépanneur St-Martin", status: "confirmed", total: 15.50, subtotal: 10.00, deliveryFee: 4.99, taxes: 0.51, hoursBack: 0.1 },
  ];

  for (let i = 0; i < orderData.length; i++) {
    const o = orderData[i];
    const orderId = `FDC-${12345 + i}`;
    const createdAt = hoursAgo(o.hoursBack);

    const orderRef = doc(db, "orders", orderId);
    await setDoc(orderRef, {
      clientId: o.clientId,
      clientName: o.clientName,
      driverId: o.driverId,
      driverName: o.driverName,
      storeId: o.storeId,
      storeName: o.storeName,
      status: o.status,
      items: [
        { productId: "prod1", productName: "Heineken 6 pack", quantity: 1, unitPrice: 14.99 },
        { productId: "prod5", productName: "Doritos", quantity: 2, unitPrice: 4.29 },
      ],
      subtotal: o.subtotal,
      deliveryFee: o.deliveryFee,
      taxes: o.taxes,
      total: o.total,
      deliveryAddress: {
        street: `${Math.floor(Math.random() * 900 + 100)} Rue Principale`,
        city: "Laval",
        postalCode: "H7W 1A1",
        instructions: "Sonner à la porte",
      },
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      paymentStatus: o.status === "delivered" ? "paid" : o.status === "cancelled" ? "refunded" : "pending",
      estimatedDeliveryTime: 30,
      createdAt,
      updatedAt: serverTimestamp(),
    });

    // Add status history
    const historyStatuses = ["pending", "confirmed", "preparing"];
    if (o.status !== "pending" && o.status !== "cancelled") {
      for (const hs of historyStatuses) {
        await addDoc(collection(db, "orders", orderId, "status_history"), {
          status: hs,
          changedBy: "system",
          changedByRole: "system",
          note: `Statut mis à jour: ${hs}`,
          timestamp: hoursAgo(o.hoursBack + 0.5),
        });
        if (hs === o.status) break;
      }
    }

    console.log(`  Order: ${orderId} (${o.status})`);
  }
}

async function seedAdminProfile() {
  console.log("Seeding admin profile...");
  await setDoc(doc(db, "admin_profiles", "admin-hedi"), {
    userId: "admin-hedi",
    firstName: "Hedi",
    lastName: "Bennis",
    email: "hedibennis17@gmail.com",
    role: "super_admin",
    permissions: ["all"],
    avatarUrl: "https://picsum.photos/seed/admin-hedi/200/200",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  console.log("  Admin profile created: admin-hedi");
}

async function main() {
  console.log("🚀 Starting DepXpreS Firestore seed...\n");

  try {
    await seedAdminProfile();
    const catIds = await seedCategories();
    await seedProducts(catIds);
    const zoneIds = await seedZones();
    const storeIds = await seedStores(zoneIds);
    const driverIds = await seedDrivers(zoneIds);
    const clientIds = await seedClients();
    await seedOrders(clientIds, driverIds, storeIds);

    console.log("\n✅ Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

main();
