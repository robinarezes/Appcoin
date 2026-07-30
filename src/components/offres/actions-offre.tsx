"use client";

import { useTransition } from "react";
import { CheckIcon, SendIcon, UndoIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { changerStatutOffre } from "@/actions/offres";
import { Button } from "@/components/ui/button";

/** Changement de statut en un clic. */
export function ActionsOffre({ id, statut }: { id: string; statut: string }) {
  const [enCours, demarrer] = useTransition();

  const changer = (nouveau: string, message: string) =>
    demarrer(async () => {
      await changerStatutOffre(id, nouveau);
      toast.success(message);
    });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {statut === "BROUILLON" && (
        <Button disabled={enCours} onClick={() => changer("ENVOYEE", "Offre marquée envoyée")}>
          <SendIcon />
          Marquer envoyée
        </Button>
      )}

      {statut === "ENVOYEE" && (
        <>
          <Button disabled={enCours} onClick={() => changer("ACCEPTEE", "Offre acceptée")}>
            <CheckIcon />
            Acceptée
          </Button>
          <Button
            variant="outline"
            disabled={enCours}
            onClick={() => changer("REFUSEE", "Offre refusée")}
          >
            <XIcon />
            Refusée
          </Button>
        </>
      )}

      {statut !== "BROUILLON" && (
        <Button
          variant="ghost"
          size="sm"
          disabled={enCours}
          onClick={() => changer("ENVOYEE", "Offre remise en attente de réponse")}
          title="Revenir à l'état « envoyée »"
        >
          <UndoIcon />
          Rouvrir
        </Button>
      )}
    </div>
  );
}
