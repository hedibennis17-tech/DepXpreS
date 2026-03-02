#!/usr/bin/env python3
"""
Script d'importation des données BDOA dans Firebase Firestore
Importe les adresses du Grand Montréal et du Québec
"""
import csv
import json
import os
import sys
import unicodedata
import re
import time

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
from firebase_admin import credentials, firestore

# Initialiser Firebase Admin
if not firebase_admin._apps:
    cred = credentials.Certificate(service_account)
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Villes du Grand Montréal à importer en priorité
GRAND_MONTREAL = {
    'MONTREAL', 'LAVAL', 'LONGUEUIL', 'BROSSARD', 'SAINT-LAMBERT',
    'BOUCHERVILLE', 'SAINT-BRUNO-DE-MONTARVILLE', 'SAINT-HUBERT',
    'VERDUN', 'LASALLE', 'LACHINE', 'SAINT-LEONARD', 'ANJOU',
    'RIVIERE-DES-PRAIRIES', 'POINTE-AUX-TREMBLES', 'MONTREAL-NORD',
    'OUTREMONT', 'WESTMOUNT', 'COTE-SAINT-LUC', 'DOLLARD-DES-ORMEAUX',
    'KIRKLAND', 'BEACONSFIELD', 'POINTE-CLAIRE', 'DORVAL', 'SAINT-LAURENT',
    'MONT-ROYAL', 'SAINTE-ANNE-DE-BELLEVUE', 'BAIE-DURFE', 'SENNEVILLE',
    'SAINTE-GENEVIEVE', 'PIERREFONDS', 'ROXBORO', 'MONTREAL-OUEST',
    'HAMPSTEAD', 'COTE-SAINT-LUC', 'REPENTIGNY', 'TERREBONNE',
    'MASCOUCHE', 'BLAINVILLE', 'BOISBRIAND', 'SAINT-EUSTACHE',
    'DEUX-MONTAGNES', 'SAINTE-THERESE', 'MIRABEL', 'ROSEMERE',
    'SAINTE-MARTHE-SUR-LE-LAC', 'SAINT-JEROME', 'VARENNES', 'BOUCHERVILLE',
    'SAINT-AMABLE', 'SAINTE-JULIE', 'MCMASTERVILLE', 'BELOEIL',
    'MONT-SAINT-HILAIRE', 'SAINT-BASILE-LE-GRAND', 'CHAMBLY',
    'CARIGNAN', 'SAINT-JEAN-SUR-RICHELIEU', 'CANDIAC', 'DELSON',
    'SAINT-CONSTANT', 'SAINTE-CATHERINE', 'LA PRAIRIE', 'LAPRAIRIE',
    'CHATEAUGUAY', 'MERCIER', 'SAINT-ISIDORE', 'SAINT-MATHIEU',
    'SAINT-PHILIPPE', 'BEAUHARNOIS', 'SALABERRY-DE-VALLEYFIELD',
    'VAUDREUIL-DORION', 'VAUDREUIL', 'PINCOURT', 'HUDSON',
    'SAINT-LAZARE', 'LES CEDRES', 'COTEAU-DU-LAC', 'RIGAUD',
    'ILES-BIZARD', 'SAINTE-GENEVIEVE', 'PIERREFONDS-ROXBORO',
}

def normalize_text(text: str) -> str:
    """Normalise le texte pour la recherche (minuscules, sans accents)"""
    if not text:
        return ''
    # Convertir en minuscules
    text = text.lower()
    # Supprimer les accents
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    # Garder seulement les caractères alphanumériques et espaces
    text = re.sub(r'[^a-z0-9]+', ' ', text)
    return text.strip()

