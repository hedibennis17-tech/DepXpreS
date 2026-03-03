export const runtime = "nodejs";
/**
 * GET  /api/admin/users  — Lister tous les utilisateurs (users.read)
 * POST /api/admin/users  — Créer admin/dispatcher/agent (users.create, super_admin uniquement)
 * Équivalent Firebase des endpoints Supabase admin users
 */
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { requirePermission, handleAuthError } from '@/lib/auth/auth-guards';
import { ROLE_PERMISSIONS, type RoleKey } from '@/lib/auth/roles-permissions';

// ============================================================
// GET /api/admin/users
// ============================================================
export async function GET(req: NextRequest) {
  try {
    const authUser = await requirePermission(req, 'users.read');

    const { searchParams } = new URL(req.url);
    const role   = searchParams.get('role') || null;
    const status = searchParams.get('status') || null;
    const q      = searchParams.get('q') || null;
    const limit  = Math.min(parseInt(searchParams.get('limit') || '50'), 200);

    let query: FirebaseFirestore.Query = adminDb.collection('app_users');

    if (role)   query = query.where('primary_role', '==', role);
    if (status) query = query.where('status', '==', status);

    query = query.orderBy('created_at', 'desc').limit(limit);

    const snapshot = await query.get();
    let rows = snapshot.docs.map(doc => {
      const d = doc.data();
      return {
        id:            doc.id,
        email:         d.email,
        phone:         d.phone,
        display_name:  d.display_name,
        first_name:    d.first_name,
        last_name:     d.last_name,
        primary_role:  d.primary_role,
        status:        d.status,
        is_email_verified: d.is_email_verified,
        created_at:    d.created_at,
      };
    });

    // Filtre texte côté serveur (Firestore ne supporte pas ilike)
    if (q) {
      const ql = q.toLowerCase();
      rows = rows.filter(u =>
        (u.display_name ?? '').toLowerCase().includes(ql) ||
        (u.email ?? '').toLowerCase().includes(ql)
      );
    }

    return NextResponse.json({ ok: true, rows, total: rows.length });

  } catch (error) {
    return handleAuthError(error);
  }
}

// ============================================================
// POST /api/admin/users — Créer admin/dispatcher/agent
// Réservé au super_admin uniquement (users.create)
// ============================================================
type CreateAdminBody = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'admin' | 'dispatcher' | 'agent';
};

export async function POST(req: NextRequest) {
  try {
    // Seul super_admin peut créer des comptes équipe
    const authUser = await requirePermission(req, 'users.create');

    const body = (await req.json()) as CreateAdminBody;

    const email     = body.email?.trim().toLowerCase();
    const password  = body.password?.trim();
    const firstName = body.firstName?.trim();
    const lastName  = body.lastName?.trim();
    const phone     = body.phone?.trim() || null;
    const role      = body.role;

    // Validation
    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        { ok: false, error: 'MISSING_REQUIRED_FIELDS' },
        { status: 400 }
      );
    }

    if (!['admin', 'dispatcher', 'agent'].includes(role)) {
      return NextResponse.json(
        { ok: false, error: 'INVALID_ROLE' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { ok: false, error: 'PASSWORD_TOO_SHORT' },
        { status: 400 }
      );
    }

    const fullName = `${firstName} ${lastName}`.trim();
    const now = FieldValue.serverTimestamp();

    // 1. Créer le compte Firebase Auth
    let userRecord;
    try {
      userRecord = await adminAuth.createUser({
        email,
        password,
        displayName: fullName,
        phoneNumber: phone ? (phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`) : undefined,
        emailVerified: false,
      });
    } catch (authError: unknown) {
      const err = authError as { code?: string; message?: string };
      if (err.code === 'auth/email-already-exists') {
        return NextResponse.json({ ok: false, error: 'EMAIL_ALREADY_EXISTS' }, { status: 409 });
      }
      return NextResponse.json(
        { ok: false, error: err.message || 'AUTH_CREATE_FAILED' },
        { status: 400 }
      );
    }

    const userId = userRecord.uid;

    // 2. Créer app_users + admin_profiles dans Firestore (batch atomique)
    // Équivalent Firebase de create_admin_profile() SQL
    const batch = adminDb.batch();

    // app_users
    const appUserRef = adminDb.collection('app_users').doc(userId);
    batch.set(appUserRef, {
      id: userId,
      email,
      phone,
      display_name: fullName,
      first_name: firstName,
      last_name: lastName,
      primary_role: role,
      status: 'active',
      is_email_verified: false,
      is_phone_verified: false,
      created_by: authUser.uid,
      created_at: now,
      updated_at: now,
    });

    // admin_profiles — structure identique au schéma SQL
    const adminProfileRef = adminDb.collection('admin_profiles').doc(userId);
    batch.set(adminProfileRef, {
      user_id: userId,
      role_key: role,
      full_name: fullName,
      is_super_admin: false,
      invited_by: authUser.uid,
      created_at: now,
      updated_at: now,
    });

    try {
      await batch.commit();
    } catch (dbError) {
      await adminAuth.deleteUser(userId).catch(() => {});
      console.error('Firestore batch error:', dbError);
      return NextResponse.json(
        { ok: false, error: 'PROFILE_CREATE_FAILED' },
        { status: 500 }
      );
    }

    // 3. Définir le custom claim role dans Firebase Auth
    await adminAuth.setCustomUserClaims(userId, { role });

    return NextResponse.json({
      ok: true,
      userId,
      role,
    }, { status: 201 });

  } catch (error) {
    return handleAuthError(error);
  }
}
