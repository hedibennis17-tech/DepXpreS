export const runtime = "nodejs";
export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { TAXONOMY } from "@/lib/taxonomy";

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("secret") !== "depxpres-seed-v3-2026")
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    let catCount = 0, subCount = 0;
    const BATCH = 400;

    // Commerce types
    const ctBatch = adminDb.batch();
    TAXONOMY.forEach(({ categories: _, ...ct }) =>
      ctBatch.set(adminDb.collection("taxonomy_commerce_types").doc(ct.id), ct)
    );
    await ctBatch.commit();

    // Categories
    const catDocs = TAXONOMY.flatMap(ct =>
      ct.categories.map(({ subcategories: _, ...cat }) => cat)
    );
    for (let i = 0; i < catDocs.length; i += BATCH) {
      const b = adminDb.batch();
      catDocs.slice(i, i + BATCH).forEach(d => {
        b.set(adminDb.collection("taxonomy_categories").doc(d.id), d);
        catCount++;
      });
      await b.commit();
    }

    // Subcategories
    const subDocs = TAXONOMY.flatMap(ct => ct.categories.flatMap(c => c.subcategories));
    for (let i = 0; i < subDocs.length; i += BATCH) {
      const b = adminDb.batch();
      subDocs.slice(i, i + BATCH).forEach(d => {
        b.set(adminDb.collection("taxonomy_subcategories").doc(d.id), d);
        subCount++;
      });
      await b.commit();
    }

    return NextResponse.json({
      ok: true,
      message: "Taxonomie v3 seedée ✅",
      stats: { commerce_types: TAXONOMY.length, categories: catCount, subcategories: subCount }
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
