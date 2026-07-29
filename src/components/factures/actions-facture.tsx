"use client";

import { useTransition } from "react";
import { CheckIcon, UndoIcon } from "lucide-react";
import { toast } from "sonner";

import { marquerFactureImpayee, marquerFacturePayee } from "@/actions/factures";
import { Button } from "@/components/ui/button";

export function ActionsFacture({ id, payee }: { id: string; payee: boolean }) {
  const [enCours, demarrer] = useTransition();

  if (payee) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={enCours}
        aria-label="Annuler le paiement"
        title="Annuler le paiement"
        onClick={() =>
          demarrer(async () => {
            await marquerFactureImpayee(id);
            toast.success("Facture remise en attente");
          })
        }
      >
        <UndoIcon />
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      disabled={enCours}
      onClick={() =>
        demarrer(async () => {
          await marquerFacturePayee(id);
          toast.success("Facture marquée payée");
        })
      }
    >
      <CheckIcon />
      Payée
    </Button>
  );
}
