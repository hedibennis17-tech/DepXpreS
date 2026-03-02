#!/usr/bin/env python3
"""
DepXpreS — Seed COMPLET de toutes les collections Firestore manquantes
Collections: promotions, notifications, support_tickets, payments/transactions,
             dispatch_queue, dispatch_events, tracking_sessions, reviews,
             audit_logs, reports, system_settings, order_tracking,
             driver_locations, wallets, addresses, chat_threads, chat_messages
"""
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta
import random
import uuid
import os

SA_PATH = os.path.join(os.path.dirname(__file__), "serviceAccount.json")
cred = credentials.Certificate(SA_PATH)
try:
    firebase_admin.initialize_app(cred)
except:
    pass

db = firestore.client()

def dt(days_ago=0, hours_ago=0, minutes_ago=0):
    return datetime.utcnow() - timedelta(days=days_ago, hours=hours_ago, minutes=minutes_ago)

def rand_id():
    return str(uuid.uuid4())[:8]

# ─────────────────────────────────────────────
# IDs existants (du seed précédent)
# ─────────────────────────────────────────────
DRIVER_IDS = ["driver-1","driver-2","driver-3","driver-4","driver-5","driver-6","driver-7"]
DRIVER_NAMES = {
    "driver-1": "Marc-André Tremblay",
    "driver-2": "Jean-Philippe Gagnon",
    "driver-3": "Amina Diallo",
    "driver-4": "Luc Bergeron",
    "driver-5": "Sofia Martinez",
    "driver-6": "Kevin Lapointe",
    "driver-7": "Yasmine Khelifi",
}
CLIENT_IDS = [f"client-{i}" for i in range(1,9)]
CLIENT_NAMES = {
    "client-1": "Sophie Tremblay",
    "client-2": "Mohammed Benali",
    "client-3": "Julie Côté",
    "client-4": "David Kim",
    "client-5": "Isabelle Gagnon",
    "client-6": "Carlos Rodriguez",
    "client-7": "Fatima Zahra",
    "client-8": "Patrick Leblanc",
}
STORE_IDS = [f"store-{i}" for i in range(1,8)]
STORE_NAMES = {
    "store-1": "Dépanneur Centre-Ville 24h",
    "store-2": "Dépanneur Chomedey Express",
    "store-3": "Dépanneur St-Martin",
    "store-4": "Dépanneur Laval Ouest",
    "store-5": "Dépanneur Montréal-Nord",
    "store-6": "Dépanneur Longueuil Express",
    "store-7": "Dépanneur Plateau Express",
}
ZONE_IDS = ["zone-mtl-centre","zone-laval","zone-longueuil","zone-mtl-nord"]
ZONE_NAMES = {
    "zone-mtl-centre": "Montréal Centre-Ville",
    "zone-laval": "Laval",
    "zone-longueuil": "Longueuil",
    "zone-mtl-nord": "Montréal Nord",
}
ORDER_IDS = [f"order-{i}" for i in range(1,16)]
ORDER_NUMBERS = {
    "order-1": "FDC-12345",
    "order-2": "FDC-12346",
    "order-3": "FDC-12347",
    "order-4": "FDC-12348",
    "order-5": "FDC-12349",
    "order-6": "FDC-12344",
    "order-7": "FDC-12343",
    "order-8": "FDC-12342",
    "order-9": "FDC-12339",
    "order-10": "FDC-12341",
    "order-11": "FDC-12340",
    "order-12": "FDC-12337",
    "order-13": "FDC-12335",
    "order-14": "FDC-12330",
    "order-15": "FDC-12325",
}

# ─────────────────────────────────────────────
# 1. PROMOTIONS
# ─────────────────────────────────────────────
def seed_promotions():
    print("\n🎁 Seeding promotions...")
    promos = [
        {
            "id": "promo-1",
            "code": "DEPXPRES1",
            "type": "percentage",
            "discountValue": 10,
            "minOrderAmount": 15.0,
            "maxDiscountAmount": 5.0,
            "description": "10% de rabais sur votre première commande",
            "title": "Bienvenue DepXpreS",
            "status": "active",
            "usageLimit": 1000,
            "usageCount": 247,
            "perUserLimit": 1,
            "applicableTo": "all",
            "startDate": dt(30),
            "endDate": dt(-60),
            "createdBy": "admin-hedi",
            "createdAt": dt(30),
            "updatedAt": dt(1),
            "zoneIds": [],
            "storeIds": [],
            "categoryIds": [],
        },
        {
            "id": "promo-2",
            "code": "LIVRAISON0",
            "type": "free_delivery",
            "discountValue": 0,
            "minOrderAmount": 25.0,
            "maxDiscountAmount": 4.99,
            "description": "Livraison gratuite pour toute commande de 25$ et plus",
            "title": "Livraison gratuite",
            "status": "active",
            "usageLimit": 500,
            "usageCount": 89,
            "perUserLimit": 3,
            "applicableTo": "all",
            "startDate": dt(15),
            "endDate": dt(-30),
            "createdBy": "admin-hedi",
            "createdAt": dt(15),
            "updatedAt": dt(2),
            "zoneIds": [],
            "storeIds": [],
            "categoryIds": [],
        },
        {
            "id": "promo-3",
            "code": "BIERE20",
            "type": "percentage",
            "discountValue": 20,
            "minOrderAmount": 20.0,
            "maxDiscountAmount": 8.0,
            "description": "20% de rabais sur les bières ce weekend",
            "title": "Weekend Bière",
            "status": "active",
            "usageLimit": 200,
            "usageCount": 34,
            "perUserLimit": 2,
            "applicableTo": "category",
            "startDate": dt(3),
            "endDate": dt(-4),
            "createdBy": "admin-hedi",
            "createdAt": dt(3),
            "updatedAt": dt(0),
            "zoneIds": [],
            "storeIds": [],
            "categoryIds": ["cat-boissons-alcoolisees"],
        },
        {
            "id": "promo-4",
            "code": "LAVAL15",
            "type": "fixed",
            "discountValue": 3.0,
            "minOrderAmount": 20.0,
            "maxDiscountAmount": 3.0,
            "description": "3$ de rabais pour les clients de Laval",
            "title": "Spécial Laval",
            "status": "active",
            "usageLimit": 300,
            "usageCount": 67,
            "perUserLimit": 5,
            "applicableTo": "zone",
            "startDate": dt(7),
            "endDate": dt(-14),
            "createdBy": "admin-hedi",
            "createdAt": dt(7),
            "updatedAt": dt(1),
            "zoneIds": ["zone-laval"],
            "storeIds": [],
            "categoryIds": [],
        },
        {
            "id": "promo-5",
            "code": "NOEL2024",
            "type": "percentage",
            "discountValue": 15,
            "minOrderAmount": 30.0,
            "maxDiscountAmount": 10.0,
            "description": "15% de rabais pour les fêtes",
            "title": "Spécial Noël",
            "status": "expired",
            "usageLimit": 1000,
            "usageCount": 892,
            "perUserLimit": 2,
            "applicableTo": "all",
            "startDate": dt(90),
            "endDate": dt(30),
            "createdBy": "admin-hedi",
            "createdAt": dt(90),
            "updatedAt": dt(30),
            "zoneIds": [],
            "storeIds": [],
            "categoryIds": [],
        },
        {
            "id": "promo-6",
            "code": "REFER10",
            "type": "fixed",
            "discountValue": 5.0,
            "minOrderAmount": 15.0,
            "maxDiscountAmount": 5.0,
            "description": "5$ de crédit pour chaque ami référé",
            "title": "Programme Référence",
            "status": "active",
            "usageLimit": 2000,
            "usageCount": 156,
            "perUserLimit": 10,
            "applicableTo": "all",
            "startDate": dt(60),
            "endDate": dt(-90),
            "createdBy": "admin-hedi",
            "createdAt": dt(60),
            "updatedAt": dt(5),
            "zoneIds": [],
            "storeIds": [],
            "categoryIds": [],
        },
    ]
    batch = db.batch()
    for p in promos:
        ref = db.collection("promotions").document(p["id"])
        batch.set(ref, p)
    batch.commit()
    print(f"  ✅ {len(promos)} promotions créées")

