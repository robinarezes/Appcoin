import Link from "next/link";

import {
  JOURS_COURTS,
  aujourdHui,
  formatHeure,
  memeJour,
  versInputDate,
} from "@/lib/dates";
import type { RendezVousComplet } from "@/lib/requetes/rendez-vous";
import { cn } from "@/lib/utils";

/**
 * Grille mensuelle sur six semaines commençant le lundi. Chaque rendez-vous
 * porte la couleur de la personne qui s'y rend — c'est le repère principal
 * quand on regarde le mois de loin.
 */
export function CalendrierMois({
  mois,
  cases,
  rendezVous,
}: {
  /** Index du mois affiché (0–11) : sert à griser les jours des mois voisins. */
  mois: number;
  cases: Date[];
  rendezVous: RendezVousComplet[];
}) {
  const today = aujourdHui();

  return (
    <div className="overflow-hidden rounded-xl border bg-background">
      <div className="grid grid-cols-7 border-b bg-muted/40">
        {JOURS_COURTS.map((jour) => (
          <div
            key={jour}
            className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
          >
            <span className="hidden sm:inline">{jour}</span>
            <span className="sm:hidden">{jour[0]}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cases.map((jour, index) => {
          const duJour = rendezVous.filter((r) => memeJour(r.dateDebut, jour));
          const horsMois = jour.getUTCMonth() !== mois;
          const cEstAujourdHui = memeJour(jour, today);

          return (
            <div
              key={jour.toISOString()}
              className={cn(
                "min-h-20 border-b border-r p-1 sm:min-h-28 sm:p-1.5",
                index % 7 === 6 && "border-r-0",
                index >= 35 && "border-b-0",
                horsMois && "bg-muted/30",
              )}
            >
              <div className="mb-1 flex items-center justify-between">
                <Link
                  href={`/rendez-vous/nouveau?date=${versInputDate(jour)}`}
                  title="Créer un rendez-vous ce jour-là"
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-xs tabular-nums transition-colors hover:bg-muted",
                    horsMois ? "text-muted-foreground/60" : "text-muted-foreground",
                    cEstAujourdHui &&
                      "bg-primary font-semibold text-primary-foreground hover:bg-primary/90",
                  )}
                >
                  {jour.getUTCDate()}
                </Link>
              </div>

              <ul className="grid gap-1">
                {duJour.slice(0, 3).map((rdv) => (
                  <li key={rdv.id}>
                    <Link
                      href={`/rendez-vous/${rdv.id}`}
                      className={cn(
                        "flex items-center gap-1 rounded px-1 py-0.5 text-[11px] leading-tight hover:bg-muted",
                        rdv.statut === "ANNULE" && "line-through opacity-60",
                      )}
                      title={`${formatHeure(rdv.dateDebut)} — ${rdv.titre}`}
                    >
                      <span
                        aria-hidden
                        className="size-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: rdv.participant.couleur }}
                      />
                      <span className="hidden truncate sm:inline">
                        <span className="tabular-nums text-muted-foreground">
                          {formatHeure(rdv.dateDebut)}
                        </span>{" "}
                        {rdv.client?.entreprise ?? rdv.titre}
                      </span>
                    </Link>
                  </li>
                ))}

                {duJour.length > 3 && (
                  <li className="px-1 text-[11px] text-muted-foreground">
                    +{duJour.length - 3}
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
