'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';

function ManualDispatchContent() {
  const router = useRouter();
  const dispatchId = (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get('dispatchId') : null) || '';
  const [candidates, setCandidates] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [selectedDispatch, setSelectedDispatch] = useState(dispatchId);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/dispatch?status=queued').then(r => r.json()).then(d => setQueue(d.queue || [])).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedDispatch) {
      fetch(`/api/admin/dispatch/${selectedDispatch}/candidates`).then(r => r.json()).then(d => setCandidates(d.candidates || []));
    }
  }, [selectedDispatch]);

  const assign = async (driverId: string) => {
    if (!selectedDispatch) return;
    setAssigning(driverId);
    const res = await fetch(`/api/admin/dispatch/${selectedDispatch}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driverId }),
    });
    const data = await res.json();
    if (data.success) {
      alert(`✅ ${data.message}`);
      router.push('/admin/dispatch');
    }
    setAssigning(null);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dispatch Manuel</h1>
        <p className="text-muted-foreground mt-1">Assigner manuellement un chauffeur à une commande</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Sélectionner une commande</h2>
          <select value={selectedDispatch} onChange={e => setSelectedDispatch(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option value="">Choisir une commande...</option>
            {queue.map((d: any) => <option key={d.id} value={d.id}>{d.orderNumber} — {d.storeName} ({d.zoneName})</option>)}
          </select>
          {selectedDispatch && queue.find((d: any) => d.id === selectedDispatch) && (() => {
            const d = queue.find((q: any) => q.id === selectedDispatch);
            return (
              <div className="space-y-2 p-3 rounded-lg bg-muted/30">
                <p className="text-sm font-medium">{d.orderNumber}</p>
                <p className="text-xs text-muted-foreground">Dépanneur: {d.storeName}</p>
                <p className="text-xs text-muted-foreground">Zone: {d.zoneName}</p>
              </div>
            );
          })()}
        </div>
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Chauffeurs disponibles ({candidates.length})</h2>
          {candidates.length === 0 ? (
            <p className="text-muted-foreground text-sm">{selectedDispatch ? 'Aucun chauffeur disponible pour cette zone.' : 'Sélectionnez une commande pour voir les chauffeurs.'}</p>
          ) : (
            <div className="space-y-3">
              {candidates.map((driver: any) => (
                <div key={driver.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">{driver.name}</p>
                    <p className="text-xs text-muted-foreground">{driver.rating?.toFixed(1)} ⭐ • {driver.deliveriesToday} livraisons aujourd&apos;hui</p>
                  </div>
                  <button
                    onClick={() => assign(driver.id)}
                    disabled={assigning === driver.id}
                    className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600 disabled:opacity-50"
                  >
                    {assigning === driver.id ? '...' : 'Assigner'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>}><ManualDispatchContent /></Suspense>;
}
