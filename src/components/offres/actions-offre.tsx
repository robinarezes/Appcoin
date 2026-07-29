"use client";

import { useTransition } from "react";
import { CheckIcon, FileOutputIcon, SendIcon, UndoIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { changerStatutOffre, convertirEnFacture } from "@/actions/offres";
import { Button } from "@/components/ui/button";

/** Changement de statut en un clic, et conversion en facture le moment venu. */
export function ActionsOffre({
  id,
  statut,
  dejaFacturee,
}: {
  id: string;
  statut: string;
  dejaFacturee: boolean;
}) {
  const [enCours, demarrer] = useTransition();

  const changer = (nouveau: string, message: string) =>
    demarrer(async () => {
      await changerStatutOffre(id, nouveau);
      toast.success(message);
    });

  const convertir = () =>
    demarrer(async () => {
      const resultat = await convertirEnFacture(id);
      if (resultat?.erreur) toast.error(resultat.erreur);
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

      {statut === "ACCEPTEE" && !dejaFacturee && (
        <Button disabled={enCours} onClick={convertir}>
          <FileOutputIcon />
          Convertir en facture
        </Button>
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
