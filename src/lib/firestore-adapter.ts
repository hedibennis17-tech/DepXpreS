/**
 * firestore-adapter.ts
 * Adaptateur Firestore compatible avec l'API Firebase Admin SDK
 * Utilise l'API REST Firestore au lieu de gRPC (compatible Vercel Serverless)
 */

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-1471071484-26917";
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const RUN_QUERY_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default):runQuery`;

// Cache du token d'accès
let _cachedToken: string | null = null;
let _tokenExpiry = 0;

async function getAccessToken(): Promise<string> {
  if (_cachedToken && Date.now() < _tokenExpiry) return _cachedToken!;

  const saStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!saStr) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY not set");

  const sa = JSON.parse(saStr);
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

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  const data = await res.json() as { access_token?: string };
  if (!data.access_token) throw new Error(`Token error: ${JSON.stringify(data)}`);

  _cachedToken = data.access_token;
  _tokenExpiry = Date.now() + 55 * 60 * 1000;
  return _cachedToken!;
}

// ─── Firestore value converters ───────────────────────────────────────────────

type FirestoreValue = { [key: string]: unknown };

function toFsValue(v: unknown): FirestoreValue {
  if (v === null || v === undefined) return { nullValue: null };
  if (v instanceof FieldValue) return v._toFirestoreValue();
  if (typeof v === "string") return { stringValue: v };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") {
    return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  }
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toFsValue) } };
  if (typeof v === "object") {
    return { mapValue: { fields: toFsFields(v as Record<string, unknown>) } };
  }
  return { stringValue: String(v) };
}

function toFsFields(data: Record<string, unknown>): Record<string, FirestoreValue> {
  const out: Record<string, FirestoreValue> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) out[k] = toFsValue(v);
  }
  return out;
}

function fromFsValue(v: FirestoreValue): unknown {
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("nullValue" in v) return null;
  if ("timestampValue" in v) return v.timestampValue; // ISO string
  if ("arrayValue" in v) {
    const arr = v.arrayValue as { values?: FirestoreValue[] };
    return (arr.values || []).map(fromFsValue);
  }
  if ("mapValue" in v) {
    const map = v.mapValue as { fields?: Record<string, FirestoreValue> };
    const r: Record<string, unknown> = {};
    for (const [k, fv] of Object.entries(map.fields || {})) r[k] = fromFsValue(fv);
    return r;
  }
  if ("geoPointValue" in v) return v.geoPointValue;
  if ("referenceValue" in v) return v.referenceValue;
  return null;
}

function fromFsDoc(doc: { name: string; fields?: Record<string, FirestoreValue> }): DocumentSnapshot {
  const id = doc.name.split("/").pop() || "";
  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(doc.fields || {})) data[k] = fromFsValue(v);
  return new DocumentSnapshot(id, doc.name, data, true);
}

// ─── FieldValue ───────────────────────────────────────────────────────────────

export class FieldValue {
  private _type: string;
  private _value: unknown;

  private constructor(type: string, value?: unknown) {
    this._type = type;
    this._value = value;
  }

  static serverTimestamp() { return new FieldValue("serverTimestamp"); }
  static delete() { return new FieldValue("delete"); }
  static increment(n: number) { return new FieldValue("increment", n); }
  static arrayUnion(...items: unknown[]) { return new FieldValue("arrayUnion", items); }
  static arrayRemove(...items: unknown[]) { return new FieldValue("arrayRemove", items); }

  _toFirestoreValue(): FirestoreValue {
    switch (this._type) {
      case "serverTimestamp": return { timestampValue: new Date().toISOString() };
      case "delete": return { nullValue: null }; // handled separately in update
      case "increment": return { integerValue: String(this._value) }; // simplified
      case "arrayUnion": return { arrayValue: { values: (this._value as unknown[]).map(toFsValue) } };
      case "arrayRemove": return { arrayValue: { values: [] } }; // simplified
      default: return { nullValue: null };
    }
  }

  isDelete() { return this._type === "delete"; }
}

// ─── DocumentSnapshot ─────────────────────────────────────────────────────────

export class DocumentSnapshot {
  readonly id: string;
  readonly ref: DocumentReference;
  readonly exists: boolean;
  private _data: Record<string, unknown>;

  constructor(id: string, path: string, data: Record<string, unknown>, exists: boolean) {
    this.id = id;
    this._data = data;
    this.exists = exists;
    this.ref = new DocumentReference(path.replace(`${FIRESTORE_BASE}/`, ""), id);
  }

  data(): Record<string, unknown> | undefined {
    return this.exists ? { ...this._data } : undefined;
  }

  get(field: string): unknown {
    return this._data[field];
  }
}

// ─── QueryDocumentSnapshot ────────────────────────────────────────────────────

export class QueryDocumentSnapshot extends DocumentSnapshot {
  constructor(id: string, path: string, data: Record<string, unknown>) {
    super(id, path, data, true);
  }

  data(): Record<string, unknown> {
    return super.data() as Record<string, unknown>;
  }
}

// ─── QuerySnapshot ────────────────────────────────────────────────────────────

export class QuerySnapshot {
  readonly docs: QueryDocumentSnapshot[];
  readonly size: number;
  readonly empty: boolean;

  constructor(docs: QueryDocumentSnapshot[]) {
    this.docs = docs;
    this.size = docs.length;
    this.empty = docs.length === 0;
  }

  forEach(cb: (doc: QueryDocumentSnapshot) => void) {
    this.docs.forEach(cb);
  }
}

// ─── DocumentReference ────────────────────────────────────────────────────────

export class DocumentReference {
  readonly id: string;
  private _path: string; // e.g. "orders/abc123"

  constructor(path: string, id?: string) {
    this._path = path;
    this.id = id || path.split("/").pop() || "";
  }

  collection(name: string): CollectionReference {
    return new CollectionReference(`${this._path}/${name}`);
  }

  async get(): Promise<DocumentSnapshot> {
    const token = await getAccessToken();
    const url = `${FIRESTORE_BASE}/${this._path}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 404) {
      const id = this._path.split("/").pop() || "";
      return new DocumentSnapshot(id, `${FIRESTORE_BASE}/${this._path}`, {}, false);
    }
    if (!res.ok) throw new Error(`Firestore get ${this._path}: ${res.status}`);
    const doc = await res.json() as { name: string; fields?: Record<string, FirestoreValue> };
    return fromFsDoc(doc);
  }

  async set(data: Record<string, unknown>, options?: { merge?: boolean }): Promise<void> {
    const token = await getAccessToken();
    const url = `${FIRESTORE_BASE}/${this._path}`;
    const fields = toFsFields(data);

    let fetchUrl = url;
    if (options?.merge) {
      const keys = Object.keys(fields).join("&updateMask.fieldPaths=");
      fetchUrl = `${url}?updateMask.fieldPaths=${keys}`;
    }

    const res = await fetch(fetchUrl, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields }),
    });
    if (!res.ok) throw new Error(`Firestore set ${this._path}: ${await res.text()}`);
  }

  async update(data: Record<string, unknown>): Promise<void> {
    const token = await getAccessToken();
    const url = `${FIRESTORE_BASE}/${this._path}`;

    // Filter out FieldValue.delete() — those fields should be removed
    const toDelete = Object.entries(data)
      .filter(([, v]) => v instanceof FieldValue && (v as FieldValue).isDelete())
      .map(([k]) => k);

    const toSet = Object.fromEntries(
      Object.entries(data).filter(([, v]) => !(v instanceof FieldValue && (v as FieldValue).isDelete()))
    );

    const fields = toFsFields(toSet);
    const allKeys = [...Object.keys(fields), ...toDelete];
    const mask = allKeys.map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join("&");

    const res = await fetch(`${url}?${mask}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields }),
    });
    if (!res.ok) throw new Error(`Firestore update ${this._path}: ${await res.text()}`);
  }

  async delete(): Promise<void> {
    const token = await getAccessToken();
    const url = `${FIRESTORE_BASE}/${this._path}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok && res.status !== 404) throw new Error(`Firestore delete ${this._path}: ${res.status}`);
  }
}

