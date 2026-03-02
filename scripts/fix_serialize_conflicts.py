#!/usr/bin/env python3
"""
Corrige les conflits de serializeDoc dans tous les fichiers API.
Supprime les définitions locales et garde uniquement l'import depuis firestore-serialize.
"""

import os
import re

# Fichiers avec conflit (import + définition locale)
CONFLICT_FILES = [
    "src/app/api/admin/orders/[orderId]/items/route.ts",
    "src/app/api/admin/orders/[orderId]/history/route.ts",
    "src/app/api/admin/orders/[orderId]/messages/route.ts",
    "src/app/api/admin/orders/[orderId]/support/route.ts",
    "src/app/api/admin/orders/[orderId]/candidate-drivers/route.ts",
    "src/app/api/admin/orders/[orderId]/route.ts",
    "src/app/api/admin/drivers/[driverId]/earnings/route.ts",
    "src/app/api/admin/clients/[clientId]/route.ts",
    "src/app/api/admin/clients/route.ts",
    "src/app/api/admin/stores/route.ts",
    "src/app/api/admin/products/route.ts",
    "src/app/api/admin/categories/route.ts",
]

# Pattern pour supprimer la définition locale de serializeDoc
# Supprime les lignes: function serializeDoc(...) { ... }
SERIALIZE_FUNC_PATTERN = re.compile(
    r'\nfunction serializeDoc\(data: FirebaseFirestore\.DocumentData\) \{[^}]+\}\n',
    re.DOTALL
)

# Pattern alternatif plus large
SERIALIZE_FUNC_PATTERN2 = re.compile(
    r'\nfunction serializeDoc\([^)]*\)[^{]*\{[^}]*(?:\{[^}]*\}[^}]*)*\}\n',
    re.DOTALL
)

base_dir = "/home/ubuntu/depxpres"
fixed = 0
errors = 0

for rel_path in CONFLICT_FILES:
    full_path = os.path.join(base_dir, rel_path)
    
    if not os.path.exists(full_path):
        print(f"⚠️  Fichier non trouvé: {rel_path}")
        continue
    
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Supprimer la définition locale de serializeDoc
    # Trouver le début et la fin de la fonction
    lines = content.split('\n')
    new_lines = []
    skip = False
    brace_count = 0
    in_func = False
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Détecter le début de la fonction locale serializeDoc
        if re.match(r'^function serializeDoc\(', line.strip()):
            in_func = True
            brace_count = line.count('{') - line.count('}')
            if brace_count == 0:
                # Fonction sur une ligne
                i += 1
                continue
            i += 1
            continue
        
        if in_func:
            brace_count += line.count('{') - line.count('}')
            if brace_count <= 0:
                in_func = False
                # Sauter aussi la ligne vide après la fonction
                if i + 1 < len(lines) and lines[i + 1].strip() == '':
                    i += 1
            i += 1
            continue
        
        new_lines.append(line)
        i += 1
    
    new_content = '\n'.join(new_lines)
    
    # Vérifier si la modification a été faite
    if new_content != original:
        # Vérifier que l'import est bien présent
        if "import { serializeDoc" not in new_content and "import {serializeDoc" not in new_content:
            print(f"⚠️  Import manquant dans: {rel_path}")
        
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✅ Corrigé: {rel_path}")
        fixed += 1
    else:
        print(f"ℹ️  Pas de changement: {rel_path}")

print(f"\n=== Résumé ===")
print(f"✅ Fichiers corrigés: {fixed}")
print(f"❌ Erreurs: {errors}")