# ─────────────────────────────────────────────
# 2. NOTIFICATIONS
# ─────────────────────────────────────────────
def seed_notifications():
    print("\n🔔 Seeding notifications...")
    notifs = []
    
    # Notifications clients
    for i, (cid, cname) in enumerate(CLIENT_NAMES.items()):
        notifs.extend([
            {
                "id": f"notif-client-{i}-1",
                "recipientId": cid,
                "recipientType": "client",
                "recipientName": cname,
                "type": "order_confirmed",
                "title": "Commande confirmée",
                "body": f"Votre commande {ORDER_NUMBERS.get(f'order-{i+1}','FDC-12345')} a été confirmée et est en cours de préparation.",
                "channel": "push",
                "status": "delivered",
                "read": i % 2 == 0,
                "orderId": f"order-{i+1}",
                "createdAt": dt(hours_ago=random.randint(1, 48)),
                "deliveredAt": dt(hours_ago=random.randint(0, 47)),
            },
            {
                "id": f"notif-client-{i}-2",
                "recipientId": cid,
                "recipientType": "client",
                "recipientName": cname,
                "type": "driver_assigned",
                "title": "Chauffeur assigné",
                "body": f"Un chauffeur a été assigné à votre commande. Livraison estimée dans 25 minutes.",
                "channel": "push",
                "status": "delivered",
                "read": True,
                "orderId": f"order-{i+1}",
                "createdAt": dt(hours_ago=random.randint(1, 24)),
                "deliveredAt": dt(hours_ago=random.randint(0, 23)),
            },
        ])
    
    # Notifications chauffeurs
    for i, (did, dname) in enumerate(DRIVER_NAMES.items()):
        notifs.extend([
            {
                "id": f"notif-driver-{i}-1",
                "recipientId": did,
                "recipientType": "driver",
                "recipientName": dname,
                "type": "new_order",
                "title": "Nouvelle commande disponible",
                "body": f"Une nouvelle commande est disponible dans votre zone. Montant: ${random.uniform(15,50):.2f}",
                "channel": "push",
                "status": "delivered",
                "read": i % 3 != 0,
                "orderId": f"order-{i+1}",
                "createdAt": dt(hours_ago=random.randint(1, 12)),
                "deliveredAt": dt(hours_ago=random.randint(0, 11)),
            },
        ])
    
    # Notifications système admin
    notifs.extend([
        {
            "id": "notif-sys-1",
            "recipientId": "admin-hedi",
            "recipientType": "admin",
            "recipientName": "Hedi Bennis",
            "type": "system_alert",
            "title": "Alerte: Zone Montréal-Nord sous-couverte",
            "body": "Seulement 1 chauffeur disponible dans la zone Montréal-Nord. Risque de délais.",
            "channel": "email",
            "status": "delivered",
            "read": False,
            "createdAt": dt(hours_ago=2),
            "deliveredAt": dt(hours_ago=2),
        },
        {
            "id": "notif-sys-2",
            "recipientId": "admin-hedi",
            "recipientType": "admin",
            "recipientName": "Hedi Bennis",
            "type": "new_driver_application",
            "title": "Nouvelle candidature chauffeur",
            "body": "Pierre Dubois a soumis une candidature pour devenir chauffeur DepXpreS.",
            "channel": "email",
            "status": "delivered",
            "read": True,
            "createdAt": dt(hours_ago=5),
            "deliveredAt": dt(hours_ago=5),
        },
        {
            "id": "notif-sys-3",
            "recipientId": "admin-hedi",
            "recipientType": "admin",
            "recipientName": "Hedi Bennis",
            "type": "support_ticket",
            "title": "Nouveau ticket de support",
            "body": "Sophie Tremblay a ouvert un ticket de support concernant sa commande FDC-12345.",
            "channel": "push",
            "status": "delivered",
            "read": False,
            "createdAt": dt(hours_ago=1),
            "deliveredAt": dt(hours_ago=1),
        },
    ])
    
    batch = db.batch()
    for n in notifs:
        ref = db.collection("notifications").document(n["id"])
        batch.set(ref, n)
    batch.commit()
    print(f"  ✅ {len(notifs)} notifications créées")

