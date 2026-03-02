'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, RefreshCw, Star, Truck, MapPin, Phone, Mail,
  CheckCircle2, XCircle, Clock, Wifi, WifiOff, Package,
  User, Car, FileText, DollarSign, AlertTriangle, Shield,
  ToggleLeft, ToggleRight, Edit2, Save, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DriverData {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  applicationStatus?: string;
  isOnline?: boolean;
  rating?: number;
  totalDeliveries?: number;
  currentOrderId?: string;
  zoneName?: string;
  zoneId?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  authUid?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
  suspensionReason?: string;
  availabilityStatus?: string;
  verificationStatus?: string;
  accountCreated?: boolean;
  passwordHint?: string;
}

interface Vehicle {
  id: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  licensePlate?: string;
  type?: string;
}

interface DriverDocument {
  id: string;
  type?: string;
  status?: string;
  expiryDate?: string;
  uploadedAt?: string;
}

interface Order {
  id: string;
  orderNumber?: string;
  status?: string;
  totalAmount?: number;
  createdAt?: string;
  storeName?: string;
  clientName?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: 'En attente',  color: 'text-yellow-700', bg: 'bg-yellow-100' },
  approved:   { label: 'Approuvé',   color: 'text-green-700',  bg: 'bg-green-100' },
  rejected:   { label: 'Rejeté',     color: 'text-red-700',    bg: 'bg-red-100' },
  suspended:  { label: 'Suspendu',   color: 'text-orange-700', bg: 'bg-orange-100' },
  incomplete: { label: 'Incomplet',  color: 'text-gray-700',   bg: 'bg-gray-100' },
};

const AVAIL_STATUS: Record<string, { label: string; color: string }> = {
  available:   { label: 'Disponible',   color: 'text-green-600' },
  busy:        { label: 'En livraison', color: 'text-purple-600' },
  offline:     { label: 'Hors ligne',   color: 'text-gray-500' },
  unavailable: { label: 'Indisponible', color: 'text-red-500' },
};

