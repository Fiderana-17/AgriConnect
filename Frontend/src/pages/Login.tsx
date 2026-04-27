import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sprout, ShoppingBasket, Truck, ShieldCheck, ArrowRight, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp, type Role } from "@/store/app";
import { toast } from "sonner";

const roles: { id: Role; label: string; icon: typeof Sprout; desc: string; color: string }[] = [
  { id: "producteur",  label: "Producteur",  icon: Sprout,        desc: "Publiez vos récoltes",    color: "hsl(148,60%,32%)" },
  { id: "acheteur",    label: "Acheteur",    icon: ShoppingBasket, desc: "Achetez frais",           color: "hsl(38,85%,40%)"  },
  { id: "transporteur",label: "Transporteur",icon: Truck,          desc: "Livrez les commandes",    color: "hsl(15,65%,42%)"  },
  { id: "admin",       label: "Admin",       icon: ShieldCheck,    desc: "Gérez la plateforme",     color: "hsl(148,60%,32%)" },
];

const perks = [
  "Inscription gratuite en 30 secondes",
  "Vente directe sans commission élevée",
  "Réseau de transporteurs partenaires",
  "Support disponible 6j/7",
];

export default function Login() {
  const location = useLocation() as { state?: { role?: Role } };
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>(location.state?.role ?? "producteur");
  const [password, setPassword] = useState("");
  const { login, register, loading } = useApp();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === "signup") {
        await register({ name, email, password, role });
      } else {
        await login(email, password);
      }
      navigate("/dashboard");
    } catch (err) {
      // toast is already handled in store
    }
  };

  const selectedRole = roles.find(r => r.id === role)!;

  return (
    <div className="min-h-[calc(100vh-68px)] flex items-center py-12">
      <div className="container-app">
        <div className="grid lg:grid-cols-[1fr_480px] gap-10 max-w-5xl mx-auto items-start">

          {/* ── Left: branding & perks ── */}
          <div className="space-y-8 animate-settle-up">
            <div>
              <span className="badge-green mb-4">Rejoindre AgriLink Mada</span>
              <h1 className="font-display text-4xl md:text-5xl mt-3 leading-tight">
                {mode === "signup"
                  ? <>Connectez le champ<br /><em className="text-[hsl(148,60%,32%)] not-italic">au marché</em></>
                  : <>Heureux de vous<br /><em className="text-[hsl(148,60%,32%)] not-italic">revoir</em></>
                }
              </h1>
              <p className="text-muted-foreground mt-4 text-lg leading-relaxed max-w-sm">
                Choisissez votre rôle et commencez en quelques secondes.
              </p>
            </div>

            {/* Role picker */}
            <div className="grid grid-cols-2 gap-3">
              {roles.map(({ id, label, desc, icon: Icon, color }) => {
                const active = role === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setRole(id)}
                    className={`tap-press flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                      active
                        ? "border-[hsl(148,60%,32%)] bg-white shadow-soft-md"
                        : "border-border bg-white/60 hover:border-[hsl(148,60%,32%,0.3)]"
                    }`}
                  >
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-all duration-200"
                      style={{
                        background: active ? color : "hsl(var(--surface-alt))",
                        color: active ? "white" : "hsl(var(--muted-foreground))",
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground truncate">{desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Perks */}
            <div className="rounded-2xl bg-[hsl(148,20%,97%)] border border-border p-6 space-y-3">
              <p className="text-sm font-semibold text-foreground uppercase tracking-wider">Pourquoi AgriLink ?</p>
              {perks.map(p => (
                <div key={p} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-[hsl(148,60%,32%)] flex items-center justify-center shrink-0">
                    <Leaf className="h-3 w-3 text-white" />
                  </div>
                  <p className="text-sm text-foreground">{p}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: form ── */}
          <div className="animate-settle-up" style={{ animationDelay: "150ms" }}>
            <div className="rounded-3xl border border-border bg-white p-8 shadow-soft-lg space-y-6">
              {/* Mode toggle */}
              <div className="flex gap-1 p-1.5 bg-surface-alt rounded-xl">
                {(["signup", "login"] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
                      mode === m
                        ? "bg-white text-foreground shadow-soft-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m === "signup" ? "Inscription" : "Connexion"}
                  </button>
                ))}
              </div>

              {/* Selected role display */}
              <div
                className="flex items-center gap-3 rounded-xl p-3 border"
                style={{ background: `${selectedRole.color}0d`, borderColor: `${selectedRole.color}30` }}
              >
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: selectedRole.color }}
                >
                  <selectedRole.icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: selectedRole.color }}>{selectedRole.label}</p>
                  <p className="text-xs text-muted-foreground">{selectedRole.desc}</p>
                </div>
              </div>

              <form onSubmit={submit} className="space-y-5">
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold">Nom complet</Label>
                    <Input
                      id="name"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Rakoto Andry"
                      className="h-12 rounded-xl border-border bg-surface-alt focus-visible:bg-white focus-visible:border-[hsl(148,60%,32%)]"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">Email ou téléphone</Label>
                  <Input
                    id="email"
                    type="text"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="vous@exemple.mg"
                    className="h-12 rounded-xl border-border bg-surface-alt focus-visible:bg-white focus-visible:border-[hsl(148,60%,32%)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pwd" className="text-sm font-semibold">Mot de passe</Label>
                  <Input
                    id="pwd"
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 rounded-xl border-border bg-surface-alt focus-visible:bg-white focus-visible:border-[hsl(148,60%,32%)]"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="w-full h-13 rounded-xl bg-[hsl(148,60%,32%)] hover:bg-[hsl(148,60%,26%)] text-white shadow-soft-md font-semibold gap-2"
                >
                  {loading ? "Chargement..." : (mode === "signup" ? "Créer mon compte" : "Se connecter")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              <p className="text-xs text-center text-muted-foreground">
                En continuant, vous acceptez nos{" "}
                <a href="#" className="underline hover:text-foreground">conditions d'utilisation</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
