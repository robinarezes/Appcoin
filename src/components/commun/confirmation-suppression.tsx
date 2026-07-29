"use client";

import { useState, useTransition } from "react";
import { LoaderCircleIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

/**
 * Confirmation avant toute suppression. `action` est une Server Action qui
 * renvoie soit rien (redirection), soit un message d'erreur à afficher.
 */
export function ConfirmationSuppression({
  action,
  titre,
  description,
  libelleBouton = "Supprimer",
  variante = "destructive",
  taille = "default",
  iconeSeule = false,
}: {
  action: () => Promise<{ erreur?: string } | void>;
  titre: string;
  description: string;
  libelleBouton?: string;
  variante?: React.ComponentProps<typeof Button>["variant"];
  taille?: React.ComponentProps<typeof Button>["size"];
  iconeSeule?: boolean;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [enCours, demarrer] = useTransition();

  const confirmer = () => {
    demarrer(async () => {
      const resultat = await action();
      if (resultat?.erreur) {
        toast.error(resultat.erreur);
        setOuvert(false);
        return;
      }
      setOuvert(false);
    });
  };

  return (
    <>
      <Button
        variant={variante}
        size={iconeSeule ? "icon-sm" : taille}
        onClick={() => setOuvert(true)}
        aria-label={iconeSeule ? libelleBouton : undefined}
        title={iconeSeule ? libelleBouton : undefined}
      >
        <Trash2Icon />
        {!iconeSeule && libelleBouton}
      </Button>

      <AlertDialog open={ouvert} onOpenChange={setOuvert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{titre}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={enCours}>Annuler</AlertDialogCancel>
            <Button variant="destructive" onClick={confirmer} disabled={enCours}>
              {enCours && <LoaderCircleIcon className="animate-spin" />}
              Supprimer définitivement
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
