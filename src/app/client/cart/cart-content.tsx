"use client";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Plus, Minus, Trash2, ShoppingCart, ArrowRight, Tag, X } from "lucide-react";
import { useState } from "react";

const TPS = 0.05;
const TVQ = 0.09975;
const DELIVERY_FEE = 4.99;

export default function CartContent() {
  const cart = useCart();
  const router = useRouter();
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");

  const subtotal = cart.total;
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const afterDiscount = subtotal - discount;
  const tps = afterDiscount * TPS;
  const tvq = afterDiscount * TVQ;
  const total = afterDiscount + tps + tvq + DELIVERY_FEE;

  function applyPromo() {
    if (promo.toUpperCase() === "DEPXPRES1") {
      setPromoApplied(true);
      setPromoError("");
    } else {
      setPromoError("Code invalide");
    }
  }

  if (cart.count === 0) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center mb-5">
        <ShoppingCart className="h-10 w-10 text-orange-300" />
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Votre panier est vide</h1>
      <p className="text-gray-500 text-sm mb-6">Ajoutez des articles depuis un commerce</p>
      <Link href="/client"
        className="flex items-center gap-2 bg-orange-500 text-white font-semibold px-6 py-3 rounded-2xl hover:bg-orange-600 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Continuer mes achats
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-32 md:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Mon panier</h1>
            <p className="text-xs text-gray-500">{cart.storeName} · {cart.count} article{cart.count > 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Articles */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {cart.items.map(item => (
            <div key={item.id} className="flex items-center gap-4 p-4">
              {/* Image */}
              <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> // eslint-disable-line
                  : <Package className="h-6 w-6 text-gray-300" />}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                {item.categoryName && <p className="text-xs text-gray-400">{item.categoryName}</p>}
                <p className="text-orange-500 font-bold text-sm mt-1">${(item.price * item.qty).toFixed(2)}</p>
              </div>
              {/* Qty controls */}
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => cart.decrement(item.id)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  {item.qty === 1 ? <Trash2 className="h-3.5 w-3.5 text-red-500" /> : <Minus className="h-3.5 w-3.5 text-gray-600" />}
                </button>
                <span className="text-sm font-bold text-gray-900 w-5 text-center">{item.qty}</span>
                <button onClick={() => cart.increment(item.id)}
                  className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-600 transition-colors">
                  <Plus className="h-3.5 w-3.5 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Ajouter d'autres articles */}
        <Link href={`/client/store/${cart.storeId}`}
          className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-orange-200 rounded-2xl text-orange-500 text-sm font-semibold hover:bg-orange-50 transition-colors">
          <Plus className="h-4 w-4" /> Ajouter d&apos;autres articles
        </Link>

        {/* Code promo */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Tag className="h-4 w-4 text-orange-500" /> Code promo
          </p>
          {promoApplied ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
              <p className="text-sm text-green-700 font-semibold">✅ DEPXPRES1 appliqué — -10%</p>
              <button onClick={() => { setPromoApplied(false); setPromo(""); }}
                className="text-green-500 hover:text-green-700">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input value={promo} onChange={e => setPromo(e.target.value.toUpperCase())}
                placeholder="Ex: DEPXPRES1"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 uppercase" />
              <button onClick={applyPromo}
                className="bg-orange-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-orange-600 transition-colors">
                Appliquer
              </button>
            </div>
          )}
          {promoError && <p className="text-red-500 text-xs mt-2">{promoError}</p>}
        </div>

        {/* Résumé prix */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <p className="text-sm font-bold text-gray-900">Résumé</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {promoApplied && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Rabais -10%</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Livraison</span>
              <span>${DELIVERY_FEE.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>TPS (5%)</span>
              <span>${tps.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>TVQ (9,975%)</span>
              <span>${tvq.toFixed(2)}</span>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex justify-between font-bold text-base text-gray-900">
              <span>Total</span>
              <span className="text-orange-500">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton checkout fixe */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:static md:bg-transparent md:border-0 md:p-0 md:max-w-2xl md:mx-auto md:px-4 md:pb-6">
        <Link href={{
          pathname: "/client/checkout",
          query: { total: total.toFixed(2), promo: promoApplied ? "DEPXPRES1" : "" }
        }}
          className="flex items-center justify-between bg-orange-500 text-white rounded-2xl px-5 py-4 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200 w-full">
          <span className="font-bold">Passer la commande</span>
          <div className="flex items-center gap-2">
            <span className="font-bold">${total.toFixed(2)}</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </Link>
      </div>
    </div>
  );
}
