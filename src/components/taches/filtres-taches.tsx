"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { XIcon } from "lucide-react";

import { SelectNatif } from "@/components/commun/select-natif";
import { Button } from "@/components/ui/button";
import { PRIORITES_TACHE, optionsDepuis } from "@/lib/constantes";
import { cn } from "@/lib/utils";

export function FiltresTaches({
  clients,
}: {
  clients: { id: string; entreprise: string }[];
}) {
  const router = useRouter();
  const chemin = usePathname();
  const parametres = useSearchParams();

  const appliquer = (modifications: Record<string, string>) => {
    const suivants = new URLSearchParams(parametres.toString());
    for (const [cle, valeur] of Object.entries(modifications)) {
      if (valeur) suivants.set(cle, valeur);
      else suivants.delete(cle);
    }
    const requete = suivants.toString();
    router.replace(requete ? `${chemin}?${requete}` : chemin, { scroll: false });
  };

  const mien = parametres.get("mien") === "1";
  const retard = parametres.get("retard") === "1";
  const client = parametres.get("client") ?? "";
  const priorite = parametres.get("priorite") ?? "";
  const actif = mien || retard || client || priorite;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <Bascule active={mien} onClick={() => appliquer({ mien: mien ? "" : "1" })}>
        Mes tâches
      </Bascule>
      <Bascule active={retard} onClick={() => appliquer({ retard: retard ? "" : "1" })}>
        En retard
      </Bascule>

      <SelectNatif
        value={client}
        onChange={(e) => appliquer({ client: e.target.value })}
        aria-label="Filtrer par client"
        className="w-auto"
      >
        <option value="">Tous les clients</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.entreprise}
          </option>
        ))}
      </SelectNatif>

      <SelectNatif
        value={priorite}
        onChange={(e) => appliquer({ priorite: e.target.value })}
        aria-label="Filtrer par priorité"
        className="w-auto"
      >
        <option value="">Toutes les priorités</option>
        {optionsDepuis(PRIORITES_TACHE).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </SelectNatif>

      {actif && (
        <Button variant="ghost" size="sm" onClick={() => router.replace(chemin, { scroll: false })}>
          <XIcon />
          Réinitialiser
        </Button>
      )}
    </div>
  );
}

function Bascule({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-8 rounded-lg border px-2.5 text-sm font-medium transition-colors",
        active
          ? "border-foreground/20 bg-foreground text-background"
          : "bg-background text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
