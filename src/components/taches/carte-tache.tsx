"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlarmClockIcon, BuildingIcon, GripVerticalIcon } from "lucide-react";

import { BadgeStatut } from "@/components/commun/badge-statut";
import { PastilleUtilisateur } from "@/components/layout/pastille-utilisateur";
import { PRIORITES_TACHE } from "@/lib/constantes";
import { formatDate } from "@/lib/dates";
import { tacheEnRetard } from "@/lib/metier";
import type { TacheKanban } from "@/lib/requetes/taches";
import { cn } from "@/lib/utils";

export function ContenuCarte({
  tache,
  className,
}: {
  tache: TacheKanban;
  className?: string;
}) {
  const enRetard = tacheEnRetard(tache);

  return (
    <div className={cn("min-w-0 flex-1 text-left", className)}>
      <p className={cn("text-sm", tache.statut === "FAIT" && "text-muted-foreground")}>
        {tache.titre}
      </p>

      {tache.client && (
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <BuildingIcon className="size-3 shrink-0" />
          <span className="truncate">{tache.client.entreprise}</span>
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <PastilleUtilisateur utilisateur={tache.assignee} className="size-5 text-[9px]" />
        {tache.priorite !== "NORMALE" && (
          <BadgeStatut map={PRIORITES_TACHE} valeur={tache.priorite} />
        )}
        {tache.dateEcheance && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs tabular-nums",
              enRetard ? "font-medium text-rose-600 dark:text-rose-400" : "text-muted-foreground",
            )}
          >
            <AlarmClockIcon className="size-3" />
            {formatDate(tache.dateEcheance)}
          </span>
        )}
      </div>
    </div>
  );
}

export function CarteTache({
  tache,
  onOuvrir,
}: {
  tache: TacheKanban;
  onOuvrir: (tache: TacheKanban) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tache.id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "flex items-start gap-1 rounded-lg border bg-background p-2.5 shadow-xs",
        isDragging && "opacity-40",
      )}
    >
      {/* Poignée dédiée : le reste de la carte reste cliquable, et sur mobile
          on peut faire défiler la colonne sans déclencher un déplacement. */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Déplacer « ${tache.titre} »`}
        className="-ml-1 cursor-grab touch-none rounded p-1 text-muted-foreground/50 hover:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:cursor-grabbing"
      >
        <GripVerticalIcon className="size-4" />
      </button>

      <button
        type="button"
        onClick={() => onOuvrir(tache)}
        className="min-w-0 flex-1 rounded text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <ContenuCarte tache={tache} />
      </button>
    </li>
  );
}
