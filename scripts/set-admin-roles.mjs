/**
 * Script pour assigner les custom claims Firebase aux comptes admin
 * Usage: node scripts/set-admin-roles.mjs
 */

import { readFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Lire les variables d'environnement depuis .env.local
const envContent = readFileSync('/home/ubuntu/depxpres/.env.local', 'utf-8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
}

const serviceAccountJson = envVars['FIREBASE_SERVICE_ACCOUNT_KEY'];
if (!serviceAccountJson) {
  console.error('FIREBASE_SERVICE_ACCOUNT_KEY non trouvé dans .env.local');
  process.exit(1);
}

const serviceAccount = JSON.parse(serviceAccountJson);

// Initialiser Firebase Admin
const admin = require('firebase-admin');

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}

const auth = admin.auth();
const db = admin.firestore();

// Comptes à configurer
const adminAccounts = [
  {
    email: 'hedi_bennis17@gmail.com',
    role: 'super_admin',
    displayName: 'Hedi Bennis',
    uid: '4FMTEf7zDzcuT5bKFZhAcdkw91K3',
  },
];

async function setAdminRole(account) {
  try {
    console.log(`\nTraitement de ${account.email}...`);
    
    // Chercher l'utilisateur par email
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(account.email);
      console.log(`  ✓ Utilisateur trouvé: ${userRecord.uid}`);
    } catch (err) {
      console.log(`  ✗ Utilisateur non trouvé: ${err.message}`);
      return;
    }

    // Vérifier les custom claims actuels
    const currentClaims = userRecord.customClaims || {};
    console.log(`  Claims actuels:`, JSON.stringify(currentClaims));

    // Assigner le custom claim "role"
    await auth.setCustomUserClaims(userRecord.uid, {
      ...currentClaims,
      role: account.role,
    });
    console.log(`  ✓ Custom claim "role: ${account.role}" assigné`);

    // Mettre à jour Firestore
    const now = new Date().toISOString();
    await db.collection('app_users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: account.email,
      display_name: account.displayName || userRecord.displayName || '',
      primary_role: account.role,
      status: 'active',
      created_at: now,
      updated_at: now,
    }, { merge: true });
    console.log(`  ✓ Profil Firestore mis à jour`);

    // Vérifier que le claim a bien été assigné
    const updatedUser = await auth.getUser(userRecord.uid);
    console.log(`  Claims après mise à jour:`, JSON.stringify(updatedUser.customClaims));

  } catch (err) {
    console.error(`  ✗ Erreur pour ${account.email}:`, err.message);
  }
}

async function main() {
  console.log('=== Assignation des rôles admin Firebase ===');
  
  for (const account of adminAccounts) {
    await setAdminRole(account);
  }
  
  console.log('\n=== Terminé ===');
  process.exit(0);
}

main().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
