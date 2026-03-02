/**
 * GET    /api/admin/users/[userId]  — Profil complet d'un utilisateur (users.read)
 * PATCH  /api/admin/users/[userId]  — Modifier le statut, rôle, permissions (users.write)
 * DELETE /api/admin/users/[userId]  — Supprimer un utilisateur (super_admin uniquement)
 */
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { requirePermission, requireSuperAdmin, handleAuthError } from '@/lib/auth/auth-guards';

type Params = { params: Promise<{ userId: string }> };

// ============================================================
// GET /api/admin/users/[userId]
// ============================================================
export async function GET(req: NextRequest, { params }: Params) {
  try {
    await requirePermission(req, 'users.read');
    const { userId } = await params;

    const userDoc = await adminDb.collection('app_users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ ok: false, error: 'Utilisateur introuvable.' }, { status: 404 });
    }

    const data = userDoc.data()!;

    // Récupérer le profil spécifique selon le rôle
    let profile = null;
    if (data.primary_role === 'client') {
      const p = await adminDb.collection('client_profiles').doc(userId).get();
      if (p.exists) profile = p.data();
    } else if (data.primary_role === 'driver') {
      const p = await adminDb.collection('driver_profiles').doc(userId).get();
      if (p.exists) profile = p.data();
    } else if (['admin', 'dispatcher', 'agent', 'super_admin'].includes(data.primary_role)) {
      const p = await adminDb.collection('admin_profiles').doc(userId).get();
      if (p.exists) profile = p.data();
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: userId,
        email: data.email,
        phone: data.phone,
        display_name: data.display_name,
        first_name: data.first_name,
        last_name: data.last_name,
        primary_role: data.primary_role,
        status: data.status,
        is_email_verified: data.is_email_verified,
        is_phone_verified: data.is_phone_verified,
        created_at: data.created_at,
        updated_at: data.updated_at,
      },
      profile,
    });

  } catch (error) {
    return handleAuthError(error);
  }
}

