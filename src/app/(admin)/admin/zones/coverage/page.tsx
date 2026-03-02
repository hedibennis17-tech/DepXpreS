'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('@/components/maps/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto" />
    </div>
  ),
});

// Coordonnées réelles des zones de livraison DepXpreS — Grand Montréal
const ZONE_COORDS: Record<string, { lat: number; lng: number }> = {
  'zone-laval': { lat: 45.5631, lng: -73.7124 },
  'zone-laval-ouest': { lat: 45.5500, lng: -73.7800 },
  'zone-longueuil': { lat: 45.5312, lng: -73.5185 },
  'zone-mtl-centre': { lat: 45.5017, lng: -73.5673 },
  'zone-mtl-nord': { lat: 45.5900, lng: -73.6200 },
  'laval': { lat: 45.5631, lng: -73.7124 },
  'laval-ouest': { lat: 45.5500, lng: -73.7800 },
  'longueuil': { lat: 45.5312, lng: -73.5185 },
  'mtl-centre': { lat: 45.5017, lng: -73.5673 },
  'mtl-nord': { lat: 45.5900, lng: -73.6200 },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getZoneCoords(zone: any): { lat: number; lng: number } {
  const key = zone.slug || zone.id || '';
  return ZONE_COORDS[key] || { lat: 45.5400 + Math.random() * 0.05, lng: -73.6500 + Math.random() * 0.05 };
}

export default function ZonesCoveragePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/zones')
      .then(r => r.json())
      .then(d => setZones(d.zones || []))
      .finally(() => setLoading(false));
  }, []);

  const mapMarkers = zones.map(z => {
    const coords = getZoneCoords(z);
    return {
      id: z.id,
      lat: coords.lat,
      lng: coords.lng,
      type: 'store' as const,
      label: z.nameFr || z.name || z.id,
      status: z.isActive ? 'Zone active' : 'Zone inactive',
      info: `Frais: ${z.deliveryFee || z.baseFee || '4.99'}$ · Délai: ${z.estimatedTime || 25} min`,
    };
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Couverture des zones</h1>
        <p className="text-sm text-gray-500 mt-1">
          {zones.length} zone(s) de livraison — Grand Montréal
        </p>
      </div>

      {/* Carte Google Maps */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
          </div>
        ) : (
          <LeafletMap
            center={[45.5400, -73.6500]}
            zoom={11}
            markers={mapMarkers}
            height="500px"
          />
        )}
      </div>

      {/* Liste des zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.map(z => (
          <div key={z.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-orange-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{z.nameFr || z.name || z.id}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                z.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {z.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Frais de livraison</p>
                <p className="font-semibold text-gray-900">{z.deliveryFee || z.baseFee || '4.99'} $</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Délai estimé</p>
                <p className="font-semibold text-gray-900">{z.estimatedTime || 25} min</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Chauffeurs</p>
                <p className="font-semibold text-gray-900">{z.driverCount || z.activeDrivers || 0}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Dépanneurs</p>
                <p className="font-semibold text-gray-900">{z.storeCount || z.activeStores || 0}</p>
              </div>
            </div>
          </div>
        ))}
        {!loading && zones.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-400">
            Aucune zone de livraison configurée
          </div>
        )}
      </div>
    </div>
  );
}
