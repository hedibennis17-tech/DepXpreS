"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { ACTIVE_ZONES, type DeliveryZone } from "@/lib/delivery-zones";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, collection, query, where, onSnapshot, serverTimestamp } from "firebase/firestore";
import {
  MapPin, Package, DollarSign, Star, Clock,
  Wifi, WifiOff, Navigation, CheckCircle2, Phone,
  Store, AlertCircle, Loader2, TrendingUp, User, ChevronRight
} from "lucide-react";
import Link from "next/link";

interface DriverProfile {
  uid: string;
  full_name: string;
  email: string;
  phone?: string;
  driver_status: "online" | "offline" | "busy";
  rating_average: number;
  rating_count: number;
  total_deliveries: number;
  current_zone_id?: string;
  application_status: string;
  vehicle_type?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  photoUrl?: string;
}

interface ActiveOrder {
  id: string;
  orderNumber?: string;
  storeName?: string;
  storeAddress?: string;
  deliveryAddress?: string;
  clientName?: string;
  clientPhone?: string;
  total?: number;
  status?: string;
  items?: { name: string; qty: number }[];
}

const STATUS_CONFIG = {
  online:  { label: "En ligne",    color: "bg-green-500",  text: "text-green-400",  border: "border-green-500/30"  },
  offline: { label: "Hors ligne",  color: "bg-gray-500",   text: "text-gray-400",   border: "border-gray-500/30"   },
  busy:    { label: "En livraison",color: "bg-orange-500", text: "text-orange-400", border: "border-orange-500/30" },
};

