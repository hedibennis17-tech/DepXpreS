export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Politique de confidentialité</h1>
      <div className="prose text-gray-600 space-y-4">
        <p>FastDép Express s&apos;engage à protéger vos données personnelles.</p>
        <h2 className="text-xl font-bold text-gray-900 mt-6">Données collectées</h2>
        <p>Nous collectons : nom, email, adresse de livraison, historique des commandes.</p>
        <h2 className="text-xl font-bold text-gray-900 mt-6">Utilisation</h2>
        <p>Vos données sont utilisées uniquement pour le traitement des commandes et l&apos;amélioration du service.</p>
        <h2 className="text-xl font-bold text-gray-900 mt-6">Contact</h2>
        <p>Pour exercer vos droits : <a href="mailto:privacy@fastdep.ca" className="text-orange-500">privacy@fastdep.ca</a></p>
      </div>
    </div>
  );
}
