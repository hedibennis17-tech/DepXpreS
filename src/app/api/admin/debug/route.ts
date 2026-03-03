export const runtime = "nodejs";
import { NextResponse } from "next/server";

export async function GET() {
  const saStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (!saStr) {
    return NextResponse.json({ 
      error: "FIREBASE_SERVICE_ACCOUNT_KEY not set", 
      firebase_keys: Object.keys(process.env).filter(k => k.includes('FIREBASE'))
    });
  }
  
  try {
    const sa = JSON.parse(saStr);
    
    // Tester getAccessToken
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
    
    const tokenStart = Date.now();
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
      signal: AbortSignal.timeout(10000)
    });
    const tokenTime = Date.now() - tokenStart;
    const tokenData = await res.json() as { access_token?: string; error?: string };
    
    if (!tokenData.access_token) {
      return NextResponse.json({ 
        ok: false, 
        step: "token", 
        token_time_ms: tokenTime,
        token_error: tokenData 
      });
    }
    
    // Tester Firestore
    const fsStart = Date.now();
    const fsRes = await fetch(
      `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents/client_profiles?pageSize=1`,
      { 
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
        signal: AbortSignal.timeout(10000)
      }
    );
    const fsTime = Date.now() - fsStart;
    const fsData = await fsRes.json() as { documents?: unknown[]; error?: unknown };
    
    return NextResponse.json({
      ok: true,
      project_id: sa.project_id,
      token_time_ms: tokenTime,
      firestore_time_ms: fsTime,
      firestore_status: fsRes.status,
      docs_count: fsData.documents?.length || 0,
      firestore_error: fsData.error || null
    });
  } catch(e) {
    return NextResponse.json({ error: String(e) });
  }
}
