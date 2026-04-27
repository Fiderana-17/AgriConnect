import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Sprout, ShoppingBasket, Truck, ShieldCheck, Star, TrendingUp, Leaf, MapPin } from "lucide-react";
import heroImg from "@/assets/hero-farmer.jpg";
import { Button } from "@/components/ui/button";
import ListingCard from "@/components/ListingCard";
import { useApp } from "@/store/app";

const roleCards = [
  {
    role: "producteur",
    title: "Producteur",
    desc: "Publiez vos récoltes et vendez directement aux acheteurs sans intermédiaire.",
    icon: Sprout,
    badge: "badge-green",
    color: "hsl(148,60%,32%)",
    bg: "hsl(148,60%,32%,0.06)",
  },
  {
    role: "acheteur",
    title: "Acheteur",
    desc: "Trouvez des produits frais certifiés, directement des producteurs locaux.",
    icon: ShoppingBasket,
    badge: "badge-gold",
    color: "hsl(38,85%,40%)",
    bg: "hsl(38,85%,48%,0.08)",
  },
  {
    role: "transporteur",
    title: "Transporteur",
    desc: "Acceptez des missions de livraison et gagnez de l'argent.",
    icon: Truck,
    badge: "badge-clay",
    color: "hsl(15,65%,42%)",
    bg: "hsl(15,65%,52%,0.08)",
  },
  {
    role: "admin",
    title: "Admin",
    desc: "Modérez les annonces et suivez l'activité de la plateforme.",
    icon: ShieldCheck,
    badge: "badge-green",
    color: "hsl(148,60%,32%)",
    bg: "hsl(148,60%,32%,0.06)",
  },
] as const;

const stats = [
  { n: "120+", l: "Producteurs actifs", icon: Sprout },
  { n: "7", l: "Régions couvertes", icon: MapPin },
  { n: "48h", l: "Livraison max", icon: Truck },
  { n: "98%", l: "Satisfaction", icon: Star },
];

