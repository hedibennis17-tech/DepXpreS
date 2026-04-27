"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowRight, Zap, Star, MapPin, Clock, ShoppingBag,
  Car, Store, CheckCircle, Shield, Package, Menu, X,
  ChevronDown, Smartphone, LogIn, UserPlus, Navigation,
  Bell, TrendingUp, Bike, MessageCircle
} from "lucide-react";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [appMenuOpen, setAppMenuOpen] = useState<string|null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(()=>{
    const h = ()=>setScrolled(window.scrollY>20);
    window.addEventListener("scroll",h);
    return ()=>window.removeEventListener("scroll",h);
  },[]);

  const APPS = [
    {
      key:"client",
      label:"Client",
      icon:ShoppingBag,
      color:"#f97316",
      desc:"Commandez depuis vos commerces",
      links:[
        {href:"/client", label:"🛍️ Commander maintenant", primary:true},
        {href:"/client/login", label:"🔐 Se connecter"},
        {href:"/client/signup", label:"✨ Créer un compte"},
        {href:"/client/orders", label:"📦 Mes commandes"},
      ]
    },
    {
      key:"driver",
      label:"Chauffeur",
      icon:Car,
      color:"#22c55e",
      desc:"Livrez et gagnez à votre rythme",
      links:[
        {href:"/driver/dashboard", label:"🚗 Mon tableau de bord", primary:true},
        {href:"/driver/login", label:"🔐 Se connecter"},
        {href:"/driver/signup", label:"✨ Devenir chauffeur"},
        {href:"/driver/orders", label:"📋 Mes livraisons"},
      ]
    },
    {
      key:"store",
      label:"Commerce",
      icon:Store,
      color:"#3b82f6",
      desc:"Gérez votre boutique en ligne",
      links:[
        {href:"/store/dashboard", label:"🏪 Mon espace store", primary:true},
        {href:"/store-login", label:"🔐 Se connecter"},
        {href:"/store-signup", label:"✨ Ouvrir mon commerce"},
        {href:"/store/orders", label:"📋 Mes commandes"},
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');
        *{box-sizing:border-box;}
        body{font-family:'DM Sans',sans-serif;background:#080808;}
        .font-display{font-family:'Syne',sans-serif;}
        .gradient-text{background:linear-gradient(135deg,#f97316 0%,#fb923c 40%,#fbbf24 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .glass{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);backdrop-filter:blur(16px);}
        .glow-orange{box-shadow:0 0 30px rgba(249,115,22,0.35);}
        .glow-green{box-shadow:0 0 30px rgba(34,197,94,0.25);}
        .glow-blue{box-shadow:0 0 30px rgba(59,130,246,0.25);}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        @keyframes pulse-glow{0%,100%{opacity:.3}50%{opacity:.7}}
        @keyframes fade-up{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        .float{animation:float 7s ease-in-out infinite;}
        .pulse{animation:pulse-glow 3s ease-in-out infinite;}
        .fade-up{animation:fade-up .6s ease forwards;}
        .fade-up-1{animation:fade-up .6s .1s ease both;}
        .fade-up-2{animation:fade-up .6s .2s ease both;}
        .fade-up-3{animation:fade-up .6s .3s ease both;}
        .app-card:hover .app-card-arrow{transform:translateX(4px);}
        .app-card-arrow{transition:transform .2s;}
        /* Dropdown */
        .dropdown-enter{animation:fade-up .15s ease forwards;}
        /* Mobile menu */
        .mobile-menu-enter{animation:fade-up .2s ease forwards;}
        /* Grid responsive */
        @media(max-width:768px){
          .hero-title{font-size:2.8rem!important;line-height:1!important;}
          .roles-grid{grid-template-columns:1fr!important;}
          .steps-grid{grid-template-columns:1fr!important;}
          .stats-grid{grid-template-columns:1fr 1fr!important;}
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled?"bg-[#080808]/95 border-b border-white/5 backdrop-blur-xl":"bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center glow-orange">
              <Zap className="h-4 w-4 text-white fill-white"/>
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight text-white">FastDép</span>
            <span className="hidden sm:inline text-[10px] font-bold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full border border-orange-400/20">EXPRESS</span>
          </Link>

          {/* ── DESKTOP NAV ── */}
          <div className="hidden lg:flex items-center gap-1">
            {APPS.map(app=>(
              <div key={app.key} className="relative">
                <button
                  onClick={()=>setAppMenuOpen(appMenuOpen===app.key?null:app.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${appMenuOpen===app.key?"text-white bg-white/8":"text-gray-400 hover:text-white hover:bg-white/5"}`}>
                  <app.icon className="h-4 w-4" style={{color:appMenuOpen===app.key?app.color:undefined}}/>
                  {app.label}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${appMenuOpen===app.key?"rotate-180":""}`}/>
                </button>

                {appMenuOpen===app.key && (
                  <div className="dropdown-enter absolute top-full left-0 mt-2 w-64 glass rounded-2xl p-2 shadow-2xl"
                    style={{borderColor:app.color+"22"}}>
                    <div className="px-3 py-2 mb-1">
                      <p className="text-xs font-bold" style={{color:app.color}}>{app.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{app.desc}</p>
                    </div>
                    <div className="h-px bg-white/5 mx-2 mb-1"/>
                    {app.links.map(l=>(
                      <Link key={l.href} href={l.href}
                        onClick={()=>setAppMenuOpen(null)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all app-card ${l.primary?"font-bold text-white":"text-gray-300 hover:text-white hover:bg-white/5"}`}
                        style={l.primary?{background:app.color+"15",borderLeft:`2px solid ${app.color}`}:{}}>
                        {l.label}
                        {l.primary && <ArrowRight className="h-3.5 w-3.5 ml-auto app-card-arrow" style={{color:app.color}}/>}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="w-px h-5 bg-white/10 mx-2"/>
            <Link href="/admin/login" className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 hover:text-white transition-colors rounded-xl hover:bg-white/5">
              <Shield className="h-4 w-4"/>Admin
            </Link>
          </div>

          {/* ── DESKTOP CTA ── */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/client/login" className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-xl hover:bg-white/5">
              <LogIn className="h-4 w-4"/>Connexion
            </Link>
            <Link href="/client" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all glow-orange hover:scale-105 active:scale-95">
              <ShoppingBag className="h-4 w-4"/>Commander
            </Link>
          </div>

          {/* ── MOBILE HAMBURGER ── */}
          <button className="lg:hidden p-2 rounded-xl glass text-gray-300" onClick={()=>setMenuOpen(m=>!m)}>
            {menuOpen ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}
          </button>
        </div>

        {/* ── MOBILE MENU ── */}
        {menuOpen && (
          <div className="lg:hidden mobile-menu-enter bg-[#0f0f0f] border-t border-white/5 px-4 py-4 space-y-1">
            {APPS.map(app=>(
              <div key={app.key}>
                <button
                  onClick={()=>setAppMenuOpen(appMenuOpen===app.key?null:app.key)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:app.color+"15"}}>
                      <app.icon className="h-4 w-4" style={{color:app.color}}/>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-white">{app.label}</p>
                      <p className="text-xs text-gray-500">{app.desc}</p>
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${appMenuOpen===app.key?"rotate-180":""}`}/>
                </button>
                {appMenuOpen===app.key && (
                  <div className="ml-11 mt-1 space-y-0.5 pb-2">
                    {app.links.map(l=>(
                      <Link key={l.href} href={l.href}
                        onClick={()=>{setMenuOpen(false);setAppMenuOpen(null);}}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all ${l.primary?"font-bold text-white":"text-gray-400"}`}
                        style={l.primary?{background:app.color+"10",color:app.color}:{}}>
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="h-px bg-white/5 my-2"/>
            <Link href="/admin/login" onClick={()=>setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm text-gray-400 hover:bg-white/5">
              <Shield className="h-4 w-4"/>Espace Admin
            </Link>
            <Link href="/client" onClick={()=>setMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-orange-500 text-white font-bold py-3.5 rounded-2xl text-sm mt-2 glow-orange">
              <ShoppingBag className="h-4 w-4"/>Commander maintenant
            </Link>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-28 sm:pt-36 pb-20 px-4 overflow-hidden">
        {/* BG orbs */}
        <div className="absolute top-24 left-1/4 w-[500px] h-[500px] bg-orange-500/8 rounded-full blur-3xl pulse pointer-events-none"/>
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-amber-500/6 rounded-full blur-3xl pulse pointer-events-none" style={{animationDelay:"1.5s"}}/>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent pointer-events-none"/>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/25 bg-orange-500/8 text-orange-400 text-xs font-bold mb-8 fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"/>
            Livraison express — Grand Montréal & Laval
          </div>

          <h1 className="hero-title font-display text-5xl sm:text-7xl lg:text-[90px] font-extrabold leading-[0.95] tracking-tight mb-8 fade-up-1" style={{letterSpacing:"-0.03em"}}>
            Votre quartier,<br/>
            <span className="gradient-text">livré en 30 min</span>
          </h1>

          <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light fade-up-2">
            Commandez depuis vos commerces locaux préférés. Épicerie, fleurs, pharmacie, boucherie — livraison express à votre porte.
          </p>

          {/* ── 3 APP BUTTONS HERO ── */}
          <div className="fade-up-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-16 max-w-2xl mx-auto">
            {/* Client */}
            <Link href="/client" className="flex-1 flex items-center justify-center gap-2.5 bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-4 rounded-2xl transition-all glow-orange hover:scale-105 active:scale-95 text-sm">
              <ShoppingBag className="h-5 w-5"/>
              <span>Je commande</span>
            </Link>
            {/* Chauffeur */}
            <Link href="/driver/login" className="flex-1 flex items-center justify-center gap-2.5 glass hover:border-green-500/30 text-white font-semibold px-6 py-4 rounded-2xl transition-all hover:bg-green-500/5 text-sm">
              <Car className="h-5 w-5 text-green-400"/>
              <span>Je livre</span>
            </Link>
            {/* Store */}
            <Link href="/store-login" className="flex-1 flex items-center justify-center gap-2.5 glass hover:border-blue-500/30 text-white font-semibold px-6 py-4 rounded-2xl transition-all hover:bg-blue-500/5 text-sm">
              <Store className="h-5 w-5 text-blue-400"/>
              <span>Mon commerce</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="stats-grid grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto fade-up-3">
            {[
              {value:"1 900+",label:"Commandes livrées",icon:Package},
              {value:"7",label:"Commerces partenaires",icon:Store},
              {value:"30 min",label:"Délai moyen",icon:Clock},
              {value:"4.9 ★",label:"Note moyenne",icon:Star},
            ].map((s,i)=>(
              <div key={i} className="glass rounded-2xl p-4 text-center hover:border-orange-500/20 transition-all">
                <p className="font-display text-2xl font-extrabold text-white mb-0.5">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 RÔLES ── */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-orange-400 text-xs font-bold tracking-widest uppercase mb-3">Plateforme</p>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold mb-4">Choisissez votre rôle</h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">FastDép connecte clients, chauffeurs et commerces en temps réel.</p>
          </div>

          <div className="roles-grid grid md:grid-cols-3 gap-5">

            {/* ── CLIENT ── */}
            <div className="relative rounded-3xl overflow-hidden group cursor-pointer" style={{background:"linear-gradient(145deg,#f97316,#ea580c)"}}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"/>
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full"/>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-black/10 rounded-full"/>
              <div className="relative p-7 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-white"/>
                  </div>
                  <span className="text-xs font-bold bg-white/20 text-white px-3 py-1 rounded-full">Client</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white mb-3 leading-tight">Commandez<br/>en 2 clics</h3>
                <p className="text-orange-100 text-sm mb-6 leading-relaxed">Parcourez les commerces locaux, ajoutez au panier et faites-vous livrer en 30 min. Disponible 24h/7j.</p>
                <ul className="space-y-2 mb-7">
                  {["Livraison en 30 minutes","Suivi en temps réel","Paiement sécurisé","Première livraison gratuite"].map(f=>(
                    <li key={f} className="flex items-center gap-2 text-sm text-orange-100">
                      <CheckCircle className="h-4 w-4 text-white shrink-0"/>{f}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-2">
                  <Link href="/client" className="flex items-center justify-center gap-2 bg-white text-orange-600 font-bold py-3.5 rounded-2xl hover:bg-orange-50 transition-all text-sm group-hover:shadow-lg">
                    Commander <ArrowRight className="h-4 w-4"/>
                  </Link>
                  <div className="flex gap-2">
                    <Link href="/client/login" className="flex-1 flex items-center justify-center gap-1.5 bg-black/15 text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-black/25 transition-all">
                      <LogIn className="h-3.5 w-3.5"/>Connexion
                    </Link>
                    <Link href="/client/signup" className="flex-1 flex items-center justify-center gap-1.5 bg-black/15 text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-black/25 transition-all">
                      <UserPlus className="h-3.5 w-3.5"/>Inscription
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* ── CHAUFFEUR ── */}
            <div className="relative rounded-3xl overflow-hidden group glass border border-white/8">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent"/>
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-green-500/5 rounded-full"/>
              <div className="relative p-7 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-green-500/15 rounded-2xl flex items-center justify-center border border-green-500/20">
                    <Car className="h-6 w-6 text-green-400"/>
                  </div>
                  <span className="text-xs font-bold bg-green-500/15 text-green-400 px-3 py-1 rounded-full border border-green-500/20">Chauffeur</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white mb-3 leading-tight">Livrez et<br/>gagnez plus</h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">Travaillez à votre rythme, choisissez vos heures et gagnez jusqu&apos;à 1 500$/semaine.</p>
                <div className="grid grid-cols-2 gap-2.5 mb-7">
                  {[{v:"~25$/h",l:"Revenu moyen"},{v:"Flexible",l:"Vos horaires"},{v:"Hebdo",l:"Paiement"},{v:"App GPS",l:"Navigation"}].map(s=>(
                    <div key={s.v} className="bg-white/4 rounded-xl p-3 text-center border border-white/5">
                      <p className="font-bold text-white text-sm">{s.v}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{s.l}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  <Link href="/driver/dashboard" className="flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3.5 rounded-2xl hover:bg-green-400 transition-all text-sm glow-green">
                    Mon tableau de bord <ArrowRight className="h-4 w-4"/>
                  </Link>
                  <div className="flex gap-2">
                    <Link href="/driver/login" className="flex-1 flex items-center justify-center gap-1.5 glass text-gray-300 text-xs font-semibold py-2.5 rounded-xl hover:text-white transition-all">
                      <LogIn className="h-3.5 w-3.5"/>Connexion
                    </Link>
                    <Link href="/driver/signup" className="flex-1 flex items-center justify-center gap-1.5 glass text-gray-300 text-xs font-semibold py-2.5 rounded-xl hover:text-white transition-all">
                      <UserPlus className="h-3.5 w-3.5"/>Inscription
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* ── STORE ── */}
            <div className="relative rounded-3xl overflow-hidden group glass border border-white/8">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"/>
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/5 rounded-full"/>
              <div className="relative p-7 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-blue-500/15 rounded-2xl flex items-center justify-center border border-blue-500/20">
                    <Store className="h-6 w-6 text-blue-400"/>
                  </div>
                  <span className="text-xs font-bold bg-blue-500/15 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">Commerce</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white mb-3 leading-tight">Vendez en ligne<br/>facilement</h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">Gérez votre catalogue, recevez les commandes et suivez vos ventes en temps réel.</p>
                <ul className="space-y-2 mb-7">
                  {["Inscription gratuite","Tableau de bord complet","Catalogue & stock","Paiements automatiques"].map(f=>(
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-blue-400 shrink-0"/>{f}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-2">
                  <Link href="/store/dashboard" className="flex items-center justify-center gap-2 bg-blue-500 text-white font-bold py-3.5 rounded-2xl hover:bg-blue-400 transition-all text-sm glow-blue">
                    Mon espace store <ArrowRight className="h-4 w-4"/>
                  </Link>
                  <div className="flex gap-2">
                    <Link href="/store-login" className="flex-1 flex items-center justify-center gap-1.5 glass text-gray-300 text-xs font-semibold py-2.5 rounded-xl hover:text-white transition-all">
                      <LogIn className="h-3.5 w-3.5"/>Connexion
                    </Link>
                    <Link href="/store-signup" className="flex-1 flex items-center justify-center gap-1.5 glass text-gray-300 text-xs font-semibold py-2.5 rounded-xl hover:text-white transition-all">
                      <UserPlus className="h-3.5 w-3.5"/>Inscription
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section className="py-20 sm:py-28 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/3 to-transparent pointer-events-none"/>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-orange-400 text-xs font-bold tracking-widest uppercase mb-3">Simple & rapide</p>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold mb-4">Commander en 3 étapes</h2>
          </div>
          <div className="steps-grid grid md:grid-cols-3 gap-5">
            {[
              {step:"01",icon:MapPin,title:"Choisissez votre zone",desc:"Sélectionnez votre quartier et découvrez les commerces disponibles.",color:"#f97316"},
              {step:"02",icon:ShoppingBag,title:"Ajoutez au panier",desc:"Parcourez les catalogues, choisissez vos articles en un clic.",color:"#3b82f6"},
              {step:"03",icon:Zap,title:"Livré en 30 min",desc:"Confirmez et notre chauffeur vous livre directement à votre porte.",color:"#22c55e"},
            ].map((s,i)=>(
              <div key={i} className="relative">
                {i<2 && <div className="hidden md:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-orange-500/20 to-transparent -translate-x-8 z-0"/>}
                <div className="glass rounded-3xl p-6 relative z-10 hover:border-white/15 transition-all group">
                  <div className="flex items-center gap-4 mb-5">
                    <span className="font-display text-5xl font-extrabold leading-none" style={{color:s.color+"30"}}>{s.step}</span>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{background:s.color+"15",border:`1px solid ${s.color}25`}}>
                      <s.icon className="h-5 w-5" style={{color:s.color}}/>
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
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="glass rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent"/>
            <div className="relative">
              <p className="text-orange-400 text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 mb-3">
                <MapPin className="h-4 w-4"/>Zones desservies
              </p>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold mb-6">Grand Montréal & Laval</h2>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {["Chomedey","Sainte-Dorothée","Fabreville","Vimont","Centre-Ville MTL","Rosemont","Plateau","Longueuil","Brossard","Laval-des-Rapides"].map(z=>(
                  <span key={z} className="px-3 py-1.5 bg-white/4 border border-white/8 rounded-full text-xs sm:text-sm text-gray-300 hover:border-orange-500/30 hover:text-orange-300 transition-colors cursor-default">
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
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl sm:text-6xl font-extrabold mb-6 leading-tight">
            Prêt à commander?<br/>
            <span className="gradient-text">C&apos;est gratuit.</span>
          </h2>
          <p className="text-gray-400 mb-10 text-base sm:text-lg">Première livraison offerte avec le code <span className="text-orange-400 font-bold font-mono bg-orange-400/8 px-2 py-0.5 rounded-lg">DEPXPRES1</span></p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/client/signup" className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-4 rounded-2xl transition-all glow-orange hover:scale-105 text-sm sm:text-base">
              <UserPlus className="h-5 w-5"/>Créer mon compte gratuit
            </Link>
            <Link href="/client" className="flex items-center justify-center gap-2 glass text-white font-semibold px-8 py-4 rounded-2xl hover:border-orange-500/30 transition-all text-sm sm:text-base">
              Commander sans compte
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-xl bg-orange-500 flex items-center justify-center"><Zap className="h-3.5 w-3.5 text-white fill-white"/></div>
                <span className="font-display font-extrabold text-white">FastDép</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">Livraison express Grand Montréal & Laval. Disponible 24h/7j.</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">🛍️ Clients</p>
              <div className="space-y-2">
                {[{href:"/client",l:"Commander"},{href:"/client/login",l:"Se connecter"},{href:"/client/signup",l:"Créer un compte"},{href:"/client/orders",l:"Mes commandes"}].map(l=>(
                  <Link key={l.href} href={l.href} className="block text-xs text-gray-500 hover:text-orange-400 transition-colors">{l.l}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">🚗 Chauffeurs</p>
              <div className="space-y-2">
                {[{href:"/driver/login",l:"Se connecter"},{href:"/driver/signup",l:"Devenir chauffeur"},{href:"/driver/dashboard",l:"Mon dashboard"},{href:"/driver/orders",l:"Mes livraisons"}].map(l=>(
                  <Link key={l.href} href={l.href} className="block text-xs text-gray-500 hover:text-green-400 transition-colors">{l.l}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">🏪 Commerces</p>
              <div className="space-y-2">
                {[{href:"/store-login",l:"Se connecter"},{href:"/store-signup",l:"Ouvrir mon commerce"},{href:"/store/dashboard",l:"Mon espace store"},{href:"/admin/login",l:"Admin"}].map(l=>(
                  <Link key={l.href} href={l.href} className="block text-xs text-gray-500 hover:text-blue-400 transition-colors">{l.l}</Link>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">© 2026 FastDép Express. Tous droits réservés.</p>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Shield className="h-3.5 w-3.5"/><span>Paiements sécurisés SSL</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Overlay pour fermer les menus */}
      {(appMenuOpen||menuOpen) && (
        <div className="fixed inset-0 z-40" onClick={()=>{setAppMenuOpen(null);setMenuOpen(false);}}/>
      )}
    </div>
  );
}
