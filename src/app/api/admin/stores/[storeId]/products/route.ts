export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(_: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const { storeId } = await params;

    // Collecte tous les IDs possibles pour ce store
    const possibleIds = new Set<string>([storeId]);

    // Chercher le document store pour trouver ownerId/userId
    const storeDoc = await adminDb.collection('stores').doc(storeId).get();
    if (storeDoc.exists) {
      const data = storeDoc.data()!;
      if (data.ownerId)  possibleIds.add(data.ownerId);
      if (data.userId)   possibleIds.add(data.userId);
      if (data.uid)      possibleIds.add(data.uid);
      if (data.id)       possibleIds.add(data.id);
    }

    // Chercher aussi dans app_users si un user a storeId = ce storeId
    const usersSnap = await adminDb.collection('app_users')
      .where('storeId', '==', storeId).limit(1).get();
    if (!usersSnap.empty) {
      const userData = usersSnap.docs[0].data();
      possibleIds.add(usersSnap.docs[0].id);
      if (userData.uid) possibleIds.add(userData.uid);
    }

    // Chercher les produits avec tous les IDs possibles
    let allProducts: any[] = [];
    for (const id of possibleIds) {
      const snap = await adminDb.collection('products')
        .where('storeId', '==', id)
        .orderBy('name', 'asc').get();
      if (!snap.empty) {
        allProducts = snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name || '',
            price: typeof data.price === 'number' ? data.price : parseFloat(data.price) || 0,
            categoryName: data.categoryName || data.category || 'Général',
            categoryId: data.categoryId || '',
            description: data.description || '',
            imageUrl: data.imageUrl || data.image || '',
            inStock: data.inStock !== false && data.is_available !== false,
            storeId: data.storeId,
          };
        });
        break; // On a trouvé des produits — stop
      }
    }

    return NextResponse.json({ products: allProducts, total: allProducts.length });
  } catch (e) {
    return NextResponse.json({ error: String(e), products: [] }, { status: 500 });
  }
}
