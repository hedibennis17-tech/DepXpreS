import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, phone } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' }, { status: 400 });
    }

    // 1. Créer l'utilisateur dans Firebase Auth
    const userRecord = await adminAuth.createUser({
      email: email.trim().toLowerCase(),
      password,
      displayName: firstName && lastName ? `${firstName} ${lastName}` : undefined,
      phoneNumber: phone ? (phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`) : undefined,
    });

    const uid = userRecord.uid;
    const now = FieldValue.serverTimestamp();

    // 2. Créer le document dans app_users
    await adminDb.collection('app_users').doc(uid).set({
      uid,
      email: email.trim().toLowerCase(),
      firstName: firstName || '',
      lastName: lastName || '',
      phone: phone || '',
      primary_role: 'driver',
      status: 'active',
      is_email_verified: false,
      created_at: now,
      updated_at: now,
    });

    // 3. Créer le profil chauffeur dans driver_profiles
    await adminDb.collection('driver_profiles').doc(uid).set({
      id: uid,
      userId: uid,
      firstName: firstName || '',
      lastName: lastName || '',
      email: email.trim().toLowerCase(),
      phone: phone || '',
      status: 'offline',
      isOnline: false,
      rating: 0,
      totalDeliveries: 0,
      totalEarnings: 0,
      applicationStatus: 'pending',
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    // 4. Créer la candidature dans driver_applications
    await adminDb.collection('driver_applications').add({
      driverId: uid,
      email: email.trim().toLowerCase(),
      firstName: firstName || '',
      lastName: lastName || '',
      phone: phone || '',
      application_status: 'draft',
      driver_status: 'offline',
      verification_status: 'pending',
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    // 5. Définir le custom claim de rôle
    await adminAuth.setCustomUserClaims(uid, { role: 'driver' });

    return NextResponse.json({
      success: true,
      uid,
      message: 'Compte chauffeur créé avec succès.',
    }, { status: 201 });

  } catch (error: any) {
    console.error('Driver signup error:', error);

    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json({ error: 'Cette adresse email est déjà utilisée.' }, { status: 409 });
    }
    if (error.code === 'auth/invalid-email') {
      return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 });
    }
    if (error.code === 'auth/weak-password') {
      return NextResponse.json({ error: 'Mot de passe trop faible.' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Erreur lors de la création du compte.' }, { status: 500 });
  }
}
