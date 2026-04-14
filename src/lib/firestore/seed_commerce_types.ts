/**
 * Script de seed — Types de commerce DepXpreS
 * Insère 100 types de petits commerces de proximité dans Firestore
 * Collection: commerce_types
 *
 * Usage:
 *   cd /ton/projet/depxpres
 *   npx ts-node src/lib/firestore/seed_commerce_types.ts
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

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

// ─── Slugify ────────────────────────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// ─── 100 Types de commerce ───────────────────────────────────────────────────
const COMMERCE_TYPES: {
  name: string;
  description: string;
  group: string;
  icon: string;
  priority: "high" | "medium" | "low";
}[] = [
  // ── ALIMENTAIRE DE PROXIMITÉ ───────────────────────────────────────────
  { name: "Dépanneur", description: "Produits du quotidien, boissons, collations, lait, pain, cigarettes, articles de base.", group: "Alimentaire de proximité", icon: "Store", priority: "high" },
  { name: "Épicerie de quartier", description: "Petite épicerie locale avec produits essentiels et parfois produits ethniques.", group: "Alimentaire de proximité", icon: "ShoppingBasket", priority: "high" },
  { name: "Mini-marché de quartier", description: "Version compacte d'une épicerie, souvent très locale.", group: "Alimentaire de proximité", icon: "ShoppingCart", priority: "high" },
  { name: "Fruiterie", description: "Fruits frais, légumes, jus, parfois produits complémentaires.", group: "Alimentaire de proximité", icon: "Apple", priority: "high" },
  { name: "Marchand de légumes", description: "Légumes frais, herbes, produits saisonniers.", group: "Alimentaire de proximité", icon: "Leaf", priority: "medium" },
  { name: "Boucherie", description: "Viande fraîche, marinades, produits maison, plats à cuire.", group: "Alimentaire de proximité", icon: "Beef", priority: "high" },
  { name: "Charcuterie", description: "Viandes froides, saucissons, terrines, produits fins.", group: "Alimentaire de proximité", icon: "Utensils", priority: "medium" },
  { name: "Poissonnerie", description: "Poisson frais, fruits de mer, produits marins.", group: "Alimentaire de proximité", icon: "Fish", priority: "medium" },
  { name: "Boulangerie artisanale", description: "Pains, baguettes, pains spéciaux, produits cuits sur place.", group: "Alimentaire de proximité", icon: "Bread", priority: "high" },
  { name: "Pâtisserie", description: "Gâteaux, tartes, entremets, desserts individuels.", group: "Alimentaire de proximité", icon: "Cake", priority: "high" },
  { name: "Viennoiserie artisanale", description: "Croissants, chocolatines, brioches, feuilletés.", group: "Alimentaire de proximité", icon: "Croissant", priority: "medium" },
  { name: "Biscuiterie", description: "Biscuits, sablés, barres sucrées, produits secs.", group: "Alimentaire de proximité", icon: "Cookie", priority: "medium" },
  { name: "Fromagerie", description: "Fromages fins, accompagnements, spécialités locales ou importées.", group: "Alimentaire de proximité", icon: "Cheese", priority: "medium" },
  { name: "Crèmerie", description: "Desserts glacés, produits laitiers spécialisés, crème molle ou glacée.", group: "Alimentaire de proximité", icon: "IceCream", priority: "medium" },
  { name: "Glacier artisanal", description: "Glaces artisanales, gelato, formats à emporter.", group: "Alimentaire de proximité", icon: "IceCream2", priority: "high" },
  { name: "Sorbetier", description: "Sorbets, produits glacés fruités, options sans lait.", group: "Alimentaire de proximité", icon: "Snowflake", priority: "low" },
  { name: "Chocolaterie", description: "Tablettes, truffes, bouchées, coffrets cadeaux.", group: "Alimentaire de proximité", icon: "Candy", priority: "high" },
  { name: "Confiserie", description: "Bonbons, caramel, nougat, sucreries artisanales.", group: "Alimentaire de proximité", icon: "CandyOff", priority: "medium" },
  { name: "Torréfacteur de café", description: "Café en grains ou moulu, accessoires, abonnements, produits maison.", group: "Alimentaire de proximité", icon: "Coffee", priority: "high" },
  { name: "Boutique de thé", description: "Thés en vrac, infusions, accessoires, coffrets.", group: "Alimentaire de proximité", icon: "Coffee", priority: "medium" },
  { name: "Boutique d'épices", description: "Épices en vrac, mélanges maison, assaisonnements.", group: "Alimentaire de proximité", icon: "Flame", priority: "medium" },
  { name: "Marchand de noix et fruits secs", description: "Amandes, pistaches, dattes, mélanges collation.", group: "Alimentaire de proximité", icon: "Nut", priority: "medium" },
  { name: "Magasin de produits fins", description: "Produits gastronomiques, conserves, sauces, huiles, spécialités.", group: "Alimentaire de proximité", icon: "Star", priority: "medium" },
  { name: "Épicerie bio", description: "Produits biologiques, locaux, naturels, souvent écoresponsables.", group: "Alimentaire de proximité", icon: "Sprout", priority: "high" },
  { name: "Magasin en vrac", description: "Aliments secs, produits ménagers, produits rechargeables.", group: "Alimentaire de proximité", icon: "Scale", priority: "medium" },
  { name: "Marchand d'huiles et vinaigres", description: "Huiles aromatisées, vinaigres spécialisés, condiments.", group: "Alimentaire de proximité", icon: "Droplets", priority: "low" },
  { name: "Boutique de miel et produits de la ruche", description: "Miel, pollen, propolis, produits dérivés.", group: "Alimentaire de proximité", icon: "Hexagon", priority: "low" },
  { name: "Confiturerie artisanale", description: "Confitures, gelées, tartinades, compotes.", group: "Alimentaire de proximité", icon: "Jar", priority: "low" },
  { name: "Fabricant de sauces et condiments", description: "Sauces piquantes, ketchup maison, chutneys, moutardes.", group: "Alimentaire de proximité", icon: "Flask", priority: "low" },
  { name: "Fabrique de pâtes fraîches", description: "Pâtes, raviolis, gnocchis, parfois sauces fraîches.", group: "Alimentaire de proximité", icon: "Utensils", priority: "medium" },
  { name: "Raviolerie", description: "Raviolis, pâtes farcies, produits prêts à cuire.", group: "Alimentaire de proximité", icon: "Utensils", priority: "low" },
  { name: "Bagelerie artisanale", description: "Bagels frais, formats paquet, produits de boulangerie connexes.", group: "Alimentaire de proximité", icon: "Circle", priority: "medium" },
  { name: "Marchand de produits surgelés artisanaux", description: "Repas maison, desserts, pâtes, pâtisseries congelées.", group: "Alimentaire de proximité", icon: "Thermometer", priority: "medium" },
  { name: "Producteur de granola et céréales", description: "Granola artisanal, muesli, collations santé.", group: "Alimentaire de proximité", icon: "Wheat", priority: "low" },
  { name: "Marchand de collations santé", description: "Bouchées énergétiques, barres, snacks spécialisés.", group: "Alimentaire de proximité", icon: "Zap", priority: "medium" },
  { name: "Fabricant de popcorn gourmet", description: "Popcorn sucré, salé, aromatisé.", group: "Alimentaire de proximité", icon: "Star", priority: "low" },
  { name: "Boutique de kombucha ou boissons artisanales", description: "Boissons locales non alcoolisées, formats bouteille.", group: "Alimentaire de proximité", icon: "Bottle", priority: "low" },
  { name: "Marchand de jus pressés embouteillés", description: "Jus frais, cures, boissons santé.", group: "Alimentaire de proximité", icon: "Droplet", priority: "medium" },
  { name: "Magasin de produits sans gluten", description: "Pains, desserts, produits spécialisés.", group: "Alimentaire de proximité", icon: "Ban", priority: "low" },
  { name: "Boutique végétalienne spécialisée", description: "Produits vegan emballés, desserts, collations, aliments spécialisés.", group: "Alimentaire de proximité", icon: "Leaf", priority: "medium" },

  // ── BEAUTÉ, SANTÉ ET CONSOMMATION COURANTE ────────────────────────────
  { name: "Pharmacie indépendante", description: "Médicaments, hygiène, cosmétiques, produits de santé.", group: "Beauté, santé et consommation courante", icon: "Pill", priority: "high" },
  { name: "Parapharmacie", description: "Soins corporels, beauté, hygiène, sans volet complet de prescription.", group: "Beauté, santé et consommation courante", icon: "Heart", priority: "medium" },
  { name: "Tabagie", description: "Cigarettes, cigares, accessoires fumeurs, loterie, journaux.", group: "Beauté, santé et consommation courante", icon: "Cigarette", priority: "high" },
  { name: "Boutique de vapotage", description: "E-liquides, appareils, accessoires.", group: "Beauté, santé et consommation courante", icon: "Wind", priority: "medium" },
  { name: "Herboristerie", description: "Tisanes, plantes séchées, produits naturels.", group: "Beauté, santé et consommation courante", icon: "Sprout", priority: "medium" },
  { name: "Boutique de suppléments", description: "Vitamines, protéines, nutraceutiques, produits bien-être.", group: "Beauté, santé et consommation courante", icon: "Dumbbell", priority: "medium" },
  { name: "Boutique de cosmétiques indépendants", description: "Maquillage, soins visage, produits locaux.", group: "Beauté, santé et consommation courante", icon: "Sparkles", priority: "medium" },
  { name: "Savonnerie artisanale", description: "Savons, bombes de bain, soins naturels.", group: "Beauté, santé et consommation courante", icon: "Droplets", priority: "medium" },
  { name: "Boutique de produits corporels", description: "Lotions, huiles, soins personnels.", group: "Beauté, santé et consommation courante", icon: "HandHeart", priority: "low" },
  { name: "Magasin de produits d'hygiène naturelle", description: "Déodorants, shampoings, soins écologiques.", group: "Beauté, santé et consommation courante", icon: "Leaf", priority: "low" },
  { name: "Lunetterie indépendante", description: "Lunettes, accessoires, montures, parfois verres spécialisés.", group: "Beauté, santé et consommation courante", icon: "Glasses", priority: "medium" },
  { name: "Boutique orthopédique", description: "Bas, supports, produits de confort, équipements légers.", group: "Beauté, santé et consommation courante", icon: "Activity", priority: "low" },
  { name: "Magasin de premiers soins", description: "Trousses, pansements, produits médicaux de base.", group: "Beauté, santé et consommation courante", icon: "Cross", priority: "low" },
  { name: "Boutique de parfums artisanaux", description: "Fragrances locales, bougies parfumées, diffuseurs.", group: "Beauté, santé et consommation courante", icon: "Wind", priority: "medium" },
  { name: "Boutique zéro déchet", description: "Brosses, contenants, produits rechargeables, soins écologiques.", group: "Beauté, santé et consommation courante", icon: "Recycle", priority: "medium" },

  // ── MAISON ET QUOTIDIEN ───────────────────────────────────────────────
  { name: "Fleuriste", description: "Bouquets, plantes, arrangements, cadeaux floraux.", group: "Maison et quotidien", icon: "Flower", priority: "high" },
  { name: "Jardinerie de quartier", description: "Plantes, terreaux, semences, pots, accessoires.", group: "Maison et quotidien", icon: "TreeDeciduous", priority: "medium" },
  { name: "Boutique de plantes d'intérieur", description: "Plantes décoratives, cache-pots, entretien.", group: "Maison et quotidien", icon: "Flower2", priority: "medium" },
  { name: "Quincaillerie de quartier", description: "Outils de base, vis, ampoules, peinture, petits articles maison.", group: "Maison et quotidien", icon: "Wrench", priority: "medium" },
  { name: "Magasin d'articles ménagers", description: "Ustensiles, rangement, produits du quotidien.", group: "Maison et quotidien", icon: "Home", priority: "medium" },
  { name: "Boutique de décoration", description: "Objets décoratifs, accessoires maison, petites pièces design.", group: "Maison et quotidien", icon: "Palette", priority: "medium" },
  { name: "Magasin de literie et textiles maison", description: "Draps, couvertures, coussins, linge de maison.", group: "Maison et quotidien", icon: "BedDouble", priority: "low" },
  { name: "Boutique de bougies et senteurs maison", description: "Bougies, diffuseurs, parfums d'ambiance.", group: "Maison et quotidien", icon: "Flame", priority: "medium" },
  { name: "Boutique de vaisselle et cuisine", description: "Assiettes, verres, ustensiles, petits accessoires.", group: "Maison et quotidien", icon: "UtensilsCrossed", priority: "low" },
  { name: "Magasin de rangement et organisation", description: "Boîtes, paniers, solutions maison.", group: "Maison et quotidien", icon: "LayoutGrid", priority: "low" },
  { name: "Boutique de cadeaux", description: "Objets cadeaux, petits articles saisonniers, cartes, accessoires.", group: "Maison et quotidien", icon: "Gift", priority: "high" },
  { name: "Papeterie", description: "Carnets, stylos, enveloppes, fournitures de bureau.", group: "Maison et quotidien", icon: "PenLine", priority: "medium" },
  { name: "Boutique de cartes et emballages cadeaux", description: "Cartes de souhaits, papiers, rubans, accessoires.", group: "Maison et quotidien", icon: "MailOpen", priority: "low" },
  { name: "Magasin de produits écologiques maison", description: "Nettoyants, recharges, accessoires durables.", group: "Maison et quotidien", icon: "Recycle", priority: "medium" },
  { name: "Boutique d'éclairage décoratif", description: "Lampes, ampoules design, luminaires petits formats.", group: "Maison et quotidien", icon: "Lightbulb", priority: "low" },

  // ── MODE ET ACCESSOIRES ───────────────────────────────────────────────
  { name: "Boutique de vêtements indépendante", description: "Vêtements homme, femme, enfant, collections locales.", group: "Mode et accessoires", icon: "Shirt", priority: "medium" },
  { name: "Friperie", description: "Vêtements seconde main, vintage, accessoires récupérés.", group: "Mode et accessoires", icon: "Recycle", priority: "medium" },
  { name: "Boutique de mode locale", description: "Créateurs locaux, petites séries, articles uniques.", group: "Mode et accessoires", icon: "Sparkles", priority: "medium" },
  { name: "Magasin de chaussures", description: "Chaussures de ville, sport, confort, accessoires.", group: "Mode et accessoires", icon: "Footprints", priority: "medium" },
  { name: "Maroquinerie", description: "Sacs, portefeuilles, ceintures, accessoires en cuir.", group: "Mode et accessoires", icon: "Briefcase", priority: "low" },
  { name: "Bijouterie indépendante", description: "Bijoux fins ou fantaisie, créations artisanales.", group: "Mode et accessoires", icon: "Gem", priority: "medium" },
  { name: "Horlogerie-bijouterie", description: "Montres, bracelets, petits accessoires cadeaux.", group: "Mode et accessoires", icon: "Watch", priority: "low" },
  { name: "Chapellerie", description: "Casquettes, chapeaux, accessoires de tête.", group: "Mode et accessoires", icon: "Hat", priority: "low" },
  { name: "Boutique d'accessoires de mode", description: "Foulards, ceintures, lunettes soleil, sacs.", group: "Mode et accessoires", icon: "Glasses", priority: "low" },
  { name: "Boutique pour enfants et bébés", description: "Vêtements, cadeaux, accessoires, produits spécialisés.", group: "Mode et accessoires", icon: "Baby", priority: "medium" },

  // ── CULTURE, LOISIRS ET NICHE ─────────────────────────────────────────
  { name: "Librairie indépendante", description: "Livres, papeterie complémentaire, cadeaux culturels.", group: "Culture, loisirs et niche", icon: "BookOpen", priority: "medium" },
  { name: "Disquaire", description: "Vinyles, CD, accessoires audio, objets musicaux.", group: "Culture, loisirs et niche", icon: "Disc", priority: "low" },
  { name: "Boutique de jeux et jouets", description: "Jouets éducatifs, jeux de société, cadeaux enfant.", group: "Culture, loisirs et niche", icon: "Gamepad", priority: "medium" },
  { name: "Boutique de matériel d'artiste", description: "Peinture, pinceaux, papiers, matériel créatif.", group: "Culture, loisirs et niche", icon: "Palette", priority: "low" },
  { name: "Boutique d'artisanat local", description: "Objets faits main, déco, bijoux, cadeaux.", group: "Culture, loisirs et niche", icon: "HandMetal", priority: "medium" },
  { name: "Boutique de souvenirs montréalais", description: "Produits touristiques, cadeaux, objets locaux.", group: "Culture, loisirs et niche", icon: "MapPin", priority: "medium" },
  { name: "Animalerie indépendante", description: "Nourriture, accessoires, produits pour animaux.", group: "Culture, loisirs et niche", icon: "Dog", priority: "medium" },
  { name: "Boutique de vélo", description: "Vélos, casques, pièces, accessoires, entretien léger.", group: "Culture, loisirs et niche", icon: "Bike", priority: "low" },
  { name: "Boutique de sport de quartier", description: "Articles ciblés, équipements spécialisés, accessoires.", group: "Culture, loisirs et niche", icon: "Trophy", priority: "medium" },
  { name: "Magasin de téléphonie et accessoires", description: "Coques, câbles, chargeurs, petits gadgets.", group: "Culture, loisirs et niche", icon: "Smartphone", priority: "medium" },
  { name: "Boutique informatique de détail", description: "Accessoires, périphériques, petits appareils.", group: "Culture, loisirs et niche", icon: "Monitor", priority: "low" },
  { name: "Boutique photo", description: "Pellicules, cadres, accessoires, impression légère.", group: "Culture, loisirs et niche", icon: "Camera", priority: "low" },
  { name: "Boutique de chasse et pêche", description: "Accessoires, articles spécialisés, vêtements.", group: "Culture, loisirs et niche", icon: "Crosshair", priority: "low" },
  { name: "Boutique ésotérique", description: "Encens, pierres, cartes, bougies, objets spirituels.", group: "Culture, loisirs et niche", icon: "Stars", priority: "low" },
  { name: "Magasin religieux spécialisé", description: "Livres, objets, accessoires religieux.", group: "Culture, loisirs et niche", icon: "BookMarked", priority: "low" },
  { name: "Boutique de fêtes", description: "Décorations, ballons, accessoires événementiels.", group: "Culture, loisirs et niche", icon: "PartyPopper", priority: "medium" },
  { name: "Boutique saisonnière", description: "Noël, Halloween, Pâques, cadeaux et décors.", group: "Culture, loisirs et niche", icon: "Calendar", priority: "medium" },
  { name: "Kiosque de journaux et loterie", description: "Presse, billets, petits articles de comptoir.", group: "Culture, loisirs et niche", icon: "Newspaper", priority: "medium" },
  { name: "Boutique de produits locaux québécois", description: "Cadeaux gourmands, artisanat, produits régionaux.", group: "Culture, loisirs et niche", icon: "MapPin", priority: "high" },
  { name: "Magasin multi-produits de quartier", description: "Petit commerce hybride entre dépanneur, cadeaux, produits utiles et spécialités locales.", group: "Culture, loisirs et niche", icon: "Store", priority: "high" },
];

// ─── Seed Function ───────────────────────────────────────────────────────────
async function seedCommerceTypes() {
  console.log(`\n🏪 Début de l'import — ${COMMERCE_TYPES.length} types de commerce\n`);

  const colRef = collection(db, "commerce_types");
  let success = 0;
  let errors = 0;

  for (let i = 0; i < COMMERCE_TYPES.length; i++) {
    const ct = COMMERCE_TYPES[i];
    const slug = slugify(ct.name);
    const docId = `${String(i + 1).padStart(3, "0")}-${slug}`;

    try {
      await setDoc(doc(colRef, docId), {
        id: docId,
        sortOrder: i + 1,
        name: ct.name,
        slug,
        description: ct.description,
        group: ct.group,
        icon: ct.icon,
        priority: ct.priority,
        isActive: true,
        storeCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log(`  ✅ [${i + 1}/100] ${ct.name}`);
      success++;
    } catch (err) {
      console.error(`  ❌ [${i + 1}/100] ${ct.name} — Erreur:`, err);
      errors++;
    }
  }

  console.log(`\n${"─".repeat(50)}`);
  console.log(`✅ Succès : ${success}`);
  console.log(`❌ Erreurs : ${errors}`);
  console.log(`📦 Collection Firestore : commerce_types`);
  console.log(`${"─".repeat(50)}\n`);
}

seedCommerceTypes().catch(console.error);
