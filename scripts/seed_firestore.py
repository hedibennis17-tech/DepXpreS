#!/usr/bin/env python3
"""
Script de seed Firestore pour DepXpreS
Utilise l'API REST Firestore avec la clé API Firebase
"""

import requests
import json
import time
import random
from datetime import datetime, timedelta

PROJECT_ID = "studio-1471071484-26917"
API_KEY = "AIzaSyAmDwm43D52jpgDp1MiNg_TvLBn_fDTsU8"
BASE_URL = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents"

def now_ts():
    return {"timestampValue": datetime.utcnow().isoformat() + "Z"}

def days_ago(n):
    d = datetime.utcnow() - timedelta(days=n)
    return {"timestampValue": d.isoformat() + "Z"}

def hours_ago(n):
    d = datetime.utcnow() - timedelta(hours=n)
    return {"timestampValue": d.isoformat() + "Z"}

def str_val(v):
    return {"stringValue": str(v)}

def int_val(v):
    return {"integerValue": str(int(v))}

def float_val(v):
    return {"doubleValue": float(v)}

def bool_val(v):
    return {"booleanValue": bool(v)}

def arr_val(items):
    return {"arrayValue": {"values": items}}

def map_val(fields):
    return {"mapValue": {"fields": fields}}

def null_val():
    return {"nullValue": None}

def create_doc(collection_path, doc_id, fields):
    """Create or overwrite a document"""
    url = f"{BASE_URL}/{collection_path}/{doc_id}?key={API_KEY}"
    body = {"fields": fields}
    resp = requests.patch(url, json=body)
    if resp.status_code not in [200, 201]:
        print(f"  ERROR {resp.status_code}: {resp.text[:200]}")
        return None
    return resp.json()

def add_doc(collection_path, fields):
    """Add a document with auto-generated ID"""
    url = f"{BASE_URL}/{collection_path}?key={API_KEY}"
    body = {"fields": fields}
    resp = requests.post(url, json=body)
    if resp.status_code not in [200, 201]:
        print(f"  ERROR {resp.status_code}: {resp.text[:200]}")
        return None
    result = resp.json()
    # Extract doc ID from name
    name = result.get("name", "")
    doc_id = name.split("/")[-1]
    return doc_id

def seed_categories():
    print("Seeding categories...")
    categories = [
        {"name": "Bière & alcool", "slug": "biere-alcool", "iconName": "Beer", "isActive": True, "sortOrder": 1},
        {"name": "Boissons", "slug": "boissons", "iconName": "GlassWater", "isActive": True, "sortOrder": 2},
        {"name": "Tabagisme", "slug": "tabagisme", "iconName": "Cigarette", "isActive": True, "sortOrder": 3},
        {"name": "Vapotage", "slug": "vapotage", "iconName": "Flame", "isActive": True, "sortOrder": 4},
        {"name": "Craquelins & chips", "slug": "chips", "iconName": "Cookie", "isActive": True, "sortOrder": 5},
        {"name": "Chocolat & bonbons", "slug": "chocolat", "iconName": "Gift", "isActive": True, "sortOrder": 6},
        {"name": "Café & boissons glacées", "slug": "cafe", "iconName": "Coffee", "isActive": True, "sortOrder": 7},
        {"name": "Pain & lait", "slug": "pain-lait", "iconName": "Sandwich", "isActive": True, "sortOrder": 8},
        {"name": "Produits laitiers", "slug": "produits-laitiers", "iconName": "Milk", "isActive": True, "sortOrder": 9},
        {"name": "Congelé", "slug": "congele", "iconName": "Snowflake", "isActive": True, "sortOrder": 10},
        {"name": "Articles ménagers", "slug": "menagers", "iconName": "Home", "isActive": True, "sortOrder": 11},
        {"name": "Hygiène & toilette", "slug": "hygiene", "iconName": "Bath", "isActive": True, "sortOrder": 12},
        {"name": "Lotto / billets", "slug": "lotto", "iconName": "Ticket", "isActive": True, "sortOrder": 13},
        {"name": "Dépannage express", "slug": "express", "iconName": "Zap", "isActive": True, "sortOrder": 14},
    ]
    
    cat_ids = {}
    for cat in categories:
        doc_id = add_doc("categories", {
            "name": str_val(cat["name"]),
            "slug": str_val(cat["slug"]),
            "iconName": str_val(cat["iconName"]),
            "isActive": bool_val(cat["isActive"]),
            "sortOrder": int_val(cat["sortOrder"]),
            "productCount": int_val(0),
            "createdAt": now_ts(),
            "updatedAt": now_ts(),
        })
        if doc_id:
            cat_ids[cat["slug"]] = doc_id
            print(f"  Category: {cat['name']} -> {doc_id}")
        time.sleep(0.1)
    
    return cat_ids

