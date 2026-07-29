"use client";

import { useState } from "react";
import Link from "next/link";
import { PhoneIcon } from "lucide-react";

import { BadgeStatut } from "@/components/commun/badge-statut";
import { DialogueCompteRendu } from "@/components/prospection/dialogue-compte-rendu";
import { Button } from "@/components/ui/button";
import { RESULTATS_APPEL, STATUTS_CLIENT } from "@/lib/constantes";
import { aujourdHui, formatDate, formatDateRelative } from "@/lib/dates";
import type { FicheProspection } from "@/lib/requetes/prospection";
import { cn } from "@/lib/utils";

export function CarteProspect({ fiche }: { fiche: FicheProspection }) {
  const [dialogueOuvert, setDialogueOuvert] = useState(false);
  const [debutAppel, setDebutAppel] = useState<number | null>(null);

  // Le lien tel: suit son cours (le téléphone compose) ; on ouvre le
  // compte-rendu dans la foulée pour qu'il soit là au retour sur l'écran.
  const lancerAppel = () => {
    setDebutAppel(Date.now());
    setDialogueOuvert(true);
  };

  const rappelDu =
    fiche.dernierAppel?.rappelLe && fiche.dernierAppel.rappelLe <= aujourdHui();

  return (
    <>
      <li
        className={cn(
          "flex flex-wrap items-start gap-3 rounded-xl border bg-background p-3 sm:flex-nowrap sm:items-center",
          rappelDu && "border-amber-300 dark:border-amber-500/40",
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/clients/${fiche.id}`} className="font-medium hover:underline">
              {fiche.entreprise}
            </Link>
            <BadgeStatut map={STATUTS_CLIENT} valeur={fiche.statut} />
            {fiche.dernierAppel && (
              <BadgeStatut map={RESULTATS_APPEL} valeur={fiche.dernierAppel.resultat} />
            )}
          </div>

          <p className="mt-0.5 text-sm text-muted-foreground">
            {[fiche.nomContact, fiche.secteur, fiche.ville].filter(Boolean).join(" · ") ||
              "Aucune précision"}
          </p>

          <p className="mt-1 text-sm tabular-nums text-muted-foreground">{fiche.telephone}</p>

          {fiche.dernierAppel ? (
            <p className="mt-1.5 text-xs text-muted-foreground">
              Dernier appel {formatDateRelative(fiche.dernierAppel.createdAt)} par{" "}
              {fiche.dernierAppel.auteur}
              {fiche.nombreAppels > 1 && ` · ${fiche.nombreAppels} appels au total`}
              {fiche.dernierAppel.note && (
                <>
                  {" — "}
                  <span className="italic">{fiche.dernierAppel.note}</span>
                </>
              )}
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-muted-foreground">Jamais appelé</p>
          )}

          {fiche.dernierAppel?.rappelLe && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                rappelDu
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-muted-foreground",
              )}
            >
              À rappeler le {formatDate(fiche.dernierAppel.rappelLe)}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            size="lg"
            onClick={lancerAppel}
            render={<a href={`tel:${fiche.telephone.replace(/\s/g, "")}`} />}
          >
            <PhoneIcon />
            Appeler
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDialogueOuvert(true)}>
            Noter
          </Button>
        </div>
      </li>

      <DialogueCompteRendu
        ouvert={dialogueOuvert}
        onOuvertChange={setDialogueOuvert}
        clientId={fiche.id}
        entreprise={fiche.entreprise}
        debutAppel={debutAppel}
      />
    </>
  );
}
