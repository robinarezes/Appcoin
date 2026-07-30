"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { enregistrerAppel } from "@/actions/prospection";
import { BoutonSoumettre } from "@/components/commun/bouton-soumettre";
import { Champ } from "@/components/commun/champ";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CLES_RESULTAT_APPEL, RESULTATS_APPEL } from "@/lib/constantes";
import { ajouterJours, maintenant, versInputDate } from "@/lib/dates";
import { ETAT_INITIAL } from "@/lib/validations";
import { cn } from "@/lib/utils";

/** mm:ss */
function chrono(secondes: number) {
  const m = Math.floor(secondes / 60);
  const s = secondes % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Ce qui s'affiche dès qu'on a lancé l'appel : le compte-rendu se remplit
 * pendant ou juste après la conversation, tant que c'est frais.
 */
export function DialogueCompteRendu({
  ouvert,
  onOuvertChange,
  clientId,
  entreprise,
  debutAppel,
}: {
  ouvert: boolean;
  onOuvertChange: (ouvert: boolean) => void;
  clientId: string;
  entreprise: string;
  /** Horodatage du clic sur « Appeler », pour mesurer la durée. */
  debutAppel: number | null;
}) {
  const [etat, envoyer] = useActionState(enregistrerAppel, ETAT_INITIAL);
  const [resultat, setResultat] = useState<string>("");
  const [secondes, setSecondes] = useState(0);

  useEffect(() => {
    if (!ouvert) {
      setResultat("");
      return;
    }
    const tic = setInterval(() => {
      setSecondes(debutAppel ? Math.round((Date.now() - debutAppel) / 1000) : 0);
    }, 1000);
    return () => clearInterval(tic);
  }, [ouvert, debutAppel]);

  useEffect(() => {
    if (etat.ok) {
      toast.success("Appel enregistré");
      onOuvertChange(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etat]);

  const dansUneSemaine = versInputDate(ajouterJours(maintenant(), 7));

  return (
    <Dialog open={ouvert} onOpenChange={onOuvertChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Comment s&apos;est passé l&apos;appel&nbsp;?</DialogTitle>
          <DialogDescription>
            {entreprise}
            {debutAppel && secondes > 0 && (
              <span className="ml-2 tabular-nums">· {chrono(secondes)}</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form action={envoyer} className="grid gap-4">
          <input type="hidden" name="clientId" value={clientId} />
          <input type="hidden" name="resultat" value={resultat} />
          <input type="hidden" name="dureeSecondes" value={secondes} />

          <fieldset className="grid gap-1.5">
            <legend className="mb-1.5 text-sm font-medium">Résultat</legend>
            {CLES_RESULTAT_APPEL.map((cle) => (
              <button
                key={cle}
                type="button"
                onClick={() => setResultat(cle)}
                aria-pressed={resultat === cle}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  resultat === cle
                    ? "border-foreground/25 bg-muted font-medium"
                    : "hover:bg-muted/60",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex size-4 items-center justify-center rounded-full border",
                    resultat === cle && "border-foreground bg-foreground",
                  )}
                >
                  {resultat === cle && (
                    <span className="size-1.5 rounded-full bg-background" />
                  )}
                </span>
                {RESULTATS_APPEL[cle].label}
                {cle === "RDV_PRIS" && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    ouvre l&apos;agenda
                  </span>
                )}
              </button>
            ))}
          </fieldset>

          {etat.erreurs?.resultat && (
            <p role="alert" className="text-xs text-destructive">
              Choisissez d&apos;abord un résultat.
            </p>
          )}

          {resultat === "A_RAPPELER" && (
            <div className="grid grid-cols-[1fr_7rem] gap-3">
              <Champ
                id="rappelLe"
                label="Rappeler le"
                indication="Une tâche de rappel sera créée automatiquement."
              >
                <Input
                  id="rappelLe"
                  name="rappelLe"
                  type="date"
                  defaultValue={dansUneSemaine}
                />
              </Champ>
              <Champ id="rappelHeure" label="À quelle heure" indication="Facultatif.">
                <Input id="rappelHeure" name="rappelHeure" type="time" />
              </Champ>
            </div>
          )}

          <Champ
            id="note"
            label="Notes"
            indication="Interlocuteur, budget, horaires, objection… tout ce qui servira au prochain appel."
          >
            <Textarea
              id="note"
              name="note"
              rows={4}
              placeholder="A demandé de rappeler après le service, vers 15 h. Site fait par son neveu, pas satisfaite."
            />
          </Champ>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOuvertChange(false)} type="button">
              Plus tard
            </Button>
            <BoutonSoumettre disabled={!resultat}>Enregistrer l&apos;appel</BoutonSoumettre>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
