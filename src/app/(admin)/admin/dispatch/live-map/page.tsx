'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const GoogleMapView = dynamic(() => import('@/components/maps/GoogleMapView'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Chargement de la carte Google Maps...</p>
      </div>
    </div>
  ),
});

const ZONE_CENTERS: Record<string, { lat: number; lng: number }> = {
  'zone-laval': { lat: 45.5631, lng: -73.7124 },
  'zone-laval-ouest': { lat: 45.5500, lng: -73.7800 },
  'zone-longueuil': { lat: 45.5312, lng: -73.5185 },
  'zone-mtl-centre': { lat: 45.5017, lng: -73.5673 },
  'zone-mtl-nord': { lat: 45.5900, lng: -73.6200 },
};

const STORE_COORDS: Record<string, { lat: number; lng: number }> = {
  'Dépanneur Chomedey Express': { lat: 45.5631, lng: -73.7124 },
  'Dépanneur St-Martin': { lat: 45.5500, lng: -73.7500 },
  'Dépanneur Laval Ouest': { lat: 45.5450, lng: -73.7900 },
  'Dépanneur Longueuil Express': { lat: 45.5312, lng: -73.5185 },
  'Dépanneur Centre-Ville 24h': { lat: 45.5017, lng: -73.5673 },
  'Dépanneur Plateau': { lat: 45.5200, lng: -73.5800 },
  'Dépanneur Montréal Nord': { lat: 45.5900, lng: -73.6200 },
};

export default function DispatchLiveMapPage() {
  const [drivers, setDrivers] = useState<Array<{id:string;name:string;lat:number;lng:number;status:string;currentOrder?:string;zone?:string}>>([]);
  const [stores, setStores] = useState<Array<{id:string;name:string;lat:number;lng:number;status:string}>>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showDrivers, setShowDrivers] = useState(true);
  const [showStores, setShowStores] = useState(true);
  const [selectedZone, setSelectedZone] = useState('all');
  const [stats, setStats] = useState({ online: 0, delivering: 0, available: 0, offline: 0 });

  const fetchData = async () => {
    try {
      const [driversRes, storesRes, dispatchRes] = await Promise.all([
        fetch('/api/admin/drivers'),
        fetch('/api/admin/stores'),
        fetch('/api/admin/dispatch'),
      ]);
      const driversData = await driversRes.json();
      const storesData = await storesRes.json();
      const dispatchData = await dispatchRes.json();

      const activeOrders: Record<string, string> = {};
      if (dispatchData.queue) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dispatchData.queue.forEach((d: any) => {
          if (d.selectedDriverId && d.orderId) activeOrders[d.selectedDriverId] = d.orderId;
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const driverLocations = (driversData.drivers || []).map((d: any, index: number) => {
        const zone = d.currentZone || d.zoneId || 'zone-laval';
        const zoneCenter = ZONE_CENTERS[zone] || ZONE_CENTERS['zone-laval'];
        const offset = 0.008;
        const angle = (index * 72) * (Math.PI / 180);
        return {
          id: d.id,
          name: d.name || `${d.firstName || ''} ${d.lastName || ''}`.trim() || `Chauffeur ${index + 1}`,
          lat: zoneCenter.lat + Math.cos(angle) * offset,
          lng: zoneCenter.lng + Math.sin(angle) * offset,
          status: d.status || 'offline',
          currentOrder: activeOrders[d.id],
          zone,
        };
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const storeLocations = (storesData.stores || []).map((s: any) => {
        const coords = STORE_COORDS[s.name] || ZONE_CENTERS['zone-laval'];
        return { id: s.id, name: s.name || s.id, lat: coords.lat, lng: coords.lng, status: s.status || 'open' };
      });

      setDrivers(driverLocations);
      setStores(storeLocations);
      setLastUpdate(new Date());
      setStats({
        online: driverLocations.filter((d: {status:string}) => d.status === 'online' || d.status === 'delivering').length,
        delivering: driverLocations.filter((d: {status:string;currentOrder?:string}) => d.currentOrder).length,
        available: driverLocations.filter((d: {status:string;currentOrder?:string}) => d.status === 'online' && !d.currentOrder).length,
        offline: driverLocations.filter((d: {status:string}) => d.status === 'offline').length,
      });
    } catch (err) {
      console.error('Erreur carte:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mapMarkers = [
    ...(showDrivers ? drivers
      .filter(d => selectedZone === 'all' || d.zone === selectedZone)
      .map(d => ({
        id: d.id, lat: d.lat, lng: d.lng, type: 'driver' as const,
        label: d.name,
        status: d.status === 'online' ? 'En ligne' : d.status === 'delivering' ? 'En livraison' : 'Hors ligne',
        info: d.currentOrder ? `Commande: ${d.currentOrder}` : 'Disponible',
      })) : []),
    ...(showStores ? stores.map(s => ({
      id: s.id, lat: s.lat, lng: s.lng, type: 'store' as const,
      label: s.name, status: s.status === 'open' ? 'Ouvert' : 'Fermé',
    })) : []),
  ];

  const mapCenter = selectedZone !== 'all' && ZONE_CENTERS[selectedZone]
    ? ZONE_CENTERS[selectedZone]
    : { lat: 45.5400, lng: -73.6500 };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carte Live — Grand Montréal</h1>
          <p className="text-sm text-gray-500 mt-1">
            Dernière mise à jour : {lastUpdate.toLocaleTimeString('fr-CA')} · Actualisation auto 15s
          </p>
        </div>
        <button onClick={fetchData} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium">
          ↻ Actualiser
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[{label:'En ligne',val:stats.online,color:'text-green-600'},{label:'En livraison',val:stats.delivering,color:'text-blue-600'},{label:'Disponibles',val:stats.available,color:'text-orange-600'},{label:'Hors ligne',val:stats.offline,color:'text-gray-400'}].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Zone :</label>
            <select value={selectedZone} onChange={e => setSelectedZone(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5">
              <option value="all">Toutes les zones</option>
              <option value="zone-laval">Laval</option>
              <option value="zone-laval-ouest">Laval Ouest</option>
              <option value="zone-longueuil">Longueuil</option>
              <option value="zone-mtl-centre">Montréal Centre-Ville</option>
              <option value="zone-mtl-nord">Montréal Nord</option>
            </select>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showDrivers} onChange={e => setShowDrivers(e.target.checked)} className="rounded" />
              <span className="text-sm">🚗 Chauffeurs ({drivers.length})</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showStores} onChange={e => setShowStores(e.target.checked)} className="rounded" />
              <span className="text-sm">🏪 Dépanneurs ({stores.length})</span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-3" />
              <p className="text-gray-500">Chargement des données...</p>
            </div>
          </div>
        ) : (
          <GoogleMapView
            center={mapCenter}
            zoom={selectedZone === 'all' ? 11 : 13}
            markers={mapMarkers}
            height="550px"
          />
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Légende</h3>
        <div className="flex flex-wrap gap-6">
          {[{color:'bg-green-500',label:'Chauffeur disponible'},{color:'bg-blue-500',label:'Chauffeur en livraison'},{color:'bg-yellow-500',label:'Dépanneur ouvert'},{color:'bg-gray-400',label:'Hors ligne / Fermé'}].map(l => (
            <div key={l.label} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${l.color}`} />
              <span className="text-sm text-gray-600">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
