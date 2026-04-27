import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Package, User, ShieldCheck, Star, Leaf, Share2, Heart } from "lucide-react";
import { useApp, formatAr } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { listings, reserve, user, role } = useApp();
  const listing = listings.find(l => l.id === id);
  const [qty, setQty] = useState(10);
  const [liked, setLiked] = useState(false);
  const catLabels: Record<string, string> = {
    Fruits: "Fruits", Legumes: "Légumes", Cereales: "Céréales", Epices: "Épices", Boissons: "Boissons", Autres: "Autres"
  };
  const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?q=80&w=800&auto=format&fit=crop";

  if (!listing) {
    return (
      <div className="container-app py-24 text-center">
        <div className="text-6xl mb-6">🌿</div>
        <p className="font-display text-3xl text-foreground">Annonce introuvable</p>
        <Link to="/produits" className="text-[hsl(148,60%,32%)] hover:underline mt-4 inline-flex items-center gap-1.5 font-semibold">
          <ArrowLeft className="h-4 w-4" /> Retour aux produits
        </Link>
      </div>
    );
  }

  const total = qty * listing.pricePerUnit;

  const onReserve = () => {
    if (!user) {
      toast.info("Connectez-vous pour réserver");
      navigate("/connexion", { state: { role: "acheteur" } });
      return;
    }
    if (qty < 1 || qty > listing.quantity) {
      toast.error("Quantité invalide");
      return;
    }
    reserve(listing.id, qty);
  };

  return (
    <div className="min-h-[calc(100vh-68px)]">
      {/* ── Breadcrumb ── */}
      <div className="border-b border-border bg-[hsl(148,20%,97%)]">
        <div className="container-app py-4">
          <Link
            to="/produits"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground font-semibold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Tous les produits
          </Link>
        </div>
      </div>

      <div className="container-app py-8 md:py-12">
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-10">

          {/* ── Left: image + description ── */}
          <div className="space-y-5 animate-settle-up">
            {/* Image */}
            <div className="relative rounded-3xl overflow-hidden shadow-soft-lg group">
              <img
                src={listing.imageUrl || PLACEHOLDER_IMG}
                alt={listing.productName}
                className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

              {/* Actions overlay */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => setLiked(v => !v)}
                  className={`glass-panel h-10 w-10 rounded-full flex items-center justify-center transition-colors ${liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
                >
                  <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
                </button>
                <button className="glass-panel h-10 w-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>

              {/* Category badge */}
              <div className="absolute bottom-4 left-4">
                <span className="glass-panel rounded-pill px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-foreground">
                  {catLabels[listing.category] || listing.category}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-border bg-white p-6 shadow-soft-sm">
              <h2 className="font-display text-xl text-foreground mb-3">Description</h2>
              <p className="text-muted-foreground leading-relaxed">{listing.description || "Aucune description fournie."}</p>
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Leaf, title: "Produit frais", desc: "Directement du producteur" },
                { icon: ShieldCheck, title: "Paiement sécurisé", desc: "À la livraison" },
                { icon: Star, title: "Producteur vérifié", desc: "Profil certifié" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-xl border border-border bg-white p-3 text-center shadow-soft-xs">
                  <div className="h-8 w-8 rounded-lg bg-[hsl(148,60%,32%,0.1)] flex items-center justify-center mx-auto mb-2">
                    <Icon className="h-4 w-4 text-[hsl(148,60%,32%)]" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">{title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: purchase panel ── */}
          <aside className="space-y-5 animate-settle-up" style={{ animationDelay: "150ms" }}>
            <div className="rounded-3xl border border-border bg-white p-7 shadow-soft-lg space-y-6">
              {/* Header */}
              <div>
                <span className="badge-green">{catLabels[listing.category] || listing.category}</span>
                <h1 className="font-display text-3xl md:text-4xl mt-3 leading-tight text-foreground">
                  {listing.productName}
                </h1>
                <div className="flex items-baseline gap-2 mt-3">
                  <p className="font-display text-4xl text-[hsl(148,60%,32%)] tabular-nums">
                    {formatAr(listing.pricePerUnit)}
                  </p>
                  <span className="text-base text-muted-foreground">/{listing.unit === "piece" ? "pièce" : listing.unit}</span>
                </div>
              </div>

              {/* Details */}
              <dl className="space-y-3 rounded-xl bg-[hsl(148,20%,97%)] p-4">
                <Row icon={MapPin}  label="Région"       value={listing.region} />
                <Row icon={Package} label="Disponible"   value={`${listing.quantity} ${listing.unit === "piece" ? "pièce" : listing.unit}`} />
                <Row icon={Calendar} label="À partir du" value={new Date(listing.availableOn).toLocaleDateString()} />
                <Row icon={User}    label="Producteur"   value={listing.producer.name} />
              </dl>

              {/* Reservation */}
              {role !== "producteur" && role !== "admin" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="qty" className="text-sm font-semibold">
                      Quantité à réserver ({listing.unit === "piece" ? "pièce" : listing.unit})
                    </Label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQty(q => Math.max(1, q - 10))}
                        className="h-12 w-12 rounded-xl border-2 border-border text-xl font-bold text-muted-foreground hover:border-[hsl(148,60%,32%)] hover:text-[hsl(148,60%,32%)] transition-colors flex items-center justify-center"
                      >
                        −
                      </button>
                      <Input
                        id="qty"
                        type="number"
                        min={1}
                        max={listing.quantity}
                        value={qty}
                        onChange={e => setQty(Number(e.target.value))}
                        className="h-12 rounded-xl text-center font-display text-lg border-2 border-border focus-visible:border-[hsl(148,60%,32%)]"
                      />
                      <button
                        type="button"
                        onClick={() => setQty(q => Math.min(listing.quantity, q + 10))}
                        className="h-12 w-12 rounded-xl border-2 border-border text-xl font-bold text-muted-foreground hover:border-[hsl(148,60%,32%)] hover:text-[hsl(148,60%,32%)] transition-colors flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="rounded-xl bg-gradient-to-br from-[hsl(148,60%,32%,0.08)] to-[hsl(148,60%,32%,0.04)] border border-[hsl(148,60%,32%,0.15)] px-5 py-4 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total estimé</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{qty} {listing.unit === "piece" ? "pièce" : listing.unit} × {formatAr(listing.pricePerUnit)}</p>
                    </div>
                    <p className="font-display text-3xl text-[hsl(148,60%,32%)] tabular-nums">{formatAr(total)}</p>
                  </div>

                  <Button
                    size="lg"
                    className="w-full h-14 rounded-xl bg-[hsl(148,60%,32%)] hover:bg-[hsl(148,60%,26%)] text-white shadow-soft-md font-semibold text-base"
                    onClick={onReserve}
                  >
                    Réserver maintenant
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Le transporteur est notifié dès l'acceptation du producteur.
                  </p>
                </div>
              )}

              {role === "producteur" && (
                <div className="rounded-xl bg-surface-alt border border-border p-4 text-center">
                  <p className="text-sm text-muted-foreground italic">
                    Connecté en tant que producteur — réservation indisponible.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4 text-[hsl(148,60%,32%)]" /> {label}
      </dt>
      <dd className="text-sm font-semibold text-foreground">{value}</dd>
    </div>
  );
}
