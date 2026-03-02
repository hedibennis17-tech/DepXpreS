#!/usr/bin/env python3
"""
Script d'importation BDOA v3 - Avec rate limiting respectueux de Firestore
Firestore Free tier: 20,000 writes/day, 1 write/second burst limit
"""
import csv
import json
import os
import sys
import unicodedata
import re
import time

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

# Villes du Grand Montréal (priorité)
GRAND_MONTREAL = {
    'MONTREAL', 'LAVAL', 'LONGUEUIL', 'BROSSARD', 'SAINT-LAMBERT',
    'BOUCHERVILLE', 'SAINT-BRUNO-DE-MONTARVILLE', 'SAINT-HUBERT',
    'VERDUN', 'LASALLE', 'LACHINE', 'SAINT-LEONARD', 'ANJOU',
    'RIVIERE-DES-PRAIRIES', 'POINTE-AUX-TREMBLES', 'MONTREAL-NORD',
    'OUTREMONT', 'WESTMOUNT', 'COTE-SAINT-LUC', 'DOLLARD-DES-ORMEAUX',
    'KIRKLAND', 'BEACONSFIELD', 'POINTE-CLAIRE', 'DORVAL', 'SAINT-LAURENT',
    'MONT-ROYAL', 'SAINTE-ANNE-DE-BELLEVUE', 'BAIE-DURFE', 'SENNEVILLE',
    'PIERREFONDS', 'ROXBORO', 'MONTREAL-OUEST', 'HAMPSTEAD',
    'REPENTIGNY', 'TERREBONNE', 'MASCOUCHE', 'BLAINVILLE', 'BOISBRIAND',
    'SAINT-EUSTACHE', 'DEUX-MONTAGNES', 'SAINTE-THERESE', 'MIRABEL',
    'ROSEMERE', 'SAINTE-MARTHE-SUR-LE-LAC', 'SAINT-JEROME', 'VARENNES',
    'SAINT-AMABLE', 'SAINTE-JULIE', 'MCMASTERVILLE', 'BELOEIL',
    'MONT-SAINT-HILAIRE', 'SAINT-BASILE-LE-GRAND', 'CHAMBLY',
    'CARIGNAN', 'SAINT-JEAN-SUR-RICHELIEU', 'CANDIAC', 'DELSON',
    'SAINT-CONSTANT', 'SAINTE-CATHERINE', 'LA PRAIRIE', 'LAPRAIRIE',
    'CHATEAUGUAY', 'MERCIER', 'VAUDREUIL-DORION', 'VAUDREUIL', 'PINCOURT',
    'HUDSON', 'SAINT-LAZARE', 'PIERREFONDS-ROXBORO',
}

QC_MAJOR = {
    'QUEBEC', 'SHERBROOKE', 'SAGUENAY', 'LEVIS', 'TROIS-RIVIERES',
    'GATINEAU', 'DRUMMONDVILLE', 'GRANBY', 'SHAWINIGAN', 'VICTORIAVILLE',
    'RIMOUSKI', 'SAINT-HYACINTHE', 'SOREL-TRACY', 'JOLIETTE',
    'SAINT-GEORGES', 'ALMA', 'BAIE-COMEAU', 'VAL-D-OR',
}

ALL_TARGET_CITIES = GRAND_MONTREAL | QC_MAJOR

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
            'unite': row.get('unit', '').strip(),
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
            'is_grand_montreal': ville_pcs in GRAND_MONTREAL,
        }
        return (bdoa_id, doc)
    except Exception:
        return None

def commit_batch_with_retry(batch_docs: list, max_retries: int = 5) -> int:
    """Commit avec retry exponentiel en cas de 429"""
    if not batch_docs:
        return 0
    
    for attempt in range(max_retries):
        try:
            batch = db.batch()
            for doc_id, doc_data in batch_docs:
                ref = db.collection('bdoa_addresses').document(doc_id)
                batch.set(ref, doc_data)
            batch.commit()
            return len(batch_docs)
        except Exception as e:
            if '429' in str(e) or 'Quota' in str(e) or 'quota' in str(e):
                wait_time = (2 ** attempt) * 5  # 5s, 10s, 20s, 40s, 80s
                print(f"  Rate limit (429), attente {wait_time}s... (tentative {attempt+1}/{max_retries})", flush=True)
                time.sleep(wait_time)
            else:
                print(f"  Erreur: {e}", flush=True)
                if attempt == max_retries - 1:
                    raise
                time.sleep(2)
    return 0

def main():
    csv_path = '/home/ubuntu/bdoa_data/ODA_QC_v1.csv'
    print("=== Importation BDOA v3 dans Firestore ===")
    print(f"Projet: {db.project}")
    print("Mode: Rate-limited (pauses entre batches)")
    print()

    # Paramètres conservateurs pour éviter les rate limits
    BATCH_SIZE = 200        # Réduit de 400 à 200
    PAUSE_BETWEEN_BATCHES = 2.0  # 2 secondes entre chaque batch
    MAX_DOCS = 50000        # Limite pour cette session (quota daily)

    batch_docs = []
    total_imported = 0
    total_processed = 0
    start_time = time.time()

    print(f"Objectif: {MAX_DOCS:,} adresses (Grand Montréal + QC)")
    print()

    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)

        for row in reader:
            total_processed += 1
            city_pcs = row.get('city_pcs', '').strip().upper()

            if city_pcs not in ALL_TARGET_CITIES:
                continue

            result = process_row(row)
            if not result:
                continue

            batch_docs.append(result)

            if len(batch_docs) >= BATCH_SIZE:
                imported = commit_batch_with_retry(batch_docs)
                total_imported += imported
                batch_docs = []

                elapsed = time.time() - start_time
                rate = total_imported / elapsed if elapsed > 0 else 0
                print(f"  ✓ Importé: {total_imported:,} | Traité: {total_processed:,} | {rate:.0f} docs/s", flush=True)

                # Pause pour respecter les rate limits
                time.sleep(PAUSE_BETWEEN_BATCHES)

            if total_imported >= MAX_DOCS:
                print(f"  Limite de {MAX_DOCS:,} atteinte pour cette session")
                break

    # Dernier batch
    if batch_docs:
        imported = commit_batch_with_retry(batch_docs)
        total_imported += imported

    elapsed = time.time() - start_time
    print(f"\n=== Importation terminée! ===")
    print(f"  Total importé: {total_imported:,}")
    print(f"  Lignes traitées: {total_processed:,}")
    print(f"  Temps: {elapsed:.1f}s")
    if elapsed > 0:
        print(f"  Vitesse: {total_imported/elapsed:.0f} docs/s")
    print(f"\nCollection Firestore: bdoa_addresses")
    print(f"Projet: {db.project}")
    print()
    print("Note: Pour importer plus d'adresses, relancez le script.")
    print("Firestore Free tier: 20,000 writes/jour")

if __name__ == '__main__':
    main()