const testimonials = [
  {
    text: "AgriLink Mada m'a permis de vendre mes litchis directement à Antananarivo. Plus d'intermédiaires, plus de revenus.",
    author: "Coop. Toamasina",
    role: "Producteur · Atsinanana",
  },
  {
    text: "Je commande des légumes frais chaque semaine. La qualité est incomparable et les prix sont honnêtes.",
    author: "Hôtel Colbert",
    role: "Acheteur · Analamanga",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { listings } = useApp();
  const featured = listings.filter(l => l.status === "active").slice(0, 3);

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 right-0 w-[65%] h-full bg-[hsl(148,30%,96%)] clip-hero" />
          <div
            className="absolute top-10 right-[5%] w-[500px] h-[500px] rounded-full opacity-[0.07]"
            style={{ background: "radial-gradient(circle, hsl(148,60%,32%), transparent 70%)" }}
          />
          {/* Floating dots pattern */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-float"
              style={{
                width: `${8 + i * 4}px`,
                height: `${8 + i * 4}px`,
                background: i % 2 === 0 ? "hsl(148,60%,32%,0.12)" : "hsl(38,85%,48%,0.12)",
                top: `${15 + i * 13}%`,
                right: `${8 + i * 7}%`,
                animationDelay: `${i * 0.7}s`,
              }}
            />
          ))}
        </div>

        <div className="container-app grid lg:grid-cols-2 gap-12 lg:gap-20 py-16 md:py-24 relative">
          {/* Left */}
          <div className="space-y-8 animate-settle-up">
            <div className="inline-flex items-center gap-2 rounded-pill border border-[hsl(148,60%,32%,0.2)] bg-[hsl(148,60%,32%,0.07)] px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-[hsl(148,60%,32%)] animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(148,60%,28%)]">
                Marketplace agricole · Madagascar
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.0] text-foreground">
              Du champ<br />
              <span className="relative">
                au marché
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M0 8 Q75 0 150 8 Q225 16 300 8" stroke="hsl(38,85%,48%)" strokeWidth="3" strokeLinecap="round" fill="none"/>
                </svg>
              </span>
              <br />
              <em className="text-[hsl(148,60%,32%)] not-italic">directement.</em>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              AgriLink Mada relie producteurs, acheteurs et transporteurs locaux. Moins d'intermédiaires, des prix justes, une logistique simple.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => navigate("/produits")}
                className="gap-2 bg-[hsl(148,60%,32%)] hover:bg-[hsl(148,60%,26%)] text-white shadow-soft-md rounded-xl font-semibold px-8 h-13"
              >
                Explorer les produits <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/connexion")}
                className="rounded-xl border-2 border-[hsl(148,60%,32%,0.3)] text-[hsl(148,60%,28%)] hover:bg-[hsl(148,60%,32%,0.06)] font-semibold h-13"
              >
                Vendre ma récolte
              </Button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-4 pt-6">
              {stats.map(({ n, l, icon: Icon }, i) => (
                <div
                  key={l}
                  className="animate-settle-up"
                  style={{ animationDelay: `${200 + i * 80}ms` }}
                >
                  <div className="text-2xl font-display font-semibold text-foreground tabular-nums">{n}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Hero image */}
          <div className="relative animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="relative rounded-3xl overflow-hidden shadow-soft-xl">
              <img
                src={heroImg}
                alt="Productrice malgache avec un panier de litchis"
                className="w-full h-[480px] object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(20,40%,10%,0.4)] via-transparent to-transparent" />
            </div>

            {/* Floating card — bottom left */}
            <div
              className="absolute -bottom-5 -left-5 glass-panel rounded-2xl p-4 max-w-[200px] shadow-soft-lg animate-settle-up"
              style={{ animationDelay: "500ms" }}
            >
              <p className="text-[10px] uppercase tracking-widest font-semibold text-[hsl(148,60%,32%)] mb-1">
                Récolte du jour
              </p>
              <p className="font-display text-sm text-foreground leading-tight">
                800 kg de litchis frais — Toamasina
              </p>
              <div className="mt-2 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-[hsl(38,85%,48%)] text-[hsl(38,85%,48%)]" />
                ))}
              </div>
            </div>

            {/* Floating badge — top right */}
            <div
              className="absolute -top-4 -right-4 glass-panel rounded-2xl p-3 shadow-soft-md animate-settle-up"
              style={{ animationDelay: "650ms" }}
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[hsl(148,60%,32%)] flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">+34%</p>
                  <p className="text-[10px] text-muted-foreground">ce mois</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Roles section ── */}
      <section className="py-20 bg-[hsl(148,20%,97%)] border-y border-border">
        <div className="container-app">
          <div className="text-center max-w-2xl mx-auto mb-14 animate-settle-up">
            <span className="badge-green mb-4">La plateforme</span>
            <h2 className="font-display text-4xl md:text-5xl mt-3">
              Une plateforme, <em className="text-[hsl(148,60%,32%)] not-italic">quatre rôles</em>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Choisissez votre rôle pour commencer en quelques secondes.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {roleCards.map(({ role, title, desc, icon: Icon, color }, i) => (
              <Link
                key={role}
                to="/connexion"
                state={{ role }}
                className="group relative rounded-2xl bg-white border border-border p-7 shadow-soft-sm hover:shadow-soft-lg hover:-translate-y-2 transition-all duration-300 ease-out animate-settle-up overflow-hidden"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                {/* Decorative top-right circle */}
                <div
                  className="absolute -top-6 -right-6 h-20 w-20 rounded-full opacity-[0.08] transition-all duration-300 group-hover:opacity-[0.14] group-hover:scale-125"
                  style={{ background: color }}
                />

                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 shadow-soft-sm"
                  style={{ background: color }}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>

                <h3 className="font-display text-xl text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>

                <div
                  className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold transition-all duration-200 group-hover:gap-3"
                  style={{ color }}
                >
                  Commencer <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured listings ── */}
      <section className="py-20 container-app">
        <div className="flex items-end justify-between gap-4 mb-12">
          <div className="animate-settle-up">
            <span className="badge-gold mb-3">Sélection du jour</span>
            <h2 className="font-display text-4xl md:text-5xl mt-3">
              Récoltes en vedette
            </h2>
            <p className="text-muted-foreground mt-3 text-lg">
              Sélection fraîche, directement des producteurs.
            </p>
          </div>
          <Link
            to="/produits"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-[hsl(148,60%,32%)] hover:underline shrink-0"
          >
            Tout voir <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((l, i) => <ListingCard key={l.id} listing={l} index={i} />)}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 bg-[hsl(148,55%,22%)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none" aria-hidden>
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }} />
        </div>
        <div className="container-app relative">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl text-white">
              Ils font confiance à AgriLink
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="glass-panel rounded-2xl p-7 animate-settle-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-[hsl(38,85%,48%)] text-[hsl(38,85%,48%)]" />
                  ))}
                </div>
                <p className="text-foreground leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3 border-t border-border pt-4">
                  <div className="h-9 w-9 rounded-full bg-[hsl(148,60%,32%)] flex items-center justify-center">
                    <Leaf className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.author}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 container-app">
        <div className="rounded-3xl overflow-hidden relative bg-gradient-to-br from-[hsl(148,60%,32%)] to-[hsl(148,55%,20%)] p-10 md:p-16 text-center shadow-soft-xl">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
            backgroundImage: "radial-gradient(circle at 20% 80%, white 0%, transparent 50%), radial-gradient(circle at 80% 20%, white 0%, transparent 50%)"
          }} aria-hidden />
          <h2 className="font-display text-4xl md:text-5xl text-white mb-4 relative">
            Prêt à rejoindre la marketplace ?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto relative">
            Inscrivez-vous gratuitement et connectez-vous au réseau agricole malgache.
          </p>
          <div className="flex flex-wrap justify-center gap-4 relative">
            <Button
              size="lg"
              onClick={() => navigate("/connexion")}
              className="bg-white text-[hsl(148,60%,28%)] hover:bg-white/90 shadow-soft-md rounded-xl font-semibold h-13 px-8"
            >
              Créer un compte gratuit
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/produits")}
              className="border-2 border-white/40 text-white hover:bg-white/10 rounded-xl font-semibold h-13"
            >
              Voir les produits
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
