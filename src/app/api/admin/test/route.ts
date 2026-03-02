import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  const steps: string[] = [];
  
  try {
    steps.push("1. Starting test...");
    
    // Test 1: Vérifier les variables d'environnement
    const hasServiceKey = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-1471071484-26917";
    steps.push(`2. Service key present: ${hasServiceKey}, Project: ${projectId}`);
    
    // Test 2: Essayer d'initialiser Firebase Admin
    const { initializeApp, getApps, cert } = await import("firebase-admin/app");
    steps.push("3. firebase-admin/app imported");
    
    let app;
    if (getApps().length > 0) {
      app = getApps()[0];
      steps.push("4. Using existing app");
    } else {
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY!;
      const parsed = JSON.parse(serviceAccount);
      app = initializeApp({ credential: cert(parsed), projectId });
      steps.push("4. New app initialized");
    }
    
    // Test 3: Essayer d'obtenir Firestore
    const { getFirestore } = await import("firebase-admin/firestore");
    steps.push("5. firebase-admin/firestore imported");
    
    const db = getFirestore(app);
    steps.push("6. Firestore instance created");
    
    // Test 4: Faire une requête simple avec timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Firestore timeout after 5s")), 5000)
    );
    
    const queryPromise = db.collection("_test_").limit(1).get();
    
    const result = await Promise.race([queryPromise, timeoutPromise]);
    steps.push(`7. Firestore query success: ${(result as { size: number }).size} docs`);
    
    return NextResponse.json({ ok: true, steps });
    
  } catch (error: unknown) {
    const e = error as Error;
    steps.push(`ERROR: ${e.message}`);
    return NextResponse.json({ ok: false, steps, error: e.message }, { status: 500 });
  }
}
