import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Home, ShoppingBasket, LayoutDashboard, LogOut, Sprout, Menu, X } from "lucide-react";
import { useApp } from "@/store/app";
import { Button } from "@/components/ui/button";
import { type ReactNode, useState, useEffect } from "react";

const navItems = [
  { to: "/", label: "Accueil", icon: Home },
  { to: "/produits", label: "Produits", icon: ShoppingBasket },
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, role, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const roleColors: Record<string, string> = {
    producteur: "badge-green",
    acheteur: "badge-gold",
    transporteur: "badge-clay",
    admin: "badge-green",
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Navbar ── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass-panel shadow-soft-md"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="container-app flex h-[68px] items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative h-9 w-9">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[hsl(148,60%,32%)] to-[hsl(148,55%,22%)] shadow-soft-sm group-hover:shadow-soft-md transition-shadow" />
              <Sprout className="absolute inset-0 m-auto h-5 w-5 text-white" />
            </div>
            <span className="font-display text-xl tracking-tight text-foreground leading-none">
              Agri<span className="text-[hsl(148,60%,32%)]">Link</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[hsl(148,60%,32%)] text-white shadow-soft-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-alt"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* User zone */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden sm:flex flex-col items-end leading-tight gap-1">
                  <span className="text-sm font-semibold text-foreground">{user.name}</span>
                  {role && <span className={roleColors[role] ?? "badge-green"}>{role}</span>}
                </div>
                <button
                  onClick={() => { logout(); navigate("/"); }}
                  aria-label="Déconnexion"
                  className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-alt transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => navigate("/connexion")}
                className="rounded-lg bg-[hsl(148,60%,32%)] text-white hover:bg-[hsl(148,60%,26%)] shadow-soft-sm font-semibold"
              >
                Se connecter
              </Button>
            )}
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="md:hidden h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-surface-alt transition-colors"
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-surface shadow-soft-lg animate-scale-in">
            <div className="container-app py-3 space-y-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-[hsl(148,60%,32%)/0.1] text-[hsl(148,60%,32%)]"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface-alt"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 pb-24 md:pb-0">{children}</main>

      {/* ── Footer ── */}
      <footer className="hidden md:block border-t border-border bg-[hsl(148,20%,97%)]">
        <div className="container-app py-10">
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div className="space-y-3 max-w-xs">
              <div className="flex items-center gap-2">
                <div className="relative h-8 w-8">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[hsl(148,60%,32%)] to-[hsl(148,55%,22%)]" />
                  <Sprout className="absolute inset-0 m-auto h-4 w-4 text-white" />
                </div>
                <span className="font-display text-lg text-foreground">AgriLink Mada</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Du champ au marché, directement. La marketplace agricole de Madagascar.
              </p>
            </div>
            <div className="flex gap-12 text-sm">
              <div className="space-y-2">
                <p className="font-semibold text-foreground uppercase tracking-wider text-xs">Plateforme</p>
                {["Accueil", "Produits", "Tableau de bord"].map(l => (
                  <p key={l}><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{l}</a></p>
                ))}
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-foreground uppercase tracking-wider text-xs">Entreprise</p>
                {["À propos", "Aide", "CGU", "Confidentialité"].map(l => (
                  <p key={l}><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{l}</a></p>
                ))}
              </div>
            </div>
          </div>
          <div className="divider-fancy mt-8 mb-5" />
          <p className="text-xs text-muted-foreground text-center">
            © 2026 AgriLink Mada — Connecter les producteurs malgaches au marché.
          </p>
        </div>
      </footer>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 glass-panel border-t border-border">
        <div className="grid grid-cols-3 max-w-sm mx-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-semibold transition-colors ${
                  isActive ? "text-[hsl(148,60%,32%)]" : "text-muted-foreground"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {to === "/" ? "Accueil" : to === "/produits" ? "Produits" : "Tableau"}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
