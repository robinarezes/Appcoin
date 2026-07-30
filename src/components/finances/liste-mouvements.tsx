"use client";

import { useTransition } from "react";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { supprimerMouvement } from "@/actions/finances";
import { BadgeStatut } from "@/components/commun/badge-statut";
import { Button } from "@/components/ui/button";
import { TYPES_MOUVEMENT } from "@/lib/constantes";
import { formatDate } from "@/lib/dates";
import { formatEuros } from "@/lib/format";
import { cn } from "@/lib/utils";

type Mouvement = {
  id: string;
  date: Date;
  libelle: string;
  montantCents: number;
  type: string;
};

export function ListeMouvements({ mouvements }: { mouvements: Mouvement[] }) {
  const [enCours, demarrer] = useTransition();

  if (mouvements.length === 0) {
    return (
      <p className="py-2 text-sm text-muted-foreground">
        Aucun mouvement noté cette année. Ajoutez un encaissement ou une dépense
        ci-dessus.
      </p>
    );
  }

  const supprimer = (mouvement: Mouvement) =>
    demarrer(async () => {
      await supprimerMouvement(mouvement.id);
      toast.success(`« ${mouvement.libelle} » supprimé`);
    });

  return (
    <ul className="grid divide-y">
      {mouvements.map((mouvement) => {
        const sortie = mouvement.type === "SORTIE";
        return (
          <li
            key={mouvement.id}
            className="flex items-center gap-3 py-2 first:pt-0 last:pb-0"
          >
            <span className="w-20 shrink-0 text-xs tabular-nums text-muted-foreground">
              {formatDate(mouvement.date)}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm">{mouvement.libelle}</span>
            <BadgeStatut map={TYPES_MOUVEMENT} valeur={mouvement.type} />
            <span
              className={cn(
                "w-24 shrink-0 text-right text-sm font-medium tabular-nums",
                sortie
                  ? "text-rose-700 dark:text-rose-400"
                  : "text-emerald-700 dark:text-emerald-400",
              )}
            >
              {sortie ? "−" : "+"}
              {formatEuros(mouvement.montantCents)}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={enCours}
              aria-label={`Supprimer « ${mouvement.libelle} »`}
              title="Supprimer"
              onClick={() => supprimer(mouvement)}
            >
              <Trash2Icon />
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
