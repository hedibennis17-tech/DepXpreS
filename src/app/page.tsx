import Link from "next/link";
import { ArrowRight, Zap, Star, MapPin, ShoppingBag, Car, Store, CheckCircle2, ChevronRight, Smartphone } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white fill-white" />
            </div>
            <span className="font-extrabold text-xl text-gray-900 tracking-tight">FastDép</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#client" className="hover:text-orange-500 transition-colors">Commander</a>
            <a href="#driver" className="hover:text-orange-500 transition-colors">Chauffeurs</a>
            <a href="#store" className="hover:text-orange-500 transition-colors">Dépanneurs</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/client" className="hidden sm:inline-flex text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors">
              Se connecter
            </Link>
            <Link href="/client" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-sm">
              Commander <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-4 text-center bg-gradient-to-b from-orange-50 via-white to-white overflow-hidden relative">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-orange-100/40 blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Livraison express — Montréal &amp; Laval
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
            Votre dépanneur,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">
              livré en 30 min
            </span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Commandez depuis votre dépanneur préféré, devenez chauffeur partenaire ou ouvrez votre dépanneur sur la plateforme.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/client" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-orange-500 text-white font-bold text-base hover:bg-orange-600 transition-all shadow-lg shadow-orange-200">
              <ShoppingBag className="h-5 w-5" />
              Commander maintenant
            </Link>
            <a href="#store" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white border-2 border-gray-200 text-gray-800 font-bold text-base hover:border-orange-300 hover:text-orange-600 transition-all">
              Ouvrir mon dépanneur <ChevronRight className="h-4 w-4" />
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-8 mt-14">
            {[["1\u00a0900+", "Commandes livrées"], ["7", "Dépanneurs partenaires"], ["30 min", "Délai moyen"], ["4.9 ★", "Note moyenne"]].map(([v, l]) => (
              <div key={l} className="text-center">
                <p className="text-3xl font-extrabold text-gray-900">{v}</p>
                <p className="text-sm text-gray-500 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 BLOCS */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3">Choisissez votre rôle</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">FastDép connecte clients, chauffeurs et dépanneurs en temps réel.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* BLOC CLIENT */}
            <div id="client" className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-orange-500 to-amber-400 p-8 text-white shadow-xl shadow-orange-200 hover:shadow-2xl hover:-translate-y-1 transition-all">
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
              <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/10" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                  <ShoppingBag className="h-7 w-7 text-white" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-4">
                  <Zap className="h-3 w-3 fill-white" /> Express
                </div>
                <h3 className="text-2xl font-extrabold mb-3 leading-tight">Commandez<br />en quelques clics</h3>
                <p className="text-orange-100 text-sm leading-relaxed mb-6">
                  Parcourez les produits de vos dépanneurs locaux, ajoutez au panier et faites-vous livrer en 30 minutes. Disponible 24h/7j.
                </p>
                <ul className="space-y-2 mb-8">
                  {["Livraison en 30 minutes", "Suivi en temps réel", "Paiement sécurisé", "Première livraison gratuite"].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-white/80 flex-shrink-0" />{item}
                    </li>
                  ))}
                </ul>
                <Link href="/client" className="inline-flex items-center gap-2 w-full justify-center px-5 py-3 rounded-2xl bg-white text-orange-600 font-bold text-sm hover:bg-orange-50 transition-colors">
                  Commander maintenant <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* BLOC CHAUFFEUR */}
            <div id="driver" className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
              <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-6">
                  <Car className="h-7 w-7 text-orange-400" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold mb-4">
                  <Star className="h-3 w-3 fill-orange-400" /> Partenaire
                </div>
                <h3 className="text-2xl font-extrabold mb-3 leading-tight">Devenez chauffeur<br />et gagnez plus</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Travaillez à votre rythme, choisissez vos heures et gagnez jusqu&apos;à 1&nbsp;500&nbsp;$/semaine en livrant dans votre quartier.
                </p>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {[["~$25/h", "Revenu moyen"], ["Flexible", "Vos horaires"], ["Hebdo", "Paiement"], ["App", "Tout en 1 clic"]].map(([v, l]) => (
                    <div key={l} className="bg-white/5 rounded-2xl p-3 text-center">
                      <p className="text-lg font-extrabold text-white">{v}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{l}</p>
                    </div>
                  ))}
                </div>
                <Link href="/auth/driver-signup" className="inline-flex items-center gap-2 w-full justify-center px-5 py-3 rounded-2xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors">
                  Devenir chauffeur <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* BLOC STORE */}
            <div id="store" className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-xl shadow-blue-200 hover:shadow-2xl hover:-translate-y-1 transition-all">
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
              <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/10" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                  <Store className="h-7 w-7 text-white" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-4">
                  <Zap className="h-3 w-3 fill-white" /> SaaS
                </div>
                <h3 className="text-2xl font-extrabold mb-3 leading-tight">Ouvrez votre dépanneur<br />sur FastDép</h3>
                <p className="text-blue-100 text-sm leading-relaxed mb-6">
                  Rejoignez la plateforme, gérez vos commandes, votre catalogue et vos paiements depuis votre tableau de bord dédié.
                </p>
                <ul className="space-y-2 mb-8">
                  {["Tableau de bord en temps réel", "Gestion du catalogue & stock", "Paiements hebdomadaires", "Notifications instantanées"].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-blue-200 flex-shrink-0" />{item}
                    </li>
                  ))}
                </ul>
                <Link href="/store-login" className="inline-flex items-center gap-2 w-full justify-center px-5 py-3 rounded-2xl bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 transition-colors">
                  Ouvrir mon compte <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ETAPES */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3">Simple comme bonjour</h2>
            <p className="text-gray-500 text-lg">3 étapes pour recevoir votre commande</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: MapPin, title: "Choisissez votre dépanneur", desc: "Trouvez le dépanneur le plus proche et parcourez son catalogue en temps réel.", color: "bg-orange-100 text-orange-600" },
              { step: "02", icon: ShoppingBag, title: "Ajoutez vos produits", desc: "Sélectionnez vos articles, boissons, snacks et produits du quotidien.", color: "bg-blue-100 text-blue-600" },
              { step: "03", icon: Zap, title: "Livraison en 30 min", desc: "Un chauffeur partenaire récupère votre commande et vous la livre à votre porte.", color: "bg-green-100 text-green-600" },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative text-center">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-7xl font-extrabold text-gray-100 select-none pointer-events-none z-0">{item.step}</div>
                  <div className="relative z-10">
                    <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TEMOIGNAGES */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3">Ils nous font confiance</h2>
            <div className="flex items-center justify-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)}
              <span className="ml-2 text-gray-600 font-semibold">4.9 / 5 — 1&nbsp;900+ commandes</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Marie L.", role: "Cliente", text: "Incroyable ! Commandé à 23h, livré en 25 minutes. Le chauffeur était super sympa.", avatar: "M" },
              { name: "Carlos R.", role: "Chauffeur partenaire", text: "Je gagne bien ma vie avec FastDép. Les horaires sont flexibles et l'app est super facile.", avatar: "C" },
              { name: "Ahmed B.", role: "Propriétaire — Dép. Centre-Ville", text: "Depuis qu'on est sur FastDép, nos ventes ont augmenté de 40%. Le tableau de bord est excellent.", avatar: "A" },
            ].map(t => (
              <div key={t.name} className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600 text-sm">{t.avatar}</div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-500 to-amber-400">
        <div className="max-w-3xl mx-auto text-center text-white">
          <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center mx-auto mb-6">
            <Smartphone className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold mb-4">Prêt à commander ?</h2>
          <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
            Première livraison gratuite avec le code{" "}
            <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded-lg">DEPXPRES1</span>
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/client" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-orange-600 font-extrabold text-base hover:bg-orange-50 transition-colors shadow-lg">
              <ShoppingBag className="h-5 w-5" /> Commander maintenant
            </Link>
            <Link href="/store-login" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/20 text-white font-extrabold text-base hover:bg-white/30 transition-colors border border-white/30">
              <Store className="h-5 w-5" /> Espace dépanneur
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white fill-white" />
              </div>
              <span className="font-extrabold text-white text-lg">FastDép</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/client" className="hover:text-white transition-colors">Commander</Link>
              <a href="#driver" className="hover:text-white transition-colors">Devenir chauffeur</a>
              <Link href="/store-login" className="hover:text-white transition-colors">Espace dépanneur</Link>
              <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-orange-500" />
              <span>Montréal &amp; Laval, QC</span>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-xs text-gray-600">
            © 2025 FastDép — Tous droits réservés
          </div>
        </div>
      </footer>

    </div>
  );
}
