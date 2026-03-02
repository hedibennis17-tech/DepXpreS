#!/usr/bin/env python3
"""
DepXpreS — Seed complet Firestore via Firebase Admin SDK
Collections: zones, stores, categories, products, driver_profiles,
             client_profiles, admin_profiles, orders, order_items,
             order_status_history, payments, chat_threads, chat_messages,
             support_tickets, notifications, dispatch_queue
"""

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta
import random
import uuid
import os

# Init Admin SDK
SA_PATH = os.path.join(os.path.dirname(__file__), "serviceAccount.json")
cred = credentials.Certificate(SA_PATH)
firebase_admin.initialize_app(cred)
db = firestore.client()

def ts_now():
    return firestore.SERVER_TIMESTAMP

def ts_days_ago(n):
    return datetime.utcnow() - timedelta(days=n)

def ts_hours_ago(n):
    return datetime.utcnow() - timedelta(hours=n)

def ts_minutes_ago(n):
    return datetime.utcnow() - timedelta(minutes=n)

def rand_order_number():
    return f"FDC-{random.randint(10000, 99999)}"

# ─────────────────────────────────────────────
# 1. ADMIN PROFILES
# ─────────────────────────────────────────────
def seed_admin_profiles():
    print("\n📋 Seeding admin_profiles...")
    admins = [
        {
            "id": "admin-hedi",
            "userId": "admin-hedi",
            "firstName": "Hedi",
            "lastName": "Bennis",
            "email": "hedibennis17@gmail.com",
            "role": "super_admin",
            "permissions": ["all"],
            "isActive": True,
            "avatarUrl": "https://ui-avatars.com/api/?name=Hedi+Bennis&background=ef4444&color=fff",
            "createdAt": ts_days_ago(365),
            "updatedAt": ts_days_ago(1),
        },
        {
            "id": "admin-sophie",
            "userId": "admin-sophie",
            "firstName": "Sophie",
            "lastName": "Côté",
            "email": "sophie.cote@depxpres.com",
            "role": "admin",
            "permissions": ["orders", "drivers", "clients", "stores"],
            "isActive": True,
            "avatarUrl": "https://ui-avatars.com/api/?name=Sophie+Cote&background=3b82f6&color=fff",
            "createdAt": ts_days_ago(200),
            "updatedAt": ts_days_ago(2),
        },
    ]
    for a in admins:
        doc_id = a.pop("id")
        db.collection("admin_profiles").document(doc_id).set(a)
        print(f"  ✓ Admin: {a['firstName']} {a['lastName']}")

# ─────────────────────────────────────────────
# 2. ZONES
# ─────────────────────────────────────────────
def seed_zones():
    print("\n🗺️  Seeding zones...")
    zones = [
        {"id": "zone-laval", "nameFr": "Laval", "nameEn": "Laval", "slug": "laval", "isActive": True, "deliveryFee": 4.99, "minOrderAmount": 10.0, "estimatedTimeMinutes": 25, "lat": 45.5586, "lng": -73.7553},
        {"id": "zone-mtl-centre", "nameFr": "Montréal Centre-Ville", "nameEn": "Montreal Downtown", "slug": "mtl-centre", "isActive": True, "deliveryFee": 5.99, "minOrderAmount": 15.0, "estimatedTimeMinutes": 30, "lat": 45.5048, "lng": -73.5772},
        {"id": "zone-mtl-nord", "nameFr": "Montréal Nord", "nameEn": "Montreal North", "slug": "mtl-nord", "isActive": True, "deliveryFee": 5.49, "minOrderAmount": 12.0, "estimatedTimeMinutes": 28, "lat": 45.5978, "lng": -73.6241},
        {"id": "zone-longueuil", "nameFr": "Longueuil", "nameEn": "Longueuil", "slug": "longueuil", "isActive": True, "deliveryFee": 6.49, "minOrderAmount": 15.0, "estimatedTimeMinutes": 35, "lat": 45.5312, "lng": -73.5185},
        {"id": "zone-laval-ouest", "nameFr": "Laval Ouest", "nameEn": "Laval West", "slug": "laval-ouest", "isActive": True, "deliveryFee": 4.99, "minOrderAmount": 10.0, "estimatedTimeMinutes": 27, "lat": 45.5700, "lng": -73.8100},
    ]
    zone_ids = []
    for z in zones:
        doc_id = z.pop("id")
        z["createdAt"] = ts_days_ago(400)
        z["updatedAt"] = ts_days_ago(10)
        db.collection("zones").document(doc_id).set(z)
        zone_ids.append(doc_id)
        print(f"  ✓ Zone: {z['nameFr']}")
    return zone_ids

# ─────────────────────────────────────────────
# 3. CATEGORIES
# ─────────────────────────────────────────────
def seed_categories():
    print("\n🏷️  Seeding categories...")
    cats = [
        {"name": "Bière & alcool", "slug": "biere-alcool", "iconName": "Beer", "sortOrder": 1, "isActive": True},
        {"name": "Boissons", "slug": "boissons", "iconName": "GlassWater", "sortOrder": 2, "isActive": True},
        {"name": "Tabagisme", "slug": "tabagisme", "iconName": "Cigarette", "sortOrder": 3, "isActive": True},
        {"name": "Vapotage", "slug": "vapotage", "iconName": "Flame", "sortOrder": 4, "isActive": True},
        {"name": "Chips & craquelins", "slug": "chips", "iconName": "Cookie", "sortOrder": 5, "isActive": True},
        {"name": "Chocolat & bonbons", "slug": "chocolat", "iconName": "Candy", "sortOrder": 6, "isActive": True},
        {"name": "Café & boissons glacées", "slug": "cafe", "iconName": "Coffee", "sortOrder": 7, "isActive": True},
        {"name": "Pain & lait", "slug": "pain-lait", "iconName": "Sandwich", "sortOrder": 8, "isActive": True},
        {"name": "Produits laitiers", "slug": "produits-laitiers", "iconName": "Milk", "sortOrder": 9, "isActive": True},
        {"name": "Congelé", "slug": "congele", "iconName": "Snowflake", "sortOrder": 10, "isActive": True},
        {"name": "Articles ménagers", "slug": "menagers", "iconName": "Home", "sortOrder": 11, "isActive": True},
        {"name": "Hygiène & toilette", "slug": "hygiene", "iconName": "Bath", "sortOrder": 12, "isActive": True},
        {"name": "Lotto / billets", "slug": "lotto", "iconName": "Ticket", "sortOrder": 13, "isActive": True},
        {"name": "Dépannage express", "slug": "express", "iconName": "Zap", "sortOrder": 14, "isActive": True},
    ]
    cat_ids = {}
    for c in cats:
        c["productCount"] = 0
        c["createdAt"] = ts_days_ago(300)
        c["updatedAt"] = ts_days_ago(5)
        ref = db.collection("categories").add(c)
        cat_ids[c["slug"]] = ref[1].id
        print(f"  ✓ Category: {c['name']} → {ref[1].id}")
    return cat_ids

