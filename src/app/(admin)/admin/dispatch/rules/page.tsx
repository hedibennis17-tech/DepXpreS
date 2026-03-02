'use client';
import { useState } from 'react';

interface Rule {
  id: string;
  name: string;
  description: string;
  value: string | number | boolean;
  type: 'number' | 'boolean' | 'select';
  options?: string[];
  unit?: string;
}

const DEFAULT_RULES: Rule[] = [
  { id: 'max_search_time', name: 'Temps max de recherche', description: 'Durée maximale avant passage en assignation manuelle', value: 5, type: 'number', unit: 'minutes' },
  { id: 'max_attempts', name: 'Tentatives max', description: "Nombre max de tentatives d'assignation automatique", value: 3, type: 'number', unit: 'tentatives' },
  { id: 'min_driver_rating', name: 'Note minimale chauffeur', description: 'Note minimale requise pour recevoir des commandes', value: 4.0, type: 'number', unit: '/ 5.0' },
  { id: 'radius_km', name: 'Rayon de recherche', description: 'Rayon de recherche des chauffeurs disponibles', value: 5, type: 'number', unit: 'km' },
  { id: 'auto_dispatch', name: 'Dispatch automatique', description: "Activer l'assignation automatique des commandes", value: true, type: 'boolean' },
  { id: 'priority_mode', name: 'Mode de priorité', description: 'Critère principal pour sélectionner le chauffeur', value: 'proximity', type: 'select', options: ['proximity', 'rating', 'deliveries', 'balanced'] },
  { id: 'notify_driver', name: 'Notifier le chauffeur', description: "Envoyer une notification push lors d'une assignation", value: true, type: 'boolean' },
  { id: 'fallback_manual', name: 'Fallback manuel', description: 'Passer en manuel si aucun chauffeur disponible', value: true, type: 'boolean' },
];

export default function Page() {
  const [rules, setRules] = useState<Rule[]>(DEFAULT_RULES);
  const [saved, setSaved] = useState(false);

  const updateRule = (id: string, value: string | number | boolean) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, value } : r));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Règles de dispatch</h1>
          <p className="text-sm text-gray-500 mt-1">Configuration de l&apos;algorithme d&apos;assignation automatique</p>
        </div>
        <button
          onClick={handleSave}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${saved ? 'bg-green-500 text-white' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
        >
          {saved ? '✅ Sauvegardé' : '💾 Sauvegarder'}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <strong>🤖 Algorithme actuel :</strong> Proximité GPS → Note chauffeur → Disponibilité zone → Nombre de livraisons du jour
      </div>

      <div className="space-y-4">
        {rules.map(rule => (
          <div key={rule.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{rule.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{rule.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {rule.type === 'boolean' ? (
                  <button
                    onClick={() => updateRule(rule.id, !rule.value)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${rule.value ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${rule.value ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                ) : rule.type === 'select' ? (
                  <select
                    value={String(rule.value)}
                    onChange={e => updateRule(rule.id, e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                  >
                    {rule.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={Number(rule.value)}
                      onChange={e => updateRule(rule.id, parseFloat(e.target.value))}
                      className="w-20 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-center"
                      step={rule.unit === '/ 5.0' ? 0.1 : 1}
                    />
                    {rule.unit && <span className="text-xs text-gray-500">{rule.unit}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
