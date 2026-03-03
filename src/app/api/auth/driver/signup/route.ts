export const runtime = "nodejs";
/**
 * POST /api/auth/driver/signup
 * Crée un compte chauffeur : Firebase Auth + app_users + driver_profiles + driver_applications
 * Équivalent Firebase de create_driver_profile() SQL
 */
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

type Body = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;

    const email     = body.email?.trim().toLowerCase();
    const password  = body.password?.trim();
    const firstName = body.firstName?.trim();
    const lastName  = body.lastName?.trim();
    const phone     = body.phone?.trim() || null;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { ok: false, error: 'MISSING_REQUIRED_FIELDS' },
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
        return NextResponse.json(
          { ok: false, error: 'EMAIL_ALREADY_EXISTS' },
          { status: 409 }
        );
      }
      if (err.code === 'auth/invalid-email') {
        return NextResponse.json({ ok: false, error: 'INVALID_EMAIL' }, { status: 400 });
      }
      return NextResponse.json(
        { ok: false, error: err.message || 'AUTH_CREATE_FAILED' },
        { status: 400 }
      );
    }

    const userId = userRecord.uid;

    // 2. Créer app_users + driver_profiles + driver_applications dans Firestore (batch atomique)
    const batch = adminDb.batch();

    // app_users — structure identique au schéma SQL
    const appUserRef = adminDb.collection('app_users').doc(userId);
    batch.set(appUserRef, {
      id: userId,
      email,
      phone,
      display_name: fullName,
      first_name: firstName,
      last_name: lastName,
      primary_role: 'driver',
      status: 'active',
      is_email_verified: false,
      is_phone_verified: false,
      created_by: null,
      created_at: now,
      updated_at: now,
    });

    // driver_profiles — structure identique au schéma SQL
    const driverProfileRef = adminDb.collection('driver_profiles').doc(userId);
    batch.set(driverProfileRef, {
      user_id: userId,
      full_name: fullName,
      application_status: 'draft',
      driver_status: 'offline',
      availability_status: 'available',
      verification_status: 'pending',
      current_zone_id: null,
      current_order_id: null,
      wallet_id: null,
      rating_average: 0,
      rating_count: 0,
      total_deliveries: 0,
      created_at: now,
      updated_at: now,
    });

    // driver_applications — structure identique au schéma SQL
    const appRef = adminDb.collection('driver_applications').doc(userId);
    batch.set(appRef, {
      id: userId,
      user_id: userId,
      step: 1,
      status: 'draft',
      review_status: 'pending',
      submitted_at: null,
      reviewed_by: null,
      reviewed_at: null,
      notes: null,
      created_at: now,
      updated_at: now,
    });

    try {
      await batch.commit();
    } catch (dbError) {
      // Rollback : supprimer le compte Firebase Auth si Firestore échoue
      await adminAuth.deleteUser(userId).catch(() => {});
      console.error('Firestore batch error:', dbError);
      return NextResponse.json(
        { ok: false, error: 'PROFILE_CREATE_FAILED' },
        { status: 500 }
      );
    }

    // 3. Définir le custom claim role dans Firebase Auth
    await adminAuth.setCustomUserClaims(userId, { role: 'driver' });

    return NextResponse.json({
      ok: true,
      userId,
      role: 'driver',
      nextStep: '/driver/wizard/personal',
    }, { status: 201 });

  } catch (error) {
    console.error('Signup driver error:', error);
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}
