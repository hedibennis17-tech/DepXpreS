"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Store, Phone, Mail, MapPin, Clock, Edit2,
  Check, X, RefreshCw, User, Shield
} from "lucide-react";

interface StoreData {
  name?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  postalCode?: string;
  description?: string;
  minOrderAmount?: number;
  deliveryFee?: number;
  preparationTime?: number;
}

export default function StoreProfilePage() {
  const [storeId, setStoreId] = useState("");
  const [storeData, setStoreData] = useState<StoreData>({});
  const [editData, setEditData] = useState<StoreData>({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const sid = localStorage.getItem("storeId") || "";
    setStoreId(sid);
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email || "");
        setUserName(user.displayName || localStorage.getItem("storeUserName") || "");
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!storeId) return;
    const unsub = onSnapshot(doc(db, "stores", storeId), (snap) => {
      if (snap.exists()) {
        setStoreData(snap.data() as StoreData);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [storeId]);

  const startEdit = () => {
    setEditData({ ...storeData });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditData({});
  };

  const saveProfile = async () => {
    if (!storeId) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "stores", storeId), {
        ...editData,
        minOrderAmount: Number(editData.minOrderAmount) || 0,
        deliveryFee: Number(editData.deliveryFee) || 0,
        preparationTime: Number(editData.preparationTime) || 15,
        updatedAt: serverTimestamp(),
      });
      setIsEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const data = isEditing ? editData : storeData;

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
          <p className="text-gray-500 text-sm mt-0.5">Informations de votre dépanneur</p>
        </div>
        {!isEditing ? (
          <Button onClick={startEdit} variant="outline" className="border-orange-200 text-orange-500 hover:bg-orange-50">
            <Edit2 className="h-4 w-4 mr-1.5" /> Modifier
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={saveProfile}
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-1" /> Sauvegarder</>}
            </Button>
            <Button variant="outline" onClick={cancelEdit}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
          <Check className="h-4 w-4" /> Profil mis à jour avec succès !
        </div>
      )}

      {/* Infos compte */}
      <div className="bg-white rounded-2xl border shadow-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <User className="h-5 w-5 text-gray-500" />
          </div>
          <h2 className="font-bold text-gray-900">Compte utilisateur</h2>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <User className="h-4 w-4 text-gray-400" />
            <span>{userName || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="h-4 w-4 text-gray-400" />
            <span>{userEmail || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Shield className="h-4 w-4 text-gray-400" />
            <span>{localStorage.getItem("storeUserRole") || "store_owner"}</span>
          </div>
        </div>
      </div>

      {/* Infos dépanneur */}
      <div className="bg-white rounded-2xl border shadow-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <Store className="h-5 w-5 text-orange-500" />
          </div>
          <h2 className="font-bold text-gray-900">Informations du dépanneur</h2>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-gray-500">Nom du dépanneur</Label>
              <Input
                value={editData.name || ""}
                onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Adresse</Label>
              <Input
                value={editData.address || ""}
                onChange={e => setEditData(d => ({ ...d, address: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-gray-500">Ville</Label>
                <Input
                  value={editData.city || ""}
                  onChange={e => setEditData(d => ({ ...d, city: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Code postal</Label>
                <Input
                  value={editData.postalCode || ""}
                  onChange={e => setEditData(d => ({ ...d, postalCode: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-gray-500">Téléphone</Label>
                <Input
                  value={editData.phone || ""}
                  onChange={e => setEditData(d => ({ ...d, phone: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Courriel</Label>
                <Input
                  type="email"
                  value={editData.email || ""}
                  onChange={e => setEditData(d => ({ ...d, email: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            {[
              { icon: Store, label: storeData.name || "—" },
              { icon: MapPin, label: [storeData.address, storeData.city, storeData.postalCode].filter(Boolean).join(", ") || "—" },
              { icon: Phone, label: storeData.phone || "—" },
              { icon: Mail, label: storeData.email || "—" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-2 text-gray-600">
                  <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Paramètres de livraison */}
      <div className="bg-white rounded-2xl border shadow-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <h2 className="font-bold text-gray-900">Paramètres de service</h2>
        </div>

        {isEditing ? (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-gray-500">Commande min. ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={editData.minOrderAmount ?? storeData.minOrderAmount ?? ""}
                onChange={e => setEditData(d => ({ ...d, minOrderAmount: Number(e.target.value) }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Frais livraison ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={editData.deliveryFee ?? storeData.deliveryFee ?? ""}
                onChange={e => setEditData(d => ({ ...d, deliveryFee: Number(e.target.value) }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Temps prép. (min)</Label>
              <Input
                type="number"
                value={editData.preparationTime ?? storeData.preparationTime ?? ""}
                onChange={e => setEditData(d => ({ ...d, preparationTime: Number(e.target.value) }))}
                className="mt-1"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Commande min.", value: `$${(storeData.minOrderAmount || 0).toFixed(2)}` },
              { label: "Frais livraison", value: `$${(storeData.deliveryFee || 0).toFixed(2)}` },
              { label: "Temps préparation", value: `${storeData.preparationTime || 15} min` },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="font-bold text-gray-900 mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
