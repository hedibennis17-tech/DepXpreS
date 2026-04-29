"use client";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { collection, addDoc, serverTimestamp, doc, getDoc, writeBatch } from "firebase/firestore";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Clock, CreditCard, Package,
  Lock, Loader2, CheckCircle2, Truck, AlertCircle
} from "lucide-react";

const TPS = 0.05;
const TVQ = 0.09975;
const DELIVERY_FEE = 4.99;

export default function CheckoutContent() {
  const cart = useCart();
  const router = useRouter();
  const params = useSearchParams();
  const promoCode = params.get("promo") || "";

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Laval");
  const [postalCode, setPostalCode] = useState("");
  const [deliveryLat, setDeliveryLat] = useState<number | null>(null);
  const [deliveryLng, setDeliveryLng] = useState<number | null>(null);
  const [apt, setApt] = useState("");
  const [instructions, setInstructions] = useState("");
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      if (!u) router.push("/client/login");
    });
    return () => unsub();
  }, [router]);

  // ── Google Places Autocomplete ──────────────────────────────────────
  useEffect(() => {
    function init() {
      if (!addressInputRef.current || autocompleteRef.current) return;
      const g = (window as any).google?.maps?.places;
      if (!g) return;
      const ac = new g.Autocomplete(addressInputRef.current, {
        types: ["address"],
        componentRestrictions: { country: "ca" },
        fields: ["address_components", "geometry", "formatted_address"],
      });
      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (!place?.geometry) return;
        let num = "", route = "", cityVal = "", postal = "";
        for (const c of place.address_components || []) {
          if (c.types[0] === "street_number") num = c.long_name;
          if (c.types[0] === "route") route = c.long_name;
          if (c.types[0] === "locality") cityVal = c.long_name;
          if (c.types[0] === "postal_code") postal = c.long_name;
        }
        setAddress([num, route].filter(Boolean).join(" ") || place.formatted_address || "");
        if (cityVal) setCity(cityVal);
        if (postal) setPostalCode(postal);
        setDeliveryLat(place.geometry.location.lat());
        setDeliveryLng(place.geometry.location.lng());
      });
      autocompleteRef.current = ac;
    }
    if ((window as any).google?.maps?.places) { init(); return; }
    const existing = document.getElementById("gmaps-places-sdk");
    if (existing) {
      const t = setInterval(() => {
        if ((window as any).google?.maps?.places) { clearInterval(t); init(); }
      }, 150);
      return () => clearInterval(t);
    }
    const cb = "__gmP" + Date.now();
    (window as any)[cb] = () => { delete (window as any)[cb]; init(); };
    const s = document.createElement("script");
    s.id = "gmaps-places-sdk";
    s.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAmDwm43D52jpgDp1MiNg_TvLBn_fDTsU8&libraries=places&callback=" + cb;
    document.head.appendChild(s);
  }, []);

  // Calculs
  const subtotal = cart.total;
  const discount = promoCode === "DEPXPRES1" ? subtotal * 0.1 : 0;
  const afterDiscount = subtotal - discount;
  const tps = afterDiscount * TPS;
  const tvq = afterDiscount * TVQ;
  const total = afterDiscount + tps + tvq + DELIVERY_FEE;

  async function handleOrder() {
    if (!address.trim()) { setError("Veuillez entrer votre adresse de livraison."); return; }
    if (cart.count === 0) { setError("Votre panier est vide."); return; }
    setError(""); setProcessing(true);

    try {
      const orderNumber = `FDC-${Date.now().toString().slice(-6)}`;
      const fullAddress = [address.trim(), apt ? `Apt ${apt}` : "", city.trim(), `QC ${postalCode.trim()}`].filter(Boolean).join(", ");

      // Récupérer les infos complètes du store (lat, lng, phone, zoneId)
      let storeData: Record<string, any> = {};
      if (cart.storeId) {
        const storeDoc = await getDoc(doc(db, "stores", cart.storeId));
        if (storeDoc.exists()) storeData = storeDoc.data();
      }

      // Récupérer le profil client complet
      let clientData: Record<string, any> = {};
      if (user?.uid) {
        const clientDoc = await getDoc(doc(db, "app_users", user.uid));
        if (clientDoc.exists()) clientData = clientDoc.data();
      }

      const mappedItems = cart.items.map(i => ({
        productId: i.id,
        name: i.name,
        price: i.price,
        qty: i.qty,
        imageUrl: i.imageUrl || "",
        categoryName: i.categoryName || "",
        subtotal: i.price * i.qty,
      }));

      // Doc principal de la commande — tous les champs nécessaires
      const orderPayload = {
        orderNumber,
        source: "client_app",
        // Client
        clientId: user?.uid || "",
        clientEmail: user?.email || "",
        clientName: clientData.display_name || clientData.full_name || user?.displayName || user?.email || "",
        clientPhone: clientData.phone || clientData.phoneNumber || "",
        clientPhotoUrl: clientData.photoURL || user?.photoURL || "",
        // Store
        storeId: cart.storeId || "",
        storeName: storeData.name || cart.storeName || "",
        storeAddress: storeData.address || "",
        storePhone: storeData.phone || "",
        storeLat: storeData.lat || storeData.latitude || null,
        storeLng: storeData.lng || storeData.longitude || null,
        // Zone
        zoneId: storeData.zoneId || "",
        zoneName: storeData.zoneName || "",
        // Articles (sauvés dans le doc ET sous-collection)
        items: mappedItems,
        itemCount: cart.count,
        // Livraison
        deliveryAddress: fullAddress,
        deliveryLat: deliveryLat,
        deliveryLng: deliveryLng,
        deliveryInstructions: instructions,
        deliveryFee: DELIVERY_FEE,
        estimatedDelivery: 30,
        // Paiement
        paymentMethod,
        paymentStatus: "pending",
        promoCode: promoCode || null,
        notes,
        // Montants
        subtotal,
        discount,
        tps,
        tvq,
        total,
        // Statut
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // 1. Créer la commande principale
      const orderRef = await addDoc(collection(db, "orders"), orderPayload);

      // 2. Sauvegarder les articles dans la sous-collection (pour l'admin)
      const batch = writeBatch(db);
      mappedItems.forEach(item => {
        const itemRef = doc(collection(db, "orders", orderRef.id, "items"));
        batch.set(itemRef, { ...item, orderId: orderRef.id, createdAt: serverTimestamp() });
      });

      // 3. Ajouter dans dispatch_queue pour le dispatch automatique
      const dispatchRef = doc(collection(db, "dispatch_queue"));
      batch.set(dispatchRef, {
        orderId: orderRef.id,
        orderNumber,
        storeId: cart.storeId || "",
        storeName: storeData.name || cart.storeName || "",
        storeAddress: storeData.address || "",
        storeLat: storeData.lat || storeData.latitude || null,
        storeLng: storeData.lng || storeData.longitude || null,
        clientId: user?.uid || "",
        clientName: clientData.display_name || user?.displayName || user?.email || "",
        clientPhone: clientData.phone || "",
        deliveryAddress: fullAddress,
        zoneId: storeData.zoneId || "",
        zoneName: storeData.zoneName || "",
        total,
        itemCount: cart.count,
        paymentMethod,
        dispatchStatus: "queued",
        priority: 1,
        attempts: 0,
        source: "client_app",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await batch.commit();

      setOrderId(orderRef.id);
      cart.clear();
      setSuccess(true);

    } catch (e) {
      console.error("Checkout error:", e);
      setError(e instanceof Error ? e.message : "Erreur lors de la commande. Réessayez.");
    } finally {
      setProcessing(false);
    }
  }

  // Écran succès
  if (success) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-xl border border-gray-100">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Commande confirmée !</h1>
        <p className="text-gray-500 text-sm mb-1">Votre commande est en cours de traitement.</p>
        <p className="text-orange-500 font-bold text-sm mb-6">⏱ Livraison estimée : 25–35 min</p>

        <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Commande</span>
            <span className="font-bold text-gray-900">#{orderId.slice(-6).toUpperCase()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total payé</span>
            <span className="font-bold text-orange-500">${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Paiement</span>
            <span className="font-semibold text-gray-900 capitalize">
              {paymentMethod === "cash" ? "Comptant" : "Carte"}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Link href={`/client/orders`}
            className="flex items-center justify-center gap-2 bg-orange-500 text-white font-semibold py-3 rounded-2xl hover:bg-orange-600 transition-colors w-full">
            <Package className="h-4 w-4" /> Suivre ma commande
          </Link>
          <Link href="/client"
            className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-semibold py-3 rounded-2xl hover:bg-gray-50 transition-colors w-full">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );

  if (cart.count === 0 && !success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Votre panier est vide</p>
          <Link href="/client" className="text-orange-500 font-semibold">← Retour à l&apos;accueil</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32 md:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/client/cart" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Confirmer la commande</h1>
            <p className="text-xs text-gray-500">{cart.storeName}</p>
          </div>
          <div className="ml-auto flex items-center gap-1 text-gray-400 text-xs">
            <Lock className="h-3.5 w-3.5" /> Paiement sécurisé
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="grid md:grid-cols-5 gap-4">

          {/* Formulaire — gauche */}
          <div className="md:col-span-3 space-y-4">

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />{error}
              </div>
            )}

            {/* Adresse livraison */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-500" /> Adresse de livraison
              </h2>
              {/* Autocomplete Google Places */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  ref={addressInputRef}
                  value={address}
                  onChange={e => { setAddress(e.target.value); setDeliveryLat(null); setDeliveryLng(null); }}
                  placeholder="Rechercher votre adresse…"
                  autoComplete="off"
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-orange-400 transition-colors"
                />
                {deliveryLat && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-xs font-bold">✓ GPS</span>
                )}
              </div>
              <input value={apt} onChange={e => setApt(e.target.value)}
                placeholder="Appartement, suite (optionnel)"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 transition-colors" />
              <div className="grid grid-cols-2 gap-2">
                <input value={city} onChange={e => setCity(e.target.value)}
                  placeholder="Ville *"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 transition-colors" />
                <input value={postalCode} onChange={e => setPostalCode(e.target.value.toUpperCase())}
                  placeholder="Code postal *"
                  maxLength={7}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 transition-colors" />
              </div>
              {deliveryLat && deliveryLng && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  ✅ Adresse géolocalisée — le GPS calculera la distance exacte
                </p>
              )}
              <input value={instructions} onChange={e => setInstructions(e.target.value)}
                placeholder="Instructions ex: Sonner à la porte, code: 1234"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 transition-colors" />
            </div>

            {/* Délai */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-orange-500" /> Délai de livraison
              </h2>
              <div className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-xl p-3">
                <Truck className="h-5 w-5 text-orange-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-orange-700">Express — 25 à 35 min</p>
                  <p className="text-xs text-orange-500">Livraison à votre porte</p>
                </div>
                <span className="ml-auto bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">Disponible</span>
              </div>
            </div>

            {/* Paiement */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                <CreditCard className="h-4 w-4 text-orange-500" /> Mode de paiement
              </h2>
              <div className="space-y-2">
                {[
                  { id: "cash", title: "Comptant à la livraison", desc: "Payer en espèces au chauffeur", emoji: "💵" },
                  { id: "interac", title: "Interac e-Transfer", desc: "Transfert sécurisé depuis votre banque", emoji: "🏦" },
                  { id: "card", title: "Carte de crédit / débit", desc: "Paiement sécurisé en ligne", emoji: "💳" },
                ].map(m => (
                  <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      paymentMethod === m.id ? "border-orange-500 bg-orange-50" : "border-gray-100 hover:border-gray-200"
                    }`}>
                    <span className="text-2xl">{m.emoji}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${paymentMethod === m.id ? "text-orange-700" : "text-gray-900"}`}>{m.title}</p>
                      <p className="text-xs text-gray-500">{m.desc}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === m.id ? "border-orange-500 bg-orange-500" : "border-gray-300"}`}>
                      {paymentMethod === m.id && <div className="w-2 h-2 bg-white rounded-full m-px" />}
                    </div>
                  </button>
                ))}
              </div>

              {paymentMethod === "interac" && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
                  📧 Un email Interac vous sera envoyé après confirmation. Envoyez le paiement à <strong>paiement@fastdep.ca</strong>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h2 className="text-sm font-bold text-gray-900 mb-3">Notes supplémentaires</h2>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                placeholder="Instructions spéciales pour votre commande..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 transition-colors resize-none" />
            </div>
          </div>

          {/* Résumé — droite */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3 md:sticky md:top-20">
              <h2 className="text-sm font-bold text-gray-900">Votre commande</h2>

              {/* Articles */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cart.items.map(item => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
                      {item.imageUrl
                        ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> // eslint-disable-line
                        : <Package className="h-4 w-4 text-gray-300" />}
                    </div>
                    <p className="flex-1 text-xs text-gray-700 truncate">{item.name} ×{item.qty}</p>
                    <p className="text-xs font-bold text-gray-900 shrink-0">${(item.price * item.qty).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="h-px bg-gray-100" />

              {/* Calculs */}
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between"><span>Sous-total</span><span>${subtotal.toFixed(2)}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-600"><span>Rabais -10%</span><span>-${discount.toFixed(2)}</span></div>}
                <div className="flex justify-between"><span>Livraison</span><span>${DELIVERY_FEE.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>TPS 5%</span><span>${tps.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>TVQ 9,975%</span><span>${tvq.toFixed(2)}</span></div>
              </div>

              <div className="h-px bg-gray-100" />
              <div className="flex justify-between font-bold text-sm">
                <span>Total</span>
                <span className="text-orange-500">${total.toFixed(2)}</span>
              </div>

              {/* Bouton confirmer */}
              <button onClick={handleOrder} disabled={processing || !address.trim()}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white font-bold py-3.5 rounded-2xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-200">
                {processing
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Traitement...</>
                  : <><Lock className="h-4 w-4" />Confirmer — ${total.toFixed(2)}</>}
              </button>

              <p className="text-center text-xs text-gray-400">🔒 Paiement sécurisé SSL 256-bit</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