# ─────────────────────────────────────────────
# 3. SUPPORT TICKETS
# ─────────────────────────────────────────────
def seed_support_tickets():
    print("\n🎫 Seeding support_tickets...")
    tickets = [
        {
            "id": "ticket-1",
            "ticketNumber": "TKT-001",
            "clientId": "client-1",
            "clientName": "Sophie Tremblay",
            "orderId": "order-1",
            "orderNumber": "FDC-12345",
            "subject": "Commande incomplète - article manquant",
            "description": "J'ai commandé une caisse de bière 24 et j'ai reçu seulement 12 canettes.",
            "category": "order_issue",
            "priority": "high",
            "status": "open",
            "assignedTo": "admin-hedi",
            "assignedToName": "Hedi Bennis",
            "resolution": None,
            "satisfactionRating": None,
            "createdAt": dt(hours_ago=3),
            "updatedAt": dt(hours_ago=1),
            "resolvedAt": None,
            "tags": ["commande", "article manquant"],
            "messages": [
                {
                    "id": "msg-t1-1",
                    "senderId": "client-1",
                    "senderName": "Sophie Tremblay",
                    "senderType": "client",
                    "content": "Bonjour, j'ai commandé une caisse de bière 24 et j'ai reçu seulement 12 canettes. Pouvez-vous m'aider?",
                    "createdAt": dt(hours_ago=3),
                },
                {
                    "id": "msg-t1-2",
                    "senderId": "admin-hedi",
                    "senderName": "Hedi Bennis",
                    "senderType": "admin",
                    "content": "Bonjour Sophie, nous sommes désolés pour cet inconvénient. Nous allons vérifier avec le dépanneur et vous contacter dans les plus brefs délais.",
                    "createdAt": dt(hours_ago=2),
                },
            ],
        },
        {
            "id": "ticket-2",
            "ticketNumber": "TKT-002",
            "clientId": "client-3",
            "clientName": "Julie Côté",
            "orderId": "order-3",
            "orderNumber": "FDC-12347",
            "subject": "Délai de livraison trop long",
            "description": "Ma commande est en route depuis plus d'une heure. Le chauffeur ne répond pas.",
            "category": "delivery_issue",
            "priority": "urgent",
            "status": "in_progress",
            "assignedTo": "admin-hedi",
            "assignedToName": "Hedi Bennis",
            "resolution": None,
            "satisfactionRating": None,
            "createdAt": dt(hours_ago=1),
            "updatedAt": dt(minutes_ago=30),
            "resolvedAt": None,
            "tags": ["livraison", "délai"],
            "messages": [
                {
                    "id": "msg-t2-1",
                    "senderId": "client-3",
                    "senderName": "Julie Côté",
                    "senderType": "client",
                    "content": "Ma commande est en route depuis 1h15. C'est vraiment trop long!",
                    "createdAt": dt(hours_ago=1),
                },
                {
                    "id": "msg-t2-2",
                    "senderId": "admin-hedi",
                    "senderName": "Hedi Bennis",
                    "senderType": "admin",
                    "content": "Nous contactons le chauffeur immédiatement. Vous serez livré dans 15 minutes maximum.",
                    "createdAt": dt(minutes_ago=45),
                },
            ],
        },
        {
            "id": "ticket-3",
            "ticketNumber": "TKT-003",
            "clientId": "client-2",
            "clientName": "Mohammed Benali",
            "orderId": "order-8",
            "orderNumber": "FDC-12342",
            "subject": "Remboursement non reçu",
            "description": "Ma commande a été annulée il y a 3 jours mais je n'ai pas encore reçu mon remboursement.",
            "category": "payment_issue",
            "priority": "medium",
            "status": "resolved",
            "assignedTo": "admin-hedi",
            "assignedToName": "Hedi Bennis",
            "resolution": "Remboursement traité le 28 février. Délai bancaire de 3-5 jours ouvrables.",
            "satisfactionRating": 4,
            "createdAt": dt(days_ago=2),
            "updatedAt": dt(days_ago=1),
            "resolvedAt": dt(days_ago=1),
            "tags": ["remboursement", "paiement"],
            "messages": [],
        },
        {
            "id": "ticket-4",
            "ticketNumber": "TKT-004",
            "clientId": "client-5",
            "clientName": "Isabelle Gagnon",
            "orderId": None,
            "orderNumber": None,
            "subject": "Comment ajouter une adresse de livraison",
            "description": "Je n'arrive pas à ajouter une deuxième adresse dans mon profil.",
            "category": "technical",
            "priority": "low",
            "status": "resolved",
            "assignedTo": "admin-hedi",
            "assignedToName": "Hedi Bennis",
            "resolution": "Guidé la cliente vers Profil > Adresses > Ajouter une adresse.",
            "satisfactionRating": 5,
            "createdAt": dt(days_ago=3),
            "updatedAt": dt(days_ago=3),
            "resolvedAt": dt(days_ago=3),
            "tags": ["technique", "profil"],
            "messages": [],
        },
        {
            "id": "ticket-5",
            "ticketNumber": "TKT-005",
            "clientId": "client-4",
            "clientName": "David Kim",
            "orderId": "order-11",
            "orderNumber": "FDC-12340",
            "subject": "Litige - produit endommagé",
            "description": "Les chips commandées étaient écrasées et le sac était ouvert à la livraison.",
            "category": "dispute",
            "priority": "high",
            "status": "escalated",
            "assignedTo": "admin-hedi",
            "assignedToName": "Hedi Bennis",
            "resolution": None,
            "satisfactionRating": None,
            "createdAt": dt(days_ago=4),
            "updatedAt": dt(days_ago=1),
            "resolvedAt": None,
            "tags": ["litige", "produit endommagé"],
            "messages": [],
        },
    ]
    
    batch = db.batch()
    for t in tickets:
        ref = db.collection("support_tickets").document(t["id"])
        batch.set(ref, t)
    batch.commit()
    print(f"  ✅ {len(tickets)} tickets de support créés")

# ─────────────────────────────────────────────
# 4. PAYMENTS / TRANSACTIONS
# ─────────────────────────────────────────────
def seed_payments():
    print("\n💳 Seeding payments & transactions...")
    payments = []
    
    order_amounts = {
        "order-1": 25.74, "order-2": 18.75, "order-3": 31.20,
        "order-4": 15.50, "order-5": 22.30, "order-6": 42.50,
        "order-7": 67.80, "order-8": 22.50, "order-9": 19.50,
        "order-10": 38.90, "order-11": 28.90, "order-12": 33.20,
        "order-13": 45.60, "order-14": 29.80, "order-15": 52.40,
    }
    order_clients = {
        "order-1": "client-1", "order-2": "client-3", "order-3": "client-5",
        "order-4": "client-2", "order-5": "client-7", "order-6": "client-2",
        "order-7": "client-6", "order-8": "client-1", "order-9": "client-8",
        "order-10": "client-3", "order-11": "client-4", "order-12": "client-1",
        "order-13": "client-3", "order-14": "client-6", "order-15": "client-5",
    }
    
    methods = ["card_visa", "card_mastercard", "interac", "cash"]
    statuses = {
        "order-1": "paid", "order-2": "pending", "order-3": "paid",
        "order-4": "paid", "order-5": "paid", "order-6": "paid",
        "order-7": "paid", "order-8": "refunded", "order-9": "paid",
        "order-10": "paid", "order-11": "paid", "order-12": "paid",
        "order-13": "paid", "order-14": "paid", "order-15": "paid",
    }
    
    for i, (oid, amount) in enumerate(order_amounts.items()):
        cid = order_clients[oid]
        subtotal = round(amount / 1.14975, 2)
        tps = round(subtotal * 0.05, 2)
        tvq = round(subtotal * 0.09975, 2)
        delivery_fee = 3.99
        
        payments.append({
            "id": f"pay-{oid}",
            "transactionNumber": f"TRX-{10000 + i}",
            "orderId": oid,
            "orderNumber": ORDER_NUMBERS.get(oid, f"FDC-{12300+i}"),
            "clientId": cid,
            "clientName": CLIENT_NAMES.get(cid, "Client"),
            "amount": amount,
            "subtotal": subtotal,
            "deliveryFee": delivery_fee,
            "tps": tps,
            "tvq": tvq,
            "discountAmount": 0.0,
            "promoCode": "DEPXPRES1" if i == 0 else None,
            "paymentMethod": random.choice(methods),
            "paymentStatus": statuses.get(oid, "paid"),
            "stripePaymentIntentId": f"pi_{rand_id()}{rand_id()}",
            "last4": str(random.randint(1000, 9999)),
            "currency": "CAD",
            "createdAt": dt(days_ago=random.randint(0, 7), hours_ago=random.randint(0, 23)),
            "paidAt": dt(days_ago=random.randint(0, 7), hours_ago=random.randint(0, 22)),
            "refundedAt": dt(days_ago=2) if statuses.get(oid) == "refunded" else None,
            "refundAmount": amount if statuses.get(oid) == "refunded" else None,
            "refundReason": "Commande annulée par le client" if statuses.get(oid) == "refunded" else None,
            "metadata": {},
        })
    
    # Payouts chauffeurs
    payouts = []
    for i, (did, dname) in enumerate(DRIVER_NAMES.items()):
        for week in range(1, 4):
            earnings = round(random.uniform(200, 600), 2)
            payouts.append({
                "id": f"payout-{did}-w{week}",
                "transactionNumber": f"PAY-{20000 + i*10 + week}",
                "type": "driver_payout",
                "driverId": did,
                "driverName": dname,
                "amount": earnings,
                "deliveriesCount": random.randint(10, 30),
                "periodStart": dt(days_ago=week*7),
                "periodEnd": dt(days_ago=(week-1)*7),
                "status": "completed" if week > 1 else "pending",
                "paymentMethod": "interac_transfer",
                "bankAccount": f"****{random.randint(1000,9999)}",
                "createdAt": dt(days_ago=(week-1)*7 + 1),
                "processedAt": dt(days_ago=(week-1)*7) if week > 1 else None,
            })
    
    batch = db.batch()
    for p in payments:
        ref = db.collection("payments").document(p["id"])
        batch.set(ref, p)
    for p in payouts:
        ref = db.collection("payouts").document(p["id"])
        batch.set(ref, p)
    batch.commit()
    print(f"  ✅ {len(payments)} paiements + {len(payouts)} payouts créés")

