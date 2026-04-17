'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi, Package, MapPin, Truck, Navigation } from 'lucide-react';
import dynamic from 'next/dynamic';

const GoogleMapView = dynamic(() => import('@/components/maps/GoogleMapView'), { ssr: false, loading: () => <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div> });
import { cn } from '@/lib/utils';

interface DriverLocation {
  id: string;
  fullName?: string;
  full_name?: string;
  firstName?: string;
  lastName?: string;
  isOnline?: boolean;
  currentOrderId?: string;
  zoneName?: string;
  current_zone_id?: string;
  lat?: number;
  lng?: number;
  rating?: number;
}

interface ActiveOrder {
  id: string;
  orderNumber?: string;
  order_status?: string;
  status?: string;
  driverName?: string;
  storeName?: string;
  totalAmount?: number;
}

interface DashboardData {
  onlineDrivers?: DriverLocation[];
  activeOrders?: ActiveOrder[];
  kpis?: Record<string, number>;
}

// Coordonnées fixes de Montréal pour la carte statique
const MONTREAL_ZONES = [
  { name: 'Centre-Ville', lat: 45.5017, lng: -73.5673 },
  { name: 'Laval', lat: 45.6066, lng: -73.7124 },
  { name: 'Longueuil', lat: 45.5315, lng: -73.5185 },
  { name: 'Montréal Nord', lat: 45.5935, lng: -73.6174 },
  { name: 'Laval Ouest', lat: 45.5731, lng: -73.7690 },
];

