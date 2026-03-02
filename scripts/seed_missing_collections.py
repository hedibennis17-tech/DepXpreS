#!/usr/bin/env python3
"""Seed les collections vides: transactions, driver_applications, reports, system_settings, audit_logs"""

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta
import random

if not firebase_admin._apps:
    cred = credentials.Certificate('/home/ubuntu/depxpres/service-account.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

def ts(days_ago=0, hours_ago=0):
    return datetime.utcnow() - timedelta(days=days_ago, hours=hours_ago)

print("=== Seed collections manquantes ===")

# 1. TRANSACTIONS (paiements réels)
print("\n1. Transactions...")
transactions = [
    {"id": "tx-001", "type": "payment", "amount": 18.75, "currency": "CAD", "status": "paid",
     "method": "card_visa", "orderId": "FDC-12345", "clientId": "client-1", "clientName": "Sophie Tremblay",
     "storeId": "store-1", "storeName": "Dépanneur Centre-Ville 24h",
     "description": "Commande FDC-12345", "stripePaymentId": "pi_3abc123", "createdAt": ts(0, 2)},
    {"id": "tx-002", "type": "payment", "amount": 15.50, "currency": "CAD", "status": "paid",
     "method": "card_mastercard", "orderId": "FDC-12344", "clientId": "client-2", "clientName": "Marc Gagnon",
     "storeId": "store-2", "storeName": "Dépanneur St-Martin",
     "description": "Commande FDC-12344", "stripePaymentId": "pi_3def456", "createdAt": ts(0, 4)},
    {"id": "tx-003", "type": "payment", "amount": 31.20, "currency": "CAD", "status": "paid",
     "method": "interac", "orderId": "FDC-12343", "clientId": "client-3", "clientName": "Amina Diallo",
     "storeId": "store-3", "storeName": "Dépanneur Chomedey Express",
     "description": "Commande FDC-12343", "createdAt": ts(1)},
    {"id": "tx-004", "type": "payment", "amount": 22.30, "currency": "CAD", "status": "paid",
     "method": "cash", "orderId": "FDC-12342", "clientId": "client-4", "clientName": "Jean-Pierre Lavoie",
     "storeId": "store-1", "storeName": "Dépanneur Centre-Ville 24h",
     "description": "Commande FDC-12342", "createdAt": ts(1, 3)},
    {"id": "tx-005", "type": "payment", "amount": 25.74, "currency": "CAD", "status": "paid",
     "method": "card_visa", "orderId": "FDC-12341", "clientId": "client-5", "clientName": "Fatima Benali",
     "storeId": "store-4", "storeName": "Dépanneur Laval Ouest",
     "description": "Commande FDC-12341", "createdAt": ts(2)},
    {"id": "tx-006", "type": "payment", "amount": 42.50, "currency": "CAD", "status": "refunded",
     "method": "card_visa", "orderId": "FDC-12340", "clientId": "client-1", "clientName": "Sophie Tremblay",
     "storeId": "store-2", "storeName": "Dépanneur St-Martin",
     "description": "Commande FDC-12340 - Remboursé", "refundAmount": 42.50, "refundReason": "Commande annulée", "createdAt": ts(3)},
    {"id": "tx-007", "type": "payout", "amount": 501.45, "currency": "CAD", "status": "pending",
     "method": "interac_transfer", "driverId": "driver-1", "driverName": "Marc-André Tremblay",
     "description": "Versement semaine 08/2026", "createdAt": ts(0, 1)},
    {"id": "tx-008", "type": "payout", "amount": 373.19, "currency": "CAD", "status": "pending",
     "method": "interac_transfer", "driverId": "driver-2", "driverName": "Amina Diallo",
     "description": "Versement semaine 08/2026", "createdAt": ts(0, 1)},
    {"id": "tx-009", "type": "payout", "amount": 597.26, "currency": "CAD", "status": "paid",
     "method": "interac_transfer", "driverId": "driver-3", "driverName": "Sofia Martinez",
     "description": "Versement semaine 07/2026", "createdAt": ts(7)},
    {"id": "tx-010", "type": "payout", "amount": 374.93, "currency": "CAD", "status": "paid",
     "method": "interac_transfer", "driverId": "driver-4", "driverName": "Yasmine Khelifi",
     "description": "Versement semaine 07/2026", "createdAt": ts(7)},
    {"id": "tx-011", "type": "platform_fee", "amount": 3.75, "currency": "CAD", "status": "paid",
     "orderId": "FDC-12345", "description": "Commission plateforme 20%", "createdAt": ts(0, 2)},
    {"id": "tx-012", "type": "platform_fee", "amount": 3.10, "currency": "CAD", "status": "paid",
     "orderId": "FDC-12344", "description": "Commission plateforme 20%", "createdAt": ts(0, 4)},
]

batch = db.batch()
for tx in transactions:
    tx_id = tx.pop("id")
    ref = db.collection('transactions').document(tx_id)
    batch.set(ref, tx)
batch.commit()
print(f"  ✓ {len(transactions)} transactions créées")

# 2. DRIVER APPLICATIONS
print("\n2. Driver applications...")
applications = [
    {"id": "app-001", "firstName": "Kevin", "lastName": "Nguyen", "email": "kevin.nguyen@gmail.com",
     "phone": "514-555-0101", "city": "Montréal", "province": "QC", "postalCode": "H2X 1Y4",
     "vehicleType": "car", "vehicleMake": "Honda", "vehicleModel": "Civic", "vehicleYear": 2020,
     "vehiclePlate": "ABC-1234", "licenseNumber": "N1234567", "licenseExpiry": "2027-08-15",
     "status": "pending", "submittedAt": ts(1), "notes": "Candidature complète",
     "documents": {"license": True, "insurance": True, "criminal_check": False}},
    {"id": "app-002", "firstName": "Isabelle", "lastName": "Roy", "email": "isabelle.roy@hotmail.com",
     "phone": "450-555-0202", "city": "Laval", "province": "QC", "postalCode": "H7G 2K3",
     "vehicleType": "bicycle", "vehicleMake": "Trek", "vehicleModel": "FX3", "vehicleYear": 2022,
     "vehiclePlate": "N/A", "licenseNumber": "R9876543", "licenseExpiry": "2026-12-01",
     "status": "approved", "submittedAt": ts(14), "approvedAt": ts(10), "notes": "Approuvée - Zone Laval",
     "documents": {"license": True, "insurance": True, "criminal_check": True}},
    {"id": "app-003", "firstName": "David", "lastName": "Okafor", "email": "david.okafor@gmail.com",
     "phone": "514-555-0303", "city": "Montréal", "province": "QC", "postalCode": "H3B 2Y7",
     "vehicleType": "motorcycle", "vehicleMake": "Yamaha", "vehicleModel": "MT-07", "vehicleYear": 2021,
     "vehiclePlate": "DEF-5678", "licenseNumber": "O7654321", "licenseExpiry": "2028-03-20",
     "status": "pending", "submittedAt": ts(3), "notes": "En attente vérification antécédents",
     "documents": {"license": True, "insurance": True, "criminal_check": False}},
    {"id": "app-004", "firstName": "Marie-Claude", "lastName": "Beaulieu", "email": "mc.beaulieu@gmail.com",
     "phone": "450-555-0404", "city": "Longueuil", "province": "QC", "postalCode": "J4H 1R5",
     "vehicleType": "car", "vehicleMake": "Toyota", "vehicleModel": "Corolla", "vehicleYear": 2019,
     "vehiclePlate": "GHI-9012", "licenseNumber": "B2345678", "licenseExpiry": "2026-06-30",
     "status": "rejected", "submittedAt": ts(21), "rejectedAt": ts(18), "rejectionReason": "Permis expiré dans moins de 6 mois",
     "documents": {"license": True, "insurance": False, "criminal_check": True}},
]

batch = db.batch()
for app in applications:
    app_id = app.pop("id")
    ref = db.collection('driver_applications').document(app_id)
    batch.set(ref, app)
batch.commit()
print(f"  ✓ {len(applications)} candidatures créées")

# 3. REPORTS
print("\n3. Reports...")
reports = [
    {"id": "report-001", "type": "daily_summary", "title": "Rapport quotidien - 1 mars 2026",
     "period": "2026-03-01", "status": "completed",
     "data": {"totalOrders": 47, "completedOrders": 41, "cancelledOrders": 6,
               "totalRevenue": 1247.85, "platformFees": 249.57, "driverPayouts": 623.92,
               "avgDeliveryTime": 28, "activeDrivers": 5, "newClients": 3},
     "generatedAt": ts(1), "generatedBy": "system"},
    {"id": "report-002", "type": "weekly_summary", "title": "Rapport hebdomadaire - Semaine 8, 2026",
     "period": "2026-02-23/2026-03-01", "status": "completed",
     "data": {"totalOrders": 312, "completedOrders": 287, "cancelledOrders": 25,
               "totalRevenue": 8934.20, "platformFees": 1786.84, "driverPayouts": 4467.10,
               "avgDeliveryTime": 31, "activeDrivers": 7, "newClients": 18, "newStores": 1},
     "generatedAt": ts(1), "generatedBy": "system"},
    {"id": "report-003", "type": "monthly_summary", "title": "Rapport mensuel - Février 2026",
     "period": "2026-02", "status": "completed",
     "data": {"totalOrders": 1247, "completedOrders": 1156, "cancelledOrders": 91,
               "totalRevenue": 35678.90, "platformFees": 7135.78, "driverPayouts": 17839.45,
               "avgDeliveryTime": 29, "activeDrivers": 7, "newClients": 67, "newStores": 3},
     "generatedAt": ts(1), "generatedBy": "system"},
    {"id": "report-004", "type": "driver_performance", "title": "Performance chauffeurs - Semaine 8",
     "period": "2026-02-23/2026-03-01", "status": "completed",
     "data": {"topDriver": "Marc-André Tremblay", "avgRating": 4.7, "totalDeliveries": 287,
               "avgDeliveriesPerDriver": 41, "onTimeRate": 0.94},
     "generatedAt": ts(2), "generatedBy": "admin"},
    {"id": "report-005", "type": "store_performance", "title": "Performance dépanneurs - Février 2026",
     "period": "2026-02", "status": "completed",
     "data": {"topStore": "Dépanneur Centre-Ville 24h", "avgRating": 4.5, "totalOrders": 1247,
               "avgOrderValue": 28.60, "outOfStockIncidents": 23},
     "generatedAt": ts(2), "generatedBy": "admin"},
]

batch = db.batch()
for report in reports:
    report_id = report.pop("id")
    ref = db.collection('reports').document(report_id)
    batch.set(ref, report)
batch.commit()
print(f"  ✓ {len(reports)} rapports créés")

# 4. SYSTEM SETTINGS
print("\n4. System settings...")
settings = [
    {"id": "general", "siteName": "DepXpreS", "siteNameFr": "DepXpreS", "siteNameEn": "DepXpreS",
     "supportEmail": "support@depxpres.ca", "supportPhone": "1-800-DEP-XPRES",
     "defaultLanguage": "fr", "timezone": "America/Toronto",
     "maintenanceMode": False, "allowNewRegistrations": True,
     "updatedAt": ts(7), "updatedBy": "admin"},
    {"id": "delivery", "defaultDeliveryFee": 5.99, "freeDeliveryThreshold": 50.00,
     "maxDeliveryRadius": 10, "estimatedDeliveryMinutes": 30,
     "maxOrdersPerDriver": 3, "dispatchMode": "auto",
     "autoDispatchTimeoutMinutes": 5, "maxDispatchAttempts": 3,
     "updatedAt": ts(7), "updatedBy": "admin"},
    {"id": "payments", "platformFeePercent": 20, "driverFeePercent": 80,
     "minOrderAmount": 10.00, "maxOrderAmount": 500.00,
     "acceptedMethods": ["card_visa", "card_mastercard", "interac", "cash"],
     "stripeEnabled": True, "cashEnabled": True,
     "refundWindowHours": 24, "updatedAt": ts(7), "updatedBy": "admin"},
    {"id": "notifications", "emailEnabled": True, "smsEnabled": True, "pushEnabled": True,
     "orderConfirmationEmail": True, "orderConfirmationSms": True,
     "driverAssignedNotif": True, "deliveryConfirmationNotif": True,
     "promotionNotif": True, "updatedAt": ts(7), "updatedBy": "admin"},
    {"id": "age_verification", "enabled": True, "minimumAge": 18,
     "restrictedCategories": ["alcohol", "tobacco", "vaping"],
     "requireIdVerification": True, "updatedAt": ts(7), "updatedBy": "admin"},
]

batch = db.batch()
for setting in settings:
    setting_id = setting.pop("id")
    ref = db.collection('system_settings').document(setting_id)
    batch.set(ref, setting)
batch.commit()
print(f"  ✓ {len(settings)} paramètres système créés")

# 5. AUDIT LOGS
print("\n5. Audit logs...")
audit_logs = [
    {"action": "order.status_changed", "entityType": "order", "entityId": "FDC-12345",
     "adminId": "admin-1", "adminName": "Hedi Bennis", "adminEmail": "hedibennis17@gmail.com",
     "details": {"from": "pending", "to": "preparing"}, "ip": "192.168.1.1", "createdAt": ts(0, 1)},
    {"action": "driver.approved", "entityType": "driver", "entityId": "driver-1",
     "adminId": "admin-1", "adminName": "Hedi Bennis", "adminEmail": "hedibennis17@gmail.com",
     "details": {"driverName": "Marc-André Tremblay"}, "ip": "192.168.1.1", "createdAt": ts(0, 2)},
    {"action": "promotion.created", "entityType": "promotion", "entityId": "promo-depxpres1",
     "adminId": "admin-1", "adminName": "Hedi Bennis", "adminEmail": "hedibennis17@gmail.com",
     "details": {"code": "DEPXPRES1", "value": 10.00}, "ip": "192.168.1.1", "createdAt": ts(1)},
    {"action": "order.refund_issued", "entityType": "order", "entityId": "FDC-12340",
     "adminId": "admin-1", "adminName": "Hedi Bennis", "adminEmail": "hedibennis17@gmail.com",
     "details": {"amount": 42.50, "reason": "Commande annulée"}, "ip": "192.168.1.1", "createdAt": ts(3)},
    {"action": "store.status_changed", "entityType": "store", "entityId": "store-1",
     "adminId": "admin-1", "adminName": "Hedi Bennis", "adminEmail": "hedibennis17@gmail.com",
     "details": {"from": "inactive", "to": "active"}, "ip": "192.168.1.1", "createdAt": ts(5)},
    {"action": "driver.payout_sent", "entityType": "driver", "entityId": "driver-3",
     "adminId": "admin-1", "adminName": "Hedi Bennis", "adminEmail": "hedibennis17@gmail.com",
     "details": {"amount": 597.26, "method": "interac_transfer"}, "ip": "192.168.1.1", "createdAt": ts(7)},
    {"action": "settings.updated", "entityType": "settings", "entityId": "delivery",
     "adminId": "admin-1", "adminName": "Hedi Bennis", "adminEmail": "hedibennis17@gmail.com",
     "details": {"field": "defaultDeliveryFee", "from": 4.99, "to": 5.99}, "ip": "192.168.1.1", "createdAt": ts(7)},
    {"action": "client.suspended", "entityType": "client", "entityId": "client-6",
     "adminId": "admin-1", "adminName": "Hedi Bennis", "adminEmail": "hedibennis17@gmail.com",
     "details": {"reason": "Comportement abusif"}, "ip": "192.168.1.1", "createdAt": ts(10)},
]

batch = db.batch()
for i, log in enumerate(audit_logs):
    ref = db.collection('audit_logs').document(f"log-{i+1:03d}")
    batch.set(ref, log)
batch.commit()
print(f"  ✓ {len(audit_logs)} logs d'audit créés")

print("\n=== Seed terminé avec succès ===")
print("Collections créées:")
print("  - transactions: 12 documents")
print("  - driver_applications: 4 documents")
print("  - reports: 5 documents")
print("  - system_settings: 5 documents")
print("  - audit_logs: 8 documents")
