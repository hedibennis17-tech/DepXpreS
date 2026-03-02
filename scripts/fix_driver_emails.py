#!/usr/bin/env python3
"""
Script pour corriger les emails et données des chauffeurs dans Firestore
"""
import json
import os
import sys

# Charger les variables d'environnement depuis .env.local
env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env.local')
env_vars = {}
with open(env_file, 'r') as f:
    for line in f:
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            key, _, value = line.partition('=')
            env_vars[key.strip()] = value.strip()

# Extraire le service account
service_account_json = env_vars.get('FIREBASE_SERVICE_ACCOUNT_KEY', '')
if not service_account_json:
    print("FIREBASE_SERVICE_ACCOUNT_KEY non trouvé")
    sys.exit(1)

service_account = json.loads(service_account_json)

import firebase_admin
from firebase_admin import credentials, firestore, auth

# Initialiser Firebase Admin
if not firebase_admin._apps:
    cred = credentials.Certificate(service_account)
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Données correctes des chauffeurs
drivers_correct_data = {
    "driver-001": {
        "firstName": "Marc-André",
        "lastName": "Tremblay",
        "email": "marc.tremblay@depxpres.com",
        "phone": "514-555-1001",
    },
    "driver-002": {
        "firstName": "Jean-Philippe",
        "lastName": "Gagnon",
        "email": "jp.gagnon@depxpres.com",
        "phone": "514-555-1002",
    },
    "driver-003": {
        "firstName": "Amina",
        "lastName": "Diallo",
        "email": "amina.diallo@depxpres.com",
        "phone": "514-555-1003",
    },
    "driver-004": {
        "firstName": "Luc",
        "lastName": "Bergeron",
        "email": "luc.bergeron@depxpres.com",
        "phone": "514-555-1004",
    },
    "driver-005": {
        "firstName": "Sofia",
        "lastName": "Martinez",
        "email": "sofia.martinez@depxpres.com",
        "phone": "514-555-1005",
    },
    "driver-006": {
        "firstName": "Kevin",
        "lastName": "Lapointe",
        "email": "kevin.lapointe@depxpres.com",
        "phone": "514-555-1006",
    },
    "driver-007": {
        "firstName": "Yasmine",
        "lastName": "Khelifi",
        "email": "yasmine.khelifi@depxpres.com",
        "phone": "514-555-1007",
    },
}

print("=== Correction des données des chauffeurs ===\n")

for driver_id, correct_data in drivers_correct_data.items():
    doc_ref = db.collection("driver_profiles").document(driver_id)
    doc = doc_ref.get()
    
    if doc.exists:
        current = doc.to_dict()
        current_email = current.get('email', 'N/A')
        current_name = f"{current.get('firstName', '')} {current.get('lastName', '')}"
        
        print(f"Driver {driver_id}:")
        print(f"  Avant: {current_name} | {current_email}")
        
        doc_ref.update(correct_data)
        
        print(f"  Après: {correct_data['firstName']} {correct_data['lastName']} | {correct_data['email']}")
        print()
    else:
        print(f"Driver {driver_id} non trouvé dans Firestore")

print("=== Correction terminée! ===")
