"""
Import BDOA v4 - Optimisé pour la recherche par nom de rue
search_text commence par le nom de rue normalisé pour permettre la recherche par préfixe
"""
import csv
import json
import unicodedata
import time
import sys
import firebase_admin
from firebase_admin import credentials, firestore

# === Config ===
LOG_FILE = "/home/ubuntu/bdoa_import_v4.log"
CSV_FILE = "/home/ubuntu/bdoa_data/ODA_QC_v1.csv"
BATCH_SIZE = 20
PAUSE_BETWEEN_BATCHES = 3.0  # secondes
MAX_ADDRESSES = 2000  # Limiter à 2000 pour éviter les quotas

GRAND_MONTREAL_CITIES = {
    "MONTREAL", "LAVAL", "LONGUEUIL", "BROSSARD", "SAINT-LAMBERT",
    "BOUCHERVILLE", "SAINT-BRUNO-DE-MONTARVILLE", "SAINT-HUBERT",
    "VERDUN", "LASALLE", "LACHINE", "SAINT-LEONARD", "ANJOU",
    "RIVIERE-DES-PRAIRIES", "POINTE-AUX-TREMBLES", "MONTREAL-NORD",
    "OUTREMONT", "WESTMOUNT", "COTE-SAINT-LUC", "DOLLARD-DES-ORMEAUX",
    "KIRKLAND", "BEACONSFIELD", "POINTE-CLAIRE", "DORVAL",
    "SAINT-LAURENT", "MONT-ROYAL", "REPENTIGNY", "TERREBONNE",
    "BLAINVILLE", "BOISBRIAND", "ROSEMERE", "SAINTE-THERESE",
    "SAINT-EUSTACHE", "DEUX-MONTAGNES", "VARENNES", "BOUCHERVILLE",
    "SAINTE-JULIE", "SAINT-JEAN-SUR-RICHELIEU", "CHAMBLY"
}

def normalize(text):
    """Normaliser le texte pour la recherche"""
    if not text:
        return ""
    text = str(text).lower()
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = "".join(c if c.isalnum() or c == " " else " " for c in text)
    return " ".join(text.split())

def log(msg):
    print(msg, flush=True)
    with open(LOG_FILE, "a") as f:
        f.write(msg + "\n")

# Init Firebase
env_file = "/home/ubuntu/depxpres/.env.local"
env_vars = {}
with open(env_file, "r") as f:
    for line in f:
        line = line.strip()
        if "=" in line and not line.startswith("#"):
            key, _, value = line.partition("=")
            env_vars[key.strip()] = value.strip()

service_account = json.loads(env_vars.get("FIREBASE_SERVICE_ACCOUNT_KEY", "{}"))
if not firebase_admin._apps:
    cred = credentials.Certificate(service_account)
    firebase_admin.initialize_app(cred)

db = firestore.client()
project_id = service_account.get("project_id", "unknown")

log(f"=== Import BDOA v4 - Optimisé recherche par nom de rue ===")
log(f"Projet: {project_id}")
log(f"Max adresses: {MAX_ADDRESSES}")

# Vérifier les adresses déjà importées
existing = db.collection("bdoa_addresses").limit(1).stream()
existing_count = sum(1 for _ in existing)
log(f"Adresses déjà dans Firestore: {existing_count}+")

# Lire le CSV et sélectionner les adresses du Grand Montréal
log(f"\nLecture du CSV...")
addresses = []
city_counts = {}

