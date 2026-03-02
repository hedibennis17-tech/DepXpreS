/**
 * Helper centralisé pour sérialiser les données Firestore
 * Convertit les Timestamps Firestore en ISO strings pour éviter l'erreur React #418
 */

// Convertit un Timestamp Firestore (ou objet avec _seconds) en string ISO
export function serializeTimestamp(ts: unknown): string | null {
  if (!ts) return null;
  // Timestamp Firestore natif (Admin SDK)
  if (typeof ts === 'object' && ts !== null) {
    const t = ts as Record<string, unknown>;
    if (typeof t.toDate === 'function') {
      return (t.toDate as () => Date)().toISOString();
    }
    // Objet sérialisé avec _seconds/_nanoseconds
    if (typeof t._seconds === 'number') {
      return new Date(t._seconds * 1000).toISOString();
    }
    // Objet avec seconds/nanoseconds
    if (typeof t.seconds === 'number') {
      return new Date(t.seconds * 1000).toISOString();
    }
  }
  // Déjà une string
  if (typeof ts === 'string') return ts;
  // Nombre (epoch ms)
  if (typeof ts === 'number') return new Date(ts).toISOString();
  return null;
}

// Sérialise récursivement un objet Firestore — convertit tous les timestamps
export function serializeDoc(doc: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(doc)) {
    if (value === null || value === undefined) {
      result[key] = value;
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      const v = value as Record<string, unknown>;
      // Timestamp Firestore
      if (typeof v.toDate === 'function' || typeof v._seconds === 'number' || typeof v.seconds === 'number') {
        result[key] = serializeTimestamp(value);
      } else {
        // Objet imbriqué — récursion
        result[key] = serializeDoc(v);
      }
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) => {
        if (item && typeof item === 'object') {
          const i = item as Record<string, unknown>;
          if (typeof i.toDate === 'function' || typeof i._seconds === 'number' || typeof i.seconds === 'number') {
            return serializeTimestamp(item);
          }
          return serializeDoc(i);
        }
        return item;
      });
    } else {
      result[key] = value;
    }
  }
  return result;
}

// Sérialise un tableau de documents Firestore
export function serializeDocs(docs: Record<string, unknown>[]): Record<string, unknown>[] {
  return docs.map(serializeDoc);
}