# ─────────────────────────────────────────────
# 5. DISPATCH QUEUE + DISPATCH EVENTS
# ─────────────────────────────────────────────
def seed_dispatch():
    print("\n🚀 Seeding dispatch_queue & dispatch_events...")
    
    # Commandes dispatchables (confirmed, preparing, driver_assigned, etc.)
    dispatchable_orders = [
        {"orderId": "order-1", "orderNumber": "FDC-12345", "storeId": "store-1", "zoneId": "zone-mtl-centre", "driverId": "driver-1", "status": "assigned"},
        {"orderId": "order-2", "orderNumber": "FDC-12346", "storeId": "store-1", "zoneId": "zone-mtl-centre", "driverId": None, "status": "queued"},
        {"orderId": "order-3", "orderNumber": "FDC-12347", "storeId": "store-2", "zoneId": "zone-laval", "driverId": "driver-3", "status": "assigned"},
        {"orderId": "order-4", "orderNumber": "FDC-12348", "storeId": "store-2", "zoneId": "zone-laval", "driverId": None, "status": "queued"},
        {"orderId": "order-5", "orderNumber": "FDC-12349", "storeId": "store-6", "zoneId": "zone-longueuil", "driverId": "driver-7", "status": "assigned"},
        {"orderId": "order-6", "orderNumber": "FDC-12344", "storeId": "store-3", "zoneId": "zone-mtl-centre", "driverId": "driver-2", "status": "completed"},
        {"orderId": "order-7", "orderNumber": "FDC-12343", "storeId": "store-3", "zoneId": "zone-mtl-centre", "driverId": "driver-1", "status": "completed"},
    ]
    
    dispatch_docs = []
    dispatch_events = []
    
    for i, d in enumerate(dispatchable_orders):
        dispatch_id = f"dispatch-{d['orderId']}"
        dispatch_docs.append({
            "id": dispatch_id,
            "orderId": d["orderId"],
            "orderNumber": d["orderNumber"],
            "storeId": d["storeId"],
            "storeName": STORE_NAMES.get(d["storeId"], "Dépanneur"),
            "zoneId": d["zoneId"],
            "zoneName": ZONE_NAMES.get(d["zoneId"], "Zone"),
            "dispatchMode": "auto" if i % 2 == 0 else "manual",
            "dispatchStatus": d["status"],
            "selectedDriverId": d["driverId"],
            "selectedDriverName": DRIVER_NAMES.get(d["driverId"]) if d["driverId"] else None,
            "candidateDriverIds": [did for did in DRIVER_IDS if did != d["driverId"]][:3],
            "attemptCount": 1 if d["driverId"] else 0,
            "maxAttempts": 3,
            "assignedAt": dt(hours_ago=random.randint(1, 6)) if d["driverId"] else None,
            "completedAt": dt(hours_ago=random.randint(0, 2)) if d["status"] == "completed" else None,
            "createdAt": dt(hours_ago=random.randint(2, 8)),
            "updatedAt": dt(hours_ago=random.randint(0, 2)),
            "notes": None,
            "priority": "normal",
        })
        
        # Événements dispatch
        dispatch_events.append({
            "id": f"devent-{d['orderId']}-1",
            "dispatchId": dispatch_id,
            "orderId": d["orderId"],
            "eventType": "order_queued",
            "actorId": "system",
            "actorType": "system",
            "actorName": "Système automatique",
            "description": f"Commande {d['orderNumber']} ajoutée à la file de dispatch",
            "metadata": {"zoneId": d["zoneId"], "storeId": d["storeId"]},
            "createdAt": dt(hours_ago=random.randint(3, 8)),
        })
        
        if d["driverId"]:
            dispatch_events.append({
                "id": f"devent-{d['orderId']}-2",
                "dispatchId": dispatch_id,
                "orderId": d["orderId"],
                "eventType": "driver_assigned",
                "actorId": "admin-hedi",
                "actorType": "admin",
                "actorName": "Hedi Bennis",
                "description": f"Chauffeur {DRIVER_NAMES.get(d['driverId'])} assigné à la commande {d['orderNumber']}",
                "metadata": {"driverId": d["driverId"], "driverName": DRIVER_NAMES.get(d["driverId"])},
                "createdAt": dt(hours_ago=random.randint(1, 3)),
            })
    
    batch = db.batch()
    for d in dispatch_docs:
        ref = db.collection("dispatch_queue").document(d["id"])
        batch.set(ref, d)
    for e in dispatch_events:
        ref = db.collection("dispatch_events").document(e["id"])
        batch.set(ref, e)
    batch.commit()
    print(f"  ✅ {len(dispatch_docs)} entrées dispatch + {len(dispatch_events)} événements créés")

