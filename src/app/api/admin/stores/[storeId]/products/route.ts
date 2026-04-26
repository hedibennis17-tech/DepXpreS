export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(_: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const { storeId } = await params;

    // Stratégie 1: chercher produits avec storeId == doc.id du store
    let snap = await adminDb.collection('products')
      .where('storeId', '==', storeId)
      .orderBy('name', 'asc').get();

    // Stratégie 2: si vide, chercher via le userId du propriétaire du store
    if (snap.empty) {
      const storeDoc = await adminDb.collection('stores').doc(storeId).get();
      if (storeDoc.exists) {
        const storeData = storeDoc.data();
        const ownerId = storeData?.userId || storeData?.ownerId || storeData?.uid;
        if (ownerId && ownerId !== storeId) {
          snap = await adminDb.collection('products')
            .where('storeId', '==', ownerId)
            .orderBy('name', 'asc').get();
        }
      }
    }

    const products = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name || '',
        price: data.price || 0,
        categoryName: data.categoryName || data.category || 'Général',
        categoryId: data.categoryId || '',
        description: data.description || '',
        imageUrl: data.imageUrl || data.image || '',
        inStock: data.inStock !== false,
        storeId: data.storeId,
      };
    });

    return NextResponse.json({ products, total: products.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