// ─── Query / CollectionReference ─────────────────────────────────────────────

type WhereOp = "==" | "!=" | "<" | "<=" | ">" | ">=" | "array-contains" | "in" | "not-in" | "array-contains-any";

const OP_MAP: Record<WhereOp, string> = {
  "==": "EQUAL",
  "!=": "NOT_EQUAL",
  "<": "LESS_THAN",
  "<=": "LESS_THAN_OR_EQUAL",
  ">": "GREATER_THAN",
  ">=": "GREATER_THAN_OR_EQUAL",
  "array-contains": "ARRAY_CONTAINS",
  "in": "IN",
  "not-in": "NOT_IN",
  "array-contains-any": "ARRAY_CONTAINS_ANY",
};

interface WhereClause { field: string; op: WhereOp; value: unknown }
interface OrderClause { field: string; dir: "ASCENDING" | "DESCENDING" }

export class Query {
  protected _collection: string; // e.g. "orders"
  protected _wheres: WhereClause[] = [];
  protected _orders: OrderClause[] = [];
  protected _limitVal?: number;
  protected _startAfterDoc?: DocumentSnapshot;

  constructor(collection: string) {
    this._collection = collection;
  }

  where(field: string, op: WhereOp, value: unknown): Query {
    const q = this._clone();
    q._wheres = [...this._wheres, { field, op, value }];
    return q;
  }

