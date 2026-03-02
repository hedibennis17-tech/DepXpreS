/**
 * firebase-admin.ts
 * 
 * IMPORTANT: Firebase Admin SDK (gRPC) ne fonctionne pas sur Vercel Serverless Functions.
 * Ce fichier exporte maintenant depuis firestore-adapter.ts qui utilise l'API REST Firestore.
 * Tous les imports existants de firebase-admin fonctionneront sans modification.
 */

export { adminDb, adminAuth, FieldValue } from "./firestore-adapter";
