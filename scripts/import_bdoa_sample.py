#!/usr/bin/env python3
"""
Script d'importation BDOA - Échantillon représentatif
Importe ~5000 adresses du Grand Montréal avec des pauses longues
"""
import csv
import json
import os
import sys
import unicodedata
import re
import time
import random

# Charger les variables d'environnement depuis .env.local
env_file = '/home/ubuntu/depxpres/.env.local'
env_vars = {}
with open(env_file, 'r') as f:
    for line in f:
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            key, _, value = line.partition('=')
            env_vars[key.strip()] = value.strip()

service_account = json.loads(env_vars.get('FIREBASE_SERVICE_ACCOUNT_KEY', '{}'))

import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    cred = credentials.Certificate(service_account)
    firebase_admin.initialize_app(cred)

db = firestore.client()

PRIORITY_CITIES = {
    'MONTREAL': 2000,
    'LAVAL': 1000,
    'LONGUEUIL': 500,
    'BROSSARD': 200,
    'SAINT-LAURENT': 200,
    'DOLLARD-DES-ORMEAUX': 150,
    'REPENTIGNY': 150,
    'TERREBONNE': 150,
    'BLAINVILLE': 100,
    'BOISBRIAND': 100,
    'SAINT-EUSTACHE': 100,
    'CHATEAUGUAY': 100,
    'VAUDREUIL-DORION': 100,
    'SAINT-JEROME': 100,
    'GATINEAU': 100,
    'QUEBEC': 200,
    'SHERBROOKE': 100,
    'LEVIS': 100,
    'TROIS-RIVIERES': 100,
}

def normalize_text(text: str) -> str:
    if not text:
        return ''
    text = text.lower()
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = re.sub(r'[^a-z0-9]+', ' ', text)
    return text.strip()

def process_row(row: dict):
    try:
        lat = float(row.get('latitude', 0) or 0)
        lng = float(row.get('longitude', 0) or 0)
        if lat == 0 or lng == 0:
            return None
        if row.get('pruid', '') != '24':
            return None

        bdoa_id = row.get('id', '').strip()
        if not bdoa_id:
            return None

        numero_rue = row.get('street_no', '').strip()
        nom_rue = row.get('str_name', '').strip()
        type_rue = row.get('str_type', '').strip()
        dir_rue = row.get('str_dir', '').strip()
        ville = row.get('city', '').strip()
        ville_pcs = row.get('city_pcs', '').strip().upper()
        code_postal = row.get('postal_code', '').strip().upper().replace(' ', '')
        adr_complete = row.get('full_addr', '').strip()
        fournisseur = row.get('provider', '').strip()
        sdrnom = row.get('csdname', '').strip()

        line1_parts = [p for p in [numero_rue, nom_rue, type_rue, dir_rue] if p]
        line1 = ' '.join(line1_parts)

        if not line1 and not adr_complete:
            return None

        city_display = ville_pcs or ville or sdrnom
        label = adr_complete or f"{line1}, {city_display}, QC {code_postal}".strip(', ')

        search_parts = [numero_rue, nom_rue, type_rue, dir_rue, adr_complete,
                       ville_pcs, ville, sdrnom, code_postal, 'QC', 'QUEBEC']
        search_text = normalize_text(' '.join(p for p in search_parts if p))

        doc = {
            'bdoa_id': bdoa_id,
            'id_source': row.get('source_id', '').strip(),
            'numero_rue': numero_rue,
            'nom_rue': nom_rue,
            'type_rue': type_rue,
            'dir_rue': dir_rue,
            'ville': ville,
            'ville_pcs': ville_pcs,
            'code_postal': code_postal,
            'adr_complete': label,
            'adr_complete_lower': normalize_text(label),
            'sdrnom': sdrnom,
            'province_code': 'QC',
            'fournisseur': fournisseur,
            'latitude': lat,
            'longitude': lng,
            'search_text': search_text,
            'line1': line1,
            'label': label,
            'is_grand_montreal': ville_pcs in set(PRIORITY_CITIES.keys()),
        }
        return (bdoa_id, doc)
    except Exception:
        return None

