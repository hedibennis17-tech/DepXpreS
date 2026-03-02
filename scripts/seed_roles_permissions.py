"""
Seed Firestore collections: roles, role_permissions
Équivalent Firebase des tables SQL roles / role_permissions
"""
import os
import sys
import json
from datetime import datetime, timezone

# Charger les variables d'environnement depuis .env.local
env_path = os.path.join(os.path.dirname(__file__), '..', '.env.local')
env_vars = {}
with open(env_path) as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            key, _, value = line.partition('=')
            env_vars[key.strip()] = value.strip().strip('"').strip("'")

# Charger le service account
service_account_raw = env_vars.get('FIREBASE_SERVICE_ACCOUNT_KEY', '')
if not service_account_raw:
    print("ERREUR: FIREBASE_SERVICE_ACCOUNT_KEY manquant dans .env.local")
    sys.exit(1)

import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    sa = json.loads(service_account_raw)
    cred = credentials.Certificate(sa)
    firebase_admin.initialize_app(cred)

db = firestore.client()
now = datetime.now(timezone.utc)

# ============================================================
# 1. ROLES
# ============================================================
roles = [
    {"role_key": "super_admin", "label": "Super Admin", "is_system": True},
    {"role_key": "admin",       "label": "Admin",        "is_system": True},
    {"role_key": "dispatcher",  "label": "Dispatcher",   "is_system": True},
    {"role_key": "agent",       "label": "Agent",        "is_system": True},
    {"role_key": "client",      "label": "Client",       "is_system": True},
    {"role_key": "driver",      "label": "Driver",       "is_system": True},
]

print("=== Seeding roles ===")
for role in roles:
    doc_ref = db.collection('roles').document(role['role_key'])
    doc = doc_ref.get()
    if not doc.exists:
        doc_ref.set({
            **role,
            "created_at": now,
        })
        print(f"  ✓ Créé: {role['role_key']}")
    else:
        print(f"  ⏭ Existe déjà: {role['role_key']}")

# ============================================================
# 2. ROLE_PERMISSIONS
# ============================================================
role_permissions = {
    "super_admin": ["*", "users.read", "users.create", "users.write"],

    "admin": [
        "dashboard.read",
        "orders.read", "orders.write",
        "clients.read", "clients.write",
        "drivers.read", "drivers.write",
        "stores.read", "stores.write",
        "zones.read", "zones.write",
        "dispatch.read", "dispatch.write",
        "transactions.read",
        "refunds.write",
        "promotions.read", "promotions.write",
        "notifications.read", "notifications.write",
        "support.read", "support.write",
        "reports.read",
        "users.read",
    ],

    "dispatcher": [
        "dashboard.read",
        "orders.read", "orders.write",
        "drivers.read",
        "dispatch.read", "dispatch.write",
        "stores.read",
        "zones.read",
        "notifications.read", "notifications.write",
    ],

    "agent": [
        "dashboard.read",
        "orders.read",
        "clients.read",
        "drivers.read",
        "support.read", "support.write",
        "notifications.read", "notifications.write",
    ],

    "client": [
        "orders.read",
        "orders.create",
        "profile.read",
        "profile.write",
    ],

    "driver": [
        "orders.read",
        "orders.accept",
        "profile.read",
        "profile.write",
        "location.write",
    ],
}

print("\n=== Seeding role_permissions ===")
for role_key, permissions in role_permissions.items():
    doc_ref = db.collection('role_permissions').document(role_key)
    doc_ref.set({
        "role_key": role_key,
        "permissions": permissions,
        "updated_at": now,
    })
    print(f"  ✓ {role_key}: {len(permissions)} permissions")

# ============================================================
# 3. Vérification
# ============================================================
print("\n=== Vérification ===")
roles_snap = db.collection('roles').get()
perms_snap = db.collection('role_permissions').get()
print(f"  roles: {len(roles_snap)} documents")
print(f"  role_permissions: {len(perms_snap)} documents")

print("\n✅ Seed terminé avec succès!")