# ─────────────────────────────────────────────
# 6. TRACKING SESSIONS
# ─────────────────────────────────────────────
def seed_tracking():
    print("\n📍 Seeding tracking_sessions & driver_locations...")
    
    active_orders = [
        {"orderId": "order-1", "clientId": "client-1", "driverId": "driver-1", "lat": 45.5017, "lng": -73.5673},
        {"orderId": "order-3", "clientId": "client-5", "driverId": "driver-3", "lat": 45.5588, "lng": -73.7130},
        {"orderId": "order-5", "clientId": "client-7", "driverId": "driver-7", "lat": 45.5016, "lng": -73.5674},
    ]
    
    tracking_sessions = []
    driver_locations = []
    
    for t in active_orders:
        tracking_sessions.append({
            "id": f"track-{t['orderId']}",
            "orderId": t["orderId"],
            "orderNumber": ORDER_NUMBERS.get(t["orderId"]),
            "clientId": t["clientId"],
            "driverId": t["driverId"],
            "driverName": DRIVER_NAMES.get(t["driverId"]),
            "status": "active",
            "currentLat": t["lat"] + random.uniform(-0.01, 0.01),
            "currentLng": t["lng"] + random.uniform(-0.01, 0.01),
            "destinationLat": t["lat"] + random.uniform(0.005, 0.02),
            "destinationLng": t["lng"] + random.uniform(0.005, 0.02),
            "estimatedArrival": dt(minutes_ago=-random.randint(5, 25)),
            "distanceRemaining": round(random.uniform(0.5, 5.0), 1),
            "startedAt": dt(hours_ago=random.randint(0, 1)),
            "updatedAt": dt(minutes_ago=random.randint(1, 5)),
        })
        
        driver_locations.append({
            "id": f"loc-{t['driverId']}",
            "driverId": t["driverId"],
            "driverName": DRIVER_NAMES.get(t["driverId"]),
            "lat": t["lat"] + random.uniform(-0.01, 0.01),
            "lng": t["lng"] + random.uniform(-0.01, 0.01),
            "heading": random.randint(0, 360),
            "speed": round(random.uniform(0, 60), 1),
            "accuracy": round(random.uniform(5, 20), 1),
            "isOnline": True,
            "currentOrderId": t["orderId"],
            "updatedAt": dt(minutes_ago=random.randint(0, 2)),
        })
    
    # Chauffeurs en ligne sans commande
    for did in ["driver-2", "driver-4", "driver-5"]:
        driver_locations.append({
            "id": f"loc-{did}",
            "driverId": did,
            "driverName": DRIVER_NAMES.get(did),
            "lat": 45.5017 + random.uniform(-0.05, 0.05),
            "lng": -73.5673 + random.uniform(-0.05, 0.05),
            "heading": random.randint(0, 360),
            "speed": 0,
            "accuracy": 10,
            "isOnline": True,
            "currentOrderId": None,
            "updatedAt": dt(minutes_ago=random.randint(1, 10)),
        })
    
    batch = db.batch()
    for t in tracking_sessions:
        ref = db.collection("tracking_sessions").document(t["id"])
        batch.set(ref, t)
    for l in driver_locations:
        ref = db.collection("driver_locations").document(l["id"])
        batch.set(ref, l)
    batch.commit()
    print(f"  ✅ {len(tracking_sessions)} sessions de tracking + {len(driver_locations)} positions créées")

# ─────────────────────────────────────────────
# 7. REVIEWS
# ─────────────────────────────────────────────
def seed_reviews():
    print("\n⭐ Seeding reviews...")
    reviews = []
    
    completed_orders = [
        ("order-6", "client-2", "driver-2", "store-3"),
        ("order-7", "client-6", "driver-1", "store-3"),
        ("order-9", "client-8", "driver-4", "store-5"),
        ("order-10", "client-3", "driver-5", "store-4"),
        ("order-12", "client-1", "driver-3", "store-1"),
        ("order-13", "client-3", "driver-2", "store-2"),
        ("order-14", "client-6", "driver-5", "store-5"),
        ("order-15", "client-5", "driver-1", "store-1"),
    ]
    
    comments_positive = [
        "Livraison rapide, chauffeur très sympathique!",
        "Excellent service, je recommande!",
        "Parfait, tout était frais et bien emballé.",
        "Super rapide, moins de 25 minutes!",
        "Chauffeur professionnel et ponctuel.",
    ]
    comments_negative = [
        "Livraison un peu en retard mais produits OK.",
        "Quelques articles manquants mais remboursé rapidement.",
    ]
    
    for i, (oid, cid, did, sid) in enumerate(completed_orders):
        rating = random.choice([4, 4, 5, 5, 5, 3])
        reviews.append({
            "id": f"review-{oid}",
            "orderId": oid,
            "orderNumber": ORDER_NUMBERS.get(oid),
            "clientId": cid,
            "clientName": CLIENT_NAMES.get(cid),
            "driverId": did,
            "driverName": DRIVER_NAMES.get(did),
            "storeId": sid,
            "storeName": STORE_NAMES.get(sid),
            "overallRating": rating,
            "driverRating": min(5, rating + random.choice([-1, 0, 1])),
            "storeRating": min(5, rating + random.choice([-1, 0, 1])),
            "deliveryTimeRating": min(5, rating + random.choice([-1, 0, 1])),
            "comment": random.choice(comments_positive if rating >= 4 else comments_negative),
            "isPublic": True,
            "createdAt": dt(days_ago=random.randint(0, 10)),
        })
    
    batch = db.batch()
    for r in reviews:
        ref = db.collection("reviews").document(r["id"])
        batch.set(ref, r)
    batch.commit()
    print(f"  ✅ {len(reviews)} avis créés")

# ─────────────────────────────────────────────
# 8. WALLETS (clients + drivers)
# ─────────────────────────────────────────────
def seed_wallets():
    print("\n💰 Seeding wallets...")
    wallets = []
    
    for cid, cname in CLIENT_NAMES.items():
        wallets.append({
            "id": f"wallet-{cid}",
            "ownerId": cid,
            "ownerType": "client",
            "ownerName": cname,
            "balance": round(random.uniform(0, 25), 2),
            "currency": "CAD",
            "totalEarned": round(random.uniform(0, 50), 2),
            "totalSpent": round(random.uniform(50, 300), 2),
            "transactions": [
                {
                    "id": f"wtx-{cid}-1",
                    "type": "credit",
                    "amount": 5.0,
                    "description": "Bonus de bienvenue",
                    "createdAt": dt(days_ago=30),
                },
                {
                    "id": f"wtx-{cid}-2",
                    "type": "debit",
                    "amount": round(random.uniform(15, 50), 2),
                    "description": "Paiement commande",
                    "createdAt": dt(days_ago=random.randint(1, 10)),
                },
            ],
            "createdAt": dt(days_ago=60),
            "updatedAt": dt(days_ago=random.randint(0, 5)),
        })
    
    for did, dname in DRIVER_NAMES.items():
        wallets.append({
            "id": f"wallet-{did}",
            "ownerId": did,
            "ownerType": "driver",
            "ownerName": dname,
            "balance": round(random.uniform(50, 400), 2),
            "currency": "CAD",
            "totalEarned": round(random.uniform(500, 3000), 2),
            "totalWithdrawn": round(random.uniform(400, 2500), 2),
            "pendingAmount": round(random.uniform(0, 100), 2),
            "transactions": [],
            "createdAt": dt(days_ago=90),
            "updatedAt": dt(days_ago=random.randint(0, 3)),
        })
    
    batch = db.batch()
    for w in wallets:
        ref = db.collection("wallets").document(w["id"])
        batch.set(ref, w)
    batch.commit()
    print(f"  ✅ {len(wallets)} wallets créés")

