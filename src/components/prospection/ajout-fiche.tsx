"use client";

import { useActionState, useEffect, useRef } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { ajouterFicheProspection } from "@/actions/prospection";
import { BoutonSoumettre } from "@/components/commun/bouton-soumettre";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ETAT_INITIAL } from "@/lib/validations";

/**
 * Saisie en rafale : on tape une boutique et son numéro, on valide, le champ
 * reprend le focus pour la suivante. C'est fait pour vider une liste de
 * numéros trouvés sur internet ou dans les pages jaunes.
 */
export function AjoutFiche() {
  const [etat, envoyer] = useActionState(ajouterFicheProspection, ETAT_INITIAL);
  const formulaire = useRef<HTMLFormElement>(null);
  const premierChamp = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (etat.ok) {
      formulaire.current?.reset();
      premierChamp.current?.focus();
      toast.success("Fiche ajoutée à la liste d'appels");
    }
  }, [etat]);

  return (
    <form
      ref={formulaire}
      action={envoyer}
      className="mb-4 rounded-xl border bg-background p-3"
    >
      <div className="grid gap-3 sm:grid-cols-[1.5fr_1fr_1fr_auto] sm:items-end">
        <div className="grid gap-1.5">
          <Label htmlFor="entreprise">Boutique</Label>
          <Input
            ref={premierChamp}
            id="entreprise"
            name="entreprise"
            placeholder="Boulangerie du marché"
            required
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="telephone">Téléphone</Label>
          <Input
            id="telephone"
            name="telephone"
            type="tel"
            inputMode="tel"
            placeholder="02 99 00 00 00"
            required
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="ville">Ville</Label>
          <Input id="ville" name="ville" placeholder="Rennes" />
        </div>

        <BoutonSoumettre>
          <PlusIcon />
          Ajouter
        </BoutonSoumettre>
      </div>

      {(etat.erreurs?.entreprise || etat.erreurs?.telephone) && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {etat.erreurs.entreprise ?? etat.erreurs.telephone}
        </p>
      )}
    </form>
  );
}
