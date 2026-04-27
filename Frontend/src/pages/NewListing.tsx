import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ImagePlus, Sprout, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApp, REGION_LIST } from "@/store/app";
import { toast } from "sonner";

const steps = ["Informations", "Détails", "Description"];

export default function NewListing() {
  const { addListing, role } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [image, setImage] = useState<File | null>(null);
  const [form, setForm] = useState({
    productName: "", category: "Fruits", quantity: 100, unit: "kg",
    pricePerUnit: 1000, region: REGION_LIST[0], availableOn: new Date().toISOString().slice(0, 10),
    description: "",
  });

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role && role !== "producteur") {
      toast.error("Seuls les producteurs peuvent publier.");
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, String(v)));
    if (image) formData.append("image", image);

    await addListing(formData);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[hsl(148,20%,97%)]">
      {/* ── Header ── */}
      <div className="bg-white border-b border-border">
        <div className="container-app py-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground mb-5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Retour
          </button>
          <div className="flex items-center gap-4 animate-settle-up">
            <div className="h-12 w-12 rounded-2xl bg-[hsl(148,60%,32%)] flex items-center justify-center shadow-soft-sm">
              <Sprout className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-foreground">Publier une récolte</h1>
              <p className="text-muted-foreground mt-0.5">Quelques infos suffisent. Vous pourrez modifier plus tard.</p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-6">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <button
                  onClick={() => i <= step && setStep(i)}
                  className={`flex items-center gap-2 text-sm font-semibold transition-colors ${i === step ? "text-[hsl(148,60%,32%)]" : i < step ? "text-[hsl(148,60%,32%,0.6)]" : "text-muted-foreground"}`}
                >
                  <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs transition-all ${
                    i < step ? "bg-[hsl(148,60%,32%)] text-white" : i === step ? "bg-[hsl(148,60%,32%)] text-white ring-4 ring-[hsl(148,60%,32%,0.2)]" : "bg-border text-muted-foreground"
                  }`}>
                    {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </span>
                  <span className="hidden sm:inline">{s}</span>
                </button>
                {i < steps.length - 1 && (
                  <div className={`h-px w-8 sm:w-16 transition-colors ${i < step ? "bg-[hsl(148,60%,32%)]" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="container-app py-8 max-w-2xl">
        <form onSubmit={submit}>
          <div className="rounded-3xl border border-border bg-white p-8 shadow-soft-md space-y-6 animate-scale-in">

            {/* Step 0: Base infos */}
            {step === 0 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="productName" className="text-sm font-semibold">Nom du produit *</Label>
                  <Input
                    id="productName" required value={form.productName}
                    onChange={e => set("productName", e.target.value)}
                    placeholder="Ex. Litchis frais, Vanille Bourbon..."
                    className="h-12 rounded-xl border-border bg-surface-alt focus-visible:bg-white focus-visible:border-[hsl(148,60%,32%)]"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Catégorie</Label>
                    <select
                      className="h-12 w-full rounded-xl border border-border bg-surface-alt px-3 text-sm focus:border-[hsl(148,60%,32%)] focus:bg-white focus:outline-none transition-colors"
                      value={form.category} onChange={e => set("category", e.target.value)}
                    >
                      {["Fruits", "Legumes", "Cereales", "Epices", "Boissons", "Autres"].map(c => <option key={c} value={c}>{c === "Legumes" ? "Légumes" : c === "Cereales" ? "Céréales" : c === "Epices" ? "Épices" : c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Région</Label>
                    <select
                      className="h-12 w-full rounded-xl border border-border bg-surface-alt px-3 text-sm focus:border-[hsl(148,60%,32%)] focus:bg-white focus:outline-none transition-colors"
                      value={form.region} onChange={e => set("region", e.target.value)}
                    >
                      {REGION_LIST.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Step 1: Quantities & price */}
            {step === 1 && (
              <>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Quantité *</Label>
                    <Input
                      type="number" required min={1} value={form.quantity}
                      onChange={e => set("quantity", Number(e.target.value))}
                      className="h-12 rounded-xl tabular-nums border-border bg-surface-alt focus-visible:bg-white focus-visible:border-[hsl(148,60%,32%)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Unité</Label>
                    <select
                      className="h-12 w-full rounded-xl border border-border bg-surface-alt px-3 text-sm focus:border-[hsl(148,60%,32%)] focus:bg-white focus:outline-none transition-colors"
                      value={form.unit} onChange={e => set("unit", e.target.value)}
                    >
                      {["kg", "g", "L", "piece", "sac"].map(u => <option key={u} value={u}>{u === "piece" ? "pièce" : u}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Prix / unité (Ar) *</Label>
                    <Input
                      type="number" required min={1} value={form.pricePerUnit}
                      onChange={e => set("pricePerUnit", Number(e.target.value))}
                      className="h-12 rounded-xl tabular-nums border-border bg-surface-alt focus-visible:bg-white focus-visible:border-[hsl(148,60%,32%)]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Date de disponibilité *</Label>
                  <Input
                    type="date" required value={form.availableOn}
                    onChange={e => set("availableOn", e.target.value)}
                    className="h-12 rounded-xl border-border bg-surface-alt focus-visible:bg-white focus-visible:border-[hsl(148,60%,32%)]"
                  />
                </div>

                {/* Preview */}
                <div className="rounded-xl bg-[hsl(148,20%,97%)] border border-border p-4">
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">Aperçu du prix</p>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Prix unitaire</span>
                    <span className="font-semibold text-foreground">{form.pricePerUnit.toLocaleString()} Ar/{form.unit}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-muted-foreground">Valeur totale du stock</span>
                    <span className="font-display text-lg text-[hsl(148,60%,32%)]">
                      {(form.pricePerUnit * form.quantity).toLocaleString()} Ar
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Description & photo */}
            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Description</Label>
                  <Textarea
                    rows={5} value={form.description}
                    onChange={e => set("description", e.target.value)}
                    placeholder="Qualité, conditions de récolte, conditionnement, informations de contact..."
                    className="rounded-xl border-border bg-surface-alt focus-visible:bg-white focus-visible:border-[hsl(148,60%,32%)] resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Photo (optionnel)</Label>
                  <label className="block">
                    <div className="rounded-2xl border-2 border-dashed border-border bg-[hsl(148,20%,97%)] p-10 text-center hover:border-[hsl(148,60%,32%,0.4)] transition-colors cursor-pointer relative">
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept="image/*"
                        onChange={e => setImage(e.target.files?.[0] || null)}
                      />
                      <div className="h-12 w-12 rounded-xl bg-[hsl(148,60%,32%,0.1)] flex items-center justify-center mx-auto mb-3">
                        <ImagePlus className="h-6 w-6 text-[hsl(148,60%,32%)]" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {image ? image.name : "Cliquez ou glissez une photo ici"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou WEBP (max 5 Mo)</p>
                    </div>
                  </label>
                </div>
              </>
            )}
          </div>

          {/* ── Navigation ── */}
          <div className="flex gap-3 mt-6">
            {step > 0 ? (
              <Button
                type="button" size="lg" variant="outline"
                onClick={() => setStep(s => s - 1)}
                className="flex-1 rounded-xl border-2 font-semibold"
              >
                Précédent
              </Button>
            ) : (
              <Button
                type="button" size="lg" variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1 rounded-xl border-2 font-semibold"
              >
                Annuler
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button
                type="button" size="lg"
                onClick={() => setStep(s => s + 1)}
                disabled={step === 0 && !form.productName}
                className="flex-1 bg-[hsl(148,60%,32%)] hover:bg-[hsl(148,60%,26%)] text-white rounded-xl shadow-soft-md font-semibold"
              >
                Suivant
              </Button>
            ) : (
              <Button
                type="submit" size="lg"
                className="flex-1 bg-[hsl(148,60%,32%)] hover:bg-[hsl(148,60%,26%)] text-white rounded-xl shadow-soft-md font-semibold"
              >
                Publier l'annonce
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
