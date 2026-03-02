import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const ADMIN_ROLES = ['super_admin', 'admin', 'dispatcher', 'agent'];

function getSessionRole(req: NextRequest): { uid: string; role: string } | null {
  const cookie = req.cookies.get('admin_session')?.value;
  if (!cookie) return null;
  const [uid, role] = cookie.split(':');
  if (!uid || !role) return null;
  return { uid, role };
}

// GET /api/admin/users - Lister tous les utilisateurs
export async function GET(req: NextRequest) {
  const session = getSessionRole(req);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }
  if (!ADMIN_ROLES.includes(session.role)) {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get('role');
    const limitParam = parseInt(searchParams.get('limit') || '50');

    let query: FirebaseFirestore.Query = adminDb.collection('app_users');

    if (roleFilter) {
      query = query.where('primary_role', '==', roleFilter);
    }

    query = query.orderBy('created_at', 'desc').limit(limitParam);

    const snapshot = await query.get();
    const users = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        uid: data.uid,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        primary_role: data.primary_role,
        status: data.status,
        is_email_verified: data.is_email_verified,
        last_login: data.last_login,
        created_at: data.created_at,
      };
    });

    return NextResponse.json({ users, total: users.length });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des utilisateurs.' }, { status: 500 });
  }
}

// POST /api/admin/users - Créer un admin/dispatcher/agent (super_admin uniquement)
export async function POST(req: NextRequest) {
  const session = getSessionRole(req);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  // Seul super_admin peut créer des comptes admin/dispatcher/agent
  if (session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Seul le super administrateur peut créer des comptes d\'équipe.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { email, password, firstName, lastName, phone, role } = body;

    // Validation
    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Email, mot de passe et rôle sont requis.' }, { status: 400 });
    }

    const allowedRoles = ['admin', 'dispatcher', 'agent'];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: 'Rôle invalide. Valeurs acceptées : admin, dispatcher, agent.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caractères.' }, { status: 400 });
    }

    // 1. Créer dans Firebase Auth
    const userRecord = await adminAuth.createUser({
      email: email.trim().toLowerCase(),
      password,
      displayName: firstName && lastName ? `${firstName} ${lastName}` : undefined,
      phoneNumber: phone ? (phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`) : undefined,
    });

    const uid = userRecord.uid;
    const now = FieldValue.serverTimestamp();

    // 2. Créer dans app_users
    await adminDb.collection('app_users').doc(uid).set({
      uid,
      email: email.trim().toLowerCase(),
      firstName: firstName || '',
      lastName: lastName || '',
      phone: phone || '',
      primary_role: role,
      status: 'active',
      is_email_verified: false,
      created_by: session.uid,
      created_at: now,
      updated_at: now,
    });

    // 3. Créer le profil admin
    await adminDb.collection('admin_profiles').doc(uid).set({
      id: uid,
      userId: uid,
      firstName: firstName || '',
      lastName: lastName || '',
      email: email.trim().toLowerCase(),
      phone: phone || '',
      role,
      status: 'active',
      permissions: getDefaultPermissions(role),
      createdBy: session.uid,
      createdAt: now,
      updatedAt: now,
    });

    // 4. Définir le custom claim
    await adminAuth.setCustomUserClaims(uid, { role });

    return NextResponse.json({
      success: true,
      uid,
      role,
      message: `Compte ${role} créé avec succès.`,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create admin user error:', error);
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json({ error: 'Cette adresse email est déjà utilisée.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Erreur lors de la création du compte.' }, { status: 500 });
  }
}

function getDefaultPermissions(role: string): Record<string, boolean> {
  const base = {
    view_dashboard: true,
    view_orders: false,
    manage_orders: false,
    view_drivers: false,
    manage_drivers: false,
    view_clients: false,
    manage_clients: false,
    view_stores: false,
    manage_stores: false,
    view_zones: false,
    manage_zones: false,
    view_dispatch: false,
    manage_dispatch: false,
    view_tracking: false,
    view_support: false,
    manage_support: false,
    view_finance: false,
    manage_finance: false,
    view_settings: false,
    manage_settings: false,
    manage_users: false,
    create_admin: false,
  };

  if (role === 'admin') {
    return {
      ...base,
      view_orders: true,
      manage_orders: true,
      view_drivers: true,
      manage_drivers: true,
      view_clients: true,
      manage_clients: true,
      view_stores: true,
      manage_stores: true,
      view_zones: true,
      manage_zones: true,
      view_dispatch: true,
      view_tracking: true,
      view_support: true,
      manage_support: true,
      view_finance: true,
      manage_users: true,
    };
  }

  if (role === 'dispatcher') {
    return {
      ...base,
      view_orders: true,
      manage_orders: true,
      view_drivers: true,
      view_clients: true,
      view_dispatch: true,
      manage_dispatch: true,
      view_tracking: true,
    };
  }

  if (role === 'agent') {
    return {
      ...base,
      view_orders: true,
      view_clients: true,
      view_support: true,
      manage_support: true,
    };
  }

  return base;
}