export default function DriverDashboard() {
  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);
  const [todayStats, setTodayStats] = useState({ deliveries: 0, earnings: 0 });
  const [toggling, setToggling] = useState(false);
  const [showZonePicker, setShowZonePicker] = useState(false);
  const [activeZone, setActiveZone] = useState<DeliveryZone | null>(null);
  const [locationGranted, setLocationGranted] = useState(false);

  // Demander GPS au montage
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationGranted(true);
          // Mettre à jour position dans Firestore
          if (auth.currentUser) {
            updateDoc(doc(db, "driver_profiles", auth.currentUser.uid), {
              last_lat: pos.coords.latitude,
              last_lng: pos.coords.longitude,
              last_location_at: serverTimestamp(),
            }).catch(() => {});
          }
        },
        () => setLocationGranted(false),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { setLoading(false); return; }
      try {
        // Chercher dans driver_profiles ET app_users
        const [profileDoc, userDoc] = await Promise.all([
          getDoc(doc(db, "driver_profiles", user.uid)),
          getDoc(doc(db, "app_users", user.uid)),
        ]);

        const profileData = profileDoc.exists() ? profileDoc.data() : {};
        const userData = userDoc.exists() ? userDoc.data() : {};

        setDriver({
          uid: user.uid,
          full_name: profileData.full_name || userData.display_name || user.displayName || "Chauffeur",
          email: user.email || "",
          phone: profileData.phone || userData.phone || user.phoneNumber || "",
          driver_status: profileData.driver_status || "offline",
          rating_average: profileData.rating_average || 0,
          rating_count: profileData.rating_count || 0,
          total_deliveries: profileData.total_deliveries || 0,
          current_zone_id: profileData.current_zone_id || "",
          application_status: profileData.application_status || "draft",
          vehicle_type: profileData.vehicle_type || "",
          vehicle_make: profileData.vehicle_make || "",
          vehicle_model: profileData.vehicle_model || "",
          photoUrl: profileData.photoUrl || user.photoURL || "",
        });

        // Écouter commande active
        const orderUnsub = onSnapshot(
          query(collection(db, "orders"),
            where("driverId", "==", user.uid),
            where("status", "in", ["assigned", "picked_up", "en_route"])
          ),
          (snap) => {
            if (!snap.empty) {
              const d = snap.docs[0].data();
              setActiveOrder({ id: snap.docs[0].id, ...d } as ActiveOrder);
            } else {
              setActiveOrder(null);
            }
          }
        );

        // Stats du jour
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const statsSnap = await getDoc(doc(db, "driver_profiles", user.uid));
        if (statsSnap.exists()) {
          setTodayStats({
            deliveries: statsSnap.data().today_deliveries || 0,
            earnings: statsSnap.data().today_earnings || 0,
          });
        }

        return () => orderUnsub();
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    });
    return () => unsub();
  }, []);

  async function toggleStatus() {
    if (!driver) return;
    setToggling(true);
    const newStatus = driver.driver_status === "online" ? "offline" : "online";
    try {
      await updateDoc(doc(db, "driver_profiles", driver.uid), {
        driver_status: newStatus,
        last_seen: serverTimestamp(),
      });
      setDriver(prev => prev ? { ...prev, driver_status: newStatus } : null);
    } catch (e) { console.error(e); }
    finally { setToggling(false); }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
    </div>
  );

  if (!driver) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <AlertCircle className="h-10 w-10 text-gray-400 mb-3" />
      <p className="text-gray-400 mb-4">Profil chauffeur introuvable</p>
      <Link href="/driver/login" className="text-orange-400 font-semibold text-sm">Se connecter →</Link>
    </div>
  );

  const status = STATUS_CONFIG[driver.driver_status] || STATUS_CONFIG.offline;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-24 px-4 pt-4 space-y-4 max-w-lg mx-auto">

      {/* Banner wizard si profil incomplet */}
      {!driver.vehicle_make && (
        <Link href="/driver/wizard"
          className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 hover:bg-orange-500/15 transition-colors">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-orange-400">Compléter mon profil</p>
            <p className="text-xs text-gray-500">Ajoutez votre véhicule et vos documents pour être approuvé</p>
          </div>
          <ChevronRight className="h-4 w-4 text-orange-400 shrink-0" />
        </Link>
      )}

      {/* ── PROFIL CHAUFFEUR ── */}
      <div className="bg-[#1a1a1a] rounded-3xl p-5 border border-white/5">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-2xl font-bold text-orange-400 shrink-0 overflow-hidden">
            {driver.photoUrl
              ? <img src={driver.photoUrl} alt={driver.full_name} className="w-full h-full object-cover" />
              : driver.full_name[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white truncate">{driver.full_name}</h1>
            <p className="text-gray-400 text-sm truncate">{driver.email}</p>
            <div className="flex items-center gap-2 mt-1">
              {driver.rating_average > 0 && (
                <span className="flex items-center gap-1 text-xs text-yellow-400">
                  <Star className="h-3 w-3 fill-yellow-400" />
                  {driver.rating_average.toFixed(1)} ({driver.rating_count})
                </span>
              )}
              {driver.vehicle_make && (
                <span className="text-xs text-gray-500">{driver.vehicle_make} {driver.vehicle_model}</span>
              )}
            </div>
          </div>
          <Link href="/driver/profile" className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <User className="h-5 w-5 text-gray-400" />
          </Link>
        </div>
      </div>

      {/* ── TOGGLE EN LIGNE ── */}
      <button onClick={toggleStatus} disabled={toggling}
        className={`w-full flex items-center justify-between p-5 rounded-3xl border-2 transition-all ${
          driver.driver_status === "online"
            ? "bg-green-500/10 border-green-500/40"
            : "bg-white/5 border-white/10"
        }`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            driver.driver_status === "online" ? "bg-green-500/20" : "bg-gray-500/20"
          }`}>
            {driver.driver_status === "online"
              ? <Wifi className="h-6 w-6 text-green-400" />
              : <WifiOff className="h-6 w-6 text-gray-500" />}
          </div>
          <div className="text-left">
            <p className="font-bold text-white text-base">
              {driver.driver_status === "online" ? "Je suis en ligne" : "Je suis hors ligne"}
            </p>
            <p className={`text-sm ${status.text}`}>{status.label}</p>
          </div>
        </div>
        <div className={`w-14 h-7 rounded-full transition-all flex items-center px-1 ${
          driver.driver_status === "online" ? "bg-green-500 justify-end" : "bg-gray-700 justify-start"
        }`}>
          {toggling
            ? <Loader2 className="h-5 w-5 text-white animate-spin" />
            : <div className="w-5 h-5 bg-white rounded-full shadow" />}
        </div>
      </button>

      {/* ── SÉLECTEUR DE ZONE ── */}
      <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-orange-400" />
            <span className="text-sm font-bold text-white">Zone active</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`w-1.5 h-1.5 rounded-full ${locationGranted ? "bg-green-500 animate-pulse" : "bg-gray-600"}`} />
            {locationGranted ? "GPS actif" : "GPS inactif"}
          </div>
        </div>
        <button onClick={() => setShowZonePicker(v => !v)}
          className="w-full flex items-center justify-between bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm hover:border-orange-500/40 transition-colors">
          <span className={activeZone ? "text-white font-semibold" : "text-gray-500"}>
            {activeZone?.name || driver?.zone_name || "Choisir votre zone de livraison"}
          </span>
          <ChevronRight className={`h-4 w-4 text-gray-500 transition-transform ${showZonePicker ? "rotate-90" : ""}`} />
        </button>
        {showZonePicker && (
          <div className="mt-2 bg-[#111] border border-white/10 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
            {["laval","montreal","longueuil"].map(g => (
              <div key={g}>
                <div className="px-4 py-2 bg-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-white/5">
                  {g === "laval" ? "🏙️ Laval" : g === "montreal" ? "🗺️ Montréal" : "🌉 Longueuil"}
                </div>
                {ACTIVE_ZONES.filter(z => z.delivery_zone_group === g).map(z => (
                  <button key={z.id} onClick={async () => {
                    setActiveZone(z);
                    setShowZonePicker(false);
                    if (driver?.uid) {
                      await updateDoc(doc(db, "driver_profiles", driver.uid), {
                        current_zone_id: z.id, zone_name: z.name, updated_at: serverTimestamp()
                      }).catch(() => {});
                    }
                  }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${
                      (activeZone?.id === z.id || (!activeZone && driver?.current_zone_id === z.id)) ? "text-orange-400" : "text-gray-300"
                    }`}>
                    <span className="text-sm">{z.name}</span>
                    <span className="text-[10px] text-gray-500">{z.estimated_time_min}-{z.estimated_time_max} min</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── STATS DU JOUR ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Package, label: "Livraisons", value: String(driver.total_deliveries || 0), color: "text-blue-400", bg: "bg-blue-500/10" },
          { icon: DollarSign, label: "Aujourd'hui", value: `$${todayStats.earnings.toFixed(2)}`, color: "text-green-400", bg: "bg-green-500/10" },
          { icon: Star, label: "Note", value: driver.rating_average > 0 ? driver.rating_average.toFixed(1) : "—", color: "text-yellow-400", bg: "bg-yellow-500/10" },
        ].map(s => (
          <div key={s.label} className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5 text-center">
            <div className={`w-8 h-8 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── COMMANDE ACTIVE ── */}
      {activeOrder ? (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-3xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <p className="font-bold text-orange-400">Livraison en cours</p>
            <span className="text-xs text-gray-400 ml-auto">#{activeOrder.orderNumber || activeOrder.id.slice(-6)}</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Store className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-400">Commerce</p>
                <p className="text-sm font-semibold text-white">{activeOrder.storeName || "—"}</p>
                <p className="text-xs text-gray-500">{activeOrder.storeAddress || ""}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Navigation className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-400">Livrer à</p>
                <p className="text-sm font-semibold text-white">{activeOrder.deliveryAddress || "—"}</p>
              </div>
            </div>
            {activeOrder.clientPhone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-blue-400 shrink-0" />
                <a href={`tel:${activeOrder.clientPhone}`} className="text-sm text-blue-400 font-semibold">
                  {activeOrder.clientPhone}
                </a>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button className="flex-1 bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Confirmer livraison
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#1a1a1a] border border-white/5 rounded-3xl p-6 text-center">
          <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Package className="h-7 w-7 text-gray-600" />
          </div>
          <p className="text-gray-400 font-medium text-sm">Aucune livraison en cours</p>
          <p className="text-gray-600 text-xs mt-1">
            {driver.driver_status === "online" ? "En attente d'une nouvelle commande..." : "Activez votre statut pour recevoir des commandes"}
          </p>
        </div>
      )}

      {/* ── CARTE ZONE ── */}
      <div className="bg-[#1a1a1a] rounded-3xl border border-white/5 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-orange-400" />
            <span className="text-sm font-bold">Votre zone</span>
          </div>
          <span className={`text-xs font-semibold flex items-center gap-1 ${status.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.color} animate-pulse`} />
            {status.label}
          </span>
        </div>
        <div className="h-48">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d22400!2d-73.7124!3d45.5631!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sfr!2sca!4v1"
            width="100%" height="100%"
            style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
            allowFullScreen loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      {/* ── LIENS RAPIDES ── */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { href: "/driver/orders", icon: Package, label: "Mes livraisons", color: "text-blue-400", bg: "bg-blue-500/10" },
          { href: "/driver/earnings", icon: DollarSign, label: "Mes gains", color: "text-green-400", bg: "bg-green-500/10" },
          { href: "/driver/history", icon: Clock, label: "Historique", color: "text-purple-400", bg: "bg-purple-500/10" },
          { href: "/driver/profile", icon: TrendingUp, label: "Mon profil", color: "text-orange-400", bg: "bg-orange-500/10" },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 flex items-center gap-3 hover:border-orange-500/20 transition-all">
            <div className={`w-9 h-9 ${item.bg} rounded-xl flex items-center justify-center shrink-0`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
            <span className="text-sm font-semibold text-gray-300">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
