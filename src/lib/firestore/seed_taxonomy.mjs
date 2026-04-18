/**
 * Seed Firestore avec la taxonomie CMS v2
 * Usage: node src/lib/firestore/seed_taxonomy.mjs
 * 
 * Crée 3 collections:
 * - taxonomy_commerce_types (20 docs)
 * - taxonomy_categories (112 docs)
 * - taxonomy_subcategories (393 docs)
 */
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, writeBatch } from "firebase/firestore";
import { readFileSync } from "fs";

const firebaseConfig = {
  apiKey: "AIzaSyAmDwm43D52jpgDp1MiNg_TvLBn_fDTsU8",
  authDomain: "studio-1471071484-26917.firebaseapp.com",
  projectId: "studio-1471071484-26917",
  storageBucket: "studio-1471071484-26917.firebasestorage.app",
  messagingSenderId: "4728432828",
  appId: "1:4728432828:web:4ef7796d15d6464cdc48b9",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Charger les données
const raw = readFileSync("./taxonomie_cms_production_v2.json", "utf-8");
const data = JSON.parse(raw);

async function seedInBatches(colName, docs) {
  const BATCH_SIZE = 400;
  let count = 0;
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = docs.slice(i, i + BATCH_SIZE);
    for (const d of chunk) {
      const ref = doc(collection(db, colName), d.id);
      batch.set(ref, d);
      count++;
    }
    await batch.commit();
    console.log(`  ✅ ${colName}: ${Math.min(i + BATCH_SIZE, docs.length)}/${docs.length}`);
  }
  return count;
}

async function main() {
  console.log("\n🚀 Seed taxonomie CMS v2...\n");

  const commerceTypes = [];
  const categories = [];
  const subcategories = [];

  for (const ct of data.taxonomy) {
    const { categories: cats, ...ctData } = ct;
    commerceTypes.push(ctData);

    for (const cat of cats) {
      const { subcategories: subs, ...catData } = cat;
      categories.push(catData);

      for (const sub of subs) {
        const { sample_items, ...subData } = sub;
        subcategories.push({ ...subData, sample_items });
      }
    }
  }

  console.log(`📦 Commerce types: ${commerceTypes.length}`);
  await seedInBatches("taxonomy_commerce_types", commerceTypes);

  console.log(`📦 Catégories: ${categories.length}`);
  await seedInBatches("taxonomy_categories", categories);

  console.log(`📦 Sous-catégories: ${subcategories.length}`);
  await seedInBatches("taxonomy_subcategories", subcategories);

  console.log("\n✅ Seed terminé !");
  console.log(`   ${commerceTypes.length} commerce types`);
  console.log(`   ${categories.length} catégories`);
  console.log(`   ${subcategories.length} sous-catégories`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