# ─────────────────────────────────────────────
# 9. ADDRESSES (clients)
# ─────────────────────────────────────────────
def seed_addresses():
    print("\n🏠 Seeding addresses...")
    addresses_data = {
        "client-1": [
            {"label": "Maison", "street": "123 Rue Ste-Catherine O.", "city": "Montréal", "province": "QC", "postal": "H3B 1A1", "lat": 45.5017, "lng": -73.5673, "isDefault": True},
            {"label": "Bureau", "street": "1000 Rue De La Gauchetière O.", "city": "Montréal", "province": "QC", "postal": "H3B 4W5", "lat": 45.4972, "lng": -73.5664, "isDefault": False},
        ],
        "client-2": [
            {"label": "Maison", "street": "456 Boul. Chomedey", "city": "Laval", "province": "QC", "postal": "H7V 2Y3", "lat": 45.5588, "lng": -73.7130, "isDefault": True},
        ],
        "client-3": [
            {"label": "Maison", "street": "789 Rue St-Denis", "city": "Montréal", "province": "QC", "postal": "H2J 2L8", "lat": 45.5231, "lng": -73.5826, "isDefault": True},
        ],
        "client-4": [
            {"label": "Maison", "street": "321 Boul. Henri-Bourassa", "city": "Montréal", "province": "QC", "postal": "H3L 1P4", "lat": 45.5706, "lng": -73.6398, "isDefault": True},
        ],
        "client-5": [
            {"label": "Maison", "street": "654 Rue Principale", "city": "Longueuil", "province": "QC", "postal": "J4H 1Z7", "lat": 45.5316, "lng": -73.5185, "isDefault": True},
        ],
        "client-6": [
            {"label": "Maison", "street": "987 Boul. St-Martin O.", "city": "Laval", "province": "QC", "postal": "H7S 1M5", "lat": 45.5705, "lng": -73.7412, "isDefault": True},
        ],
        "client-7": [
            {"label": "Maison", "street": "147 Rue Fleury E.", "city": "Montréal", "province": "QC", "postal": "H2C 1S5", "lat": 45.5759, "lng": -73.6312, "isDefault": True},
        ],
        "client-8": [
            {"label": "Maison", "street": "258 Rue Rachel E.", "city": "Montréal", "province": "QC", "postal": "H2J 2H4", "lat": 45.5244, "lng": -73.5744, "isDefault": True},
        ],
    }
    
    batch = db.batch()
    count = 0
    for cid, addrs in addresses_data.items():
        for j, addr in enumerate(addrs):
            addr_id = f"addr-{cid}-{j+1}"
            addr["id"] = addr_id
            addr["clientId"] = cid
            addr["clientName"] = CLIENT_NAMES.get(cid)
            addr["createdAt"] = dt(days_ago=random.randint(10, 60))
            ref = db.collection("addresses").document(addr_id)
            batch.set(ref, addr)
            count += 1
    batch.commit()
    print(f"  ✅ {count} adresses créées")

# ─────────────────────────────────────────────
# 10. CHAT THREADS + MESSAGES
# ─────────────────────────────────────────────
def seed_chats():
    print("\n💬 Seeding chat_threads & messages...")
    threads = []
    messages = []
    
    active_orders = [
        ("order-1", "client-1", "driver-1"),
        ("order-3", "client-5", "driver-3"),
        ("order-5", "client-7", "driver-7"),
    ]
    
    for oid, cid, did in active_orders:
        thread_id = f"thread-{oid}"
        threads.append({
            "id": thread_id,
            "orderId": oid,
            "orderNumber": ORDER_NUMBERS.get(oid),
            "clientId": cid,
            "clientName": CLIENT_NAMES.get(cid),
            "driverId": did,
            "driverName": DRIVER_NAMES.get(did),
            "status": "active",
            "lastMessage": "Je suis en route, j'arrive dans 10 minutes!",
            "lastMessageAt": dt(minutes_ago=random.randint(5, 30)),
            "createdAt": dt(hours_ago=random.randint(1, 3)),
        })
        
        msgs = [
            (cid, CLIENT_NAMES.get(cid), "client", "Bonjour, ma commande est pour le 3e étage svp.", dt(hours_ago=2)),
            (did, DRIVER_NAMES.get(did), "driver", "Bien reçu, je note ça!", dt(hours_ago=1, minutes_ago=55)),
            (did, DRIVER_NAMES.get(did), "driver", "Je suis au dépanneur, je prépare votre commande.", dt(hours_ago=1)),
            (did, DRIVER_NAMES.get(did), "driver", "Je suis en route, j'arrive dans 10 minutes!", dt(minutes_ago=random.randint(5, 30))),
        ]
        
        for j, (sid, sname, stype, content, created) in enumerate(msgs):
            messages.append({
                "id": f"msg-{oid}-{j+1}",
                "threadId": thread_id,
                "orderId": oid,
                "senderId": sid,
                "senderName": sname,
                "senderType": stype,
                "content": content,
                "type": "text",
                "read": True,
                "createdAt": created,
            })
    
    batch = db.batch()
    for t in threads:
        ref = db.collection("chat_threads").document(t["id"])
        batch.set(ref, t)
    for m in messages:
        ref = db.collection("chat_messages").document(m["id"])
        batch.set(ref, m)
    batch.commit()
    print(f"  ✅ {len(threads)} threads + {len(messages)} messages créés")

# ─────────────────────────────────────────────
# 11. SYSTEM SETTINGS
# ─────────────────────────────────────────────
def seed_system_settings():
    print("\n⚙️ Seeding system_settings...")
    settings = {
        "id": "global",
        "appName": "DepXpreS",
        "appVersion": "1.0.0",
        "supportEmail": "support@depxpres.ca",
        "supportPhone": "1-800-DEPXPRES",
        "defaultLanguage": "fr",
        "supportedLanguages": ["fr", "en"],
        "currency": "CAD",
        "timezone": "America/Toronto",
        "delivery": {
            "baseFee": 3.99,
            "perKmFee": 0.50,
            "maxDistance": 10,
            "minOrderAmount": 10.0,
            "freeDeliveryThreshold": 50.0,
            "estimatedTimeMinutes": 30,
            "maxDeliveryTimeMinutes": 60,
        },
        "dispatch": {
            "mode": "auto",
            "maxAttempts": 3,
            "attemptTimeoutSeconds": 60,
            "autoAssignEnabled": True,
            "radiusKm": 5,
        },
        "payments": {
            "stripeEnabled": True,
            "cashEnabled": True,
            "interacEnabled": True,
            "walletEnabled": True,
            "tpsRate": 0.05,
            "tvqRate": 0.09975,
        },
        "notifications": {
            "pushEnabled": True,
            "emailEnabled": True,
            "smsEnabled": False,
        },
        "maintenance": {
            "isMaintenanceMode": False,
            "maintenanceMessage": "",
        },
        "features": {
            "reviewsEnabled": True,
            "promotionsEnabled": True,
            "referralEnabled": True,
            "liveTrackingEnabled": True,
            "scheduledDeliveryEnabled": False,
        },
        "updatedAt": dt(days_ago=1),
        "updatedBy": "admin-hedi",
    }
    
    db.collection("system_settings").document("global").set(settings)
    print("  ✅ system_settings créé")

