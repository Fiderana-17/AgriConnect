import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X, Grid3X3, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useApp, REGION_LIST } from "@/store/app";
import ListingCard from "@/components/ListingCard";

export default function Products() {
  const { listings } = useApp();
  const [q, setQ] = useState("");
  const [region, setRegion] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const categories = useMemo(
    () => Array.from(new Set(listings.map(l => l.category))),
    [listings]
  );

  const catLabels: Record<string, string> = {
    Fruits: "Fruits", Legumes: "Légumes", Cereales: "Céréales", Epices: "Épices", Boissons: "Boissons", Autres: "Autres"
  };

  const filtered = listings.filter(l =>
    l.status === "active" &&
    (region === "all" || l.region === region) &&
    (category === "all" || l.category === category) &&
    (!q || l.productName.toLowerCase().includes(q.toLowerCase()) || l.producer.name.toLowerCase().includes(q.toLowerCase()))
  );

  const hasFilters = region !== "all" || category !== "all" || q !== "";

  return (
    <div className="min-h-[calc(100vh-68px)]">
      {/* ── Page header ── */}
      <div className="bg-[hsl(148,20%,97%)] border-b border-border">
        <div className="container-app py-10">
          <div className="animate-settle-up">
            <span className="badge-green mb-3">Marketplace</span>
            <h1 className="font-display text-4xl md:text-5xl mt-3">Produits frais</h1>
            <p className="text-muted-foreground mt-3 text-lg">
              <span className="font-semibold text-foreground">{filtered.length}</span> récolte{filtered.length > 1 ? "s" : ""} disponible{filtered.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        {/* ── Filters bar ── */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-soft-sm mb-8 space-y-4 animate-settle-up">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <Input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Rechercher un produit, un producteur..."
              className="pl-11 h-12 rounded-xl border-border bg-surface-alt focus-visible:bg-white focus-visible:border-[hsl(148,60%,32%)]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
              <FilterPills
                label="Région"
                value={region}
                onChange={setRegion}
                options={[{ v: "all", l: "Toutes régions" }, ...REGION_LIST.map(r => ({ v: r, l: r }))]}
              />
            </div>
            <div className="h-5 w-px bg-border hidden sm:block" />
            <FilterPills
              label="Catégorie"
              value={category}
              onChange={setCategory}
              options={[{ v: "all", l: "Toutes catégories" }, ...categories.map(c => ({ v: c, l: catLabels[c] || c }))]}
            />
            <div className="ml-auto flex items-center gap-1 border border-border rounded-lg p-1">
              <button
                onClick={() => setView("grid")}
                className={`rounded-md p-1.5 transition-colors ${view === "grid" ? "bg-[hsl(148,60%,32%)] text-white" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`rounded-md p-1.5 transition-colors ${view === "list" ? "bg-[hsl(148,60%,32%)] text-white" : "text-muted-foreground hover:text-foreground"}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Active filter pills */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 pt-1 border-t border-border">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Filtres actifs :</span>
              {q && (
                <ActiveFilter label={`"${q}"`} onRemove={() => setQ("")} />
              )}
              {region !== "all" && (
                <ActiveFilter label={region} onRemove={() => setRegion("all")} />
              )}
              {category !== "all" && (
                <ActiveFilter label={category} onRemove={() => setCategory("all")} />
              )}
              <button
                onClick={() => { setQ(""); setRegion("all"); setCategory("all"); }}
                className="text-xs font-semibold text-[hsl(148,60%,32%)] hover:underline ml-2"
              >
                Tout effacer
              </button>
            </div>
          )}
        </div>

        {/* ── Results ── */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border bg-white py-24 text-center animate-scale-in">
            <div className="text-5xl mb-4">🌿</div>
            <p className="font-display text-2xl text-foreground">Aucun produit trouvé</p>
            <p className="text-muted-foreground mt-2">Essayez d'élargir vos filtres ou changez de région.</p>
            <button
              onClick={() => { setQ(""); setRegion("all"); setCategory("all"); }}
              className="mt-6 text-sm font-semibold text-[hsl(148,60%,32%)] hover:underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${view === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 max-w-2xl"}`}>
            {filtered.map((l, i) => <ListingCard key={l.id} listing={l} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function ActiveFilter({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 rounded-pill bg-[hsl(148,60%,32%,0.1)] text-[hsl(148,60%,26%)] border border-[hsl(148,60%,32%,0.2)] px-3 py-1 text-xs font-semibold hover:bg-[hsl(148,60%,32%,0.18)] transition-colors"
    >
      {label} <X className="h-3 w-3" />
    </button>
  );
}

function FilterPills({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1 hidden sm:inline">{label}</span>
      {options.map(o => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={`tap-press rounded-pill px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
            value === o.v
              ? "bg-[hsl(148,60%,32%)] text-white shadow-soft-xs"
              : "bg-surface-alt text-muted-foreground hover:text-foreground hover:bg-[hsl(148,60%,32%,0.08)]"
          }`}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}
