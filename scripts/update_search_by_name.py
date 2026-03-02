"""
Mise à jour des adresses Firestore pour ajouter search_by_name
Ce champ commence par le nom de rue pour permettre la recherche par préfixe de nom
"""
import json, unicodedata, time, firebase_admin
from firebase_admin import credentials, firestore

LOG = "/home/ubuntu/update_search_by_name.log"

def log(msg):
    print(msg, flush=True)
    with open(LOG, "a") as f:
        f.write(msg + "\n")

def normalize(text):
    if not text:
        return ""
    text = str(text).lower()
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = "".join(c if c.isalnum() or c == " " else " " for c in text)
    return " ".join(text.split())

env_vars = {}
with open("/home/ubuntu/depxpres/.env.local", "r") as f:
    for line in f:
        line = line.strip()
        if "=" in line and not line.startswith("#"):
            k, _, v = line.partition("=")
            env_vars[k.strip()] = v.strip()

sa = json.loads(env_vars.get("FIREBASE_SERVICE_ACCOUNT_KEY", "{}"))
if not firebase_admin._apps:
    firebase_admin.initialize_app(credentials.Certificate(sa))

db = firestore.client()

log("=== Mise à jour search_by_name ===")
updated = 0
skipped = 0
errors = 0
batch_size = 20
docs_batch = []

for doc in db.collection("bdoa_addresses").stream():
    docs_batch.append(doc)
    
    if len(docs_batch) >= batch_size:
        batch = db.batch()
        count_in_batch = 0
        
        for d_doc in docs_batch:
            d = d_doc.to_dict()
            if "search_by_name" in d:
                skipped += 1
                continue
            
            nom_rue = d.get("nom_rue", "") or d.get("str_name_pcs", "") or ""
            type_rue = d.get("type_rue", "") or d.get("str_type_pcs", "") or ""
            ville = d.get("ville_pcs", "") or ""
            
            search_by_name = normalize(f"{nom_rue} {type_rue} {ville}")
            
            if search_by_name:
                batch.update(d_doc.reference, {"search_by_name": search_by_name})
                count_in_batch += 1
        
        if count_in_batch > 0:
            for attempt in range(3):
                try:
                    batch.commit()
                    updated += count_in_batch
                    log(f"  ✓ {updated} mis à jour, {skipped} ignorés...")
                    break
                except Exception as e:
                    if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                        wait = 30 * (attempt + 1)
                        log(f"  Rate limit, attente {wait}s...")
                        time.sleep(wait)
                    else:
                        log(f"  Erreur: {str(e)[:100]}")
                        errors += 1
                        break
        
        docs_batch = []
        time.sleep(2)

# Dernier batch
if docs_batch:
    batch = db.batch()
    count_in_batch = 0
    for d_doc in docs_batch:
        d = d_doc.to_dict()
        if "search_by_name" not in d:
            nom_rue = d.get("nom_rue", "") or d.get("str_name_pcs", "") or ""
            type_rue = d.get("type_rue", "") or d.get("str_type_pcs", "") or ""
            ville = d.get("ville_pcs", "") or ""
            search_by_name = normalize(f"{nom_rue} {type_rue} {ville}")
            if search_by_name:
                batch.update(d_doc.reference, {"search_by_name": search_by_name})
                count_in_batch += 1
    if count_in_batch > 0:
        try:
            batch.commit()
            updated += count_in_batch
        except Exception as e:
            log(f"Erreur dernier batch: {e}")

log(f"\n=== Terminé: {updated} mis à jour, {skipped} ignorés, {errors} erreurs ===")