export default function DriverDetailPage() {
  const { driverId } = useParams() as { driverId: string };
  const router = useRouter();

  const [driver, setDriver] = useState<DriverData | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [documents, setDocuments] = useState<DriverDocument[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [zone, setZone] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Champs éditables
  const [editMode, setEditMode] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editSuspensionReason, setEditSuspensionReason] = useState('');

  const fetchDriver = useCallback(async () => {
    if (!driverId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/drivers/${driverId}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur ${res.status}`);
      }
      const data = await res.json();
      setDriver(data.driver || null);
      setVehicle(data.vehicle || null);
      setDocuments(data.documents || []);
      setOrders(data.recentOrders || []);
      setZone(data.zone || null);
      if (data.driver) {
        setEditNotes(data.driver.notes || '');
        setEditSuspensionReason(data.driver.suspensionReason || '');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => { fetchDriver(); }, [fetchDriver]);

  const updateDriver = async (updates: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/drivers/${driverId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Mise à jour échouée');
      await fetchDriver();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    updateDriver({ applicationStatus: newStatus });
  };

  const handleToggleOnline = () => {
    updateDriver({ isOnline: !driver?.isOnline });
  };

  const handleSaveNotes = () => {
    updateDriver({ notes: editNotes, suspensionReason: editSuspensionReason });
    setEditMode(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
        <span className="ml-3 text-muted-foreground">Chargement du profil...</span>
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-400" />
        <p className="text-lg font-semibold text-red-600">{error || 'Chauffeur introuvable'}</p>
        <p className="text-sm text-muted-foreground">ID: {driverId}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour
          </Button>
          <Button onClick={fetchDriver}>
            <RefreshCw className="h-4 w-4 mr-2" /> Réessayer
          </Button>
        </div>
      </div>
    );
  }

  const appCfg = STATUS_CONFIG[driver.applicationStatus || 'pending'] ?? STATUS_CONFIG.pending;
  const availCfg = AVAIL_STATUS[driver.availabilityStatus || (driver.isOnline ? 'available' : 'offline')];
  const fullName = `${driver.firstName || ''} ${driver.lastName || ''}`.trim() || 'Chauffeur';
  const initials = `${driver.firstName?.[0] || ''}${driver.lastName?.[0] || ''}`.toUpperCase() || 'CH';

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{fullName}</h1>
            <p className="text-sm text-muted-foreground">ID: {driverId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDriver}
            disabled={saving}
            className="gap-1"
          >
            <RefreshCw className={cn('h-4 w-4', saving && 'animate-spin')} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Profil header card */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-orange-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {initials}
              </div>
              <span className={cn(
                'absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white',
                driver.isOnline ? 'bg-green-500' : 'bg-gray-400'
              )} />
            </div>

            {/* Infos principales */}
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold">{fullName}</h2>
                <Badge className={cn('border-0 text-xs', appCfg.bg, appCfg.color)}>
                  {appCfg.label}
                </Badge>
                {driver.isOnline ? (
                  <Badge className="border-0 text-xs bg-green-100 text-green-700">
                    <Wifi className="h-3 w-3 mr-1" /> En ligne
                  </Badge>
                ) : (
                  <Badge className="border-0 text-xs bg-gray-100 text-gray-600">
                    <WifiOff className="h-3 w-3 mr-1" /> Hors ligne
                  </Badge>
                )}
                {driver.accountCreated && (
                  <Badge className="border-0 text-xs bg-blue-100 text-blue-700">
                    <Shield className="h-3 w-3 mr-1" /> Auth Firebase
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {driver.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> {driver.email}
                  </span>
                )}
                {driver.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> {driver.phone}
                  </span>
                )}
                {driver.zoneName && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {driver.zoneName}
                  </span>
                )}
              </div>
              {driver.authUid && (
                <p className="text-xs text-muted-foreground font-mono">
                  UID Firebase: {driver.authUid}
                </p>
              )}
            </div>

            {/* Stats rapides */}
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-orange-500">{driver.totalDeliveries || 0}</p>
                <p className="text-xs text-muted-foreground">Livraisons</p>
              </div>
              <div>
                <div className="flex items-center gap-1 justify-center">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <p className="text-2xl font-bold">{(driver.rating || 0).toFixed(1)}</p>
                </div>
                <p className="text-xs text-muted-foreground">Note</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Changer statut application */}
        <Card className="border shadow-sm">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Statut du compte</p>
            <Select
              value={driver.applicationStatus || 'pending'}
              onValueChange={handleStatusChange}
              disabled={saving}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
                <SelectItem value="suspended">Suspendu</SelectItem>
                <SelectItem value="incomplete">Incomplet</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Toggle en ligne */}
        <Card className="border shadow-sm">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Disponibilité</p>
            <Button
              variant={driver.isOnline ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'w-full h-9 gap-2 text-sm',
                driver.isOnline
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'border-gray-300'
              )}
              onClick={handleToggleOnline}
              disabled={saving}
            >
              {driver.isOnline ? (
                <><ToggleRight className="h-4 w-4" /> En ligne</>
              ) : (
                <><ToggleLeft className="h-4 w-4" /> Hors ligne</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Statut disponibilité */}
        <Card className="border shadow-sm">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Statut activité</p>
            <Select
              value={driver.availabilityStatus || 'offline'}
              onValueChange={(v) => updateDriver({ availabilityStatus: v })}
              disabled={saving}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="busy">En livraison</SelectItem>
                <SelectItem value="offline">Hors ligne</SelectItem>
                <SelectItem value="unavailable">Indisponible</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Commande active */}
        <Card className={cn('border shadow-sm', driver.currentOrderId ? 'bg-purple-50 dark:bg-purple-900/20' : '')}>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Commande active</p>
            {driver.currentOrderId ? (
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700 truncate">{driver.currentOrderId}</span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Aucune commande</span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Credentials Firebase Auth */}
      {driver.accountCreated && driver.email && (
        <Card className="border border-blue-200 bg-blue-50 dark:bg-blue-900/20 shadow-sm">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
              <Shield className="h-4 w-4" /> Credentials Firebase Auth (pour tests)
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <code className="bg-white dark:bg-slate-800 px-2 py-1 rounded text-xs font-mono border">
                  {driver.email}
                </code>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Mot de passe</p>
                <code className="bg-white dark:bg-slate-800 px-2 py-1 rounded text-xs font-mono border">
                  {driver.passwordHint || 'DepXpreS2025!'}
                </code>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Firebase UID</p>
                <code className="bg-white dark:bg-slate-800 px-2 py-1 rounded text-xs font-mono border truncate block">
                  {driver.authUid || driver.userId || '—'}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="overview" className="gap-1.5 text-xs">
            <User className="h-3.5 w-3.5" /> Profil
          </TabsTrigger>
          <TabsTrigger value="vehicle" className="gap-1.5 text-xs">
            <Car className="h-3.5 w-3.5" /> Véhicule
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-1.5 text-xs">
            <Package className="h-3.5 w-3.5" /> Commandes
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-1.5 text-xs">
            <FileText className="h-3.5 w-3.5" /> Documents
          </TabsTrigger>
        </TabsList>

        {/* Onglet Profil */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border shadow-sm">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4 text-purple-500" /> Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 space-y-2">
                {[
                  { label: 'Prénom', value: driver.firstName },
                  { label: 'Nom', value: driver.lastName },
                  { label: 'Email', value: driver.email },
                  { label: 'Téléphone', value: driver.phone },
                  { label: 'Zone', value: driver.zoneName },
                  { label: 'Statut vérification', value: driver.verificationStatus },
                  { label: 'Membre depuis', value: driver.createdAt ? new Date(driver.createdAt).toLocaleDateString('fr-CA') : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-1.5 border-b last:border-0 text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-right max-w-48 truncate">{value || '—'}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Truck className="h-4 w-4 text-orange-500" /> Statistiques de livraison
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 space-y-2">
                {[
                  { label: 'Total livraisons', value: String(driver.totalDeliveries || 0) },
                  { label: 'Note moyenne', value: `${(driver.rating || 0).toFixed(1)} / 5.0` },
                  { label: 'Statut compte', value: appCfg.label },
                  { label: 'Disponibilité', value: availCfg?.label || '—' },
                  { label: 'Commande active', value: driver.currentOrderId || 'Aucune' },
                  { label: 'Auth Firebase', value: driver.accountCreated ? 'Actif' : 'Non créé' },
                  { label: 'Dernière MAJ', value: driver.updatedAt ? new Date(driver.updatedAt).toLocaleDateString('fr-CA') : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-1.5 border-b last:border-0 text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Notes admin */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-2 pt-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Edit2 className="h-4 w-4 text-blue-500" /> Notes administrateur
                </CardTitle>
                {!editMode ? (
                  <Button variant="ghost" size="sm" onClick={() => setEditMode(true)} className="h-7 text-xs gap-1">
                    <Edit2 className="h-3 w-3" /> Modifier
                  </Button>
                ) : (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setEditMode(false)} className="h-7 text-xs gap-1">
                      <X className="h-3 w-3" /> Annuler
                    </Button>
                    <Button size="sm" onClick={handleSaveNotes} disabled={saving} className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700">
                      <Save className="h-3 w-3" /> Sauvegarder
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pb-4 space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Notes internes</label>
                {editMode ? (
                  <textarea
                    className="w-full border rounded-md p-2 text-sm resize-none h-20 bg-background"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Notes sur ce chauffeur..."
                  />
                ) : (
                  <p className="text-sm text-muted-foreground bg-muted/30 rounded-md p-2 min-h-10">
                    {driver.notes || 'Aucune note'}
                  </p>
                )}
              </div>
              {(driver.applicationStatus === 'suspended' || editMode) && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Raison de suspension</label>
                  {editMode ? (
                    <textarea
                      className="w-full border rounded-md p-2 text-sm resize-none h-16 bg-background"
                      value={editSuspensionReason}
                      onChange={(e) => setEditSuspensionReason(e.target.value)}
                      placeholder="Raison de la suspension..."
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground bg-muted/30 rounded-md p-2 min-h-8">
                      {driver.suspensionReason || 'Aucune'}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Véhicule */}
        <TabsContent value="vehicle" className="mt-4">
          <Card className="border shadow-sm">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Car className="h-4 w-4 text-blue-500" /> Informations véhicule
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {vehicle ? (
                <div className="space-y-2">
                  {[
                    { label: 'Marque', value: vehicle.make },
                    { label: 'Modèle', value: vehicle.model },
                    { label: 'Année', value: vehicle.year ? String(vehicle.year) : undefined },
                    { label: 'Couleur', value: vehicle.color },
                    { label: 'Plaque', value: vehicle.licensePlate },
                    { label: 'Type', value: vehicle.type },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-1.5 border-b last:border-0 text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{value || '—'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Car className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">Aucun véhicule enregistré</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Commandes */}
        <TabsContent value="orders" className="mt-4">
          <Card className="border shadow-sm">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-500" /> Commandes récentes
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Package className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">Aucune commande</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 text-sm">
                      <div>
                        <p className="font-medium">{order.orderNumber || order.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.storeName || '—'} • {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-CA') : '—'}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={cn('border-0 text-xs mb-1', {
                          'bg-green-100 text-green-700': order.status === 'delivered',
                          'bg-blue-100 text-blue-700': order.status === 'delivering',
                          'bg-yellow-100 text-yellow-700': order.status === 'pending',
                          'bg-red-100 text-red-700': order.status === 'cancelled',
                          'bg-gray-100 text-gray-700': !['delivered','delivering','pending','cancelled'].includes(order.status || ''),
                        })}>
                          {order.status || '—'}
                        </Badge>
                        {order.totalAmount && (
                          <p className="text-xs font-medium">{order.totalAmount.toFixed(2)} $</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Documents */}
        <TabsContent value="documents" className="mt-4">
          <Card className="border shadow-sm">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-500" /> Documents officiels
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <FileText className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">Aucun document</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 text-sm">
                      <div>
                        <p className="font-medium capitalize">{doc.type?.replace(/_/g, ' ') || doc.id}</p>
                        {doc.expiryDate && (
                          <p className="text-xs text-muted-foreground">
                            Expire: {new Date(doc.expiryDate).toLocaleDateString('fr-CA')}
                          </p>
                        )}
                      </div>
                      <Badge className={cn('border-0 text-xs', {
                        'bg-green-100 text-green-700': doc.status === 'approved' || doc.status === 'valid',
                        'bg-yellow-100 text-yellow-700': doc.status === 'pending',
                        'bg-red-100 text-red-700': doc.status === 'rejected' || doc.status === 'expired',
                        'bg-gray-100 text-gray-700': !doc.status,
                      })}>
                        {doc.status || 'En attente'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
