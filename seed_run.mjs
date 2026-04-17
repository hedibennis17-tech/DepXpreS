import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";

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

function slugify(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

const TYPES = [
  // Alimentaire
  ["Dépanneur","Produits du quotidien, boissons, collations, lait, pain.","Alimentaire de proximité","Store","high"],
  ["Épicerie de quartier","Petite épicerie locale avec produits essentiels.","Alimentaire de proximité","ShoppingBasket","high"],
  ["Fruiterie","Fruits frais, légumes, jus.","Alimentaire de proximité","Apple","high"],
  ["Boucherie","Viande fraîche, marinades, produits maison.","Alimentaire de proximité","Beef","high"],
  ["Charcuterie","Viandes froides, saucissons, terrines.","Alimentaire de proximité","Utensils","medium"],
  ["Poissonnerie","Poisson frais, fruits de mer.","Alimentaire de proximité","Fish","medium"],
  ["Boulangerie artisanale","Pains, baguettes, produits cuits sur place.","Alimentaire de proximité","Bread","high"],
  ["Pâtisserie","Gâteaux, tartes, entremets.","Alimentaire de proximité","Cake","high"],
  ["Viennoiserie artisanale","Croissants, chocolatines, brioches.","Alimentaire de proximité","Croissant","medium"],
  ["Biscuiterie","Biscuits, sablés, barres sucrées.","Alimentaire de proximité","Cookie","medium"],
  ["Fromagerie","Fromages fins, spécialités locales.","Alimentaire de proximité","Cheese","medium"],
  ["Glacier artisanal","Glaces artisanales, gelato.","Alimentaire de proximité","IceCream","high"],
  ["Chocolaterie","Tablettes, truffes, bouchées, coffrets.","Alimentaire de proximité","Candy","high"],
  ["Confiserie","Bonbons, caramel, sucreries artisanales.","Alimentaire de proximité","CandyOff","medium"],
  ["Torréfacteur de café","Café en grains, accessoires, abonnements.","Alimentaire de proximité","Coffee","high"],
  ["Boutique de thé","Thés en vrac, infusions, accessoires.","Alimentaire de proximité","Coffee","medium"],
  ["Épicerie bio","Produits biologiques, locaux, naturels.","Alimentaire de proximité","Sprout","high"],
  ["Magasin en vrac","Aliments secs, produits rechargeables.","Alimentaire de proximité","Scale","medium"],
  ["Bagelerie artisanale","Bagels frais, produits de boulangerie.","Alimentaire de proximité","Circle","medium"],
  ["Boutique végétalienne","Produits vegan, desserts, snacks spécialisés.","Alimentaire de proximité","Leaf","medium"],
  ["Marchand de légumes","Légumes frais, herbes, produits saisonniers.","Alimentaire de proximité","Leaf","medium"],
  ["Crèmerie","Desserts glacés, produits laitiers spécialisés.","Alimentaire de proximité","IceCream","medium"],
  ["Boutique d'épices","Épices en vrac, mélanges maison.","Alimentaire de proximité","Flame","medium"],
  ["Confiturerie artisanale","Confitures, gelées, tartinades.","Alimentaire de proximité","Jar","low"],
  ["Fabrique de pâtes fraîches","Pâtes, raviolis, gnocchis.","Alimentaire de proximité","Utensils","medium"],
  ["Marchand de jus pressés","Jus frais, cures, boissons santé.","Alimentaire de proximité","Droplet","medium"],
  ["Marchand de collations santé","Bouchées énergétiques, barres, snacks.","Alimentaire de proximité","Zap","medium"],
  ["Boutique de kombucha","Boissons artisanales, formats bouteille.","Alimentaire de proximité","Bottle","low"],
  ["Magasin produits sans gluten","Pains, desserts, produits spécialisés.","Alimentaire de proximité","Ban","low"],
  ["Mini-marché de quartier","Version compacte d'une épicerie locale.","Alimentaire de proximité","ShoppingCart","high"],
  // Beauté / Santé
  ["Pharmacie indépendante","Médicaments, hygiène, cosmétiques.","Beauté, santé et consommation","Pill","high"],
  ["Parapharmacie","Soins corporels, beauté, hygiène.","Beauté, santé et consommation","Heart","medium"],
  ["Tabagie","Cigarettes, cigares, accessoires fumeurs, loterie.","Beauté, santé et consommation","Cigarette","high"],
  ["Boutique de vapotage","E-liquides, appareils, accessoires.","Beauté, santé et consommation","Wind","medium"],
  ["Herboristerie","Tisanes, plantes séchées, produits naturels.","Beauté, santé et consommation","Sprout","medium"],
  ["Boutique de suppléments","Vitamines, protéines, nutraceutiques.","Beauté, santé et consommation","Dumbbell","medium"],
  ["Boutique de cosmétiques","Maquillage, soins visage, produits locaux.","Beauté, santé et consommation","Sparkles","medium"],
  ["Savonnerie artisanale","Savons, bombes de bain, soins naturels.","Beauté, santé et consommation","Droplets","medium"],
  ["Lunetterie indépendante","Lunettes, accessoires, montures.","Beauté, santé et consommation","Glasses","medium"],
  ["Boutique zéro déchet","Brosses, contenants, produits écologiques.","Beauté, santé et consommation","Recycle","medium"],
  ["Boutique de parfums","Fragrances locales, bougies parfumées.","Beauté, santé et consommation","Wind","medium"],
  ["Boutique orthopédique","Bas, supports, produits de confort.","Beauté, santé et consommation","Activity","low"],
  // Maison
  ["Fleuriste","Bouquets, plantes, arrangements floraux.","Maison et quotidien","Flower","high"],
  ["Jardinerie de quartier","Plantes, terreaux, semences, pots.","Maison et quotidien","TreeDeciduous","medium"],
  ["Boutique de plantes","Plantes décoratives, cache-pots.","Maison et quotidien","Flower2","medium"],
  ["Quincaillerie de quartier","Outils, vis, ampoules, peinture.","Maison et quotidien","Wrench","medium"],
  ["Boutique de décoration","Objets décoratifs, accessoires maison.","Maison et quotidien","Palette","medium"],
  ["Boutique de cadeaux","Objets cadeaux, articles saisonniers.","Maison et quotidien","Gift","high"],
  ["Papeterie","Carnets, stylos, fournitures de bureau.","Maison et quotidien","PenLine","medium"],
  ["Boutique de bougies","Bougies, diffuseurs, parfums d'ambiance.","Maison et quotidien","Flame","medium"],
  ["Magasin d'articles ménagers","Ustensiles, rangement, produits quotidiens.","Maison et quotidien","Home","medium"],
  ["Boutique de vaisselle","Assiettes, verres, ustensiles.","Maison et quotidien","UtensilsCrossed","low"],
  ["Boutique écologique maison","Nettoyants, recharges, accessoires durables.","Maison et quotidien","Recycle","medium"],
  // Mode
  ["Boutique de vêtements","Vêtements homme, femme, enfant.","Mode et accessoires","Shirt","medium"],
  ["Friperie","Vêtements seconde main, vintage.","Mode et accessoires","Recycle","medium"],
  ["Boutique de mode locale","Créateurs locaux, petites séries.","Mode et accessoires","Sparkles","medium"],
  ["Magasin de chaussures","Chaussures ville, sport, confort.","Mode et accessoires","Footprints","medium"],
  ["Bijouterie indépendante","Bijoux fins ou fantaisie, créations.","Mode et accessoires","Gem","medium"],
  ["Maroquinerie","Sacs, portefeuilles, ceintures cuir.","Mode et accessoires","Briefcase","low"],
  ["Boutique pour enfants","Vêtements, cadeaux, accessoires bébé.","Mode et accessoires","Baby","medium"],
  ["Chapellerie","Casquettes, chapeaux, accessoires tête.","Mode et accessoires","Hat","low"],
  ["Boutique d'accessoires mode","Foulards, ceintures, lunettes soleil.","Mode et accessoires","Glasses","low"],
  // Culture / Loisirs
  ["Librairie indépendante","Livres, papeterie, cadeaux culturels.","Culture, loisirs et niche","BookOpen","medium"],
  ["Boutique de jeux et jouets","Jouets éducatifs, jeux de société.","Culture, loisirs et niche","Gamepad","medium"],
  ["Animalerie indépendante","Nourriture, accessoires animaux.","Culture, loisirs et niche","Dog","medium"],
  ["Boutique de souvenirs","Produits touristiques, cadeaux locaux.","Culture, loisirs et niche","MapPin","medium"],
  ["Boutique d'artisanat local","Objets faits main, déco, bijoux.","Culture, loisirs et niche","HandMetal","medium"],
  ["Boutique produits québécois","Cadeaux gourmands, artisanat régional.","Culture, loisirs et niche","MapPin","high"],
  ["Magasin multi-produits","Commerce hybride dépanneur-boutique.","Culture, loisirs et niche","Store","high"],
  ["Boutique de sport","Articles sportifs, équipements, accessoires.","Culture, loisirs et niche","Trophy","medium"],
  ["Magasin téléphonie","Coques, câbles, chargeurs, gadgets.","Culture, loisirs et niche","Smartphone","medium"],
  ["Disquaire","Vinyles, CD, accessoires audio.","Culture, loisirs et niche","Disc","low"],
  ["Boutique matériel artiste","Peinture, pinceaux, matériel créatif.","Culture, loisirs et niche","Palette","low"],
  ["Boutique de fêtes","Décorations, ballons, accessoires événements.","Culture, loisirs et niche","PartyPopper","medium"],
  ["Boutique saisonnière","Noël, Halloween, Pâques, cadeaux.","Culture, loisirs et niche","Calendar","medium"],
  ["Kiosque journaux et loterie","Presse, billets, petits articles.","Culture, loisirs et niche","Newspaper","medium"],
  ["Boutique ésotérique","Encens, pierres, cartes, bougies.","Culture, loisirs et niche","Stars","low"],
  ["Boutique de vélo","Vélos, casques, pièces, accessoires.","Culture, loisirs et niche","Bike","low"],
];

async function seed() {
  console.log(`\n🏪 Seed ${TYPES.length} types de commerce...\n`);
  const col = collection(db, "commerce_types");
  let ok = 0, fail = 0;
  
  for (let i = 0; i < TYPES.length; i++) {
    const [name, desc, group, icon, priority] = TYPES[i];
    const slug = slugify(name);
    const id = `${String(i+1).padStart(3,"0")}-${slug}`;
    try {
      await setDoc(doc(col, id), {
        id, sortOrder: i+1, name, slug, description: desc,
        group, icon, priority, isActive: true, storeCount: 0,
        createdAt: new Date(), updatedAt: new Date()
      });
      process.stdout.write(`✅ [${i+1}/${TYPES.length}] ${name}\n`);
      ok++;
    } catch(e) {
      process.stdout.write(`❌ [${i+1}] ${name}: ${e.message}\n`);
      fail++;
    }
  }
  console.log(`\n✅ ${ok} OK  ❌ ${fail} erreurs`);
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
