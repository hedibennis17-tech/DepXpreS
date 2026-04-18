export const runtime = "nodejs";
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { TAXONOMY } from "@/lib/taxonomy";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== "depxpres-seed-taxonomy-2026") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    let ctCount = 0, catCount = 0, subCount = 0;
    const BATCH = 400;

    // ── Commerce types ────────────────────────────────────────────
    const ctDocs = TAXONOMY.map(({ categories: _, ...ct }) => ct);
    for (let i = 0; i < ctDocs.length; i += BATCH) {
      const batch = adminDb.batch();
      ctDocs.slice(i, i + BATCH).forEach(d => {
        batch.set(adminDb.collection("taxonomy_commerce_types").doc(d.id), d);
        ctCount++;
      });
      await batch.commit();
    }

    // ── Categories ────────────────────────────────────────────────
    const catDocs = TAXONOMY.flatMap(ct =>
      ct.categories.map(({ subcategories: _, ...cat }) => cat)
    );
    for (let i = 0; i < catDocs.length; i += BATCH) {
      const batch = adminDb.batch();
      catDocs.slice(i, i + BATCH).forEach(d => {
        batch.set(adminDb.collection("taxonomy_categories").doc(d.id), d);
        catCount++;
      });
      await batch.commit();
    }

    // ── Subcategories ─────────────────────────────────────────────
    const subDocs = TAXONOMY.flatMap(ct =>
      ct.categories.flatMap(cat => cat.subcategories)
    );
    for (let i = 0; i < subDocs.length; i += BATCH) {
      const batch = adminDb.batch();
      subDocs.slice(i, i + BATCH).forEach(d => {
        batch.set(adminDb.collection("taxonomy_subcategories").doc(d.id), d);
        subCount++;
      });
      await batch.commit();
    }

    return NextResponse.json({
      ok: true,
      message: "Taxonomie seedée avec succès ✅",
      stats: {
        commerce_types: ctCount,
        categories: catCount,
        subcategories: subCount,
      }
    });

  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
