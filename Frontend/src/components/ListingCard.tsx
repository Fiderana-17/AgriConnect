import { Link } from "react-router-dom";
import { MapPin, Calendar, Package, ArrowRight } from "lucide-react";
import { type Listing, formatAr } from "@/store/app";

const categoryColors: Record<string, { bg: string; text: string; label: string }> = {
  Fruits:   { bg: "hsl(38,85%,48%,0.12)",  text: "hsl(38,80%,33%)", label: "Fruits" },
  Legumes:  { bg: "hsl(148,60%,32%,0.1)", text: "hsl(148,60%,26%)", label: "Légumes" },
  Cereales: { bg: "hsl(15,65%,52%,0.1)",  text: "hsl(15,65%,38%)", label: "Céréales" },
  Epices:   { bg: "hsl(270,50%,55%,0.1)", text: "hsl(270,50%,38%)", label: "Épices" },
  Boissons: { bg: "hsl(200,70%,48%,0.1)", text: "hsl(200,70%,32%)", label: "Boissons" },
  Autres:   { bg: "hsl(0,0%,50%,0.1)",    text: "hsl(0,0%,35%)", label: "Autres" },
};

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?q=80&w=800&auto=format&fit=crop";

export default function ListingCard({ listing, index = 0 }: { listing: Listing; index?: number }) {
  const cat = categoryColors[listing.category] ?? categoryColors["Autres"];

  return (
    <Link
      to={`/produits/${listing.id}`}
      className="group block rounded-2xl bg-white border border-border overflow-hidden shadow-soft-sm hover:shadow-soft-lg hover:-translate-y-2 transition-all duration-300 ease-out animate-settle-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-alt">
        <img
          src={listing.imageUrl || PLACEHOLDER_IMG}
          alt={listing.productName}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Category badge */}
        <span
          className="absolute top-3 left-3 rounded-pill px-3 py-1 text-[11px] font-semibold uppercase tracking-wide backdrop-blur-sm border"
          style={{ background: `${cat.bg}`, color: cat.text, borderColor: `${cat.text}30` }}
        >
          {cat.label}
        </span>

        {/* Price on hover */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="glass-panel rounded-lg px-3 py-1.5 text-sm font-display font-semibold text-foreground shadow-soft-sm">
            {formatAr(listing.pricePerUnit)}/{listing.unit === "piece" ? "pièce" : listing.unit}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl text-foreground leading-tight group-hover:text-[hsl(148,60%,32%)] transition-colors">
            {listing.productName}
          </h3>
          <p className="font-display text-lg text-[hsl(148,60%,32%)] tabular-nums whitespace-nowrap shrink-0">
            {formatAr(listing.pricePerUnit)}
            <span className="text-xs text-muted-foreground font-sans font-normal">/{listing.unit === "piece" ? "pièce" : listing.unit}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-[hsl(148,60%,32%)]" />
            {listing.region}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 text-[hsl(38,85%,48%)]" />
            {listing.quantity} {listing.unit === "piece" ? "pièce" : listing.unit}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            {new Date(listing.availableOn).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            Par <span className="font-semibold text-foreground">{listing.producer.name}</span>
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[hsl(148,60%,32%)] opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
            Voir <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
