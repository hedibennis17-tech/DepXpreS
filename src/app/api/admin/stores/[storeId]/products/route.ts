export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(_: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const { storeId } = await params;
    const ids = new Set<string>([storeId]);

    // 1. Récupérer le doc store pour trouver tous les IDs liés
    const storeDoc = await adminDb.collection('stores').doc(storeId).get();
    if (storeDoc.exists) {
      const d = storeDoc.data()!;
      [d.ownerId, d.userId, d.uid, d.id].forEach(v => v && ids.add(v));
    }

    // 2. Chercher dans app_users
    const [byStoreId, byUid] = await Promise.all([
      adminDb.collection('app_users').where('storeId', '==', storeId).limit(3).get(),
      adminDb.collection('app_users').where('uid', '==', storeId).limit(1).get(),
    ]);
    [...byStoreId.docs, ...byUid.docs].forEach(d => {
      ids.add(d.id);
      const data = d.data();
      [data.uid, data.storeId].forEach(v => v && ids.add(v));
    });

    // 3. Chercher produits avec tous les IDs
    let products: any[] = [];
    for (const id of ids) {
      const snap = await adminDb.collection('products')
        .where('storeId', '==', id).get();
      if (!snap.empty) {
        products = snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name || '',
            price: Number(data.price) || 0,
            categoryName: data.categoryName || data.category || 'Général',
            categoryId: data.categoryId || '',
            description: data.description || '',
            imageUrl: data.imageUrl || data.image || '',
            inStock: data.inStock !== false,
          };
        }).sort((a,b) => a.name.localeCompare(b.name));
        break;
      }
    }

    return NextResponse.json({ products, total: products.length, debug_ids: [...ids] });
  } catch (e) {
    return NextResponse.json({ error: String(e), products: [] }, { status: 500 });
  }
}