export default function DashboardMapPage() {
  const [data, setData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Éviter les erreurs d'hydratation SSR/CSR
  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json || {});
      }
    } catch (err) {
      console.error('Dashboard map fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchData();
      const interval = setInterval(() => fetchData(true), 30000);
      return () => clearInterval(interval);
    }
  }, [mounted, fetchData]);

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
        <span className="ml-3 text-muted-foreground">Chargement de la carte...</span>
      </div>
    );
  }

  const onlineDrivers: DriverLocation[] = Array.isArray(data?.onlineDrivers) ? data.onlineDrivers : [];
  const activeOrders: ActiveOrder[] = Array.isArray(data?.activeOrders) ? data.activeOrders : [];
  const deliveringOrders = activeOrders.filter((o) => o.order_status === 'delivering' || o.status === 'delivering');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Carte en direct</h1>
          <p className="text-muted-foreground mt-1">
            Positions des chauffeurs et commandes actives — Grand Montréal
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
          Actualiser
        </Button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Chauffeurs en ligne', value: onlineDrivers.length, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', icon: Wifi },
          { label: 'Commandes actives', value: activeOrders.length, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: Package },
          { label: 'En livraison', value: deliveringOrders.length, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', icon: Truck },
          { label: 'Zones couvertes', value: MONTREAL_ZONES.length, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', icon: MapPin },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className={cn('border-0 shadow-sm', stat.bg)}>
              <CardContent className="pt-3 pb-3 px-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={cn('h-4 w-4', stat.color)} />
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
                <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Carte visuelle Grand Montréal */}
      <Card className="border shadow-md overflow-hidden">
        <CardHeader className="pb-2 pt-4 bg-slate-50 dark:bg-slate-900 border-b">
          <CardTitle className="text-sm flex items-center gap-2">
            <Navigation className="h-4 w-4 text-orange-500" />
            Carte Grand Montréal — Temps réel
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative w-full bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800"
            style={{ height: '480px' }}>
            <GoogleMapView
              center={{ lat: 45.5514, lng: -73.6483 }}
              zoom={11}
              height="100%"
              className="absolute inset-0"
              markers={[
                ...onlineDrivers.slice(0, 10).map(d => ({
                  id: d.id,
                  lat: d.lat || 45.5017 + (Math.random() - 0.5) * 0.1,
                  lng: d.lng || -73.5673 + (Math.random() - 0.5) * 0.1,
                  type: 'driver' as const,
                  label: d.fullName || d.full_name || 'Chauffeur',
                  status: d.isOnline ? 'online' : 'offline',
                })),
              ]}
            />

            {/* Marqueurs chauffeurs en ligne */}
            {onlineDrivers.slice(0, 7).map((driver, i) => {
              const name = driver.fullName || driver.full_name ||
                `${driver.firstName || ''} ${driver.lastName || ''}`.trim() || `Chauffeur ${i + 1}`;
              return (
                <div
                  key={driver.id}
                  className="absolute flex flex-col items-center gap-0.5 cursor-pointer group"
                  style={{
                    top: `${25 + (i * 11) % 55}%`,
                    left: `${15 + (i * 13) % 70}%`,
                    transform: 'translate(-50%, -100%)',
                  }}
                  title={name}
                >
                  <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg text-sm font-bold border-2 border-white group-hover:scale-110 transition-transform">
                    🚗
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded px-1.5 py-0.5 text-xs font-medium shadow-md border whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {name.split(' ')[0]}
                  </div>
                  <div className="w-1 h-1 bg-green-500 rounded-full" />
                </div>
              );
            })}

            {/* Marqueurs commandes en livraison */}
            {deliveringOrders.slice(0, 5).map((order, i) => (
              <div
                key={order.id}
                className="absolute flex flex-col items-center gap-0.5 cursor-pointer group"
                style={{
                  top: `${60 + (i * 8) % 25}%`,
                  left: `${30 + (i * 15) % 50}%`,
                  transform: 'translate(-50%, -100%)',
                }}
                title={order.orderNumber || order.id}
              >
                <div className="bg-orange-500 text-white rounded-lg w-8 h-8 flex items-center justify-center shadow-lg text-sm border-2 border-white group-hover:scale-110 transition-transform">
                  📦
                </div>
                <div className="w-1 h-1 bg-orange-500 rounded-full" />
              </div>
            ))}

            {/* Légende */}
            <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-800/90 rounded-lg p-3 shadow-md text-xs space-y-1.5">
              <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Légende</p>
              <div className="flex items-center gap-2">
                <span className="text-base">🚗</span>
                <span className="text-slate-600 dark:text-slate-400">Chauffeur en ligne</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">📦</span>
                <span className="text-slate-600 dark:text-slate-400">Commande en livraison</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-100 border border-blue-300" />
                <span className="text-slate-600 dark:text-slate-400">Zone de service</span>
              </div>
            </div>

            {/* Badge temps réel */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-green-500 text-white rounded-full px-3 py-1 text-xs font-medium shadow-md">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Temps réel
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listes détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chauffeurs actifs */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wifi className="h-4 w-4 text-green-500" />
              Chauffeurs en ligne ({onlineDrivers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {onlineDrivers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun chauffeur en ligne</p>
            ) : (
              <div className="space-y-2">
                {onlineDrivers.slice(0, 8).map((driver) => {
                  const name = driver.fullName || driver.full_name ||
                    `${driver.firstName || ''} ${driver.lastName || ''}`.trim() || driver.id;
                  const zone = driver.zoneName || driver.current_zone_id || '—';
                  return (
                    <div key={driver.id} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-muted/30">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
                        <span className="font-medium">{name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {driver.currentOrderId && (
                          <Badge className="text-xs bg-purple-100 text-purple-700 border-0">En livraison</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{zone}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Commandes actives */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4 text-orange-500" />
              Commandes actives ({activeOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {activeOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune commande active</p>
            ) : (
              <div className="space-y-2">
                {activeOrders.slice(0, 8).map((order) => {
                  const status = order.order_status || order.status || 'pending';
                  return (
                    <div key={order.id} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-muted/30">
                      <div>
                        <p className="font-medium">{order.orderNumber || order.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">{order.driverName || 'Non assigné'}</p>
                      </div>
                      <Badge className={cn('text-xs border-0', {
                        'bg-purple-100 text-purple-700': status === 'delivering',
                        'bg-blue-100 text-blue-700': status === 'assigned' || status === 'accepted',
                        'bg-yellow-100 text-yellow-700': status === 'pending',
                        'bg-orange-100 text-orange-700': status === 'pickup',
                        'bg-gray-100 text-gray-700': !['delivering','assigned','accepted','pending','pickup'].includes(status),
                      })}>
                        {status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
