export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const newPwd = req.nextUrl.searchParams.get("pwd");
  
  if (secret !== "depxpres-reset-2026") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (!newPwd || newPwd.length < 8) {
    return NextResponse.json({ error: "Mot de passe trop court (min 8 caractères)" }, { status: 400 });
  }

  try {
    const user = await adminAuth.getUserByEmail("hedibennis17@gmail.com");
    await adminAuth.updateUser(user.uid, { password: newPwd });
    return NextResponse.json({ ok: true, message: `Mot de passe changé pour hedibennis17@gmail.com` });
  } catch(e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
