import Link from "next/link";
import {
  ArrowRight, Zap, Star, MapPin, Clock, ShoppingBag,
  Car, Store, CheckCircle, Shield, Smartphone,
  TrendingUp, Users, Package
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden">

      {/* ── FONTS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');
        body { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Syne', sans-serif; }
        .grain {
          position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes glow { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        .float { animation: float 6s ease-in-out infinite; }
        .glow { animation: glow 3s ease-in-out infinite; }
        .gradient-text {
          background: linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fbbf24 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .card-glass {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
        }
        .orange-glow { box-shadow: 0 0 40px rgba(249,115,22,0.3); }
      `}</style>

      <div className="grain" />

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center orange-glow">
              <Zap className="h-4 w-4 text-white fill-white" />
            </div>
            <span className="font-display font-800 text-xl tracking-tight">FastDép</span>
            <span className="text-[10px] font-semibold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full border border-orange-400/20">EXPRESS</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#commander" className="hover:text-white transition-colors">Commander</a>
            <a href="#chauffeur" className="hover:text-white transition-colors">Chauffeurs</a>
            <a href="#store" className="hover:text-white transition-colors">Commercants</a>
            <a href="#about" className="hover:text-white transition-colors">À propos</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/client/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors hidden sm:block">
              Connexion
            </Link>
            <Link href="/client" className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all orange-glow">
              Commander <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden" id="commander">
        {/* Background orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl glow" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl glow" style={{animationDelay:"1.5s"}} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-semibold mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Livraison express — Grand Montréal & Laval
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-8xl font-extrabold leading-[0.95] tracking-tight mb-8">
            Votre quartier,<br />
            <span className="gradient-text">livré en 30 min</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            Commandez depuis vos commerces locaux préférés. Épicerie, fleurs, pharmacie, boucherie — livraison express à votre porte.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link href="/client" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-4 rounded-2xl transition-all text-base orange-glow hover:scale-105 active:scale-95">
              <ShoppingBag className="h-5 w-5" />
              Commander maintenant
            </Link>
            <Link href="/store-signup" className="flex items-center gap-2 card-glass text-white font-semibold px-8 py-4 rounded-2xl transition-all text-base hover:border-orange-500/30">
              Ouvrir mon commerce <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: "1 900+", label: "Commandes livrées", icon: Package },
              { value: "7", label: "Commerces partenaires", icon: Store },
              { value: "30 min", label: "Délai moyen", icon: Clock },
              { value: "4.9 ★", label: "Note moyenne", icon: Star },
            ].map((stat, i) => (
              <div key={i} className="card-glass rounded-2xl p-4 text-center">
                <p className="font-display text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 RÔLES ── */}
      <section className="py-24 px-4 relative" id="roles">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-orange-400 text-sm font-semibold mb-3 tracking-wider uppercase">Plateforme</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">Choisissez votre rôle</h2>
            <p className="text-gray-400 max-w-xl mx-auto">FastDép connecte clients, chauffeurs et commercants en temps réel.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Client */}
            <div className="relative group rounded-3xl overflow-hidden" style={{background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)"}}>
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative p-8">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-bold bg-white/20 text-white px-2 py-0.5 rounded-full mb-4 inline-block">Express</span>
                <h3 className="font-display text-2xl font-bold text-white mb-3">Commandez<br />en quelques clics</h3>
                <p className="text-orange-100 text-sm mb-6 leading-relaxed">
                  Parcourez les produits de vos commerces locaux, ajoutez au panier et faites-vous livrer en 30 minutes. Disponible 24h/7j.
                </p>
                <ul className="space-y-2 mb-8">
                  {["Livraison en 30 minutes", "Suivi en temps réel", "Paiement sécurisé", "Première livraison gratuite"].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-orange-100">
                      <CheckCircle className="h-4 w-4 text-white shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/client" className="flex items-center justify-center gap-2 bg-white text-orange-600 font-bold py-3 rounded-2xl hover:bg-orange-50 transition-colors text-sm w-full">
                  Commander maintenant <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Chauffeur */}
            <div className="relative group rounded-3xl overflow-hidden card-glass border border-white/10">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gray-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative p-8">
                <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                  <Car className="h-6 w-6 text-orange-400" />
                </div>
                <span className="text-xs font-bold bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full mb-4 inline-block border border-orange-500/30">Partenaire</span>
                <h3 className="font-display text-2xl font-bold text-white mb-3">Devenez chauffeur<br />et gagnez plus</h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  Travaillez à votre rythme, choisissez vos heures et gagnez jusqu&apos;à 1 500 $/semaine en livrant dans votre quartier.
                </p>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {[
                    { value: "~25$/h", label: "Revenu moyen" },
                    { value: "Flexible", label: "Vos horaires" },
                    { value: "Hebdo", label: "Paiement" },
                    { value: "App", label: "Tout en 1 clic" },
                  ].map(s => (
                    <div key={s.value} className="bg-white/5 rounded-xl p-3 text-center">
                      <p className="font-bold text-white text-sm">{s.value}</p>
                      <p className="text-gray-500 text-xs">{s.label}</p>
                    </div>
                  ))}
                </div>
                <Link href="/driver/signup" className="flex items-center justify-center gap-2 bg-orange-500 text-white font-bold py-3 rounded-2xl hover:bg-orange-400 transition-colors text-sm w-full orange-glow">
                  Devenir chauffeur <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Store */}
            <div className="relative group rounded-3xl overflow-hidden" style={{background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"}}>
              <div className="absolute inset-0" style={{background: "radial-gradient(circle at 70% 20%, rgba(249,115,22,0.15) 0%, transparent 60%)"}} />
              <div className="relative p-8">
                <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-6 border border-orange-500/30">
                  <Store className="h-6 w-6 text-orange-400" />
                </div>
                <span className="text-xs font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full mb-4 inline-block border border-blue-500/30">Commerce</span>
                <h3 className="font-display text-2xl font-bold text-white mb-3">Ouvrez votre<br />espace en ligne</h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  Inscrivez votre commerce, gérez votre catalogue et recevez des commandes directement dans votre tableau de bord.
                </p>
                <ul className="space-y-2 mb-8">
                  {["Inscription gratuite", "Tableau de bord complet", "Gestion catalogue & stock", "Paiements automatiques"].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-orange-400 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/store-signup" className="flex items-center justify-center gap-2 border border-orange-500/50 text-orange-400 font-bold py-3 rounded-2xl hover:bg-orange-500/10 transition-colors text-sm w-full">
                  Ouvrir mon commerce <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section className="py-24 px-4 relative" id="about">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/3 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-orange-400 text-sm font-semibold mb-3 tracking-wider uppercase">Simple & rapide</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">Commander en 3 étapes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: MapPin, title: "Choisissez votre zone", desc: "Sélectionnez votre quartier et découvrez les commerces disponibles près de chez vous." },
              { step: "02", icon: ShoppingBag, title: "Ajoutez au panier", desc: "Parcourez les catalogues, choisissez vos articles et ajoutez-les à votre panier en un clic." },
              { step: "03", icon: Zap, title: "Livré en 30 min", desc: "Confirmez votre commande et notre chauffeur partenaire vous livre directement à votre porte." },
            ].map((s, i) => (
              <div key={i} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-orange-500/30 to-transparent -translate-x-8 z-0" />
                )}
                <div className="card-glass rounded-3xl p-6 relative z-10 group hover:border-orange-500/30 transition-all">
                  <div className="flex items-center gap-4 mb-5">
                    <span className="font-display text-5xl font-extrabold text-orange-500/20 leading-none">{s.step}</span>
                    <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/20">
                      <s.icon className="h-5 w-5 text-orange-400" />
                    </div>
                  </div>
                  <h3 className="font-display text-lg font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ZONES ── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="card-glass rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent" />
            <div className="relative">
              <p className="text-orange-400 text-sm font-semibold mb-3 tracking-wider uppercase flex items-center justify-center gap-2">
                <MapPin className="h-4 w-4" /> Zones desservies
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">Grand Montréal & Laval</h2>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {["Chomedey", "Sainte-Dorothée", "Fabreville", "Vimont", "Centre-Ville MTL", "Rosemont", "Plateau", "Longueuil"].map(z => (
                  <span key={z} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300 hover:border-orange-500/30 hover:text-orange-300 transition-colors cursor-default">
                    {z}
                  </span>
                ))}
              </div>
              <p className="text-gray-500 text-sm">Expansion continue. Votre zone arrive bientôt. 🚀</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl sm:text-6xl font-extrabold mb-6 leading-tight">
            Prêt à commander ?<br />
            <span className="gradient-text">C&apos;est gratuit.</span>
          </h2>
          <p className="text-gray-400 mb-10 text-lg">Première livraison offerte avec le code <span className="text-orange-400 font-bold font-mono">DEPXPRES1</span></p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/client/signup" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-10 py-4 rounded-2xl transition-all text-base orange-glow hover:scale-105">
              Créer mon compte gratuit <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/client" className="flex items-center gap-2 card-glass text-white font-semibold px-10 py-4 rounded-2xl text-base hover:border-orange-500/30 transition-all">
              Commander sans compte
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-orange-500 flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-white fill-white" />
            </div>
            <span className="font-display font-bold text-white">FastDép</span>
            <span className="text-gray-600 text-sm ml-2">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/client" className="hover:text-white transition-colors">Commander</Link>
            <Link href="/driver/signup" className="hover:text-white transition-colors">Chauffeurs</Link>
            <Link href="/store-signup" className="hover:text-white transition-colors">Commercants</Link>
            <Link href="/admin/login" className="hover:text-white transition-colors">Admin</Link>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Shield className="h-3.5 w-3.5" />
            Paiements sécurisés SSL
          </div>
        </div>
      </footer>
    </div>
  );
}