def process_row(row: dict) -> dict | None:
    """Traite une ligne CSV et retourne un document Firestore"""
    try:
        lat = float(row.get('latitude', 0) or 0)
        lng = float(row.get('longitude', 0) or 0)
        
        if lat == 0 or lng == 0:
            return None
        
        # Vérifier que c'est bien au Québec (pruid = 24)
        if row.get('pruid', '') != '24':
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
        bdoa_id = row.get('id', '').strip()
        
        if not bdoa_id:
            return None
        
        # Construire line1
        line1_parts = [p for p in [numero_rue, nom_rue, type_rue, dir_rue] if p]
        line1 = ' '.join(line1_parts)
        
        if not line1 and not adr_complete:
            return None
        
        # Construire search_text normalisé
        search_parts = [
            numero_rue, nom_rue, type_rue, dir_rue,
            adr_complete, ville_pcs, ville, sdrnom,
            code_postal, 'QC', 'QUEBEC'
        ]
        search_text = normalize_text(' '.join(p for p in search_parts if p))
        
        # Label complet
        city_display = ville_pcs or ville or sdrnom
        label = adr_complete or f"{line1}, {city_display}, QC {code_postal}".strip(', ')
        
        return {
            'bdoa_id': bdoa_id,
            'id_source': row.get('source_id', '').strip(),
            'id_group': row.get('group_id', '').strip(),
            'numero_rue': numero_rue,
            'nom_rue': nom_rue,
            'type_rue': type_rue,
            'dir_rue': dir_rue,
            'unite': row.get('unit', '').strip(),
            'ville': ville,
            'ville_pcs': ville_pcs,
            'code_postal': code_postal,
            'adr_complete': adr_complete or label,
            'adr_complete_lower': normalize_text(adr_complete or label),
            'sdrnom': sdrnom,
            'province_code': 'QC',
            'province_numeric': 24,
            'fournisseur': fournisseur,
            'latitude': lat,
            'longitude': lng,
            'search_text': search_text,
            'line1': line1,
            'label': label,
            'is_grand_montreal': ville_pcs in GRAND_MONTREAL,
            'created_at': firestore.SERVER_TIMESTAMP,
        }
    except Exception as e:
        return None

def import_batch(batch_docs: list, collection_name: str = 'bdoa_addresses') -> int:
    """Importe un batch de documents dans Firestore"""
    if not batch_docs:
        return 0
    
    batch = db.batch()
    for doc_id, doc_data in batch_docs:
        ref = db.collection(collection_name).document(doc_id)
        batch.set(ref, doc_data, merge=True)
    
    batch.commit()
    return len(batch_docs)

