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

// GET /api/admin/users/[userId] - Voir un utilisateur
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = getSessionRole(req);
  if (!session || !ADMIN_ROLES.includes(session.role)) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const { userId } = await params;

  try {
    const userDoc = await adminDb.collection('app_users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Utilisateur introuvable.' }, { status: 404 });
    }

    const data = userDoc.data()!;

    // Récupérer le profil lié selon le rôle
    let profile = null;
    if (data.primary_role === 'client') {
      const profileDoc = await adminDb.collection('client_profiles').doc(userId).get();
      if (profileDoc.exists) profile = profileDoc.data();
    } else if (data.primary_role === 'driver') {
      const profileDoc = await adminDb.collection('driver_profiles').doc(userId).get();
      if (profileDoc.exists) profile = profileDoc.data();
    } else {
      const profileDoc = await adminDb.collection('admin_profiles').doc(userId).get();
      if (profileDoc.exists) profile = profileDoc.data();
    }

    return NextResponse.json({
      id: userDoc.id,
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
      profile,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération.' }, { status: 500 });
  }
}

// PATCH /api/admin/users/[userId] - Modifier un utilisateur
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = getSessionRole(req);
  if (!session || !ADMIN_ROLES.includes(session.role)) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const { userId } = await params;

  try {
    const body = await req.json();
    const { action, status, role, newPassword, permissions } = body;

    const userDoc = await adminDb.collection('app_users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Utilisateur introuvable.' }, { status: 404 });
    }

    const userData = userDoc.data()!;

    // Action: bloquer
    if (action === 'block') {
      await adminDb.collection('app_users').doc(userId).update({
        status: 'blocked',
        updated_at: FieldValue.serverTimestamp(),
      });
      await adminAuth.updateUser(userId, { disabled: true });
      return NextResponse.json({ success: true, message: 'Compte bloqué.' });
    }

    // Action: débloquer
    if (action === 'unblock') {
      await adminDb.collection('app_users').doc(userId).update({
        status: 'active',
        updated_at: FieldValue.serverTimestamp(),
      });
      await adminAuth.updateUser(userId, { disabled: false });
      return NextResponse.json({ success: true, message: 'Compte débloqué.' });
    }

    // Action: reset mot de passe (super_admin uniquement)
    if (action === 'reset_password') {
      if (session.role !== 'super_admin') {
        return NextResponse.json({ error: 'Seul le super admin peut réinitialiser les mots de passe.' }, { status: 403 });
      }
      if (!newPassword || newPassword.length < 8) {
        return NextResponse.json({ error: 'Nouveau mot de passe requis (min 8 caractères).' }, { status: 400 });
      }
      await adminAuth.updateUser(userId, { password: newPassword });
      return NextResponse.json({ success: true, message: 'Mot de passe réinitialisé.' });
    }

    // Action: changer le rôle (super_admin uniquement)
    if (action === 'change_role') {
      if (session.role !== 'super_admin') {
        return NextResponse.json({ error: 'Seul le super admin peut changer les rôles.' }, { status: 403 });
      }
      const allowedRoles = ['admin', 'dispatcher', 'agent'];
      if (!role || !allowedRoles.includes(role)) {
        return NextResponse.json({ error: 'Rôle invalide.' }, { status: 400 });
      }
      await adminDb.collection('app_users').doc(userId).update({
        primary_role: role,
        updated_at: FieldValue.serverTimestamp(),
      });
      await adminDb.collection('admin_profiles').doc(userId).update({
        role,
        updated_at: FieldValue.serverTimestamp(),
      });
      await adminAuth.setCustomUserClaims(userId, { role });
      return NextResponse.json({ success: true, message: `Rôle changé en ${role}.` });
    }

    // Action: mettre à jour les permissions (super_admin et admin)
    if (action === 'update_permissions') {
      if (session.role !== 'super_admin' && session.role !== 'admin') {
        return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
      }
      await adminDb.collection('admin_profiles').doc(userId).update({
        permissions,
        updated_at: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ success: true, message: 'Permissions mises à jour.' });
    }

    return NextResponse.json({ error: 'Action non reconnue.' }, { status: 400 });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour.' }, { status: 500 });
  }
}

// DELETE /api/admin/users/[userId] - Supprimer un utilisateur (super_admin uniquement)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = getSessionRole(req);
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Seul le super admin peut supprimer des comptes.' }, { status: 403 });
  }

  const { userId } = await params;

  try {
    // Supprimer de Firebase Auth
    await adminAuth.deleteUser(userId);

    // Supprimer de Firestore
    await adminDb.collection('app_users').doc(userId).delete();
    await adminDb.collection('admin_profiles').doc(userId).delete();

    return NextResponse.json({ success: true, message: 'Compte supprimé.' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 });
  }
}