# ─────────────────────────────────────────────
# 4. PRODUCTS
# ─────────────────────────────────────────────
def seed_products(cat_ids):
    print("\n📦 Seeding products...")
    products = [
        # Bière & alcool
        {"name": "Heineken 6 pack", "slug": "biere-alcool", "format": "6 × 330ml", "price": 14.99, "cost": 9.50, "stock": "in_stock", "stockQty": 48, "tags": ["popular", "age_required"], "isRestricted": True, "minAge": 18, "imageUrl": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&q=80"},
        {"name": "Corona 6 pack", "slug": "biere-alcool", "format": "6 × 355ml", "price": 15.49, "cost": 10.00, "stock": "in_stock", "stockQty": 36, "tags": ["age_required"], "isRestricted": True, "minAge": 18, "imageUrl": "https://images.unsplash.com/photo-1566633806827-0a7a9d2e2b9c?w=400&q=80"},
        {"name": "Budweiser 12 pack", "slug": "biere-alcool", "format": "12 × 355ml", "price": 26.99, "cost": 18.00, "stock": "in_stock", "stockQty": 24, "tags": ["age_required", "popular"], "isRestricted": True, "minAge": 18, "imageUrl": "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400&q=80"},
        {"name": "Vin rouge 750ml", "slug": "biere-alcool", "format": "750ml", "price": 18.99, "cost": 12.00, "stock": "low_stock", "stockQty": 8, "tags": ["age_required"], "isRestricted": True, "minAge": 18, "imageUrl": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80"},
        {"name": "Vodka Smirnoff 375ml", "slug": "biere-alcool", "format": "375ml", "price": 24.99, "cost": 16.00, "stock": "in_stock", "stockQty": 15, "tags": ["age_required"], "isRestricted": True, "minAge": 18, "imageUrl": "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&q=80"},
        # Boissons
        {"name": "Coca-Cola", "slug": "boissons", "format": "355ml", "price": 1.79, "cost": 0.90, "stock": "in_stock", "stockQty": 120, "tags": ["popular"], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80"},
        {"name": "Red Bull", "slug": "boissons", "format": "250ml", "price": 3.49, "cost": 1.80, "stock": "in_stock", "stockQty": 80, "tags": ["popular"], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80"},
        {"name": "Eau Evian 1.5L", "slug": "boissons", "format": "1.5L", "price": 2.29, "cost": 1.10, "stock": "in_stock", "stockQty": 60, "tags": [], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80"},
        {"name": "Gatorade Fruit Punch", "slug": "boissons", "format": "591ml", "price": 2.99, "cost": 1.50, "stock": "in_stock", "stockQty": 45, "tags": [], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=400&q=80"},
        # Tabagisme
        {"name": "Marlboro Rouge", "slug": "tabagisme", "format": "20 unités", "price": 16.50, "cost": 12.00, "stock": "in_stock", "stockQty": 50, "tags": ["age_required"], "isRestricted": True, "minAge": 18, "imageUrl": "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=400&q=80"},
        {"name": "Export A Vert", "slug": "tabagisme", "format": "20 unités", "price": 15.99, "cost": 11.50, "stock": "in_stock", "stockQty": 40, "tags": ["age_required"], "isRestricted": True, "minAge": 18, "imageUrl": "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=400&q=80"},
        # Vapotage
        {"name": "Vape jetable Elf Bar", "slug": "vapotage", "format": "1 unité / 600 puffs", "price": 12.99, "cost": 7.00, "stock": "in_stock", "stockQty": 30, "tags": ["age_required", "popular"], "isRestricted": True, "minAge": 18, "imageUrl": "https://images.unsplash.com/photo-1574169208507-84376144848b?w=400&q=80"},
        {"name": "E-liquide 30ml", "slug": "vapotage", "format": "30ml", "price": 9.99, "cost": 5.00, "stock": "low_stock", "stockQty": 12, "tags": ["age_required"], "isRestricted": True, "minAge": 18, "imageUrl": "https://images.unsplash.com/photo-1574169208507-84376144848b?w=400&q=80"},
        # Chips
        {"name": "Doritos Nacho Cheese", "slug": "chips", "format": "255g", "price": 4.29, "cost": 2.20, "stock": "in_stock", "stockQty": 55, "tags": ["popular", "promo"], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80"},
        {"name": "Lays Original", "slug": "chips", "format": "235g", "price": 3.99, "cost": 2.00, "stock": "in_stock", "stockQty": 48, "tags": [], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400&q=80"},
        {"name": "Pringles Original", "slug": "chips", "format": "165g", "price": 4.49, "cost": 2.30, "stock": "in_stock", "stockQty": 35, "tags": ["popular"], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400&q=80"},
        # Chocolat
        {"name": "Kit Kat", "slug": "chocolat", "format": "45g", "price": 1.99, "cost": 0.90, "stock": "in_stock", "stockQty": 80, "tags": ["popular"], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&q=80"},
        {"name": "Reese's Peanut Butter", "slug": "chocolat", "format": "42g", "price": 2.29, "cost": 1.00, "stock": "in_stock", "stockQty": 60, "tags": ["popular"], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&q=80"},
        # Café
        {"name": "Café Tim Hortons", "slug": "cafe", "format": "473ml", "price": 2.49, "cost": 1.20, "stock": "in_stock", "stockQty": 40, "tags": ["popular"], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80"},
        {"name": "Starbucks Frappuccino", "slug": "cafe", "format": "281ml", "price": 3.99, "cost": 2.00, "stock": "in_stock", "stockQty": 25, "tags": [], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80"},
        # Pain & lait
        {"name": "Pain tranché Wonder", "slug": "pain-lait", "format": "675g", "price": 3.99, "cost": 2.20, "stock": "in_stock", "stockQty": 20, "tags": [], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80"},
        {"name": "Lait 2% Natrel", "slug": "pain-lait", "format": "2L", "price": 5.49, "cost": 3.50, "stock": "in_stock", "stockQty": 18, "tags": [], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80"},
        # Ménagers
        {"name": "Papier toilette Royale", "slug": "menagers", "format": "6 rouleaux", "price": 8.99, "cost": 5.00, "stock": "low_stock", "stockQty": 10, "tags": [], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=400&q=80"},
        {"name": "Sacs poubelle 40L", "slug": "menagers", "format": "20 sacs", "price": 6.99, "cost": 3.50, "stock": "in_stock", "stockQty": 22, "tags": [], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=400&q=80"},
        # Hygiène
        {"name": "Dentifrice Colgate", "slug": "hygiene", "format": "90ml", "price": 3.29, "cost": 1.80, "stock": "in_stock", "stockQty": 30, "tags": [], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1559591937-abc3a0c6a3e0?w=400&q=80"},
        {"name": "Savon Dove", "slug": "hygiene", "format": "113g", "price": 2.49, "cost": 1.20, "stock": "in_stock", "stockQty": 35, "tags": [], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1559591937-abc3a0c6a3e0?w=400&q=80"},
        # Lotto
        {"name": "Billet Lotto 6/49", "slug": "lotto", "format": "1 billet", "price": 3.00, "cost": 3.00, "stock": "in_stock", "stockQty": 200, "tags": [], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=400&q=80"},
        {"name": "Gratteux 5$", "slug": "lotto", "format": "1 billet", "price": 5.00, "cost": 5.00, "stock": "in_stock", "stockQty": 100, "tags": ["popular"], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=400&q=80"},
        # Express
        {"name": "Piles AA Duracell", "slug": "express", "format": "4 unités", "price": 6.99, "cost": 3.50, "stock": "in_stock", "stockQty": 25, "tags": [], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&q=80"},
        {"name": "Chargeur USB-C", "slug": "express", "format": "1m", "price": 12.99, "cost": 6.00, "stock": "low_stock", "stockQty": 8, "tags": [], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&q=80"},
    ]
    prod_ids = {}
    for p in products:
        slug = p.pop("slug")
        cat_id = cat_ids.get(slug, "")
        p["categoryId"] = cat_id
        p["isActive"] = True
        p["comparePrice"] = None
        p["barcode"] = f"0{random.randint(10000000000, 99999999999)}"
        p["sku"] = f"SKU-{random.randint(1000, 9999)}"
        p["createdAt"] = ts_days_ago(random.randint(30, 200))
        p["updatedAt"] = ts_days_ago(random.randint(1, 10))
        ref = db.collection("products").add(p)
        prod_ids[p["name"]] = ref[1].id
        print(f"  ✓ Product: {p['name']} → {ref[1].id}")
    return prod_ids

# ─────────────────────────────────────────────
# 5. STORES
# ─────────────────────────────────────────────
def seed_stores(zone_ids):
    print("\n🏪 Seeding stores...")
    stores_data = [
        {"name": "Dépanneur Chomedey Express", "address": "123 Boul. Chomedey", "city": "Laval", "postalCode": "H7W 2E8", "phone": "450-555-0101", "email": "chomedey@depxpres.com", "status": "active", "zoneId": zone_ids[0], "zoneName": "Laval", "rating": 4.8, "totalOrders": 342, "totalRevenue": 8750.50, "isOpen": True, "lat": 45.5586, "lng": -73.7553},
        {"name": "Dépanneur St-Martin", "address": "456 Boul. St-Martin O.", "city": "Laval", "postalCode": "H7M 1Y3", "phone": "450-555-0202", "email": "stmartin@depxpres.com", "status": "active", "zoneId": zone_ids[0], "zoneName": "Laval", "rating": 4.6, "totalOrders": 218, "totalRevenue": 5420.25, "isOpen": True, "lat": 45.5725, "lng": -73.7412},
        {"name": "Dépanneur Centre-Ville 24h", "address": "789 Rue Ste-Catherine O.", "city": "Montréal", "postalCode": "H3B 1C9", "phone": "514-555-0303", "email": "centreville@depxpres.com", "status": "active", "zoneId": zone_ids[1], "zoneName": "Montréal Centre-Ville", "rating": 4.5, "totalOrders": 891, "totalRevenue": 22340.75, "isOpen": True, "lat": 45.5048, "lng": -73.5772},
        {"name": "Dépanneur Montréal-Nord", "address": "321 Boul. Henri-Bourassa E.", "city": "Montréal", "postalCode": "H1G 2T5", "phone": "514-555-0404", "email": "mtlnord@depxpres.com", "status": "inactive", "zoneId": zone_ids[2], "zoneName": "Montréal Nord", "rating": 4.2, "totalOrders": 156, "totalRevenue": 3890.00, "isOpen": False, "lat": 45.5978, "lng": -73.6241},
        {"name": "Dépanneur Longueuil Express", "address": "555 Rue St-Charles O.", "city": "Longueuil", "postalCode": "J4H 1E5", "phone": "450-555-0505", "email": "longueuil@depxpres.com", "status": "active", "zoneId": zone_ids[3], "zoneName": "Longueuil", "rating": 4.4, "totalOrders": 124, "totalRevenue": 3120.50, "isOpen": True, "lat": 45.5312, "lng": -73.5185},
        {"name": "Dépanneur Laval Ouest", "address": "88 Boul. Cartier O.", "city": "Laval", "postalCode": "H7N 2J4", "phone": "450-555-0606", "email": "lavalwest@depxpres.com", "status": "active", "zoneId": zone_ids[4], "zoneName": "Laval Ouest", "rating": 4.7, "totalOrders": 198, "totalRevenue": 4980.00, "isOpen": True, "lat": 45.5700, "lng": -73.8100},
        {"name": "Dépanneur Plateau Express", "address": "1200 Rue Rachel E.", "city": "Montréal", "postalCode": "H2J 2K3", "phone": "514-555-0707", "email": "plateau@depxpres.com", "status": "pending", "zoneId": zone_ids[1], "zoneName": "Montréal Centre-Ville", "rating": 0.0, "totalOrders": 0, "totalRevenue": 0.0, "isOpen": False, "lat": 45.5231, "lng": -73.5745},
    ]
    store_ids = []
    for s in stores_data:
        s["createdAt"] = ts_days_ago(random.randint(60, 400))
        s["updatedAt"] = ts_days_ago(random.randint(1, 30))
        ref = db.collection("stores").add(s)
        store_ids.append(ref[1].id)
        print(f"  ✓ Store: {s['name']} → {ref[1].id}")
    return store_ids

# ─────────────────────────────────────────────
# 6. DRIVER PROFILES
# ─────────────────────────────────────────────
def seed_drivers(zone_ids):
    print("\n🚗 Seeding driver_profiles...")
    drivers = [
        {"id": "driver-001", "firstName": "Marc-André", "lastName": "Tremblay", "email": "marc.tremblay@depxpres.com", "phone": "514-555-1001", "status": "online", "isOnline": True, "rating": 4.9, "totalDeliveries": 342, "totalEarnings": 8750.50, "zoneId": zone_ids[0], "zoneName": "Laval", "applicationStatus": "approved", "verificationStatus": "approved", "availabilityStatus": "available"},
        {"id": "driver-002", "firstName": "Jean-Philippe", "lastName": "Gagnon", "email": "jp.gagnon@depxpres.com", "phone": "514-555-1002", "status": "delivering", "isOnline": True, "rating": 4.7, "totalDeliveries": 218, "totalEarnings": 5420.25, "zoneId": zone_ids[1], "zoneName": "Montréal Centre-Ville", "applicationStatus": "approved", "verificationStatus": "approved", "availabilityStatus": "reserved"},
        {"id": "driver-003", "firstName": "Amina", "lastName": "Diallo", "email": "amina.diallo@depxpres.com", "phone": "438-555-1003", "status": "online", "isOnline": True, "rating": 5.0, "totalDeliveries": 89, "totalEarnings": 2340.00, "zoneId": zone_ids[0], "zoneName": "Laval", "applicationStatus": "approved", "verificationStatus": "approved", "availabilityStatus": "available"},
        {"id": "driver-004", "firstName": "Luc", "lastName": "Bergeron", "email": "luc.bergeron@depxpres.com", "phone": "514-555-1004", "status": "offline", "isOnline": False, "rating": 4.6, "totalDeliveries": 156, "totalEarnings": 3890.75, "zoneId": zone_ids[2], "zoneName": "Montréal Nord", "applicationStatus": "approved", "verificationStatus": "approved", "availabilityStatus": "available"},
        {"id": "driver-005", "firstName": "Sofia", "lastName": "Martinez", "email": "sofia.martinez@depxpres.com", "phone": "514-555-1005", "status": "online", "isOnline": True, "rating": 4.8, "totalDeliveries": 201, "totalEarnings": 5100.00, "zoneId": zone_ids[3], "zoneName": "Longueuil", "applicationStatus": "approved", "verificationStatus": "approved", "availabilityStatus": "available"},
        {"id": "driver-006", "firstName": "Kevin", "lastName": "Lapointe", "email": "kevin.lapointe@depxpres.com", "phone": "514-555-1006", "status": "suspended", "isOnline": False, "rating": 3.8, "totalDeliveries": 45, "totalEarnings": 980.00, "zoneId": zone_ids[1], "zoneName": "Montréal Centre-Ville", "applicationStatus": "approved", "verificationStatus": "approved", "availabilityStatus": "unavailable"},
        {"id": "driver-007", "firstName": "Yasmine", "lastName": "Khelifi", "email": "yasmine.khelifi@depxpres.com", "phone": "438-555-1007", "status": "online", "isOnline": True, "rating": 4.5, "totalDeliveries": 67, "totalEarnings": 1650.00, "zoneId": zone_ids[4], "zoneName": "Laval Ouest", "applicationStatus": "approved", "verificationStatus": "approved", "availabilityStatus": "available"},
    ]
    driver_ids = []
    makes = ["Toyota", "Honda", "Ford", "Hyundai", "Kia", "Mazda"]
    models = ["Corolla", "Civic", "Focus", "Elantra", "Rio", "3"]
    colors = ["Blanc", "Noir", "Gris", "Rouge", "Bleu", "Argent"]
    
    for d in drivers:
        doc_id = d.pop("id")
        d["userId"] = doc_id
        d["avatarUrl"] = f"https://ui-avatars.com/api/?name={d['firstName']}+{d['lastName']}&background=random&color=fff&size=200"
        d["joinedAt"] = ts_days_ago(random.randint(30, 300))
        d["createdAt"] = d["joinedAt"]
        d["updatedAt"] = ts_days_ago(random.randint(1, 15))
        d["currentOrderId"] = None
        d["lastLocation"] = {"lat": 45.5 + random.uniform(-0.1, 0.1), "lng": -73.7 + random.uniform(-0.1, 0.1), "updatedAt": ts_minutes_ago(random.randint(5, 60))}
        
        db.collection("driver_profiles").document(doc_id).set(d)
        
        # Documents subcollection
        doc_types = [
            {"type": "drivers_license", "label": "Permis de conduire", "status": "approved" if doc_id != "driver-004" else "expired", "expiryDate": datetime(2027, 12, 31) if doc_id != "driver-004" else datetime(2024, 1, 1)},
            {"type": "insurance", "label": "Assurance véhicule", "status": "approved", "expiryDate": datetime(2026, 6, 30)},
            {"type": "vehicle_registration", "label": "Immatriculation", "status": "approved", "expiryDate": datetime(2026, 3, 31)},
            {"type": "background_check", "label": "Vérification antécédents", "status": "approved" if doc_id not in ["driver-006"] else "rejected", "expiryDate": None},
        ]
        for dt in doc_types:
            db.collection("driver_profiles").document(doc_id).collection("documents").add({
                **dt,
                "driverId": doc_id,
                "fileUrl": f"https://storage.googleapis.com/depxpres/docs/{doc_id}/{dt['type']}.pdf",
                "uploadedAt": ts_days_ago(random.randint(10, 90)),
                "createdAt": ts_days_ago(random.randint(10, 90)),
            })
        
        # Vehicle subcollection
        idx = random.randint(0, 5)
        db.collection("driver_profiles").document(doc_id).collection("vehicles").add({
            "driverId": doc_id,
            "make": makes[idx],
            "model": models[idx],
            "year": 2018 + random.randint(0, 6),
            "color": colors[random.randint(0, 5)],
            "licensePlate": f"{chr(65+random.randint(0,25))}{chr(65+random.randint(0,25))}{chr(65+random.randint(0,25))}-{random.randint(100,999)}",
            "type": "car",
            "isActive": True,
            "createdAt": ts_days_ago(random.randint(30, 200)),
        })
        
        # Earnings subcollection (last 14 days)
        for i in range(14):
            nb_deliveries = random.randint(0, 8)
            if nb_deliveries == 0:
                continue
            amount = round(nb_deliveries * random.uniform(8, 15), 2)
            tip = round(random.uniform(0, 5), 2)
            db.collection("driver_profiles").document(doc_id).collection("earnings").add({
                "driverId": doc_id,
                "orderId": rand_order_number(),
                "amount": amount,
                "tip": tip,
                "deliveries": nb_deliveries,
                "type": "delivery",
                "description": f"{nb_deliveries} livraison(s) complétée(s)",
                "createdAt": ts_days_ago(i),
            })
        
        driver_ids.append(doc_id)
        print(f"  ✓ Driver: {d['firstName']} {d['lastName']} → {doc_id}")
    
    return driver_ids

# ─────────────────────────────────────────────
# 7. CLIENT PROFILES
# ─────────────────────────────────────────────
def seed_clients():
    print("\n👤 Seeding client_profiles...")
    clients = [
        {"id": "client-001", "firstName": "Sophie", "lastName": "Martin", "email": "sophie.martin@gmail.com", "phone": "514-555-2001", "status": "active", "totalOrders": 24, "totalSpent": 387.50, "walletBalance": 15.00},
        {"id": "client-002", "firstName": "Jean-Pierre", "lastName": "Tremblay", "email": "jp.tremblay@gmail.com", "phone": "514-555-2002", "status": "active", "totalOrders": 8, "totalSpent": 142.00, "walletBalance": 0.00},
        {"id": "client-003", "firstName": "Marie", "lastName": "Gagnon", "email": "marie.gagnon@gmail.com", "phone": "450-555-2003", "status": "active", "totalOrders": 45, "totalSpent": 892.75, "walletBalance": 30.00},
        {"id": "client-004", "firstName": "Carlos", "lastName": "Rodriguez", "email": "carlos.rodriguez@gmail.com", "phone": "514-555-2004", "status": "blocked", "totalOrders": 3, "totalSpent": 56.25, "walletBalance": 0.00},
        {"id": "client-005", "firstName": "Fatima", "lastName": "Benali", "email": "fatima.benali@gmail.com", "phone": "438-555-2005", "status": "active", "totalOrders": 17, "totalSpent": 298.90, "walletBalance": 5.00},
        {"id": "client-006", "firstName": "Alex", "lastName": "Bouchard", "email": "alex.bouchard@gmail.com", "phone": "514-555-2006", "status": "active", "totalOrders": 31, "totalSpent": 542.00, "walletBalance": 20.00},
        {"id": "client-007", "firstName": "Nadia", "lastName": "Leblanc", "email": "nadia.leblanc@gmail.com", "phone": "514-555-2007", "status": "active", "totalOrders": 12, "totalSpent": 210.50, "walletBalance": 0.00},
        {"id": "client-008", "firstName": "Omar", "lastName": "Khalil", "email": "omar.khalil@gmail.com", "phone": "438-555-2008", "status": "active", "totalOrders": 5, "totalSpent": 88.75, "walletBalance": 10.00},
    ]
    client_ids = []
    for c in clients:
        doc_id = c.pop("id")
        c["userId"] = doc_id
        c["avatarUrl"] = f"https://ui-avatars.com/api/?name={c['firstName']}+{c['lastName']}&background=random&color=fff&size=200"
        c["createdAt"] = ts_days_ago(random.randint(30, 500))
        c["updatedAt"] = ts_days_ago(random.randint(1, 20))
        c["lastOrderAt"] = ts_days_ago(random.randint(1, 30))
        c["preferredAddress"] = f"{random.randint(100, 999)} Rue Principale, Laval, QC H7W 1A1"
        
        db.collection("client_profiles").document(doc_id).set(c)
        client_ids.append(doc_id)
        print(f"  ✓ Client: {c['firstName']} {c['lastName']} → {doc_id}")
    
    return client_ids

# ─────────────────────────────────────────────
# 8. ORDERS (with subcollections)
# ─────────────────────────────────────────────
def seed_orders(client_ids, driver_ids, store_ids, prod_ids):
    print("\n📋 Seeding orders...")
    
    prod_list = list(prod_ids.items())  # [(name, id), ...]
    
    order_scenarios = [
        # Active orders
        {"orderNumber": "FDC-12345", "clientIdx": 0, "driverIdx": 0, "storeIdx": 0, "status": "en_route", "paymentStatus": "paid", "hoursBack": 0.5, "total": 25.74, "subtotal": 18.28, "deliveryFee": 4.99, "taxes": 2.47, "tip": 0, "discount": 0},
        {"orderNumber": "FDC-12346", "clientIdx": 2, "driverIdx": None, "storeIdx": 0, "status": "pending", "paymentStatus": "pending", "hoursBack": 0.1, "total": 18.75, "subtotal": 13.50, "deliveryFee": 4.99, "taxes": 0.26, "tip": 0, "discount": 0},
        {"orderNumber": "FDC-12347", "clientIdx": 4, "driverIdx": 2, "storeIdx": 1, "status": "preparing", "paymentStatus": "paid", "hoursBack": 0.3, "total": 31.20, "subtotal": 23.50, "deliveryFee": 4.99, "taxes": 2.71, "tip": 1.00, "discount": 0},
        {"orderNumber": "FDC-12348", "clientIdx": 1, "driverIdx": None, "storeIdx": 1, "status": "confirmed", "paymentStatus": "paid", "hoursBack": 0.2, "total": 15.50, "subtotal": 10.00, "deliveryFee": 4.99, "taxes": 0.51, "tip": 0, "discount": 0},
        {"orderNumber": "FDC-12349", "clientIdx": 6, "driverIdx": 6, "storeIdx": 5, "status": "driver_en_route_store", "paymentStatus": "paid", "hoursBack": 0.4, "total": 22.30, "subtotal": 15.50, "deliveryFee": 4.99, "taxes": 1.81, "tip": 0, "discount": 0},
        # Completed
        {"orderNumber": "FDC-12344", "clientIdx": 1, "driverIdx": 1, "storeIdx": 2, "status": "delivered", "paymentStatus": "paid", "hoursBack": 5, "total": 42.50, "subtotal": 33.00, "deliveryFee": 5.99, "taxes": 3.51, "tip": 2.00, "discount": 0},
        {"orderNumber": "FDC-12343", "clientIdx": 5, "driverIdx": 0, "storeIdx": 2, "status": "completed", "paymentStatus": "paid", "hoursBack": 24, "total": 67.80, "subtotal": 55.00, "deliveryFee": 5.99, "taxes": 6.81, "tip": 3.00, "discount": 2.00},
        {"orderNumber": "FDC-12341", "clientIdx": 2, "driverIdx": 4, "storeIdx": 3, "status": "completed", "paymentStatus": "paid", "hoursBack": 72, "total": 38.90, "subtotal": 29.50, "deliveryFee": 6.49, "taxes": 2.91, "tip": 0, "discount": 0},
        {"orderNumber": "FDC-12339", "clientIdx": 7, "driverIdx": 3, "storeIdx": 4, "status": "delivered", "paymentStatus": "paid", "hoursBack": 48, "total": 19.50, "subtotal": 13.00, "deliveryFee": 4.99, "taxes": 1.51, "tip": 0, "discount": 0},
        {"orderNumber": "FDC-12337", "clientIdx": 0, "driverIdx": 2, "storeIdx": 0, "status": "completed", "paymentStatus": "paid", "hoursBack": 96, "total": 33.20, "subtotal": 24.00, "deliveryFee": 4.99, "taxes": 4.21, "tip": 0, "discount": 0},
        # Cancelled / Refunded
        {"orderNumber": "FDC-12342", "clientIdx": 0, "driverIdx": None, "storeIdx": 0, "status": "cancelled", "paymentStatus": "refunded", "hoursBack": 48, "total": 22.50, "subtotal": 16.50, "deliveryFee": 4.99, "taxes": 1.01, "tip": 0, "discount": 0},
        {"orderNumber": "FDC-12340", "clientIdx": 3, "driverIdx": 3, "storeIdx": 2, "status": "disputed", "paymentStatus": "paid", "hoursBack": 96, "total": 28.90, "subtotal": 21.00, "deliveryFee": 5.99, "taxes": 1.91, "tip": 0, "discount": 0},
        # More historical
        {"orderNumber": "FDC-12335", "clientIdx": 2, "driverIdx": 1, "storeIdx": 1, "status": "completed", "paymentStatus": "paid", "hoursBack": 120, "total": 45.60, "subtotal": 36.00, "deliveryFee": 4.99, "taxes": 4.61, "tip": 2.00, "discount": 0},
        {"orderNumber": "FDC-12330", "clientIdx": 5, "driverIdx": 4, "storeIdx": 4, "status": "completed", "paymentStatus": "paid", "hoursBack": 144, "total": 29.80, "subtotal": 21.50, "deliveryFee": 6.49, "taxes": 1.81, "tip": 0, "discount": 0},
        {"orderNumber": "FDC-12325", "clientIdx": 4, "driverIdx": 0, "storeIdx": 0, "status": "completed", "paymentStatus": "paid", "hoursBack": 168, "total": 52.40, "subtotal": 42.00, "deliveryFee": 4.99, "taxes": 5.41, "tip": 0, "discount": 0},
    ]
    
    order_ids = []
    for o in order_scenarios:
        client_id = client_ids[o["clientIdx"]]
        driver_id = driver_ids[o["driverIdx"]] if o["driverIdx"] is not None else None
        store_id = store_ids[o["storeIdx"]]
        
        # Pick 2-3 random products
        items_raw = random.sample(prod_list, min(3, len(prod_list)))
        items = []
        for pname, pid in items_raw:
            qty = random.randint(1, 3)
            unit_price = round(random.uniform(2, 20), 2)
            items.append({
                "productId": pid,
                "productName": pname,
                "quantity": qty,
                "unitPrice": unit_price,
                "lineSubtotal": round(qty * unit_price, 2),
                "requiresAgeVerification": "age_required" in pname.lower() or random.random() < 0.2,
                "categoryName": "Divers",
            })
        
        order_data = {
            "orderNumber": o["orderNumber"],
            "clientId": client_id,
            "clientName": f"Client {o['clientIdx']+1}",
            "driverId": driver_id,
            "driverName": f"Driver {o['driverIdx']+1}" if driver_id else None,
            "storeId": store_id,
            "storeName": f"Dépanneur {o['storeIdx']+1}",
            "zoneId": "zone-laval",
            "zoneName": "Laval",
            "status": o["status"],
            "paymentStatus": o["paymentStatus"],
            "restrictedItemsPresent": any(i["requiresAgeVerification"] for i in items),
            "subtotal": o["subtotal"],
            "deliveryFee": o["deliveryFee"],
            "tipAmount": o["tip"],
            "discountAmount": o["discount"],
            "gstAmount": round(o["subtotal"] * 0.05, 2),
            "qstAmount": round(o["subtotal"] * 0.09975, 2),
            "total": o["total"],
            "deliveryAddress": {
                "street": f"{random.randint(100, 999)} Rue Principale",
                "city": "Laval",
                "postalCode": "H7W 1A1",
                "province": "QC",
                "instructions": "Sonner à la porte svp",
            },
            "paymentMethod": random.choice(["card", "cash", "wallet"]),
            "estimatedDeliveryAt": ts_hours_ago(o["hoursBack"] - 0.5),
            "estimatedPrepMinutes": random.randint(5, 15),
            "estimatedDriveMinutes": random.randint(10, 25),
            "createdAt": ts_hours_ago(o["hoursBack"]),
            "updatedAt": ts_hours_ago(max(0, o["hoursBack"] - 0.2)),
        }
        
        if o["status"] in ["delivered", "completed"]:
            order_data["deliveredAt"] = ts_hours_ago(o["hoursBack"] - 0.8)
            order_data["completedAt"] = ts_hours_ago(o["hoursBack"] - 0.9) if o["status"] == "completed" else None
        
        if o["status"] == "cancelled":
            order_data["cancelledAt"] = ts_hours_ago(o["hoursBack"] - 0.1)
            order_data["cancelReason"] = "Client a annulé la commande"
        
        # Create order document
        order_ref = db.collection("orders").document(o["orderNumber"])
        order_ref.set(order_data)
        order_ids.append(o["orderNumber"])
        
        # Order items subcollection
        for item in items:
            order_ref.collection("items").add({**item, "orderId": o["orderNumber"], "createdAt": ts_hours_ago(o["hoursBack"])})
        
        # Status history subcollection
        status_flow = {
            "pending": ["pending"],
            "confirmed": ["pending", "confirmed"],
            "preparing": ["pending", "confirmed", "preparing"],
            "ready": ["pending", "confirmed", "preparing", "ready"],
            "driver_en_route_store": ["pending", "confirmed", "preparing", "ready", "driver_assigned", "driver_en_route_store"],
            "en_route": ["pending", "confirmed", "preparing", "ready", "driver_assigned", "en_route"],
            "delivered": ["pending", "confirmed", "preparing", "ready", "driver_assigned", "en_route", "delivered"],
            "completed": ["pending", "confirmed", "preparing", "ready", "driver_assigned", "en_route", "delivered", "completed"],
            "cancelled": ["pending", "cancelled"],
            "disputed": ["pending", "confirmed", "preparing", "en_route", "delivered", "disputed"],
        }
        flow = status_flow.get(o["status"], ["pending", o["status"]])
        for i, st in enumerate(flow):
            offset = o["hoursBack"] - (i * 0.15)
            order_ref.collection("status_history").add({
                "orderId": o["orderNumber"],
                "fromStatus": flow[i-1] if i > 0 else None,
                "toStatus": st,
                "changedByUserId": "admin-hedi" if st in ["confirmed", "driver_assigned"] else (driver_id or client_id),
                "changedByType": "admin" if st in ["confirmed", "driver_assigned"] else "system",
                "note": f"Statut mis à jour: {st}",
                "createdAt": ts_hours_ago(max(0, offset)),
            })
        
        # Payment record
        payment_id = f"pay_{o['orderNumber'].replace('-', '_').lower()}"
        db.collection("payments").document(payment_id).set({
            "orderId": o["orderNumber"],
            "clientId": client_id,
            "provider": "stripe",
            "paymentIntentId": f"pi_{uuid.uuid4().hex[:24]}",
            "chargeId": f"ch_{uuid.uuid4().hex[:24]}",
            "paymentStatus": o["paymentStatus"],
            "amount": o["total"],
            "refundedAmount": o["total"] if o["paymentStatus"] == "refunded" else 0.0,
            "currency": "CAD",
            "receiptUrl": f"https://pay.stripe.com/receipts/{uuid.uuid4().hex[:16]}",
            "createdAt": ts_hours_ago(o["hoursBack"]),
            "updatedAt": ts_hours_ago(max(0, o["hoursBack"] - 0.1)),
        })
        
        # Refund record if cancelled
        if o["paymentStatus"] == "refunded":
            db.collection("refunds").add({
                "paymentId": payment_id,
                "orderId": o["orderNumber"],
                "clientId": client_id,
                "amount": o["total"],
                "reason": "Commande annulée par le client",
                "status": "completed",
                "createdBy": "admin-hedi",
                "createdAt": ts_hours_ago(o["hoursBack"] - 0.2),
                "updatedAt": ts_hours_ago(max(0, o["hoursBack"] - 0.3)),
            })
        
        # Chat thread + messages
        thread_ref = db.collection("chat_threads").add({
            "orderId": o["orderNumber"],
            "threadType": "order_support",
            "participantIds": [client_id] + ([driver_id] if driver_id else []),
            "status": "active" if o["status"] not in ["completed", "cancelled"] else "closed",
            "createdAt": ts_hours_ago(o["hoursBack"]),
            "updatedAt": ts_hours_ago(max(0, o["hoursBack"] - 0.1)),
        })
        thread_id = thread_ref[1].id
        
        # 2-3 messages per order
        messages = [
            {"senderId": client_id, "senderRole": "client", "body": "Bonjour, est-ce que ma commande est prête?", "minutesBack": int(o["hoursBack"] * 60 - 20)},
            {"senderId": driver_id or "admin-hedi", "senderRole": "driver" if driver_id else "admin", "body": "Oui, je suis en route!", "minutesBack": int(o["hoursBack"] * 60 - 15)},
        ]
        for msg in messages:
            db.collection("chat_threads").document(thread_id).collection("messages").add({
                "threadId": thread_id,
                "senderUserId": msg["senderId"],
                "senderRole": msg["senderRole"],
                "messageType": "text",
                "body": msg["body"],
                "readByUserIds": [msg["senderId"]],
                "createdAt": ts_minutes_ago(msg["minutesBack"]),
            })
        
        # Support ticket for disputed orders
        if o["status"] == "disputed":
            db.collection("support_tickets").add({
                "orderId": o["orderNumber"],
                "ticketNumber": f"TKT-{random.randint(10000, 99999)}",
                "createdById": client_id,
                "subject": "Problème avec ma commande",
                "category": "delivery_issue",
                "priority": "high",
                "status": "open",
                "assignedToAdminId": "admin-hedi",
                "slaHours": 4,
                "slaDueAt": ts_hours_ago(-4),
                "lastMessageAt": ts_hours_ago(o["hoursBack"] - 0.5),
                "createdAt": ts_hours_ago(o["hoursBack"]),
                "updatedAt": ts_hours_ago(max(0, o["hoursBack"] - 0.5)),
            })
        
        # Dispatch queue for active orders
        if o["status"] in ["confirmed", "preparing", "driver_en_route_store", "en_route"]:
            db.collection("dispatch_queue").add({
                "orderId": o["orderNumber"],
                "zoneId": "zone-laval",
                "storeId": store_id,
                "dispatchMode": "manual" if driver_id else "auto",
                "selectedDriverId": driver_id,
                "dispatchStatus": "assigned" if driver_id else "searching",
                "attemptCount": 1,
                "assignedAt": ts_hours_ago(o["hoursBack"] - 0.2) if driver_id else None,
                "expiresAt": ts_hours_ago(-0.5),
                "createdAt": ts_hours_ago(o["hoursBack"]),
                "updatedAt": ts_hours_ago(max(0, o["hoursBack"] - 0.1)),
            })
        
        # Notifications
        notif_data = [
            {"recipientId": client_id, "role": "client", "type": "order_confirmed", "titleFr": "Commande confirmée", "bodyFr": f"Votre commande {o['orderNumber']} a été confirmée."},
        ]
        if driver_id:
            notif_data.append({"recipientId": driver_id, "role": "driver", "type": "new_delivery", "titleFr": "Nouvelle livraison", "bodyFr": f"Commande {o['orderNumber']} assignée."})
        
        for n in notif_data:
            db.collection("notifications").add({
                "recipientUserId": n["recipientId"],
                "recipientRole": n["role"],
                "channel": "in_app",
                "notificationType": n["type"],
                "titleFr": n["titleFr"],
                "titleEn": n["titleFr"],
                "bodyFr": n["bodyFr"],
                "bodyEn": n["bodyFr"],
                "payload": {"orderId": o["orderNumber"]},
                "status": "delivered",
                "readAt": ts_hours_ago(max(0, o["hoursBack"] - 0.3)),
                "createdAt": ts_hours_ago(o["hoursBack"]),
            })
        
        print(f"  ✓ Order: {o['orderNumber']} ({o['status']})")
    
    return order_ids

# ─────────────────────────────────────────────
# 9. PROMOTIONS
# ─────────────────────────────────────────────
def seed_promotions():
    print("\n🎁 Seeding promotions...")
    promos = [
        {"code": "DEPXPRES1", "type": "percentage", "value": 10, "description": "10% de rabais sur votre première commande", "minOrderAmount": 15.0, "maxUses": 1000, "usedCount": 234, "isActive": True, "expiresAt": datetime(2026, 12, 31)},
        {"code": "LAVAL20", "type": "fixed", "value": 5, "description": "5$ de rabais pour Laval", "minOrderAmount": 20.0, "maxUses": 500, "usedCount": 89, "isActive": True, "expiresAt": datetime(2026, 6, 30)},
        {"code": "LIVRAISON0", "type": "free_delivery", "value": 0, "description": "Livraison gratuite", "minOrderAmount": 25.0, "maxUses": 200, "usedCount": 45, "isActive": True, "expiresAt": datetime(2026, 3, 31)},
        {"code": "BIENVENUE", "type": "percentage", "value": 15, "description": "15% de bienvenue", "minOrderAmount": 10.0, "maxUses": 100, "usedCount": 100, "isActive": False, "expiresAt": datetime(2025, 12, 31)},
    ]
    for p in promos:
        p["createdAt"] = ts_days_ago(random.randint(30, 180))
        p["updatedAt"] = ts_days_ago(random.randint(1, 10))
        db.collection("promotions").add(p)
        print(f"  ✓ Promo: {p['code']}")

# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────
def main():
    print("🚀 DepXpreS — Seed Firestore complet (Admin SDK)\n")
    print("=" * 60)
    
    seed_admin_profiles()
    zone_ids = seed_zones()
    cat_ids = seed_categories()
    prod_ids = seed_products(cat_ids)
    store_ids = seed_stores(zone_ids)
    driver_ids = seed_drivers(zone_ids)
    client_ids = seed_clients()
    seed_orders(client_ids, driver_ids, store_ids, prod_ids)
    seed_promotions()
    
    print("\n" + "=" * 60)
    print("✅ Seed terminé avec succès!")
    print(f"   Zones: {len(zone_ids)}")
    print(f"   Catégories: {len(cat_ids)}")
    print(f"   Produits: {len(prod_ids)}")
    print(f"   Stores: {len(store_ids)}")
    print(f"   Chauffeurs: {len(driver_ids)}")
    print(f"   Clients: {len(client_ids)}")
    print(f"   Commandes: 15 (avec sous-collections)")

if __name__ == "__main__":
    main()
