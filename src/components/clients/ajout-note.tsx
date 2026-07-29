"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { ajouterNote } from "@/actions/clients";
import { BoutonSoumettre } from "@/components/commun/bouton-soumettre";
import { Textarea } from "@/components/ui/textarea";
import { ETAT_INITIAL } from "@/lib/validations";

/** Saisie rapide d'un échange depuis la fiche client. */
export function AjoutNote({ clientId }: { clientId: string }) {
  const [etat, envoyer] = useActionState(ajouterNote, ETAT_INITIAL);
  const formulaire = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (etat.ok) {
      formulaire.current?.reset();
      toast.success("Note ajoutée");
    }
  }, [etat]);

  return (
    <form ref={formulaire} action={envoyer} className="grid gap-2">
      <input type="hidden" name="clientId" value={clientId} />
      <Textarea
        name="contenu"
        rows={3}
        required
        placeholder="Appel du jour, visite, engagement pris…"
        aria-label="Nouvelle note"
      />
      {etat.erreurs?.contenu && (
        <p role="alert" className="text-xs text-destructive">
          {etat.erreurs.contenu}
        </p>
      )}
      <div className="flex justify-end">
        <BoutonSoumettre size="sm">Ajouter au journal</BoutonSoumettre>
      </div>
    </form>
  );
}
