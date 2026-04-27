import { Link, useNavigate } from "react-router-dom";
import { Plus, Sprout, ShoppingBasket, Truck, ShieldCheck, TrendingUp, Trash2, CheckCircle2, Clock, Activity } from "lucide-react";
import { useApp, formatAr, type Listing, type ReservationStatus, type User } from "@/store/app";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const roleIcon: Record<string, typeof Sprout> = {
  producteur: Sprout,
  acheteur: ShoppingBasket,
  transporteur: Truck,
  admin: ShieldCheck,
};

const roleBg: Record<string, string> = {
  producteur: "hsl(148,60%,32%)",
  acheteur: "hsl(38,85%,40%)",
  transporteur: "hsl(15,65%,42%)",
  admin: "hsl(148,60%,32%)",
};

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?q=80&w=800&auto=format&fit=crop";

export default function Dashboard() {
  const { user, role } = useApp();
  const navigate = useNavigate();

  if (!user || !role) {
    return (
      <div className="container-app py-24 flex flex-col items-center text-center max-w-md mx-auto">
        <div className="h-16 w-16 rounded-2xl bg-[hsl(148,60%,32%,0.1)] flex items-center justify-center mb-6">
          <Sprout className="h-8 w-8 text-[hsl(148,60%,32%)]" />
        </div>
        <h1 className="font-display text-3xl text-foreground">Connectez-vous</h1>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          Accédez à votre tableau de bord pour gérer vos activités.
        </p>
        <Button
          size="lg"
          className="mt-6 bg-[hsl(148,60%,32%)] hover:bg-[hsl(148,60%,26%)] text-white rounded-xl shadow-soft-md"
          onClick={() => navigate("/connexion")}
        >
          Se connecter
        </Button>
      </div>
    );
  }

  const RoleIcon = roleIcon[role] ?? Sprout;
  const color = roleBg[role] ?? "hsl(148,60%,32%)";

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[hsl(148,20%,97%)]">
      {/* ── Dashboard header ── */}
      <div className="bg-white border-b border-border">
        <div className="container-app py-8">
          <div className="flex flex-wrap items-center justify-between gap-4 animate-settle-up">
            <div className="flex items-center gap-4">
              <div
                className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-soft-md"
                style={{ background: color }}
              >
                <RoleIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="rounded-pill px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white"
                    style={{ background: color }}
                  >
                    {role}
                  </span>
                </div>
                <h1 className="font-display text-3xl md:text-4xl text-foreground">
                  Bonjour, {user.name}
                </h1>
              </div>
            </div>
            {role === "producteur" && (
              <Button
                size="lg"
                onClick={() => navigate("/annonces/nouveau")}
                className="gap-2 bg-[hsl(148,60%,32%)] hover:bg-[hsl(148,60%,26%)] text-white shadow-soft-md rounded-xl font-semibold"
              >
                <Plus className="h-5 w-5" /> Publier une récolte
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container-app py-8 md:py-10 space-y-8">
        {role === "producteur"  && <ProducerDash user={user} />}
        {role === "acheteur"    && <BuyerDash />}
        {role === "transporteur"&& <TransporterDash />}
        {role === "admin"       && <AdminDash />}
      </div>
    </div>
  );
}

/* ── Stat card ── */
function Stat({ icon: Icon, label, value, color = "hsl(148,60%,32%)" }: {
  icon: typeof Sprout; label: string; value: string | number; color?: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-border p-6 shadow-soft-sm hover:shadow-soft-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div
          className="h-11 w-11 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="font-display text-3xl tabular-nums text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-1 font-medium">{label}</p>
    </div>
  );
}

/* ── Status pill ── */
function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    active:           { label: "Active",           bg: "hsl(148,60%,32%,0.1)",  color: "hsl(148,60%,26%)" },
    reserved:         { label: "Réservée",         bg: "hsl(38,85%,48%,0.12)", color: "hsl(38,80%,33%)"  },
    pending:          { label: "En attente",       bg: "hsl(38,85%,48%,0.12)", color: "hsl(38,80%,33%)"  },
    accepted:         { label: "Acceptée",         bg: "hsl(148,60%,32%,0.1)",  color: "hsl(148,60%,26%)" },
    awaiting_transport:{ label: "Attente transport",bg: "hsl(38,85%,48%,0.12)", color: "hsl(38,80%,33%)" },
    in_transit:       { label: "En transit",       bg: "hsl(200,70%,48%,0.12)", color: "hsl(200,70%,32%)" },
    delivered:        { label: "Livrée",           bg: "hsl(148,60%,32%,0.1)",  color: "hsl(148,60%,26%)" },
    available:        { label: "Disponible",       bg: "hsl(148,60%,32%,0.1)",  color: "hsl(148,60%,26%)" },
    removed:          { label: "Retirée",          bg: "hsl(0,72%,55%,0.1)",    color: "hsl(0,72%,45%)"   },
  };
  const m = map[status] ?? { label: status, bg: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" };
  return (
    <span
      className="inline-flex items-center rounded-pill px-3 py-1 text-xs font-semibold"
      style={{ background: m.bg, color: m.color }}
    >
      {m.label}
    </span>
  );
}

