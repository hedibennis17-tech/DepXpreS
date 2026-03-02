import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

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

    // Récupérer l'utilisateur Firebase Auth
    const firebaseUser = await adminAuth.getUser(uid);
    const claims = firebaseUser.customClaims as Record<string, string> | null;
    const claimRole = claims?.role;

    // Récupérer ou créer le document app_users
    let userDoc = await adminDb.collection('app_users').doc(uid).get();
    let role: string;

    if (!userDoc.exists) {
      // Si le compte n'existe pas dans Firestore mais a un claim admin valide → auto-créer
      if (claimRole && ADMIN_ROLES.includes(claimRole)) {
        role = claimRole;
        const now = new Date().toISOString();
        const newUserData = {
          uid,
          email: firebaseUser.email || '',
          display_name: firebaseUser.displayName || '',
          first_name: firebaseUser.displayName?.split(' ')[0] || '',
          last_name: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          primary_role: role,
          status: 'active',
          is_email_verified: firebaseUser.emailVerified,
          is_phone_verified: false,
          created_at: now,
          updated_at: now,
          last_login: now,
        };
        try {
          await adminDb.collection('app_users').doc(uid).set(newUserData);
          // Créer admin_profiles aussi
          await adminDb.collection('admin_profiles').doc(uid).set({
            uid,
            email: firebaseUser.email || '',
            display_name: firebaseUser.displayName || '',
            role_key: role,
            permissions: {
              'orders.read': true, 'orders.write': true,
              'drivers.read': true, 'drivers.write': true,
              'clients.read': true, 'clients.write': true,
              'users.read': true, 'users.write': true,
              'dispatch.manual': true, 'dispatch.auto': true,
              'finance.read': true, 'finance.write': true,
              'support.read': true, 'support.write': true,
              'settings.read': true, 'settings.write': true,
              'promotions.read': true, 'promotions.write': true,
            },
            created_at: now,
            updated_at: now,
          });
          userDoc = await adminDb.collection('app_users').doc(uid).get();
        } catch {
          // Quota Firestore dépassé — on continue quand même avec les claims
          console.warn('Firestore quota exceeded during auto-create, using claims only');
        }
      } else {
        return NextResponse.json({ error: 'Compte introuvable. Contactez l\'administrateur.' }, { status: 404 });
      }
    } else {
      const userData = userDoc.data()!;
      role = userData.primary_role;
    }

    // Vérifier que c'est bien un rôle admin
    if (!ADMIN_ROLES.includes(role)) {
      return NextResponse.json({
        error: 'Accès refusé. Ce compte n\'a pas les droits d\'administration.'
      }, { status: 403 });
    }

    // Vérifier le statut si le document existe
    if (userDoc.exists) {
      const userData = userDoc.data()!;
      if (userData.status === 'blocked' || userData.status === 'suspended') {
        return NextResponse.json({ error: 'Votre compte a été suspendu ou bloqué.' }, { status: 403 });
      }
    }

    // Mettre à jour la dernière connexion (best effort)
    try {
      await adminDb.collection('app_users').doc(uid).update({
        last_login: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      });
    } catch {
      // Quota — ignorer
    }

    // Cookie de session (uid:role)
    const sessionValue = `${uid}:${role}`;

    const userData = userDoc.exists ? userDoc.data()! : {};
    const response = NextResponse.json({
      ok: true,
      uid,
      role,
      firstName: userData.first_name || firebaseUser.displayName?.split(' ')[0] || '',
      lastName: userData.last_name || firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
      email: userData.email || firebaseUser.email || '',
    });

    // Cookie de session admin (7 jours)
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
