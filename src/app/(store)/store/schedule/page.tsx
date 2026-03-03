"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Clock, Check, RefreshCw, Info } from "lucide-react";

const DAYS = [
  { key: "monday",    label: "Lundi" },
  { key: "tuesday",   label: "Mardi" },
  { key: "wednesday", label: "Mercredi" },
  { key: "thursday",  label: "Jeudi" },
  { key: "friday",    label: "Vendredi" },
  { key: "saturday",  label: "Samedi" },
  { key: "sunday",    label: "Dimanche" },
];

interface DaySchedule {
  isOpen: boolean;
  open: string;
  close: string;
}

type Schedule = Record<string, DaySchedule>;

const DEFAULT_SCHEDULE: Schedule = {
  monday:    { isOpen: true,  open: "08:00", close: "22:00" },
  tuesday:   { isOpen: true,  open: "08:00", close: "22:00" },
  wednesday: { isOpen: true,  open: "08:00", close: "22:00" },
  thursday:  { isOpen: true,  open: "08:00", close: "22:00" },
  friday:    { isOpen: true,  open: "08:00", close: "23:00" },
  saturday:  { isOpen: true,  open: "09:00", close: "23:00" },
  sunday:    { isOpen: true,  open: "10:00", close: "22:00" },
};

export default function StoreSchedulePage() {
  const [storeId, setStoreId] = useState("");
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sid = localStorage.getItem("storeId") || "";
    setStoreId(sid);
  }, []);

  useEffect(() => {
    if (!storeId) return;
    const unsub = onSnapshot(doc(db, "stores", storeId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.schedule) {
          setSchedule({ ...DEFAULT_SCHEDULE, ...data.schedule });
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, [storeId]);

  const updateDay = (day: string, field: keyof DaySchedule, value: string | boolean) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const saveSchedule = async () => {
    if (!storeId) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "stores", storeId), {
        schedule,
        updatedAt: serverTimestamp(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const applyToAll = (sourceDay: string) => {
    const source = schedule[sourceDay];
    const newSchedule: Schedule = {};
    DAYS.forEach(d => {
      newSchedule[d.key] = { ...source };
    });
    setSchedule(newSchedule);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Horaires d'ouverture</h1>
          <p className="text-gray-500 text-sm mt-0.5">Définissez vos heures d'ouverture par jour</p>
        </div>
        <Button
          onClick={saveSchedule}
          disabled={saving}
          className={cn(
            "text-white font-medium",
            saved ? "bg-green-500 hover:bg-green-600" : "bg-orange-500 hover:bg-orange-600"
          )}
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <><Check className="h-4 w-4 mr-1.5" /> Sauvegardé !</>
          ) : (
            <><Check className="h-4 w-4 mr-1.5" /> Sauvegarder</>
          )}
        </Button>
      </div>

      {/* Info */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <p>Ces horaires s'affichent aux clients dans l'application. Le statut "Ouvert/Fermé" en temps réel peut être modifié depuis le tableau de bord.</p>
      </div>

      {/* Horaires par jour */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {DAYS.map((day, i) => {
          const daySchedule = schedule[day.key] || DEFAULT_SCHEDULE[day.key];
          return (
            <div
              key={day.key}
              className={cn("px-5 py-4", i < DAYS.length - 1 && "border-b")}
            >
              <div className="flex items-center gap-4">
                {/* Nom du jour + toggle */}
                <div className="flex items-center gap-3 w-32 flex-shrink-0">
                  <Switch
                    checked={daySchedule.isOpen}
                    onCheckedChange={v => updateDay(day.key, "isOpen", v)}
                    className="data-[state=checked]:bg-green-500"
                  />
                  <span className={cn(
                    "text-sm font-medium",
                    daySchedule.isOpen ? "text-gray-900" : "text-gray-400"
                  )}>
                    {day.label}
                  </span>
                </div>

                {/* Heures */}
                {daySchedule.isOpen ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <input
                      type="time"
                      value={daySchedule.open}
                      onChange={e => updateDay(day.key, "open", e.target.value)}
                      className="border rounded-lg px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                    <span className="text-gray-400 text-sm">à</span>
                    <input
                      type="time"
                      value={daySchedule.close}
                      onChange={e => updateDay(day.key, "close", e.target.value)}
                      className="border rounded-lg px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                    <button
                      onClick={() => applyToAll(day.key)}
                      className="text-xs text-orange-500 hover:text-orange-700 ml-1 whitespace-nowrap"
                    >
                      Appliquer à tous
                    </button>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 italic">Fermé</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Résumé */}
      <div className="bg-gray-50 rounded-2xl border p-4">
        <h3 className="font-semibold text-sm text-gray-700 mb-2">Résumé des horaires</h3>
        <div className="grid grid-cols-2 gap-1">
          {DAYS.map(day => {
            const d = schedule[day.key];
            return (
              <div key={day.key} className="flex justify-between text-xs py-1">
                <span className="text-gray-500">{day.label}</span>
                <span className={cn("font-medium", d?.isOpen ? "text-green-600" : "text-gray-400")}>
                  {d?.isOpen ? `${d.open} – ${d.close}` : "Fermé"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
