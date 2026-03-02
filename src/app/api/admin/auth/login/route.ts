import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

const ADMIN_ROLES = ['super_admin', 'admin', 'dispatcher', 'agent'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json({ error: 'Token requis.' }, { status: 400 });
    }

    // Vérifier le token Firebase (ne dépend pas de Firestore)
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // Récupérer le rôle depuis les custom claims (définis lors de la création du compte)
    const firebaseUser = await adminAuth.getUser(uid);
    const claims = firebaseUser.customClaims as Record<string, string> | null;
    const role = claims?.role || decoded.role as string;

    // Vérifier que c'est bien un rôle admin
    if (!role || !ADMIN_ROLES.includes(role)) {
      return NextResponse.json({
        error: 'Accès refusé. Ce compte n\'a pas les droits d\'administration.'
      }, { status: 403 });
    }

    // Vérifier que le compte n'est pas désactivé
    if (firebaseUser.disabled) {
      return NextResponse.json({ error: 'Votre compte a été désactivé.' }, { status: 403 });
    }

    // Essayer de mettre à jour Firestore (best effort, ne bloque pas)
    try {
      const { adminDb } = await import('@/lib/firebase-admin');
      const now = new Date().toISOString();
      
      // Vérifier si le doc existe
      const userDoc = await Promise.race([
        adminDb.collection('app_users').doc(uid).get(),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
      ]) as FirebaseFirestore.DocumentSnapshot | null;

      if (userDoc && userDoc.exists) {
        const userData = userDoc.data()!;
        if (userData.status === 'blocked' || userData.status === 'suspended') {
          return NextResponse.json({ error: 'Votre compte a été suspendu ou bloqué.' }, { status: 403 });
        }
        // Mettre à jour last_login (fire and forget)
        adminDb.collection('app_users').doc(uid).update({ last_login: now }).catch(() => {});
      } else if (userDoc && !userDoc.exists) {
        // Créer le document si absent (fire and forget)
        adminDb.collection('app_users').doc(uid).set({
          uid,
          email: firebaseUser.email || '',
          display_name: firebaseUser.displayName || '',
          first_name: firebaseUser.displayName?.split(' ')[0] || '',
          last_name: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          primary_role: role,
          status: 'active',
          is_email_verified: firebaseUser.emailVerified,
          created_at: now,
          updated_at: now,
          last_login: now,
        }, { merge: true }).catch(() => {});
      }
    } catch {
      // Firestore indisponible ou timeout — on continue quand même
      console.warn('Firestore unavailable during login, continuing with claims only');
    }

    // Cookie de session (uid:role) — valide 7 jours
    const sessionValue = `${uid}:${role}`;

    const response = NextResponse.json({
      ok: true,
      uid,
      role,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || '',
      firstName: firebaseUser.displayName?.split(' ')[0] || '',
      lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
    });

    response.cookies.set('admin_session', sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;

  } catch (error: unknown) {
    console.error('Admin login error:', error);
    const err = error as { code?: string };
    if (err.code === 'auth/id-token-expired') {
      return NextResponse.json({ error: 'Session expirée. Reconnectez-vous.' }, { status: 401 });
    }
    if (err.code === 'auth/argument-error' || err.code === 'auth/invalid-id-token') {
      return NextResponse.json({ error: 'Token invalide.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erreur d\'authentification.' }, { status: 401 });
  }
}

export async function DELETE(_req: NextRequest) {
  const response = NextResponse.json({ ok: true, message: 'Déconnexion réussie.' });
  response.cookies.delete('admin_session');
  return response;
}
