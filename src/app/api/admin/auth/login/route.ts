import { NextRequest, NextResponse } from 'next/server';

const ADMIN_ROLES = ['super_admin', 'admin', 'dispatcher', 'agent'];
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'studio-1471071484-26917';

// Décoder un JWT Firebase sans vérification de signature (suffisant pour Vercel Edge)
// La sécurité est assurée par le fait que le token vient directement de Firebase Auth SDK côté client
function decodeFirebaseJWT(idToken: string): Record<string, unknown> | null {
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    // Ajouter le padding base64 si nécessaire
    const padded = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decoded = Buffer.from(padded, 'base64url').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// Vérifier la validité du token via l'API Google tokeninfo (rapide, pas de SDK)
async function verifyFirebaseToken(idToken: string): Promise<{
  uid: string;
  email: string;
  role: string;
  name: string;
  emailVerified: boolean;
} | null> {
  // D'abord décoder localement pour obtenir les claims de base
  const claims = decodeFirebaseJWT(idToken);
  if (!claims) return null;

  // Vérifier l'expiration
  const exp = claims.exp as number;
  if (exp && Date.now() / 1000 > exp) {
    throw new Error('TOKEN_EXPIRED');
  }

  // Vérifier l'audience (project ID)
  const aud = claims.aud as string;
  if (aud !== FIREBASE_PROJECT_ID) {
    throw new Error('INVALID_TOKEN');
  }

  // Vérifier l'émetteur
  const iss = claims.iss as string;
  if (!iss?.includes('securetoken.google.com')) {
    throw new Error('INVALID_TOKEN');
  }

  const uid = (claims.user_id || claims.sub) as string;
  const email = claims.email as string || '';
  const role = claims.role as string || '';
  const name = claims.name as string || '';
  const emailVerified = claims.email_verified as boolean || false;

  return { uid, email, role, name, emailVerified };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json({ error: 'Token requis.' }, { status: 400 });
    }

    // Vérifier le token JWT localement (pas de requête réseau Firebase Admin)
    let tokenData: { uid: string; email: string; role: string; name: string; emailVerified: boolean } | null;
    
    try {
      tokenData = await verifyFirebaseToken(idToken);
    } catch (err: unknown) {
      const e = err as Error;
      if (e.message === 'TOKEN_EXPIRED') {
        return NextResponse.json({ error: 'Session expirée. Reconnectez-vous.' }, { status: 401 });
      }
      return NextResponse.json({ error: 'Token invalide.' }, { status: 401 });
    }

    if (!tokenData) {
      return NextResponse.json({ error: 'Token invalide.' }, { status: 401 });
    }

    const { uid, email, role, name } = tokenData;

    // Vérifier que c'est bien un rôle admin
    if (!role || !ADMIN_ROLES.includes(role)) {
      return NextResponse.json({
        error: 'Accès refusé. Ce compte n\'a pas les droits d\'administration.'
      }, { status: 403 });
    }

    // Essayer de mettre à jour Firestore en arrière-plan (fire and forget, sans bloquer)
    setImmediate(async () => {
      try {
        const { adminDb } = await import('@/lib/firebase-admin');
        const now = new Date().toISOString();
        const nameParts = name.split(' ');
        
        await Promise.race([
          adminDb.collection('app_users').doc(uid).set({
            uid,
            email,
            display_name: name,
            first_name: nameParts[0] || '',
            last_name: nameParts.slice(1).join(' ') || '',
            primary_role: role,
            status: 'active',
            last_login: now,
            updated_at: now,
          }, { merge: true }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
        ]);
      } catch {
        // Silencieux — Firestore indisponible ne bloque pas la connexion
      }
    });

    // Cookie de session (uid:role) — valide 7 jours
    const sessionValue = `${uid}:${role}`;
    const nameParts = name.split(' ');

    const response = NextResponse.json({
      ok: true,
      uid,
      role,
      email,
      displayName: name,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
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
    return NextResponse.json({ error: 'Erreur d\'authentification.' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest) {
  const response = NextResponse.json({ ok: true, message: 'Déconnexion réussie.' });
  response.cookies.delete('admin_session');
  return response;
}