/* ── Producer ── */
function ProducerDash({ user }: { user: User }) {
  const { listings, reservations, updateReservationStatus } = useApp();
  const mine = listings.filter(l => l.producerId === user.id && l.status !== "removed");
  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-3 gap-5">
        <Stat icon={Sprout} label="Annonces actives" value={mine.filter(l => l.status === "active").length} />
        <Stat icon={ShoppingBasket} label="Réservations reçues" value={reservations.length} color="hsl(38,85%,40%)" />
        <Stat icon={TrendingUp} label="Vues totales" value="1.2k" color="hsl(15,65%,42%)" />
      </div>
      <Section title="Mes annonces" items={mine} empty={
        <EmptyState
          emoji="🌱"
          title="Aucune annonce publiée"
          desc="Publiez votre première récolte pour atteindre des acheteurs."
          cta={<Link to="/annonces/nouveau"><Button className="bg-[hsl(148,60%,32%)] text-white rounded-xl"><Plus className="h-4 w-4 mr-1" />Publier</Button></Link>}
        />
      }>
        {mine.map(l => <ListingRow key={l.id} listing={l} />)}
      </Section>

      <Section title="Réservations reçues" items={reservations.filter(r => r.status === "pending")} empty={
        <EmptyState emoji="📦" title="Aucune nouvelle réservation" desc="Les commandes apparaîtront ici dès qu'un acheteur sera intéressé." />
      }>
        {reservations.filter(r => r.status === "pending").map(r => (
          <div key={r.id} className="p-4 hover:bg-[hsl(148,20%,97%)] transition-colors space-y-3">
            <div className="flex items-center gap-4">
              <img src={r.listing?.imageUrl || PLACEHOLDER_IMG} alt="" className="h-14 w-14 rounded-xl object-cover border border-border shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{r.listing?.productName} · {r.quantity} {r.listing?.unit === "piece" ? "pièce" : r.listing?.unit}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Par {r.buyer?.name} · {formatAr(r.totalPrice)}</p>
              </div>
              <StatusPill status={r.status} />
            </div>
            <div className="flex justify-end gap-2 pl-[4.5rem]">
              <Button size="sm" variant="outline" className="rounded-xl border-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                onClick={() => updateReservationStatus(r.id, "rejected") as any}>Refuser</Button>
              <Button size="sm" className="bg-[hsl(148,60%,32%)] text-white rounded-xl hover:bg-[hsl(148,60%,26%)]"
                onClick={() => updateReservationStatus(r.id, "accepted") as any}>Accepter</Button>
            </div>
          </div>
        ))}
      </Section>
    </div>
  );
}

function ListingRow({ listing }: { listing: Listing }) {
  const { removeListing } = useApp();
  return (
    <Link to={`/produits/${listing.id}`} className="flex items-center gap-4 p-4 hover:bg-[hsl(148,20%,97%)] transition-colors group">
      <img src={listing.imageUrl || PLACEHOLDER_IMG} alt="" className="h-14 w-14 rounded-xl object-cover border border-border shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{listing.productName}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{listing.quantity} {listing.unit === "piece" ? "pièce" : listing.unit} · {listing.region}</p>
      </div>
      <div className="text-right hidden sm:block mr-2">
        <p className="font-display text-base text-[hsl(148,60%,32%)] tabular-nums">{formatAr(listing.pricePerUnit)}</p>
        <div className="mt-1"><StatusPill status={listing.status} /></div>
      </div>
      <button
        onClick={(e) => { e.preventDefault(); removeListing(listing.id); }}
        className="text-muted-foreground hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Retirer"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </Link>
  );
}

/* ── Buyer ── */
function BuyerDash() {
  const { reservations } = useApp();
  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-3 gap-5">
        <Stat icon={ShoppingBasket} label="Réservations" value={reservations.length} />
        <Stat icon={Clock} label="En attente" value={reservations.filter(r => r.status === "pending").length} color="hsl(38,85%,40%)" />
        <Stat icon={CheckCircle2} label="Livrées" value={reservations.filter(r => r.status === "delivered").length} color="hsl(15,65%,42%)" />
      </div>
      <Section title="Mes réservations" items={reservations} empty={
        <EmptyState emoji="🛒" title="Aucune réservation" desc="Parcourez les produits pour réserver votre première récolte."
          cta={<Link to="/produits"><Button className="bg-[hsl(148,60%,32%)] text-white rounded-xl">Voir les produits</Button></Link>} />
      }>
        {reservations.map(r => (
          <div key={r.id} className="flex items-center gap-4 p-4 hover:bg-[hsl(148,20%,97%)] transition-colors">
            <img src={r.listing?.imageUrl || PLACEHOLDER_IMG} alt="" className="h-14 w-14 rounded-xl object-cover border border-border shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{r.listing?.productName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{r.quantity} {r.listing?.unit === "piece" ? "pièce" : r.listing?.unit} · {formatAr(r.totalPrice)}</p>
            </div>
            <StatusPill status={r.status} />
          </div>
        ))}
      </Section>
    </div>
  );
}

