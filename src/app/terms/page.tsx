export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Conditions d&apos;utilisation</h1>
      <div className="prose text-gray-600 space-y-4">
        <p>En utilisant FastDép Express, vous acceptez les présentes conditions d&apos;utilisation.</p>
        <h2 className="text-xl font-bold text-gray-900 mt-6">1. Service</h2>
        <p>FastDép Express est une plateforme de livraison locale au Grand Montréal et Laval.</p>
        <h2 className="text-xl font-bold text-gray-900 mt-6">2. Responsabilité</h2>
        <p>FastDép Express agit comme intermédiaire entre les commercants partenaires et les clients.</p>
        <h2 className="text-xl font-bold text-gray-900 mt-6">3. Contact</h2>
        <p>Pour toute question : <a href="mailto:support@fastdep.ca" className="text-orange-500">support@fastdep.ca</a></p>
      </div>
    </div>
  );
}
