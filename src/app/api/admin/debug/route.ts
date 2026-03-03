export const runtime = "nodejs";
import { NextResponse } from "next/server";

export async function GET() {
  // Test 1: Variable d'environnement
  const saStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!saStr) {
    return NextResponse.json({ step: "env", error: "FIREBASE_SERVICE_ACCOUNT_KEY not set" });
  }
  
  let sa: Record<string, string>;
  try {
    sa = JSON.parse(saStr);
  } catch(e) {
    return NextResponse.json({ step: "parse", error: String(e), first50: saStr.substring(0, 50) });
  }
  
  // Test 2: Firebase Admin init
  try {
    const admin = await import("firebase-admin");
    
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(sa as Parameters<typeof admin.credential.cert>[0]),
        projectId: sa.project_id,
      });
    }
    
    return NextResponse.json({ 
      step: "init_ok",
      project_id: sa.project_id,
      apps_count: admin.apps.length
    });
  } catch(e) {
    return NextResponse.json({ step: "init_error", error: String(e) });
  }
}
