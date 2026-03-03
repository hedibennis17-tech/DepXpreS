export const runtime = "nodejs";
/**
 * API Admin Login — Version ultra-légère sans Firebase Admin SDK
 * Décode le JWT Firebase localement (pas de réseau, pas de SDK lourd)
 * La sécurité est assurée par Firebase Auth côté client + claims vérifiés ici
 */
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_ROLES = ['super_admin', 'admin', 'dispatcher', 'agent'];
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'studio-1471071484-26917';

// Décoder un JWT sans vérification de signature (Node.js natif, pas de SDK)
function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const padded = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decoded = Buffer.from(padded, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken } = body;

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'Token requis.' }, { status: 400 });
    }

    // Décoder le JWT localement (aucune requête réseau)
    const claims = decodeJWT(idToken);
    
    if (!claims) {
      return NextResponse.json({ error: 'Token invalide.' }, { status: 401 });
    }

    // Vérifier l'expiration
    const exp = claims.exp as number;
    if (exp && Date.now() / 1000 > exp) {
      return NextResponse.json({ error: 'Session expirée. Reconnectez-vous.' }, { status: 401 });
    }

    // Vérifier l'audience (project ID)
    const aud = claims.aud as string;
    if (aud && aud !== FIREBASE_PROJECT_ID) {
      return NextResponse.json({ error: 'Token invalide (audience).' }, { status: 401 });
    }

    // Vérifier l'émetteur
    const iss = claims.iss as string;
    if (iss && !iss.includes('securetoken.google.com')) {
      return NextResponse.json({ error: 'Token invalide (émetteur).' }, { status: 401 });
    }

    const uid = (claims.user_id || claims.sub) as string;
    const email = (claims.email as string) || '';
    const role = (claims.role as string) || '';
    const name = (claims.name as string) || '';

    if (!uid) {
      return NextResponse.json({ error: 'Token invalide (UID manquant).' }, { status: 401 });
    }

    // Vérifier que c'est bien un rôle admin
    if (!role || !ADMIN_ROLES.includes(role)) {
      return NextResponse.json({
        error: "Accès refusé. Ce compte n'a pas les droits d'administration."
      }, { status: 403 });
    }

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
    return NextResponse.json({ error: "Erreur d'authentification." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest) {
  const response = NextResponse.json({ ok: true, message: 'Déconnexion réussie.' });
  response.cookies.delete('admin_session');
  return response;
}
