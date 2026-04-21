export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const DOC_LABELS: Record<string, string> = {
  license: "Permis de conduire",
  insurance: "Assurance automobile",
  registration: "Immatriculation",
};

export async function POST(req: NextRequest) {
  try {
    const { driverId, docKey, status, comment } = await req.json();
    if (!driverId || !docKey) return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });

    const docLabel = DOC_LABELS[docKey] || docKey;
    const isApproved = status === "approved";

    await adminDb.collection("notifications").add({
      userId: driverId,
      type: "document_review",
      docKey,
      docLabel,
      status,
      title: isApproved
        ? `✅ ${docLabel} approuvé`
        : `❌ ${docLabel} rejeté — action requise`,
      body: comment
        ? comment
        : isApproved
          ? `Votre ${docLabel} a été vérifié et approuvé par notre équipe.`
          : `Votre ${docLabel} n'a pas été accepté. Veuillez téléverser un nouveau document.`,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