// ============================================================
// PATCH /api/admin/users/[userId]
// Actions : block, unblock, suspend, activate, change_role, reset_password, update_permissions
// ============================================================
type PatchBody = {
  action: 'block' | 'unblock' | 'suspend' | 'activate' | 'change_role' | 'reset_password' | 'update_permissions';
  role?: string;
  new_password?: string;
  reason?: string;
  permissions?: Record<string, boolean>;
};

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const authUser = await requirePermission(req, 'users.write');
    const { userId } = await params;
    const body = (await req.json()) as PatchBody;
    const { action } = body;

    if (!action) {
      return NextResponse.json({ ok: false, error: 'Action requise.' }, { status: 400 });
    }

    const userDoc = await adminDb.collection('app_users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ ok: false, error: 'Utilisateur introuvable.' }, { status: 404 });
    }

    const now = FieldValue.serverTimestamp();

    switch (action) {

      // ---- BLOQUER ----
      case 'block': {
        await adminDb.collection('app_users').doc(userId).update({
          status: 'blocked',
          blocked_by: authUser.uid,
          blocked_at: now,
          block_reason: body.reason || null,
          updated_at: now,
        });
        await adminAuth.updateUser(userId, { disabled: true });
        return NextResponse.json({ ok: true, message: 'Utilisateur bloqué.' });
      }

      // ---- DÉBLOQUER ----
      case 'unblock': {
        await adminDb.collection('app_users').doc(userId).update({
          status: 'active',
          blocked_by: null,
          blocked_at: null,
          block_reason: null,
          updated_at: now,
        });
        await adminAuth.updateUser(userId, { disabled: false });
        return NextResponse.json({ ok: true, message: 'Utilisateur débloqué.' });
      }

      // ---- SUSPENDRE ----
      case 'suspend': {
        await adminDb.collection('app_users').doc(userId).update({
          status: 'suspended',
          suspended_by: authUser.uid,
          suspended_at: now,
          suspend_reason: body.reason || null,
          updated_at: now,
        });
        await adminAuth.updateUser(userId, { disabled: true });
        return NextResponse.json({ ok: true, message: 'Utilisateur suspendu.' });
      }

      // ---- ACTIVER ----
      case 'activate': {
        await adminDb.collection('app_users').doc(userId).update({
          status: 'active',
          updated_at: now,
        });
        await adminAuth.updateUser(userId, { disabled: false });
        return NextResponse.json({ ok: true, message: 'Utilisateur activé.' });
      }

      // ---- CHANGER LE RÔLE (super_admin uniquement) ----
      case 'change_role': {
        if (authUser.role !== 'super_admin') {
          return NextResponse.json(
            { ok: false, error: 'Seul le super_admin peut changer les rôles.' },
            { status: 403 }
          );
        }
        const newRole = body.role;
        if (!newRole || !['admin', 'dispatcher', 'agent', 'client', 'driver'].includes(newRole)) {
          return NextResponse.json({ ok: false, error: 'Rôle invalide.' }, { status: 400 });
        }
        const batch = adminDb.batch();
        batch.update(adminDb.collection('app_users').doc(userId), {
          primary_role: newRole,
          updated_at: now,
        });
        // Mettre à jour admin_profiles si c'est un rôle admin
        if (['admin', 'dispatcher', 'agent'].includes(newRole)) {
          const adminProfileRef = adminDb.collection('admin_profiles').doc(userId);
          batch.set(adminProfileRef, { role_key: newRole, updated_at: now }, { merge: true });
        }
        await batch.commit();
        await adminAuth.setCustomUserClaims(userId, { role: newRole });
        return NextResponse.json({ ok: true, message: `Rôle changé en ${newRole}.` });
      }

      // ---- RÉINITIALISER LE MOT DE PASSE ----
      case 'reset_password': {
        const newPassword = body.new_password;
        if (!newPassword || newPassword.length < 8) {
          return NextResponse.json(
            { ok: false, error: 'Nouveau mot de passe invalide (min. 8 caractères).' },
            { status: 400 }
          );
        }
        await adminAuth.updateUser(userId, { password: newPassword });
        await adminDb.collection('app_users').doc(userId).update({
          password_reset_at: now,
          password_reset_by: authUser.uid,
          updated_at: now,
        });
        return NextResponse.json({ ok: true, message: 'Mot de passe réinitialisé.' });
      }

      // ---- METTRE À JOUR LES PERMISSIONS (super_admin et admin) ----
      case 'update_permissions': {
        if (!['super_admin', 'admin'].includes(authUser.role)) {
          return NextResponse.json(
            { ok: false, error: 'Accès refusé pour modifier les permissions.' },
            { status: 403 }
          );
        }
        if (!body.permissions) {
          return NextResponse.json({ ok: false, error: 'Permissions requises.' }, { status: 400 });
        }
        await adminDb.collection('admin_profiles').doc(userId).set(
          { permissions: body.permissions, updated_at: now },
          { merge: true }
        );
        return NextResponse.json({ ok: true, message: 'Permissions mises à jour.' });
      }

      default:
        return NextResponse.json({ ok: false, error: 'Action inconnue.' }, { status: 400 });
    }

  } catch (error) {
    return handleAuthError(error);
  }
}

// ============================================================
// DELETE /api/admin/users/[userId] — super_admin uniquement
// ============================================================
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await requireSuperAdmin(req);
    const { userId } = await params;

    // Soft delete dans Firestore (préserver les données pour audit)
    await adminDb.collection('app_users').doc(userId).update({
      status: 'deleted',
      deleted_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    });

    // Désactiver dans Firebase Auth (ne pas supprimer pour préserver l'historique)
    await adminAuth.updateUser(userId, { disabled: true });

    return NextResponse.json({ ok: true, message: 'Utilisateur supprimé (soft delete).' });

  } catch (error) {
    return handleAuthError(error);
  }
}
