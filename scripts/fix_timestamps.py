#!/usr/bin/env python3
"""
Script pour corriger la sérialisation des timestamps Firestore dans toutes les API routes.
Remplace JSON.stringify(doc.data()) par une sérialisation propre qui convertit les Timestamps.
"""

import os
import re

API_DIR = '/home/ubuntu/depxpres/src/app/api/admin'

# Nouveau helper d'import à ajouter en tête de chaque fichier route.ts
SERIALIZE_IMPORT = "import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';\n"

def fix_route_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    modified = False
    
    # 1. Ajouter l'import du helper si pas déjà présent
    if 'firestore-serialize' not in content and ('getFirestore' in content or 'getAdminDb' in content or 'adminDb' in content):
        # Insérer après le dernier import
        lines = content.split('\n')
        last_import_idx = 0
        for i, line in enumerate(lines):
            if line.strip().startswith('import '):
                last_import_idx = i
        lines.insert(last_import_idx + 1, SERIALIZE_IMPORT.strip())
        content = '\n'.join(lines)
        modified = True
    
    # 2. Remplacer les patterns de sérialisation problématiques
    
    # Pattern: { id: doc.id, ...doc.data() }
    # Remplacer par: serializeDoc({ id: doc.id, ...doc.data() })
    pattern1 = r'\{\s*id:\s*doc\.id,\s*\.\.\.doc\.data\(\)\s*\}'
    replacement1 = 'serializeDoc({ id: doc.id, ...doc.data() })'
    new_content = re.sub(pattern1, replacement1, content)
    if new_content != content:
        content = new_content
        modified = True
    
    # Pattern: { id: snap.id, ...snap.data() }
    pattern2 = r'\{\s*id:\s*snap\.id,\s*\.\.\.snap\.data\(\)\s*\}'
    replacement2 = 'serializeDoc({ id: snap.id, ...snap.data() })'
    new_content = re.sub(pattern2, replacement2, content)
    if new_content != content:
        content = new_content
        modified = True
    
    # Pattern: docs.map(doc => ({ id: doc.id, ...doc.data() }))
    # Remplacer par: serializeDocs(docs.map(doc => ({ id: doc.id, ...doc.data() })))
    # (déjà géré par le pattern ci-dessus si chaque item est sérialisé)
    
    # Pattern: JSON.stringify(doc.data())
    pattern3 = r'JSON\.stringify\(doc\.data\(\)\)'
    replacement3 = 'JSON.stringify(serializeDoc({ id: doc.id, ...doc.data() }))'
    new_content = re.sub(pattern3, replacement3, content)
    if new_content != content:
        content = new_content
        modified = True
    
    # 3. Corriger les NextResponse.json() qui passent des objets avec timestamps
    # Pattern: return NextResponse.json({ ..., createdAt: doc.data().createdAt, ... })
    # Ces cas sont déjà gérés par serializeDoc si on l'applique à doc.data()
    
    if modified and content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"✅ Corrigé: {filepath.replace('/home/ubuntu/depxpres/', '')}")
        return True
    return False

def main():
    fixed = 0
    total = 0
    
    for root, dirs, files in os.walk(API_DIR):
        for filename in files:
            if filename == 'route.ts':
                filepath = os.path.join(root, filename)
                total += 1
                if fix_route_file(filepath):
                    fixed += 1
    
    print(f"\n📊 Résultat: {fixed}/{total} fichiers corrigés")

if __name__ == '__main__':
    main()
