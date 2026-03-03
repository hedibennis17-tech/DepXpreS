export const runtime = "nodejs";
import { NextResponse } from "next/server";

export async function GET() {
  const saStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const nodeEnv = process.env.NODE_ENV;
  const timestamp = new Date().toISOString();
  
  return NextResponse.json({ 
    ok: true,
    timestamp,
    node_env: nodeEnv,
    has_sa_key: !!saStr,
    sa_key_length: saStr?.length || 0,
    sa_key_start: saStr?.substring(0, 30) || "NOT SET"
  });
}
