import Link from "next/link";
import { MapPinIcon, MonitorIcon, PhoneIcon } from "lucide-react";

import { BadgeStatut } from "@/components/commun/badge-statut";
import { PastilleUtilisateur } from "@/components/layout/pastille-utilisateur";
import { STATUTS_RDV } from "@/lib/constantes";
import { capitaliser, formatDateLongue, formatHeure } from "@/lib/dates";
import type { RendezVousComplet } from "@/lib/requetes/rendez-vous";
import { cn } from "@/lib/utils";

const ICONES = {
  PHYSIQUE: MapPinIcon,
  TELEPHONE: PhoneIcon,
  VISIO: MonitorIcon,
} as const;

export function LigneRendezVous({
  rdv,
  compact = false,
}: {
  rdv: RendezVousComplet;
  compact?: boolean;
}) {
  const Icone = ICONES[rdv.type as keyof typeof ICONES] ?? MapPinIcon;

  return (
    <Link
      href={`/rendez-vous/${rdv.id}`}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50",
        rdv.statut === "ANNULE" && "opacity-60",
      )}
    >
      <span
        aria-hidden
        className="h-9 w-1 shrink-0 rounded-full"
        style={{ backgroundColor: rdv.participant.couleur }}
      />

      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-medium", rdv.statut === "ANNULE" && "line-through")}>
          {rdv.titre}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          <span className="tabular-nums">
            {capitaliser(formatDateLongue(rdv.dateDebut))} · {formatHeure(rdv.dateDebut)} –{" "}
            {formatHeure(rdv.dateFin)}
          </span>
          {rdv.client && <span className="truncate">· {rdv.client.entreprise}</span>}
        </p>
      </div>

      {!compact && (
        <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
          <Icone className="size-3.5" />
          {rdv.lieu}
        </span>
      )}

      <PastilleUtilisateur utilisateur={rdv.participant} className="size-7 text-[10px]" />
      <BadgeStatut map={STATUTS_RDV} valeur={rdv.statut} />
    </Link>
  );
}