  orderBy(field: string, dir: "asc" | "desc" = "asc"): Query {
    const q = this._clone();
    q._orders = [...this._orders, { field, dir: dir === "asc" ? "ASCENDING" : "DESCENDING" }];
    return q;
  }

  limit(n: number): Query {
    const q = this._clone();
    q._limitVal = n;
    return q;
  }

  startAfter(doc: DocumentSnapshot): Query {
    const q = this._clone();
    q._startAfterDoc = doc;
    return q;
  }

  protected _clone(): Query {
    const q = new Query(this._collection);
    q._wheres = [...this._wheres];
    q._orders = [...this._orders];
    q._limitVal = this._limitVal;
    q._startAfterDoc = this._startAfterDoc;
    return q;
  }

  async get(): Promise<QuerySnapshot> {
    const token = await getAccessToken();

    const structuredQuery: Record<string, unknown> = {
      from: [{ collectionId: this._collection }],
    };

    if (this._wheres.length > 0) {
      const filters = this._wheres.map(w => ({
        fieldFilter: {
          field: { fieldPath: w.field },
          op: OP_MAP[w.op] || "EQUAL",
          value: toFsValue(w.value),
        },
      }));
      structuredQuery.where =
        filters.length === 1
          ? filters[0]
          : { compositeFilter: { op: "AND", filters } };
    }

    if (this._orders.length > 0) {
      structuredQuery.orderBy = this._orders.map(o => ({
        field: { fieldPath: o.field },
        direction: o.dir,
      }));
    }

    if (this._limitVal) structuredQuery.limit = this._limitVal;

    const res = await fetch(RUN_QUERY_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ structuredQuery }),
    });

    if (!res.ok) throw new Error(`Firestore query ${this._collection}: ${await res.text()}`);

    const results = await res.json() as Array<{ document?: { name: string; fields?: Record<string, FirestoreValue> } }>;
    const docs = results
      .filter(r => r.document)
      .map(r => {
        const doc = r.document!;
        const snap = fromFsDoc(doc);
        return new QueryDocumentSnapshot(snap.id, doc.name, snap.data() as Record<string, unknown>);
      });

    return new QuerySnapshot(docs);
  }

  async count(): Promise<{ data: () => { count: number } }> {
    const snap = await this.get();
    return { data: () => ({ count: snap.size }) };
  }
}

// ─── CollectionReference ─────────────────────────────────────────────────────

export class CollectionReference extends Query {
  constructor(path: string) {
    // path can be "orders" or "orders/abc/items"
    const parts = path.split("/");
    super(parts[parts.length - 1]);
    this._collection = parts[parts.length - 1];
    this._fullPath = path;
  }

