import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Sprout } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-[calc(100vh-68px)] flex items-center justify-center bg-[hsl(148,20%,97%)]">
      <div className="text-center max-w-md px-6 animate-settle-up">
        {/* Decorative number */}
        <div className="relative mb-8 inline-block">
          <p className="font-display text-[9rem] leading-none text-[hsl(148,60%,32%,0.08)] select-none">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-20 w-20 rounded-3xl bg-[hsl(148,60%,32%)] flex items-center justify-center shadow-soft-lg animate-float">
              <Sprout className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>

        <h1 className="font-display text-3xl text-foreground mb-3">Page introuvable</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Cette page n'existe pas ou a été déplacée. Retournez à l'accueil pour continuer.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-[hsl(148,60%,32%)] text-white px-6 py-3 font-semibold shadow-soft-md hover:bg-[hsl(148,60%,26%)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