# ─────────────────────────────────────────────
# 12. AUDIT LOGS
# ─────────────────────────────────────────────
def seed_audit_logs():
    print("\n📋 Seeding audit_logs...")
    logs = [
        {
            "id": "log-1",
            "actorId": "admin-hedi",
            "actorName": "Hedi Bennis",
            "actorType": "admin",
            "action": "order.status_changed",
            "resourceType": "order",
            "resourceId": "order-8",
            "description": "Statut commande FDC-12342 changé de 'confirmed' à 'cancelled'",
            "metadata": {"oldStatus": "confirmed", "newStatus": "cancelled", "reason": "Client request"},
            "ipAddress": "192.168.1.100",
            "createdAt": dt(days_ago=2),
        },
        {
            "id": "log-2",
            "actorId": "admin-hedi",
            "actorName": "Hedi Bennis",
            "actorType": "admin",
            "action": "driver.status_changed",
            "resourceType": "driver",
            "resourceId": "driver-6",
            "description": "Statut chauffeur Kevin Lapointe changé à 'suspended'",
            "metadata": {"oldStatus": "active", "newStatus": "suspended", "reason": "Documents expirés"},
            "ipAddress": "192.168.1.100",
            "createdAt": dt(days_ago=5),
        },
        {
            "id": "log-3",
            "actorId": "admin-hedi",
            "actorName": "Hedi Bennis",
            "actorType": "admin",
            "action": "promotion.created",
            "resourceType": "promotion",
            "resourceId": "promo-3",
            "description": "Promotion BIERE20 créée",
            "metadata": {"code": "BIERE20", "discount": "20%"},
            "ipAddress": "192.168.1.100",
            "createdAt": dt(days_ago=3),
        },
        {
            "id": "log-4",
            "actorId": "admin-hedi",
            "actorName": "Hedi Bennis",
            "actorType": "admin",
            "action": "order.refund_processed",
            "resourceType": "order",
            "resourceId": "order-8",
            "description": "Remboursement de 22.50$ traité pour commande FDC-12342",
            "metadata": {"amount": 22.50, "method": "card"},
            "ipAddress": "192.168.1.100",
            "createdAt": dt(days_ago=2),
        },
        {
            "id": "log-5",
            "actorId": "admin-hedi",
            "actorName": "Hedi Bennis",
            "actorType": "admin",
            "action": "store.updated",
            "resourceType": "store",
            "resourceId": "store-7",
            "description": "Dépanneur Plateau Express mis à jour - statut: en_attente",
            "metadata": {"field": "status", "oldValue": "active", "newValue": "pending"},
            "ipAddress": "192.168.1.100",
            "createdAt": dt(days_ago=1),
        },
    ]
    
    batch = db.batch()
    for l in logs:
        ref = db.collection("audit_logs").document(l["id"])
        batch.set(ref, l)
    batch.commit()
    print(f"  ✅ {len(logs)} logs d'audit créés")

# ─────────────────────────────────────────────
# 13. REPORTS
# ─────────────────────────────────────────────
def seed_reports():
    print("\n📊 Seeding reports...")
    reports = [
        {
            "id": "report-weekly-1",
            "type": "weekly_summary",
            "title": "Rapport hebdomadaire — Semaine du 24 fév. 2026",
            "period": "weekly",
            "startDate": dt(days_ago=7),
            "endDate": dt(days_ago=0),
            "metrics": {
                "totalOrders": 42,
                "completedOrders": 38,
                "cancelledOrders": 4,
                "totalRevenue": 1247.80,
                "avgOrderValue": 29.71,
                "avgDeliveryTime": 28,
                "activeDrivers": 7,
                "activeClients": 23,
                "newClients": 5,
                "topStore": "Dépanneur Centre-Ville 24h",
                "topDriver": "Marc-André Tremblay",
                "topZone": "Montréal Centre-Ville",
            },
            "generatedBy": "system",
            "createdAt": dt(days_ago=0),
        },
        {
            "id": "report-monthly-1",
            "type": "monthly_summary",
            "title": "Rapport mensuel — Février 2026",
            "period": "monthly",
            "startDate": dt(days_ago=28),
            "endDate": dt(days_ago=0),
            "metrics": {
                "totalOrders": 187,
                "completedOrders": 171,
                "cancelledOrders": 16,
                "totalRevenue": 5432.60,
                "avgOrderValue": 29.05,
                "avgDeliveryTime": 27,
                "activeDrivers": 7,
                "activeClients": 67,
                "newClients": 18,
                "topStore": "Dépanneur Centre-Ville 24h",
                "topDriver": "Marc-André Tremblay",
                "topZone": "Montréal Centre-Ville",
            },
            "generatedBy": "system",
            "createdAt": dt(days_ago=0),
        },
        {
            "id": "report-finance-1",
            "type": "financial",
            "title": "Rapport financier — Février 2026",
            "period": "monthly",
            "startDate": dt(days_ago=28),
            "endDate": dt(days_ago=0),
            "metrics": {
                "grossRevenue": 5432.60,
                "platformFees": 814.89,
                "driverPayouts": 3250.00,
                "storePayouts": 1085.00,
                "netRevenue": 282.71,
                "refunds": 67.50,
                "avgTransactionValue": 29.05,
                "paymentMethods": {
                    "card_visa": 45,
                    "card_mastercard": 32,
                    "interac": 28,
                    "cash": 15,
                },
            },
            "generatedBy": "system",
            "createdAt": dt(days_ago=0),
        },
    ]
    
    batch = db.batch()
    for r in reports:
        ref = db.collection("reports").document(r["id"])
        batch.set(ref, r)
    batch.commit()
    print(f"  ✅ {len(reports)} rapports créés")

# ─────────────────────────────────────────────
# 14. DRIVER APPLICATIONS (candidatures)
# ─────────────────────────────────────────────
def seed_driver_applications():
    print("\n📝 Seeding driver_applications...")
    applications = [
        {
            "id": "app-1",
            "driverId": None,
            "firstName": "Pierre",
            "lastName": "Dubois",
            "email": "pierre.dubois@email.com",
            "phone": "514-555-2001",
            "city": "Montréal",
            "province": "QC",
            "applicationStatus": "pending",
            "submittedAt": dt(days_ago=2),
            "documents": {
                "driverLicense": {"status": "uploaded", "url": "#"},
                "insurance": {"status": "uploaded", "url": "#"},
                "criminalRecord": {"status": "pending", "url": None},
            },
            "vehicle": {
                "make": "Toyota",
                "model": "Corolla",
                "year": 2019,
                "color": "Blanc",
                "licensePlate": "ABC-1234",
            },
            "notes": "Candidat sérieux, documents presque complets.",
            "reviewedBy": None,
            "createdAt": dt(days_ago=2),
            "updatedAt": dt(days_ago=1),
        },
        {
            "id": "app-2",
            "driverId": None,
            "firstName": "Marie",
            "lastName": "Fontaine",
            "email": "marie.fontaine@email.com",
            "phone": "438-555-2002",
            "city": "Laval",
            "province": "QC",
            "applicationStatus": "under_review",
            "submittedAt": dt(days_ago=5),
            "documents": {
                "driverLicense": {"status": "approved", "url": "#"},
                "insurance": {"status": "approved", "url": "#"},
                "criminalRecord": {"status": "uploaded", "url": "#"},
            },
            "vehicle": {
                "make": "Honda",
                "model": "Civic",
                "year": 2021,
                "color": "Gris",
                "licensePlate": "XYZ-5678",
            },
            "notes": "Tous les documents reçus, en cours de vérification.",
            "reviewedBy": "admin-hedi",
            "createdAt": dt(days_ago=5),
            "updatedAt": dt(days_ago=1),
        },
        {
            "id": "app-3",
            "driverId": None,
            "firstName": "Ahmed",
            "lastName": "Khalil",
            "email": "ahmed.khalil@email.com",
            "phone": "514-555-2003",
            "city": "Montréal",
            "province": "QC",
            "applicationStatus": "rejected",
            "submittedAt": dt(days_ago=10),
            "documents": {
                "driverLicense": {"status": "approved", "url": "#"},
                "insurance": {"status": "rejected", "url": "#"},
                "criminalRecord": {"status": "approved", "url": "#"},
            },
            "vehicle": {
                "make": "Hyundai",
                "model": "Elantra",
                "year": 2015,
                "color": "Rouge",
                "licensePlate": "DEF-9012",
            },
            "notes": "Assurance expirée, candidature rejetée.",
            "reviewedBy": "admin-hedi",
            "rejectionReason": "Assurance automobile expirée",
            "createdAt": dt(days_ago=10),
            "updatedAt": dt(days_ago=7),
        },
    ]
    
    batch = db.batch()
    for a in applications:
        ref = db.collection("driver_applications").document(a["id"])
        batch.set(ref, a)
    batch.commit()
    print(f"  ✅ {len(applications)} candidatures créées")

