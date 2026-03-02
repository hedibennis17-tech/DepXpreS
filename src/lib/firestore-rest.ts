/**
 * firestore-rest.ts — Wrapper Firestore REST API
 * Remplace Firebase Admin SDK (gRPC) par des appels HTTP REST
 * Compatible avec Vercel Serverless Functions
 */

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-1471071484-26917";
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// Cache du token d'accès pour éviter de le régénérer à chaque requête
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Obtenir un token d'accès Google via JWT Service Account
 */
async function getAccessToken(): Promise<string> {
  // Vérifier le cache (token valide 55 minutes)
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountStr) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY not set");
  }

  const sa = JSON.parse(serviceAccountStr);
  const now = Math.floor(Date.now() / 1000);
  
  // Créer le JWT pour Google OAuth2
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  // Encoder en base64url
  const b64url = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj))
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  const signingInput = `${b64url(header)}.${b64url(payload)}`;

  // Signer avec la clé privée RSA
  const { createSign } = await import("crypto");
  const sign = createSign("RSA-SHA256");
  sign.update(signingInput);
  const signature = sign
    .sign(sa.private_key, "base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const jwt = `${signingInput}.${signature}`;

  // Échanger le JWT contre un access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`Token error: ${JSON.stringify(tokenData)}`);
  }

  cachedToken = tokenData.access_token;
  tokenExpiry = Date.now() + 55 * 60 * 1000; // 55 minutes
  return cachedToken!;
}

/**
 * Convertir un document Firestore REST en objet JavaScript
 */
function fromFirestoreDoc(doc: Record<string, unknown>): Record<string, unknown> {
  const fields = doc.fields as Record<string, Record<string, unknown>> | undefined;
  if (!fields) return {};
  
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    result[key] = fromFirestoreValue(value);
  }
  return result;
}

function fromFirestoreValue(value: Record<string, unknown>): unknown {
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("nullValue" in value) return null;
  if ("timestampValue" in value) return value.timestampValue; // ISO string
  if ("arrayValue" in value) {
    const arr = value.arrayValue as { values?: Record<string, unknown>[] };
    return (arr.values || []).map(fromFirestoreValue);
  }
  if ("mapValue" in value) {
    const map = value.mapValue as { fields?: Record<string, Record<string, unknown>> };
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(map.fields || {})) {
      result[k] = fromFirestoreValue(v);
    }
    return result;
  }
  if ("geoPointValue" in value) return value.geoPointValue;
  if ("referenceValue" in value) return value.referenceValue;
  return null;
}

/**
 * Obtenir tous les documents d'une collection
 */
export async function getCollection(
  collectionPath: string,
  options?: {
    orderBy?: string;
    orderDirection?: "ASCENDING" | "DESCENDING";
    limit?: number;
    where?: Array<{ field: string; op: string; value: unknown }>;
  }
): Promise<Array<{ id: string } & Record<string, unknown>>> {
  const token = await getAccessToken();
  
  // Utiliser l'API runQuery pour les requêtes complexes
  const structuredQuery: Record<string, unknown> = {
    from: [{ collectionId: collectionPath }],
  };

  if (options?.where && options.where.length > 0) {
    const filters = options.where.map(w => ({
      fieldFilter: {
        field: { fieldPath: w.field },
        op: w.op,
        value: toFirestoreValue(w.value),
      }
    }));
    structuredQuery.where = filters.length === 1 
      ? filters[0] 
      : { compositeFilter: { op: "AND", filters } };
  }

  if (options?.orderBy) {
    structuredQuery.orderBy = [{
      field: { fieldPath: options.orderBy },
      direction: options.orderDirection || "ASCENDING",
    }];
  }

  if (options?.limit) {
    structuredQuery.limit = options.limit;
  }

  const url = `${FIRESTORE_BASE.replace("/documents", "")}:runQuery`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ structuredQuery }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Firestore query error: ${err}`);
  }

  const results = await res.json() as Array<{ document?: { name: string; fields: Record<string, unknown> } }>;
  
  return results
    .filter(r => r.document)
    .map(r => {
      const doc = r.document!;
      const id = doc.name.split("/").pop() || "";
      return { id, ...fromFirestoreDoc(doc as unknown as Record<string, unknown>) };
    });
}

/**
 * Obtenir un document par ID
 */
export async function getDocument(
  collectionPath: string,
  docId: string
): Promise<({ id: string } & Record<string, unknown>) | null> {
  const token = await getAccessToken();
  
  const url = `${FIRESTORE_BASE}/${collectionPath}/${docId}`;
  const res = await fetch(url, {
    headers: { "Authorization": `Bearer ${token}` },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Firestore get error: ${res.status}`);

  const doc = await res.json() as { name: string; fields: Record<string, unknown> };
  return { id: docId, ...fromFirestoreDoc(doc as unknown as Record<string, unknown>) };
}

/**
 * Créer ou mettre à jour un document
 */
export async function setDocument(
  collectionPath: string,
  docId: string,
  data: Record<string, unknown>
): Promise<void> {
  const token = await getAccessToken();
  
  const url = `${FIRESTORE_BASE}/${collectionPath}/${docId}`;
  const fields = toFirestoreFields(data);
  
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Firestore set error: ${err}`);
  }
}

/**
 * Mettre à jour des champs spécifiques d'un document
 */
export async function updateDocument(
  collectionPath: string,
  docId: string,
  data: Record<string, unknown>
): Promise<void> {
  const token = await getAccessToken();
  
  const fieldPaths = Object.keys(data).join(",");
  const url = `${FIRESTORE_BASE}/${collectionPath}/${docId}?updateMask.fieldPaths=${fieldPaths}`;
  const fields = toFirestoreFields(data);
  
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Firestore update error: ${err}`);
  }
}

/**
 * Supprimer un document
 */
export async function deleteDocument(
  collectionPath: string,
  docId: string
): Promise<void> {
  const token = await getAccessToken();
  
  const url = `${FIRESTORE_BASE}/${collectionPath}/${docId}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 404) {
    const err = await res.text();
    throw new Error(`Firestore delete error: ${err}`);
  }
}

/**
 * Ajouter un document avec ID auto-généré
 */
export async function addDocument(
  collectionPath: string,
  data: Record<string, unknown>
): Promise<string> {
  const token = await getAccessToken();
  
  const url = `${FIRESTORE_BASE}/${collectionPath}`;
  const fields = toFirestoreFields(data);
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Firestore add error: ${err}`);
  }

  const doc = await res.json() as { name: string };
  return doc.name.split("/").pop() || "";
}

// Convertir une valeur JS en valeur Firestore
function toFirestoreValue(value: unknown): Record<string, unknown> {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    if (Number.isInteger(value)) return { integerValue: String(value) };
    return { doubleValue: value };
  }
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestoreValue) } };
  }
  if (typeof value === "object") {
    return {
      mapValue: {
        fields: toFirestoreFields(value as Record<string, unknown>),
      },
    };
  }
  return { stringValue: String(value) };
}

function toFirestoreFields(data: Record<string, unknown>): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields[key] = toFirestoreValue(value);
    }
  }
  return fields;
}