def main():
    csv_path = '/home/ubuntu/bdoa_data/ODA_QC_v1.csv'
    
    if not os.path.exists(csv_path):
        print(f"Fichier non trouvé: {csv_path}")
        sys.exit(1)
    
    print("=== Importation BDOA Québec dans Firestore ===")
    print(f"Fichier: {csv_path}")
    print()
    
    # Phase 1: Importer le Grand Montréal en priorité
    print("Phase 1: Grand Montréal (priorité)")
    
    batch_docs = []
    total_imported = 0
    total_skipped = 0
    batch_size = 400  # Firestore limite à 500 par batch
    
    start_time = time.time()
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for i, row in enumerate(reader):
            city_pcs = row.get('city_pcs', '').strip().upper()
            
            # Phase 1: seulement Grand Montréal
            if city_pcs not in GRAND_MONTREAL:
                total_skipped += 1
                continue
            
            doc = process_row(row)
            if not doc:
                total_skipped += 1
                continue
            
            # Utiliser bdoa_id comme ID du document
            doc_id = doc['bdoa_id']
            batch_docs.append((doc_id, doc))
            
            if len(batch_docs) >= batch_size:
                imported = import_batch(batch_docs)
                total_imported += imported
                batch_docs = []
                
                elapsed = time.time() - start_time
                rate = total_imported / elapsed if elapsed > 0 else 0
                print(f"  Importé: {total_imported:,} | Ignoré: {total_skipped:,} | Vitesse: {rate:.0f}/s")
                
                # Pause pour éviter les rate limits Firestore
                time.sleep(0.1)
            
            if total_imported >= 200000:
                print("  Limite de 200,000 atteinte pour le Grand Montréal")
                break
    
    # Importer le dernier batch
    if batch_docs:
        imported = import_batch(batch_docs)
        total_imported += imported
    
    elapsed = time.time() - start_time
    print(f"\nPhase 1 terminée!")
    print(f"  Total importé: {total_imported:,}")
    print(f"  Temps: {elapsed:.1f}s")
    print(f"  Vitesse moyenne: {total_imported/elapsed:.0f} docs/s")
    
    # Phase 2: Importer le reste du Québec (villes principales)
    print("\nPhase 2: Autres villes du Québec")
    
    QC_MAJOR_CITIES = {
        'QUEBEC', 'SHERBROOKE', 'SAGUENAY', 'LEVIS', 'TROIS-RIVIERES',
        'CHICOUTIMI', 'JONQUIERE', 'SAINT-JEAN-SUR-RICHELIEU', 'DRUMMONDVILLE',
        'SAINT-JEROME', 'GRANBY', 'SHAWINIGAN', 'VICTORIAVILLE', 'RIMOUSKI',
        'SAINT-HYACINTHE', 'SOREL-TRACY', 'SEPT-ILES', 'ROUYN-NORANDA',
        'JOLIETTE', 'SAINT-GEORGES', 'ALMA', 'BAIE-COMEAU', 'VAL-D-OR',
        'THETFORD MINES', 'SAINT-EUSTACHE', 'BLAINVILLE', 'TERREBONNE',
        'REPENTIGNY', 'MIRABEL', 'MASCOUCHE', 'BOISBRIAND', 'SAINTE-THERESE',
        'DEUX-MONTAGNES', 'ROSEMERE', 'SAINTE-MARTHE-SUR-LE-LAC',
        'VAUDREUIL-DORION', 'CHATEAUGUAY', 'SAINT-CONSTANT', 'CANDIAC',
        'DELSON', 'SAINTE-CATHERINE', 'LA PRAIRIE', 'BOUCHERVILLE',
        'VARENNES', 'SAINTE-JULIE', 'BELOEIL', 'MONT-SAINT-HILAIRE',
        'CHAMBLY', 'SAINT-BASILE-LE-GRAND', 'CARIGNAN',
    }
    
    batch_docs = []
    phase2_imported = 0
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for i, row in enumerate(reader):
            city_pcs = row.get('city_pcs', '').strip().upper()
            
            # Phase 2: villes QC principales pas encore importées
            if city_pcs in GRAND_MONTREAL:
                continue  # Déjà importé en phase 1
            if city_pcs not in QC_MAJOR_CITIES:
                continue
            
            doc = process_row(row)
            if not doc:
                continue
            
            doc_id = doc['bdoa_id']
            batch_docs.append((doc_id, doc))
            
            if len(batch_docs) >= batch_size:
                imported = import_batch(batch_docs)
                phase2_imported += imported
                batch_docs = []
                
                elapsed2 = time.time() - start_time
                print(f"  Phase 2 importé: {phase2_imported:,} | Total: {total_imported + phase2_imported:,}")
                time.sleep(0.1)
            
            if phase2_imported >= 100000:
                print("  Limite de 100,000 atteinte pour les villes QC")
                break
    
    if batch_docs:
        imported = import_batch(batch_docs)
        phase2_imported += imported
    
    total_final = total_imported + phase2_imported
    elapsed_total = time.time() - start_time
    
    print(f"\n=== Importation terminée! ===")
    print(f"  Grand Montréal: {total_imported:,} adresses")
    print(f"  Autres villes QC: {phase2_imported:,} adresses")
    print(f"  TOTAL: {total_final:,} adresses")
    print(f"  Temps total: {elapsed_total:.1f}s")
    print()
    print("Les données sont maintenant disponibles dans Firestore collection 'bdoa_addresses'")

if __name__ == '__main__':
    main()
