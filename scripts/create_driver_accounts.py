#!/usr/bin/env python3
"""
Crée les comptes Firebase Auth pour tous les chauffeurs DepXpreS
et met à jour leurs documents Firestore avec les UIDs réels.
"""

import firebase_admin
from firebase_admin import credentials, firestore, auth

if not firebase_admin._apps:
    cred = credentials.Certificate('/home/ubuntu/depxpres/service-account.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Définition des 7 chauffeurs avec credentials réels
DRIVERS = [
    {
        "id": "driver-001",
        "firstName": "Marc-André",
        "lastName": "Tremblay",
        "email": "marc.tremblay@depxpres.com",
        "password": "DepXpreS2025!",
        "phone": "514-555-1001",
        "role": "driver",
        "zoneId": "zone-laval",
        "zoneName": "Laval",
        "applicationStatus": "approved",
        "isOnline": True,
        "rating": 4.9,
        "totalDeliveries": 342,
    },
    {
        "id": "driver-002",
        "firstName": "Jean-Philippe",
        "lastName": "Gagnon",
        "email": "jp.gagnon@depxpres.com",
        "password": "DepXpreS2025!",
        "phone": "514-555-1002",
        "role": "driver",
        "zoneId": "zone-mtl-centre",
        "zoneName": "Montréal Centre-Ville",
        "applicationStatus": "approved",
        "isOnline": True,
        "rating": 4.7,
        "totalDeliveries": 218,
    },
    {
        "id": "driver-003",
        "firstName": "Amina",
        "lastName": "Diallo",
        "email": "amina.diallo@depxpres.com",
        "password": "DepXpreS2025!",
        "phone": "438-555-1003",
        "role": "driver",
        "zoneId": "zone-laval",
        "zoneName": "Laval",
        "applicationStatus": "approved",
        "isOnline": True,
        "rating": 4.8,
        "totalDeliveries": 156,
    },
    {
        "id": "driver-004",
        "firstName": "Sofia",
        "lastName": "Martinez",
        "email": "sofia.martinez@depxpres.com",
        "password": "DepXpreS2025!",
        "phone": "514-555-1004",
        "role": "driver",
        "zoneId": "zone-mtl-nord",
        "zoneName": "Montréal Nord",
        "applicationStatus": "approved",
        "isOnline": False,
        "rating": 4.6,
        "totalDeliveries": 89,
    },
    {
        "id": "driver-005",
        "firstName": "Karim",
        "lastName": "Benali",
        "email": "karim.benali@depxpres.com",
        "password": "DepXpreS2025!",
        "phone": "514-555-1005",
        "role": "driver",
        "zoneId": "zone-longueuil",
        "zoneName": "Longueuil",
        "applicationStatus": "approved",
        "isOnline": True,
        "rating": 4.5,
        "totalDeliveries": 201,
    },
    {
        "id": "driver-006",
        "firstName": "Marie",
        "lastName": "Lapointe",
        "email": "marie.lapointe@depxpres.com",
        "password": "DepXpreS2025!",
        "phone": "514-555-1006",
        "role": "driver",
        "zoneId": "zone-mtl-centre",
        "zoneName": "Montréal Centre-Ville",
        "applicationStatus": "approved",
        "isOnline": False,
        "rating": 3.8,
        "totalDeliveries": 45,
    },
    {
        "id": "driver-007",
        "firstName": "Nadia",
        "lastName": "Khelifi",
        "email": "nadia.khelifi@depxpres.com",
        "password": "DepXpreS2025!",
        "phone": "514-555-1007",
        "role": "driver",
        "zoneId": "zone-laval-ouest",
        "zoneName": "Laval Ouest",
        "applicationStatus": "approved",
        "isOnline": True,
        "rating": 4.5,
        "totalDeliveries": 67,
    },
]

print("=== Création des comptes Firebase Auth pour les chauffeurs DepXpreS ===\n")

created = []
updated = []
errors = []

for driver in DRIVERS:
    driver_id = driver["id"]
    email = driver["email"]
    
    # Essayer de récupérer l'utilisateur existant
    existing_uid = None
    try:
        existing_user = auth.get_user_by_email(email)
        existing_uid = existing_user.uid
        print(f"✓ Compte existant: {email} (UID: {existing_uid})")
        updated.append(driver_id)
    except auth.UserNotFoundError:
        # Créer le compte Firebase Auth
        try:
            new_user = auth.create_user(
                email=email,
                password=driver["password"],
                display_name=f"{driver['firstName']} {driver['lastName']}",
                phone_number=None,  # Éviter les conflits de format
                email_verified=True,
                disabled=False,
            )
            existing_uid = new_user.uid
            print(f"✅ Compte créé: {email} (UID: {existing_uid})")
            created.append(driver_id)
        except Exception as e:
            print(f"❌ Erreur création {email}: {e}")
            errors.append({"id": driver_id, "error": str(e)})
            continue
    
    # Mettre à jour le document Firestore avec l'UID Firebase Auth
    try:
        db.collection("driver_profiles").document(driver_id).update({
            "userId": existing_uid,
            "authUid": existing_uid,
            "email": email,
            "phone": driver["phone"],
            "role": "driver",
            "passwordHint": "DepXpreS2025!",  # Hint pour les tests admin
            "accountCreated": True,
        })
        print(f"   → Firestore mis à jour: {driver_id} → UID: {existing_uid}")
    except Exception as e:
        print(f"   ❌ Erreur Firestore {driver_id}: {e}")

    # Créer aussi un document dans la collection 'users' pour les règles Firestore
    try:
        db.collection("users").document(existing_uid).set({
            "uid": existing_uid,
            "email": email,
            "role": "driver",
            "driverId": driver_id,
            "firstName": driver["firstName"],
            "lastName": driver["lastName"],
            "phone": driver["phone"],
            "isActive": True,
            "createdAt": firestore.SERVER_TIMESTAMP,
        }, merge=True)
        print(f"   → Collection users mise à jour pour {email}")
    except Exception as e:
        print(f"   ❌ Erreur users {driver_id}: {e}")

print(f"\n=== Résumé ===")
print(f"✅ Créés: {len(created)} comptes")
print(f"✓ Existants mis à jour: {len(updated)} comptes")
print(f"❌ Erreurs: {len(errors)}")

print(f"\n=== Credentials des chauffeurs ===")
print(f"{'Email':<40} {'Mot de passe':<20} {'ID Firestore'}")
print("-" * 80)
for driver in DRIVERS:
    print(f"{driver['email']:<40} {driver['password']:<20} {driver['id']}")

print("\n✅ Terminé!")
