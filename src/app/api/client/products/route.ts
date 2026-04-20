export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const zone = searchParams.get("zone") || "";

    // Charger tous les produits via Admin SDK (bypass règles Firestore)
    const snap = await adminDb.collection("products").limit(100).get();
    
    // Classification automatique par nom si pas de catégorie
    function guessCategory(name: string): string {
      const n = name.toLowerCase();
      if (/bière|beer|budweiser|heineken|corona|lager|ipa|ale|blonde|rousse|stout/.test(n)) return "alcool";
      if (/vodka|rhum|gin|whisky|tequila|vin|champagne|mousseux|spiritueux/.test(n)) return "alcool";
      if (/chips|lays|doritos|pringles|nachos|craquelin|pop-corn|popcorn|pretzels/.test(n)) return "snacks";
      if (/chocolat|kit kat|reese|snickers|bounty|twix|bonbon|caramel|candy/.test(n)) return "chocolat";
      if (/coca|pepsi|sprite|fanta|red bull|monster|gatorade|powerade|eau|evian|perrier|starbucks|café|coffee|thé|tea|jus|juice/.test(n)) return "boissons";
      if (/marlboro|export|cigarette|tabac|cigare|vape|elf bar|e-liquide|vapotage/.test(n)) return "tabac";
      if (/lait|pain|beurre|oeuf|fromage|yogourt|crème|farine|riz|pâtes/.test(n)) return "epicerie";
      if (/savon|shampoing|dentifrice|colgate|dove|hygiene|papier toilette|sac poubelle|ménager/.test(n)) return "hygiene";
      if (/couche|bébé|baby|biberon|lingette/.test(n)) return "bebe";
      if (/lotto|gratteux|billet|loterie/.test(n)) return "loterie";
      if (/fleur|bouquet|rose|plante/.test(n)) return "fleurs";
      if (/chargeur|pile|usb|cable|batterie|électronique/.test(n)) return "electronique";
      return "autres";
    }

    const products = snap.docs
      .map(d => {
        const data = d.data();
        const name = data.name || "";
        const categoryName = data.categoryName || data.category || guessCategory(name);
        return {
          id: d.id,
          name,
          price: data.price || 0,
          imageUrl: data.imageUrl || "",
          categoryName,
          subcategoryName: data.subcategoryName || "",
          storeId: data.storeId || "",
          storeName: data.storeName || "",
          isAvailable: data.isAvailable,
          isActive: data.isActive,
        };
      })
      .filter(p =>
        p.name && p.price > 0 &&
        (p.isAvailable === true || p.isActive === true ||
         (p.isAvailable === undefined && p.isActive === undefined))
      );

    return NextResponse.json({ ok: true, products, total: products.length });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
