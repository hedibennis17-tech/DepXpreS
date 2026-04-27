export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storeId, products, catalogueType } = body;
    if (!storeId || !products?.length) {
      return NextResponse.json({ error: "storeId et products requis" }, { status: 400 });
    }

    // Vérifier que le store existe
    const storeDoc = await adminDb.collection("stores").doc(storeId).get();
    if (!storeDoc.exists) {
      return NextResponse.json({ error: "Store introuvable" }, { status: 404 });
    }

    // Déterminer la catégorie selon le type de catalogue
    const catConfig = catalogueType === "fruits"
      ? { name: "Fruits & Légumes", slug: "fruits-legumes", emoji: "🥦", order: 1 }
      : { name: "Pharmacie / Santé", slug: "pharmacie-sante", emoji: "💊", order: 0 };

    const catSnap = await adminDb.collection("categories")
      .where("storeId", "==", storeId)
      .where("name", "==", catConfig.name).get();

    let categoryId: string;
    if (catSnap.empty) {
      const catRef = await adminDb.collection("categories").add({
        ...catConfig, storeId, createdAt: FieldValue.serverTimestamp(),
      });
      categoryId = catRef.id;
    } else {
      categoryId = catSnap.docs[0].id;
    }

    // Créer les sous-catégories
    const subCatIds: Record<string, string> = {};
    const uniqueSubs = [...new Set(products.map((p: any) => p.subcategory))];
    
    for (const subName of uniqueSubs) {
      const subSnap = await adminDb.collection("subcategories")
        .where("storeId", "==", storeId)
        .where("name", "==", subName).get();
      
      if (subSnap.empty) {
        const subRef = await adminDb.collection("subcategories").add({
          name: subName,
          categoryId,
          storeId,
          createdAt: FieldValue.serverTimestamp(),
        });
        subCatIds[subName as string] = subRef.id;
      } else {
        subCatIds[subName as string] = subSnap.docs[0].id;
      }
    }

    // Importer les produits par batch de 20
    const BATCH_SIZE = 20;
    let imported = 0;
    let skipped = 0;

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = adminDb.batch();
      const chunk = products.slice(i, i + BATCH_SIZE);

      for (const p of chunk) {
        // Vérifier si produit existe déjà (par SKU)
        const existing = await adminDb.collection("products")
          .where("storeId", "==", storeId)
          .where("sku", "==", p.sku).get();

        if (!existing.empty) { skipped++; continue; }

        const docRef = adminDb.collection("products").doc();
        batch.set(docRef, {
          storeId,
          categoryId,
          categoryName: catConfig.name,
          subcategoryId: subCatIds[p.subcategory] || "",
          subcategoryName: p.subcategory,
          sku: p.sku,
          name: p.name || p.name_fr || "",
          brand: p.brand || "",
          description: p.activeIngredient ? `Ingrédient actif: ${p.activeIngredient}` : "",
          price: typeof p.priceEstimateCAD === "object"
              ? Math.round(((p.priceEstimateCAD.min||0)+(p.priceEstimateCAD.max||0))/2*100)/100
              : (p.price || p.priceEstimateCAD || 0),
          imageUrl: p.imageUrl || "",
          inStock: true,
          stock: 50, // stock par défaut
          requiresPrescription: p.requiresPrescription || false,
          requiresAgeCheck: p.requiresAgeCheck || false,
          requiresPharmacistNotice: p.requiresPharmacistNotice || false,
          deliveryAllowed: p.deliveryAllowed !== false,
          warnings: p.warnings || [],
          type: p.type || "OTC_OR_HEALTHCARE",
          isOrganic: p.isOrganic || false,
          isLocal: p.isLocal || false,
          unit: p.unit || "unité",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
        imported++;
      }
      await batch.commit();
    }

    return NextResponse.json({
      ok: true,
      imported,
      skipped,
      categoryId,
      totalProducts: products.length,
    });
  } catch(e) {
    console.error("import-catalogue error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