/* ── Transporter ── */
function TransporterDash() {
  const { deliveries, acceptDelivery, advanceDelivery } = useApp();
  const [fees, setFees] = useState<Record<string, number>>({});
  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-3 gap-5">
        <Stat icon={Truck} label="Missions disponibles" value={deliveries.filter(d => d.status === "available").length} />
        <Stat icon={Clock} label="En cours" value={deliveries.filter(d => d.status === "accepted" || d.status === "in_transit").length} color="hsl(38,85%,40%)" />
        <Stat icon={CheckCircle2} label="Livrées" value={deliveries.filter(d => d.status === "delivered").length} color="hsl(15,65%,42%)" />
      </div>
      <Section title="Missions de livraison" items={deliveries} empty={
        <EmptyState emoji="🚛" title="Aucune mission disponible" desc="Les nouvelles missions apparaîtront dès qu'un acheteur réservera." />
      }>
        {deliveries.map(d => {
          const r = d.reservation;
          const l = r?.listing;
          if (!l || !r) return null;
          return (
            <div key={d.id} className="p-4 hover:bg-[hsl(148,20%,97%)] transition-colors space-y-3">
              <div className="flex items-center gap-4">
                <img src={l.imageUrl || PLACEHOLDER_IMG} alt="" className="h-14 w-14 rounded-xl object-cover border border-border shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{l.productName} · {r.quantity} {l.unit === "piece" ? "pièce" : l.unit}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Départ: {d.pickup} → Arrivée: {d.dropoff}</p>
                </div>
                <StatusPill status={d.status} />
              </div>
              {d.status === "available" && (
                <div className="flex gap-2 items-end pl-[4.5rem]">
                  <div className="flex-1 max-w-xs">
                    <label className="text-xs text-muted-foreground font-medium">Tarif proposé (Ar)</label>
                    <Input type="number" min={1000} placeholder="50 000" className="h-10 mt-1 rounded-xl"
                      value={fees[d.id] || ""} onChange={e => setFees({ ...fees, [d.id]: Number(e.target.value) })} />
                  </div>
                  <Button
                    className="bg-[hsl(148,60%,32%)] text-white rounded-xl hover:bg-[hsl(148,60%,26%)]"
                    onClick={() => {
                      const f = fees[d.id]; if (!f) { toast.error("Indiquez un tarif"); return; }
                      acceptDelivery(d.id, f);
                    }}
                  >Accepter</Button>
                </div>
              )}
              {(d.status === "accepted" || d.status === "in_transit") && (
                <div className="flex justify-end pl-[4.5rem]">
                  <Button variant="outline" size="sm" className="rounded-xl border-2" onClick={() => advanceDelivery(d.id)}>
                    {d.status === "accepted" ? "Démarrer la livraison" : "Marquer livré"}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </Section>
    </div>
  );
}

/* ── Admin ── */
function AdminDash() {
  const { listings, reservations, deliveries, removeListing } = useApp();
  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-4 gap-5">
        <Stat icon={Sprout} label="Annonces" value={listings.filter(l => l.status !== "removed").length} />
        <Stat icon={ShoppingBasket} label="Réservations" value={reservations.length} color="hsl(38,85%,40%)" />
        <Stat icon={Truck} label="Livraisons" value={deliveries.length} color="hsl(15,65%,42%)" />
        <Stat icon={ShieldCheck} label="Retirées" value={listings.filter(l => l.status === "removed").length} color="hsl(0,72%,55%)" />
      </div>
      <Section title="Toutes les annonces" items={listings}>
        {listings.map(l => (
          <div key={l.id} className="flex items-center gap-4 p-4 hover:bg-[hsl(148,20%,97%)] transition-colors">
            <img src={l.imageUrl || PLACEHOLDER_IMG} alt="" className="h-14 w-14 rounded-xl object-cover border border-border shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{l.productName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{l.producer.name} · {l.region}</p>
            </div>
            <StatusPill status={l.status} />
            {l.status !== "removed" && (
              <Button size="sm" variant="outline" className="rounded-xl border-2 hover:border-red-300 hover:text-red-500 hover:bg-red-50"
                onClick={() => removeListing(l.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </Section>
    </div>
  );
}

/* ── Helpers ── */
function Section({ title, children, items, empty }: { title: string; children: React.ReactNode; items: unknown[]; empty?: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl text-foreground mb-4">{title}</h2>
      <div className="rounded-2xl border border-border bg-white shadow-soft-sm overflow-hidden divide-y divide-border">
        {items.length === 0 ? empty : children}
      </div>
    </section>
  );
}

function EmptyState({ emoji, title, desc, cta }: { emoji: string; title: string; desc: string; cta?: React.ReactNode }) {
  return (
    <div className="py-16 text-center">
      <div className="text-5xl mb-4">{emoji}</div>
      <p className="font-display text-xl text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">{desc}</p>
      {cta && <div className="mt-6">{cta}</div>}
    </div>
  );
}
