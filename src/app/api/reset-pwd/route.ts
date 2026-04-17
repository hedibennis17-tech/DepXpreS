export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const newPwd = req.nextUrl.searchParams.get("pwd");

  if (secret !== "depxpres-reset-2026") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const user = await adminAuth.getUserByEmail("hedibennis17@gmail.com");
    
    const updates: Record<string, unknown> = {
      disabled: false, // Débloquer le compte
    };
    
    if (newPwd && newPwd.length >= 8) {
      updates.password = newPwd;
    }

    await adminAuth.updateUser(user.uid, updates);
    
    // Révoquer tous les tokens existants pour forcer un fresh login
    await adminAuth.revokeRefreshTokens(user.uid);

    return NextResponse.json({ 
      ok: true, 
      message: "Compte débloqué + mot de passe changé ✅",
      email: user.email,
      disabled: false
    });
  } catch(e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
