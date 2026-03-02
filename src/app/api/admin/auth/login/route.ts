import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

const ADMIN_ROLES = ['super_admin', 'admin', 'dispatcher', 'agent'];

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

    // Récupérer l'utilisateur dans app_users
    const userDoc = await adminDb.collection('app_users').doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Compte introuvable.' }, { status: 404 });
    }

    const userData = userDoc.data()!;
    const role = userData.primary_role;

    // Vérifier que c'est bien un rôle admin
    if (!ADMIN_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Accès refusé. Ce compte n\'a pas les droits d\'administration.' }, { status: 403 });
    }

    // Vérifier que le compte est actif
    if (userData.status === 'blocked' || userData.status === 'suspended') {
      return NextResponse.json({ error: 'Votre compte a été suspendu.' }, { status: 403 });
    }

    // Mettre à jour la dernière connexion
    await adminDb.collection('app_users').doc(uid).update({
      last_login: new Date(),
    });

    // Créer le cookie de session (uid:role)
    const sessionValue = `${uid}:${role}`;

    const response = NextResponse.json({
      success: true,
      uid,
      role,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
    });

    // Définir le cookie de session admin (7 jours)
    response.cookies.set('admin_session', sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Admin login error:', error);
    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json({ error: 'Session expirée.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erreur d\'authentification.' }, { status: 401 });
  }
}

export async function DELETE(req: NextRequest) {
  // Logout admin
  const response = NextResponse.json({ success: true, message: 'Déconnexion réussie.' });
  response.cookies.delete('admin_session');
  return response;
}
