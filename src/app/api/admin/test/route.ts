import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  const steps: string[] = [];
  
  try {
    steps.push("1. Starting REST API test...");
    
    // Test 1: Vérifier les variables d'environnement
    const saStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-1471071484-26917";
    steps.push(`2. Service key present: ${!!saStr}, Project: ${projectId}`);
    
    if (!saStr) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY not set");
    
    // Test 2: Parser le service account
    const sa = JSON.parse(saStr);
    steps.push(`3. SA parsed: ${sa.client_email}`);
    
    // Test 3: Créer le JWT
    const now = Math.floor(Date.now() / 1000);
    const b64url = (obj: unknown) =>
      Buffer.from(JSON.stringify(obj)).toString("base64")
        .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    
    const header = { alg: "RS256", typ: "JWT" };
    const payload = {
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/datastore",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    };
    
    const signingInput = `${b64url(header)}.${b64url(payload)}`;
    const { createSign } = await import("crypto");
    const sign = createSign("RSA-SHA256");
    sign.update(signingInput);
    const sig = sign.sign(sa.private_key, "base64")
      .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    const jwt = `${signingInput}.${sig}`;
    steps.push("4. JWT created");
    
    // Test 4: Obtenir le token OAuth2
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
      signal: AbortSignal.timeout(10000),
    });
    
    const tokenData = await tokenRes.json() as { access_token?: string; error?: string };
    if (!tokenData.access_token) throw new Error(`Token error: ${JSON.stringify(tokenData)}`);
    steps.push("5. OAuth2 token obtained");
    
    // Test 5: Requête Firestore REST
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default):runQuery`;
    const queryRes = await fetch(firestoreUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "stores" }],
          limit: 1,
        },
      }),
      signal: AbortSignal.timeout(10000),
    });
    
    const queryData = await queryRes.json() as unknown[];
    steps.push(`6. Firestore REST query success: ${queryData.length} results`);
    
    return NextResponse.json({ ok: true, steps });
    
  } catch (error: unknown) {
    const e = error as Error;
    steps.push(`ERROR: ${e.message}`);
    return NextResponse.json({ ok: false, steps, error: e.message }, { status: 500 });
  }
}
