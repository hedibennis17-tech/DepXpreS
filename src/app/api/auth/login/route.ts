export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json({ error: 'Token requis.' }, { status: 400 });
    }

    // Vérifier le token Firebase
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // Récupérer les infos de l'utilisateur
    const userDoc = await adminDb.collection('app_users').doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Utilisateur introuvable.' }, { status: 404 });
    }

    const userData = userDoc.data()!;

    // Vérifier que le compte est actif
    if (userData.status === 'blocked' || userData.status === 'suspended') {
      return NextResponse.json({ error: 'Votre compte a été suspendu. Contactez le support.' }, { status: 403 });
    }

    // Mettre à jour la dernière connexion
    await adminDb.collection('app_users').doc(uid).update({
      last_login: new Date(),
    });

    return NextResponse.json({
      success: true,
      uid,
      role: userData.primary_role,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
    });

  } catch (error: any) {
    console.error('Login error:', error);
    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json({ error: 'Session expirée. Veuillez vous reconnecter.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erreur d\'authentification.' }, { status: 401 });
  }
}