# ─────────────────────────────────────────────
# 15. ORDER STATUS HISTORY (pour timeline)
# ─────────────────────────────────────────────
def seed_order_history():
    print("\n📜 Seeding order_status_history...")
    
    histories = []
    
    # Commande complète (order-7 = FDC-12343)
    histories.extend([
        {"orderId": "order-7", "status": "pending", "note": "Commande reçue", "actorId": "system", "actorType": "system", "createdAt": dt(days_ago=1, hours_ago=4)},
        {"orderId": "order-7", "status": "confirmed", "note": "Paiement confirmé", "actorId": "system", "actorType": "system", "createdAt": dt(days_ago=1, hours_ago=3, minutes_ago=50)},
        {"orderId": "order-7", "status": "preparing", "note": "Dépanneur prépare la commande", "actorId": "store-3", "actorType": "store", "createdAt": dt(days_ago=1, hours_ago=3, minutes_ago=40)},
        {"orderId": "order-7", "status": "driver_assigned", "note": "Chauffeur Marc-André Tremblay assigné", "actorId": "admin-hedi", "actorType": "admin", "createdAt": dt(days_ago=1, hours_ago=3, minutes_ago=30)},
        {"orderId": "order-7", "status": "picked_up", "note": "Commande récupérée au dépanneur", "actorId": "driver-1", "actorType": "driver", "createdAt": dt(days_ago=1, hours_ago=3, minutes_ago=10)},
        {"orderId": "order-7", "status": "delivered", "note": "Commande livrée avec succès", "actorId": "driver-1", "actorType": "driver", "createdAt": dt(days_ago=1, hours_ago=2, minutes_ago=40)},
        {"orderId": "order-7", "status": "completed", "note": "Commande complétée, client satisfait", "actorId": "system", "actorType": "system", "createdAt": dt(days_ago=1, hours_ago=2, minutes_ago=35)},
    ])
    
    # Commande annulée (order-8 = FDC-12342)
    histories.extend([
        {"orderId": "order-8", "status": "pending", "note": "Commande reçue", "actorId": "system", "actorType": "system", "createdAt": dt(days_ago=2, hours_ago=3)},
        {"orderId": "order-8", "status": "confirmed", "note": "Paiement confirmé", "actorId": "system", "actorType": "system", "createdAt": dt(days_ago=2, hours_ago=2, minutes_ago=55)},
        {"orderId": "order-8", "status": "cancelled", "note": "Annulé à la demande du client", "actorId": "client-1", "actorType": "client", "createdAt": dt(days_ago=2, hours_ago=2, minutes_ago=30)},
    ])
    
    # Commande en cours (order-1 = FDC-12345)
    histories.extend([
        {"orderId": "order-1", "status": "pending", "note": "Commande reçue", "actorId": "system", "actorType": "system", "createdAt": dt(hours_ago=2)},
        {"orderId": "order-1", "status": "confirmed", "note": "Paiement confirmé", "actorId": "system", "actorType": "system", "createdAt": dt(hours_ago=1, minutes_ago=55)},
        {"orderId": "order-1", "status": "preparing", "note": "Dépanneur prépare la commande", "actorId": "store-1", "actorType": "store", "createdAt": dt(hours_ago=1, minutes_ago=45)},
        {"orderId": "order-1", "status": "driver_assigned", "note": "Chauffeur Marc-André Tremblay assigné", "actorId": "admin-hedi", "actorType": "admin", "createdAt": dt(hours_ago=1, minutes_ago=30)},
        {"orderId": "order-1", "status": "picked_up", "note": "Commande récupérée", "actorId": "driver-1", "actorType": "driver", "createdAt": dt(hours_ago=1, minutes_ago=10)},
        {"orderId": "order-1", "status": "en_route", "note": "En route vers le client", "actorId": "driver-1", "actorType": "driver", "createdAt": dt(minutes_ago=25)},
    ])
    
    batch = db.batch()
    for i, h in enumerate(histories):
        h["id"] = f"hist-{h['orderId']}-{i}"
        ref = db.collection("order_status_history").document(h["id"])
        batch.set(ref, h)
    batch.commit()
    print(f"  ✅ {len(histories)} entrées d'historique créées")

# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────
if __name__ == "__main__":
    print("🚀 DepXpreS — Seed complet de toutes les collections manquantes")
    print("=" * 60)
    
    seed_promotions()
    seed_notifications()
    seed_support_tickets()
    seed_payments()
    seed_dispatch()
    seed_tracking()
    seed_reviews()
    seed_wallets()
    seed_addresses()
    seed_chats()
    seed_system_settings()
    seed_audit_logs()
    seed_reports()
    seed_driver_applications()
    seed_order_history()
    
    print("\n" + "=" * 60)
    print("✅ SEED COMPLET TERMINÉ — Toutes les collections sont peuplées!")
    print("\nCollections créées/mises à jour:")
    print("  ✅ promotions")
    print("  ✅ notifications")
    print("  ✅ support_tickets")
    print("  ✅ payments")
    print("  ✅ payouts")
    print("  ✅ dispatch_queue")
    print("  ✅ dispatch_events")
    print("  ✅ tracking_sessions")
    print("  ✅ driver_locations")
    print("  ✅ reviews")
    print("  ✅ wallets")
    print("  ✅ addresses")
    print("  ✅ chat_threads")
    print("  ✅ chat_messages")
    print("  ✅ system_settings")
    print("  ✅ audit_logs")
    print("  ✅ reports")
    print("  ✅ driver_applications")
    print("  ✅ order_status_history")