def commit_single_doc(doc_id: str, doc_data: dict, max_retries: int = 3) -> bool:
    """Commit un seul document avec retry"""
    for attempt in range(max_retries):
        try:
            ref = db.collection('bdoa_addresses').document(doc_id)
            ref.set(doc_data)
            return True
        except Exception as e:
            if '429' in str(e) or 'Quota' in str(e) or 'quota' in str(e):
                wait_time = (2 ** attempt) * 10
                print(f"  Rate limit, attente {wait_time}s...", flush=True)
                time.sleep(wait_time)
            else:
                time.sleep(2)
    return False

def commit_batch_safe(batch_docs: list) -> int:
    """Commit avec retry et fallback sur documents individuels"""
    if not batch_docs:
        return 0
    
    for attempt in range(3):
        try:
            batch = db.batch()
            for doc_id, doc_data in batch_docs:
                ref = db.collection('bdoa_addresses').document(doc_id)
                batch.set(ref, doc_data)
            batch.commit()
            return len(batch_docs)
        except Exception as e:
            if '429' in str(e) or 'Quota' in str(e) or 'quota' in str(e):
                wait_time = (2 ** attempt) * 15  # 15s, 30s, 60s
                print(f"  Rate limit (429), attente {wait_time}s... (tentative {attempt+1}/3)", flush=True)
                time.sleep(wait_time)
            else:
                print(f"  Erreur batch: {e}", flush=True)
                time.sleep(5)
    
    # Fallback: essayer les documents un par un
    print("  Fallback: import individuel...", flush=True)
    count = 0
    for doc_id, doc_data in batch_docs:
        if commit_single_doc(doc_id, doc_data):
            count += 1
            time.sleep(0.1)
    return count

def main():
    csv_path = '/home/ubuntu/bdoa_data/ODA_QC_v1.csv'
    print("=== Importation BDOA - Échantillon représentatif ===")
    print(f"Projet: {db.project}")
    print()

    # Collecter les adresses par ville
    city_buckets = {city: [] for city in PRIORITY_CITIES}
    
    print("Lecture du CSV et sélection des adresses...")
    total_read = 0
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            total_read += 1
            city_pcs = row.get('city_pcs', '').strip().upper()
            
            if city_pcs not in PRIORITY_CITIES:
                continue
            
            # Limiter par ville
            max_for_city = PRIORITY_CITIES[city_pcs]
            if len(city_buckets[city_pcs]) >= max_for_city:
                continue
            
            # Prendre seulement les adresses avec numéro de rue et code postal
            if not row.get('street_no', '').strip():
                continue
            if not row.get('postal_code', '').strip():
                continue
            
            result = process_row(row)
            if result:
                city_buckets[city_pcs].append(result)
            
            if total_read % 100000 == 0:
                total_collected = sum(len(v) for v in city_buckets.values())
                print(f"  Lu: {total_read:,} | Collecté: {total_collected:,}", flush=True)
            
            # Vérifier si on a assez
            total_collected = sum(len(v) for v in city_buckets.values())
            if total_collected >= sum(PRIORITY_CITIES.values()):
                print(f"  Quota atteint: {total_collected:,} adresses collectées")
                break
    
    # Préparer tous les documents
    all_docs = []
    for city, docs in city_buckets.items():
        all_docs.extend(docs)
        if docs:
            print(f"  {city}: {len(docs):,} adresses")
    
    print(f"\nTotal à importer: {len(all_docs):,} adresses")
    print("Début de l'import dans Firestore...")
    print()
    
    # Import par petits batches avec pauses
    BATCH_SIZE = 100
    PAUSE = 5.0  # 5 secondes entre chaque batch
    
    total_imported = 0
    start_time = time.time()
    
    for i in range(0, len(all_docs), BATCH_SIZE):
        batch = all_docs[i:i + BATCH_SIZE]
        imported = commit_batch_safe(batch)
        total_imported += imported
        
        elapsed = time.time() - start_time
        print(f"  ✓ {total_imported:,}/{len(all_docs):,} importés ({elapsed:.0f}s)", flush=True)
        
        if i + BATCH_SIZE < len(all_docs):
            time.sleep(PAUSE)
    
    elapsed = time.time() - start_time
    print(f"\n=== Importation terminée! ===")
    print(f"  Total importé: {total_imported:,}")
    print(f"  Temps: {elapsed:.1f}s")
    print(f"\nCollection Firestore: bdoa_addresses")
    print(f"Projet: {db.project}")

if __name__ == '__main__':
    main()