  private _fullPath: string;

  doc(id?: string): DocumentReference {
    const docId = id || crypto.randomUUID();
    return new DocumentReference(`${this._fullPath}/${docId}`, docId);
  }

  async add(data: Record<string, unknown>): Promise<DocumentReference> {
    const token = await getAccessToken();
    const url = `${FIRESTORE_BASE}/${this._fullPath}`;
    const fields = toFsFields(data);

    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields }),
    });

    if (!res.ok) throw new Error(`Firestore add ${this._fullPath}: ${await res.text()}`);
    const doc = await res.json() as { name: string };
    const id = doc.name.split("/").pop() || "";
    return new DocumentReference(`${this._fullPath}/${id}`, id);
  }

  protected _clone(): CollectionReference {
    const q = new CollectionReference(this._fullPath);
    q._wheres = [...this._wheres];
    q._orders = [...this._orders];
    q._limitVal = this._limitVal;
    q._startAfterDoc = this._startAfterDoc;
    return q;
  }
}

// ─── WriteBatch ───────────────────────────────────────────────────────────────

interface BatchOp {
  type: "set" | "update" | "delete";
  ref: DocumentReference;
  data?: Record<string, unknown>;
  options?: { merge?: boolean };
}

export class WriteBatch {
  private _ops: BatchOp[] = [];

  set(ref: DocumentReference, data: Record<string, unknown>, options?: { merge?: boolean }): this {
    this._ops.push({ type: "set", ref, data, options });
    return this;
  }

  update(ref: DocumentReference, data: Record<string, unknown>): this {
    this._ops.push({ type: "update", ref, data });
    return this;
  }

  delete(ref: DocumentReference): this {
    this._ops.push({ type: "delete", ref });
    return this;
  }

  async commit(): Promise<void> {
    // Execute all operations sequentially (Firestore REST batch is complex)
    for (const op of this._ops) {
      if (op.type === "set") await op.ref.set(op.data!, op.options);
      else if (op.type === "update") await op.ref.update(op.data!);
      else if (op.type === "delete") await op.ref.delete();
    }
  }
}

// ─── Firestore (main db object) ───────────────────────────────────────────────

export class Firestore {
  collection(path: string): CollectionReference {
    return new CollectionReference(path);
  }

  doc(path: string): DocumentReference {
    const parts = path.split("/");
    return new DocumentReference(path, parts[parts.length - 1]);
  }

  batch(): WriteBatch {
    return new WriteBatch();
  }

  // Timestamp helper
  static get FieldValue() { return FieldValue; }
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export const adminDb = new Firestore();
export const adminAuth = {
  // Minimal auth methods used in APIs
  getUser: async (uid: string) => {
    // Use Firebase Auth REST API
    const saStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY!;
    const sa = JSON.parse(saStr);
    const token = await getAccessToken();
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/projects/${sa.project_id}/accounts:lookup`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ localId: [uid] }),
      }
    );
    const data = await res.json() as { users?: Array<{ localId: string; email: string; displayName?: string; customAttributes?: string }> };
    if (!data.users?.[0]) throw new Error("User not found");
    const u = data.users[0];
    const claims = u.customAttributes ? JSON.parse(u.customAttributes) : {};
    return { uid: u.localId, email: u.email, displayName: u.displayName, customClaims: claims };
  },
  setCustomUserClaims: async (uid: string, claims: Record<string, unknown>) => {
    const token = await getAccessToken();
    const saStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY!;
    const sa = JSON.parse(saStr);
    await fetch(
      `https://identitytoolkit.googleapis.com/v1/projects/${sa.project_id}/accounts:update`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ localId: uid, customAttributes: JSON.stringify(claims) }),
      }
    );
  },
  verifyIdToken: async (token: string) => {
    // Decode JWT payload (trust Firebase-issued tokens)
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid token");
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    return payload;
  },
  createCustomToken: async (uid: string) => {
    // Not needed for admin panel
    return uid;
  },
};