with open(CSV_FILE, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        city_pcs = row.get("city_pcs", "").strip().upper()
        if city_pcs not in GRAND_MONTREAL_CITIES:
            continue
        
        # Ignorer les adresses sans numéro de rue
        street_no = row.get("street_no", "").strip()
        str_name = row.get("str_name", "").strip()
        if not str_name:
            continue
        
        city_counts[city_pcs] = city_counts.get(city_pcs, 0) + 1
        
        # Limiter par ville pour avoir une bonne distribution
        if city_counts.get(city_pcs, 0) > MAX_ADDRESSES // len(GRAND_MONTREAL_CITIES) + 50:
            continue
        
        addresses.append(row)
        if len(addresses) >= MAX_ADDRESSES:
            break

log(f"Adresses sélectionnées: {len(addresses)}")
for city, count in sorted(city_counts.items(), key=lambda x: -x[1])[:10]:
    log(f"  {city}: {count}")

log(f"\nDébut de l'import...")
imported = 0
errors = 0
start_time = time.time()

i = 0
while i < len(addresses):
    batch = db.batch()
    batch_count = 0
    
    for j in range(i, min(i + BATCH_SIZE, len(addresses))):
        row = addresses[j]
        
        street_no = row.get("street_no", "").strip()
        str_name = row.get("str_name", "").strip()
        str_type = row.get("str_type_pcs", "").strip()
        str_dir = row.get("str_dir_pcs", "").strip()
        city_pcs = row.get("city_pcs", "").strip().upper()
        full_addr = row.get("full_addr", "").strip()
        postal_code = row.get("postal_code", "").strip()
        
        # Construire line1
        line1_parts = [p for p in [street_no, str_name, str_type, str_dir] if p]
        line1 = " ".join(line1_parts) or full_addr
        
        # Normaliser les composants
        norm_street_no = normalize(street_no)
        norm_str_name = normalize(str_name)
        norm_str_type = normalize(str_type)
        norm_city = normalize(city_pcs)
        norm_full = normalize(full_addr)
        
        # search_text optimisé: commence par nom de rue pour recherche par préfixe
        # Format: "nom_rue numéro ville" pour permettre la recherche par nom de rue
        search_parts = []
        if norm_str_name:
            search_parts.append(norm_str_name)
        if norm_street_no:
            search_parts.append(norm_street_no)
        if norm_str_type:
            search_parts.append(norm_str_type)
        if norm_city:
            search_parts.append(norm_city)
        
        # Aussi ajouter "numéro nom_rue" pour la recherche par numéro
        search_text_by_name = " ".join(search_parts)
        search_text_by_number = f"{norm_street_no} {norm_str_name} {norm_str_type} {norm_city}".strip() if norm_street_no else ""
        
        # search_text principal: par nom de rue
        search_text = search_text_by_name
        
        # adr_complete_lower: adresse complète normalisée
        adr_complete_lower = normalize(full_addr or line1)
        
        # ID unique basé sur l'ID BDOA
        doc_id = row.get("id", "").strip()
        if not doc_id:
            doc_id = f"bdoa_{normalize(line1)[:30]}_{normalize(city_pcs)[:10]}"
        
        try:
            lat = float(row.get("latitude", 0) or 0)
            lng = float(row.get("longitude", 0) or 0)
        except (ValueError, TypeError):
            lat, lng = 0.0, 0.0
        
        doc_data = {
            "adr_complete": full_addr or line1,
            "adr_complete_lower": adr_complete_lower,
            "search_text": search_text,
            "search_text_by_number": search_text_by_number,
            "line1": line1,
            "numero_rue": street_no,
            "nom_rue": str_name,
            "type_rue": str_type,
            "dir_rue": str_dir,
            "ville_pcs": city_pcs,
            "code_postal": postal_code,
            "province_code": "QC",
            "latitude": lat,
            "longitude": lng,
            "csdname": row.get("csdname", "").strip(),
            "fournisseur": row.get("provider", "").strip(),
            "is_grand_montreal": True,
            "source_id": row.get("source_id", "").strip(),
            "imported_at": firestore.SERVER_TIMESTAMP,
        }
        
        doc_ref = db.collection("bdoa_addresses").document(doc_id)
        batch.set(doc_ref, doc_data)
        batch_count += 1
    
    # Commit avec retry
    for attempt in range(3):
        try:
            batch.commit()
            imported += batch_count
            elapsed = time.time() - start_time
            log(f"  ✓ {imported}/{len(addresses)} importés ({elapsed:.0f}s)")
            break
        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                wait = 30 * (attempt + 1)
                log(f"  Rate limit, attente {wait}s... (tentative {attempt+1}/3)")
                time.sleep(wait)
            else:
                log(f"  Erreur: {err_str[:100]}")
                errors += 1
                break
    
    i += BATCH_SIZE
    time.sleep(PAUSE_BETWEEN_BATCHES)

elapsed = time.time() - start_time
log(f"\n=== Import terminé ===")
log(f"Importé: {imported} adresses en {elapsed:.0f}s")
log(f"Erreurs: {errors}")