def seed_products(cat_ids):
    print("Seeding products...")
    products = [
        {"name": "Heineken 6 pack", "slug": "biere-alcool", "format": "6 x 330ml", "price": 14.99, "stock": "in_stock", "tags": ["popular", "age_required"], "isRestricted": True, "minAge": 18, "imageUrl": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400"},
        {"name": "Corona 6 pack", "slug": "biere-alcool", "format": "6 x 355ml", "price": 15.49, "stock": "in_stock", "tags": ["age_required"], "isRestricted": True, "minAge": 18, "imageUrl": "https://images.unsplash.com/photo-1566633806827-0a7a9d2e2b9c?w=400"},
        {"name": "Vin rouge 750ml", "slug": "biere-alcool", "format": "750ml", "price": 18.99, "stock": "low_stock", "tags": ["age_required"], "isRestricted": True, "minAge": 18, "imageUrl": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400"},
        {"name": "Coca-Cola", "slug": "boissons", "format": "355ml", "price": 1.79, "stock": "in_stock", "tags": ["popular"], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400"},
        {"name": "Red Bull", "slug": "boissons", "format": "250ml", "price": 3.49, "stock": "in_stock", "tags": [], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400"},
        {"name": "Eau Evian 1.5L", "slug": "boissons", "format": "1.5L", "price": 2.29, "stock": "in_stock", "tags": [], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400"},
        {"name": "Doritos Nacho", "slug": "chips", "format": "255g", "price": 4.29, "stock": "in_stock", "tags": ["popular", "promo"], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400"},
        {"name": "Lays Original", "slug": "chips", "format": "235g", "price": 3.99, "stock": "in_stock", "tags": [], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400"},
        {"name": "Paquet de cigarettes", "slug": "tabagisme", "format": "20 unités", "price": 16.50, "stock": "in_stock", "tags": ["age_required"], "isRestricted": True, "minAge": 18, "imageUrl": "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=400"},
        {"name": "Vape jetable", "slug": "vapotage", "format": "1 unité", "price": 12.99, "stock": "in_stock", "tags": ["age_required"], "isRestricted": True, "minAge": 18, "imageUrl": "https://images.unsplash.com/photo-1574169208507-84376144848b?w=400"},
        {"name": "Barre de chocolat", "slug": "chocolat", "format": "45g", "price": 1.99, "stock": "in_stock", "tags": ["popular"], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400"},
        {"name": "Café Tim Hortons", "slug": "cafe", "format": "473ml", "price": 2.49, "stock": "in_stock", "tags": ["popular"], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400"},
        {"name": "Pain tranché", "slug": "pain-lait", "format": "675g", "price": 3.99, "stock": "in_stock", "tags": [], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400"},
        {"name": "Lait 2%", "slug": "pain-lait", "format": "2L", "price": 5.49, "stock": "in_stock", "tags": [], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400"},
        {"name": "Papier toilette", "slug": "menagers", "format": "6 rouleaux", "price": 8.99, "stock": "low_stock", "tags": [], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=400"},
        {"name": "Dentifrice Colgate", "slug": "hygiene", "format": "90ml", "price": 3.29, "stock": "in_stock", "tags": [], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1559591937-abc3a0c6a3e0?w=400"},
        {"name": "Billet de lotto", "slug": "lotto", "format": "1 billet", "price": 5.00, "stock": "in_stock", "tags": [], "isRestricted": False, "minAge": 0, "imageUrl": "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=400"},
    ]
    
    prod_ids = []
    for prod in products:
        cat_id = cat_ids.get(prod["slug"], "")
        tags_arr = arr_val([str_val(t) for t in prod["tags"]])
        doc_id = add_doc("products", {
            "name": str_val(prod["name"]),
            "categoryId": str_val(cat_id),
            "format": str_val(prod["format"]),
            "price": float_val(prod["price"]),
            "stock": str_val(prod["stock"]),
            "tags": tags_arr,
            "isRestricted": bool_val(prod["isRestricted"]),
            "minAge": int_val(prod["minAge"]),
            "isActive": bool_val(True),
            "imageUrl": str_val(prod["imageUrl"]),
            "stockQuantity": int_val(random.randint(5, 50)),
            "createdAt": now_ts(),
            "updatedAt": now_ts(),
        })
        if doc_id:
            prod_ids.append(doc_id)
            print(f"  Product: {prod['name']} -> {doc_id}")
        time.sleep(0.1)
    
    return prod_ids

def seed_zones():
    print("Seeding zones...")
    zones = [
        {"id": "zone-laval", "name": "Laval", "slug": "laval", "deliveryFee": 4.99, "minOrderAmount": 10, "estimatedTime": 25},
        {"id": "zone-mtl-centre", "name": "Montréal Centre-Ville", "slug": "mtl-centre", "deliveryFee": 5.99, "minOrderAmount": 15, "estimatedTime": 30},
        {"id": "zone-mtl-nord", "name": "Montréal Nord", "slug": "mtl-nord", "deliveryFee": 5.49, "minOrderAmount": 12, "estimatedTime": 28},
        {"id": "zone-longueuil", "name": "Longueuil", "slug": "longueuil", "deliveryFee": 6.49, "minOrderAmount": 15, "estimatedTime": 35},
    ]
    
    zone_ids = []
    for zone in zones:
        create_doc("zones", zone["id"], {
            "name": str_val(zone["name"]),
            "slug": str_val(zone["slug"]),
            "isActive": bool_val(True),
            "deliveryFee": float_val(zone["deliveryFee"]),
            "minOrderAmount": float_val(zone["minOrderAmount"]),
            "estimatedTime": int_val(zone["estimatedTime"]),
            "createdAt": now_ts(),
            "updatedAt": now_ts(),
        })
        zone_ids.append(zone["id"])
        print(f"  Zone: {zone['name']}")
        time.sleep(0.1)
    
    return zone_ids

def seed_stores(zone_ids):
    print("Seeding stores...")
    stores = [
        {"name": "Dépanneur Chomedey Express", "address": "123 Boul. Chomedey", "city": "Laval", "postalCode": "H7W 2E8", "phone": "450-555-0101", "status": "active", "zoneId": zone_ids[0], "zoneName": "Laval", "rating": 4.8, "totalOrders": 342, "totalRevenue": 8750.50, "isOpen": True, "lat": 45.5586, "lng": -73.7553},
        {"name": "Dépanneur St-Martin", "address": "456 Boul. St-Martin O.", "city": "Laval", "postalCode": "H7M 1Y3", "phone": "450-555-0202", "status": "active", "zoneId": zone_ids[0], "zoneName": "Laval", "rating": 4.6, "totalOrders": 218, "totalRevenue": 5420.25, "isOpen": True, "lat": 45.5725, "lng": -73.7412},
        {"name": "Dépanneur Centre-Ville 24h", "address": "789 Rue Ste-Catherine O.", "city": "Montréal", "postalCode": "H3B 1C9", "phone": "514-555-0303", "status": "active", "zoneId": zone_ids[1], "zoneName": "Montréal Centre-Ville", "rating": 4.5, "totalOrders": 891, "totalRevenue": 22340.75, "isOpen": True, "lat": 45.5048, "lng": -73.5772},
        {"name": "Dépanneur Montréal-Nord", "address": "321 Boul. Henri-Bourassa E.", "city": "Montréal", "postalCode": "H1G 2T5", "phone": "514-555-0404", "status": "inactive", "zoneId": zone_ids[2], "zoneName": "Montréal Nord", "rating": 4.2, "totalOrders": 156, "totalRevenue": 3890.00, "isOpen": False, "lat": 45.5978, "lng": -73.6241},
        {"name": "Dépanneur Longueuil Express", "address": "555 Rue St-Charles O.", "city": "Longueuil", "postalCode": "J4H 1E5", "phone": "450-555-0505", "status": "active", "zoneId": zone_ids[3], "zoneName": "Longueuil", "rating": 4.4, "totalOrders": 124, "totalRevenue": 3120.50, "isOpen": True, "lat": 45.5312, "lng": -73.5185},
    ]
    
    store_ids = []
    for store in stores:
        doc_id = add_doc("stores", {
            "name": str_val(store["name"]),
            "address": str_val(store["address"]),
            "city": str_val(store["city"]),
            "postalCode": str_val(store["postalCode"]),
            "phone": str_val(store["phone"]),
            "status": str_val(store["status"]),
            "zoneId": str_val(store["zoneId"]),
            "zoneName": str_val(store["zoneName"]),
            "rating": float_val(store["rating"]),
            "totalOrders": int_val(store["totalOrders"]),
            "totalRevenue": float_val(store["totalRevenue"]),
            "isOpen": bool_val(store["isOpen"]),
            "lat": float_val(store["lat"]),
            "lng": float_val(store["lng"]),
            "createdAt": days_ago(random.randint(30, 365)),
            "updatedAt": now_ts(),
        })
        if doc_id:
            store_ids.append(doc_id)
            print(f"  Store: {store['name']} -> {doc_id}")
        time.sleep(0.1)
    
    return store_ids

def seed_drivers(zone_ids):
    print("Seeding drivers...")
    drivers = [
        {"id": "driver-001", "firstName": "Marc-André", "lastName": "Tremblay", "email": "marc.tremblay@depxpres.com", "phone": "514-555-1001", "status": "online", "isOnline": True, "rating": 4.9, "totalDeliveries": 342, "totalEarnings": 8750.50, "zoneId": zone_ids[0], "zoneName": "Laval", "avatarUrl": "https://picsum.photos/seed/driver-marc/200/200"},
        {"id": "driver-002", "firstName": "Jean-Philippe", "lastName": "Gagnon", "email": "jp.gagnon@depxpres.com", "phone": "514-555-1002", "status": "delivering", "isOnline": True, "rating": 4.7, "totalDeliveries": 218, "totalEarnings": 5420.25, "zoneId": zone_ids[1], "zoneName": "Montréal Centre-Ville", "avatarUrl": "https://picsum.photos/seed/driver-jp/200/200"},
        {"id": "driver-003", "firstName": "Amina", "lastName": "Diallo", "email": "amina.diallo@depxpres.com", "phone": "438-555-1003", "status": "online", "isOnline": True, "rating": 5.0, "totalDeliveries": 89, "totalEarnings": 2340.00, "zoneId": zone_ids[0], "zoneName": "Laval", "avatarUrl": "https://picsum.photos/seed/driver-amina/200/200"},
        {"id": "driver-004", "firstName": "Luc", "lastName": "Bergeron", "email": "luc.bergeron@depxpres.com", "phone": "514-555-1004", "status": "offline", "isOnline": False, "rating": 4.6, "totalDeliveries": 156, "totalEarnings": 3890.75, "zoneId": zone_ids[2], "zoneName": "Montréal Nord", "avatarUrl": "https://picsum.photos/seed/driver-luc/200/200"},
        {"id": "driver-005", "firstName": "Sofia", "lastName": "Martinez", "email": "sofia.martinez@depxpres.com", "phone": "514-555-1005", "status": "online", "isOnline": True, "rating": 4.8, "totalDeliveries": 201, "totalEarnings": 5100.00, "zoneId": zone_ids[3], "zoneName": "Longueuil", "avatarUrl": "https://picsum.photos/seed/driver-sofia/200/200"},
    ]
    
    driver_ids = []
    for driver in drivers:
        create_doc("driver_profiles", driver["id"], {
            "userId": str_val(driver["id"]),
            "firstName": str_val(driver["firstName"]),
            "lastName": str_val(driver["lastName"]),
            "email": str_val(driver["email"]),
            "phone": str_val(driver["phone"]),
            "status": str_val(driver["status"]),
            "isOnline": bool_val(driver["isOnline"]),
            "rating": float_val(driver["rating"]),
            "totalDeliveries": int_val(driver["totalDeliveries"]),
            "totalEarnings": float_val(driver["totalEarnings"]),
            "zoneId": str_val(driver["zoneId"]),
            "zoneName": str_val(driver["zoneName"]),
            "avatarUrl": str_val(driver["avatarUrl"]),
            "joinedAt": days_ago(random.randint(30, 180)),
            "createdAt": now_ts(),
            "updatedAt": now_ts(),
        })
        driver_ids.append(driver["id"])
        
        # Documents
        doc_types = [
            {"type": "drivers_license", "label": "Permis de conduire", "status": "approved"},
            {"type": "insurance", "label": "Assurance véhicule", "status": "expired" if driver["id"] == "driver-004" else "approved"},
            {"type": "vehicle_registration", "label": "Immatriculation", "status": "approved"},
        ]
        for dt in doc_types:
            add_doc(f"driver_profiles/{driver['id']}/documents", {
                "type": str_val(dt["type"]),
                "label": str_val(dt["label"]),
                "status": str_val(dt["status"]),
                "driverId": str_val(driver["id"]),
                "uploadedAt": days_ago(random.randint(10, 60)),
                "createdAt": now_ts(),
            })
        
        # Vehicle
        makes = ["Toyota", "Honda", "Ford", "Hyundai", "Kia"]
        models = ["Corolla", "Civic", "Focus", "Elantra", "Rio"]
        colors = ["Blanc", "Noir", "Gris", "Rouge", "Bleu"]
        idx = random.randint(0, 4)
        add_doc(f"driver_profiles/{driver['id']}/vehicles", {
            "driverId": str_val(driver["id"]),
            "make": str_val(makes[idx]),
            "model": str_val(models[idx]),
            "year": int_val(2018 + random.randint(0, 5)),
            "color": str_val(colors[random.randint(0, 4)]),
            "licensePlate": str_val(f"ABC-{random.randint(100, 999)}"),
            "type": str_val("car"),
            "isActive": bool_val(True),
            "createdAt": now_ts(),
        })
        
        # Earnings (last 7 days)
        for i in range(7):
            amount = round(random.uniform(20, 100), 2)
            add_doc(f"driver_profiles/{driver['id']}/earnings", {
                "driverId": str_val(driver["id"]),
                "orderId": str_val(f"FDC-{random.randint(10000, 99999)}"),
                "amount": float_val(amount),
                "type": str_val("delivery"),
                "description": str_val("Livraison complétée"),
                "createdAt": days_ago(i),
            })
        
        print(f"  Driver: {driver['firstName']} {driver['lastName']} -> {driver['id']}")
        time.sleep(0.2)
    
    return driver_ids

def seed_clients():
    print("Seeding clients...")
    clients = [
        {"id": "client-001", "firstName": "Sophie", "lastName": "Martin", "email": "sophie.martin@gmail.com", "phone": "514-555-2001", "status": "active", "totalOrders": 24, "totalSpent": 387.50, "avatarUrl": "https://picsum.photos/seed/client-sophie/200/200"},
        {"id": "client-002", "firstName": "Jean-Pierre", "lastName": "Tremblay", "email": "jp.tremblay@gmail.com", "phone": "514-555-2002", "status": "active", "totalOrders": 8, "totalSpent": 142.00, "avatarUrl": "https://picsum.photos/seed/client-jp/200/200"},
        {"id": "client-003", "firstName": "Marie", "lastName": "Gagnon", "email": "marie.gagnon@gmail.com", "phone": "450-555-2003", "status": "active", "totalOrders": 45, "totalSpent": 892.75, "avatarUrl": "https://picsum.photos/seed/client-marie/200/200"},
        {"id": "client-004", "firstName": "Carlos", "lastName": "Rodriguez", "email": "carlos.rodriguez@gmail.com", "phone": "514-555-2004", "status": "blocked", "totalOrders": 3, "totalSpent": 56.25, "avatarUrl": "https://picsum.photos/seed/client-carlos/200/200"},
        {"id": "client-005", "firstName": "Fatima", "lastName": "Benali", "email": "fatima.benali@gmail.com", "phone": "438-555-2005", "status": "active", "totalOrders": 17, "totalSpent": 298.90, "avatarUrl": "https://picsum.photos/seed/client-fatima/200/200"},
        {"id": "client-006", "firstName": "Alex", "lastName": "Bouchard", "email": "alex.bouchard@gmail.com", "phone": "514-555-2006", "status": "active", "totalOrders": 31, "totalSpent": 542.00, "avatarUrl": "https://picsum.photos/seed/client-alex/200/200"},
    ]
    
    client_ids = []
    for client in clients:
        create_doc("client_profiles", client["id"], {
            "userId": str_val(client["id"]),
            "firstName": str_val(client["firstName"]),
            "lastName": str_val(client["lastName"]),
            "email": str_val(client["email"]),
            "phone": str_val(client["phone"]),
            "status": str_val(client["status"]),
            "totalOrders": int_val(client["totalOrders"]),
            "totalSpent": float_val(client["totalSpent"]),
            "avatarUrl": str_val(client["avatarUrl"]),
            "createdAt": days_ago(random.randint(30, 365)),
            "updatedAt": now_ts(),
            "lastOrderAt": days_ago(random.randint(1, 14)),
        })
        client_ids.append(client["id"])
        print(f"  Client: {client['firstName']} {client['lastName']} -> {client['id']}")
        time.sleep(0.1)
    
    return client_ids

def seed_orders(client_ids, driver_ids, store_ids):
    print("Seeding orders...")
    
    order_data = [
        {"id": "FDC-12345", "clientId": client_ids[0], "clientName": "Sophie Martin", "driverId": driver_ids[0], "driverName": "Marc-André Tremblay", "storeId": store_ids[0], "storeName": "Dépanneur Chomedey Express", "status": "en_route", "total": 25.74, "subtotal": 18.28, "deliveryFee": 4.99, "taxes": 2.47, "hoursBack": 1},
        {"id": "FDC-12344", "clientId": client_ids[1], "clientName": "Jean-Pierre Tremblay", "driverId": driver_ids[1], "driverName": "Jean-Philippe Gagnon", "storeId": store_ids[2], "storeName": "Dépanneur Centre-Ville 24h", "status": "delivered", "total": 42.50, "subtotal": 33.00, "deliveryFee": 5.99, "taxes": 3.51, "hoursBack": 5},
        {"id": "FDC-12346", "clientId": client_ids[2], "clientName": "Marie Gagnon", "driverId": None, "driverName": None, "storeId": store_ids[0], "storeName": "Dépanneur Chomedey Express", "status": "pending", "total": 18.75, "subtotal": 13.50, "deliveryFee": 4.99, "taxes": 0.26, "hoursBack": 0.5},
        {"id": "FDC-12347", "clientId": client_ids[4], "clientName": "Fatima Benali", "driverId": driver_ids[2], "driverName": "Amina Diallo", "storeId": store_ids[1], "storeName": "Dépanneur St-Martin", "status": "preparing", "total": 31.20, "subtotal": 23.50, "deliveryFee": 4.99, "taxes": 2.71, "hoursBack": 0.3},
        {"id": "FDC-12343", "clientId": client_ids[5], "clientName": "Alex Bouchard", "driverId": driver_ids[0], "driverName": "Marc-André Tremblay", "storeId": store_ids[2], "storeName": "Dépanneur Centre-Ville 24h", "status": "delivered", "total": 67.80, "subtotal": 55.00, "deliveryFee": 5.99, "taxes": 6.81, "hoursBack": 24},
        {"id": "FDC-12342", "clientId": client_ids[0], "clientName": "Sophie Martin", "driverId": None, "driverName": None, "storeId": store_ids[0], "storeName": "Dépanneur Chomedey Express", "status": "cancelled", "total": 22.50, "subtotal": 16.50, "deliveryFee": 4.99, "taxes": 1.01, "hoursBack": 48},
        {"id": "FDC-12341", "clientId": client_ids[2], "clientName": "Marie Gagnon", "driverId": driver_ids[4], "driverName": "Sofia Martinez", "storeId": store_ids[3], "storeName": "Dépanneur Montréal-Nord", "status": "delivered", "total": 38.90, "subtotal": 29.50, "deliveryFee": 6.49, "taxes": 2.91, "hoursBack": 72},
        {"id": "FDC-12348", "clientId": client_ids[1], "clientName": "Jean-Pierre Tremblay", "driverId": None, "driverName": None, "storeId": store_ids[1], "storeName": "Dépanneur St-Martin", "status": "confirmed", "total": 15.50, "subtotal": 10.00, "deliveryFee": 4.99, "taxes": 0.51, "hoursBack": 0.1},
        {"id": "FDC-12340", "clientId": client_ids[3], "clientName": "Carlos Rodriguez", "driverId": driver_ids[3], "driverName": "Luc Bergeron", "storeId": store_ids[2], "storeName": "Dépanneur Centre-Ville 24h", "status": "disputed", "total": 28.90, "subtotal": 21.00, "deliveryFee": 5.99, "taxes": 1.91, "hoursBack": 96},
        {"id": "FDC-12349", "clientId": client_ids[4], "clientName": "Fatima Benali", "driverId": driver_ids[2], "driverName": "Amina Diallo", "storeId": store_ids[0], "storeName": "Dépanneur Chomedey Express", "status": "delivered", "total": 19.50, "subtotal": 13.00, "deliveryFee": 4.99, "taxes": 1.51, "hoursBack": 120},
    ]
    
    for o in order_data:
        fields = {
            "clientId": str_val(o["clientId"]),
            "clientName": str_val(o["clientName"]),
            "storeId": str_val(o["storeId"]),
            "storeName": str_val(o["storeName"]),
            "status": str_val(o["status"]),
            "items": arr_val([
                map_val({"productId": str_val("prod1"), "productName": str_val("Heineken 6 pack"), "quantity": int_val(1), "unitPrice": float_val(14.99)}),
                map_val({"productId": str_val("prod7"), "productName": str_val("Doritos Nacho"), "quantity": int_val(2), "unitPrice": float_val(4.29)}),
            ]),
            "subtotal": float_val(o["subtotal"]),
            "deliveryFee": float_val(o["deliveryFee"]),
            "taxes": float_val(o["taxes"]),
            "total": float_val(o["total"]),
            "deliveryAddress": map_val({
                "street": str_val(f"{random.randint(100, 999)} Rue Principale"),
                "city": str_val("Laval"),
                "postalCode": str_val("H7W 1A1"),
                "instructions": str_val("Sonner à la porte"),
            }),
            "paymentMethod": str_val(random.choice(["card", "cash", "wallet"])),
            "paymentStatus": str_val("paid" if o["status"] == "delivered" else "refunded" if o["status"] == "cancelled" else "pending"),
            "estimatedDeliveryTime": int_val(30),
            "createdAt": hours_ago(o["hoursBack"]),
            "updatedAt": now_ts(),
        }
        
        if o["driverId"]:
            fields["driverId"] = str_val(o["driverId"])
            fields["driverName"] = str_val(o["driverName"])
        else:
            fields["driverId"] = null_val()
            fields["driverName"] = null_val()
        
        create_doc("orders", o["id"], fields)
        
        # Status history
        history_statuses = ["pending", "confirmed", "preparing"]
        for hs in history_statuses:
            add_doc(f"orders/{o['id']}/status_history", {
                "status": str_val(hs),
                "changedBy": str_val("system"),
                "changedByRole": str_val("system"),
                "note": str_val(f"Statut mis à jour: {hs}"),
                "timestamp": hours_ago(o["hoursBack"] + 0.5),
            })
            if hs == o["status"]:
                break
        
        print(f"  Order: {o['id']} ({o['status']})")
        time.sleep(0.15)

def seed_admin():
    print("Seeding admin profile...")
    create_doc("admin_profiles", "admin-hedi", {
        "userId": str_val("admin-hedi"),
        "firstName": str_val("Hedi"),
        "lastName": str_val("Bennis"),
        "email": str_val("hedibennis17@gmail.com"),
        "role": str_val("super_admin"),
        "permissions": arr_val([str_val("all")]),
        "avatarUrl": str_val("https://picsum.photos/seed/admin-hedi/200/200"),
        "createdAt": now_ts(),
        "updatedAt": now_ts(),
    })
    print("  Admin profile: admin-hedi")

def main():
    print("🚀 Starting DepXpreS Firestore seed...\n")
    
    seed_admin()
    cat_ids = seed_categories()
    seed_products(cat_ids)
    zone_ids = seed_zones()
    store_ids = seed_stores(zone_ids)
    driver_ids = seed_drivers(zone_ids)
    client_ids = seed_clients()
    seed_orders(client_ids, driver_ids, store_ids)
    
    print("\n✅ Seed completed successfully!")

if __name__ == "__main__":
    main()
