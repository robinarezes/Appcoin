"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { modifierProfil } from "@/actions/equipe";
import { BoutonSoumettre } from "@/components/commun/bouton-soumettre";
import { Champ } from "@/components/commun/champ";
import { SelecteurCouleur } from "@/components/equipe/selecteur-couleur";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UtilisateurConnecte } from "@/lib/session";
import { ETAT_INITIAL } from "@/lib/validations";

export function MonProfil({ utilisateur }: { utilisateur: UtilisateurConnecte }) {
  const [etat, envoyer] = useActionState(modifierProfil, ETAT_INITIAL);

  useEffect(() => {
    if (etat.ok) toast.success(etat.message ?? "Profil mis à jour");
  }, [etat]);

  return (
    <form action={envoyer} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Champ id="profil-nom" label="Prénom" obligatoire erreur={etat.erreurs?.nom}>
          <Input id="profil-nom" name="nom" defaultValue={utilisateur.nom} required />
        </Champ>

        <Champ id="profil-email" label="Email">
          <Input id="profil-email" value={utilisateur.email} disabled />
        </Champ>
      </div>

      <div className="grid gap-1.5">
        <Label>Ma couleur dans le calendrier</Label>
        <SelecteurCouleur defaut={utilisateur.couleur} />
      </div>

      <div className="flex justify-end">
        <BoutonSoumettre>Enregistrer</BoutonSoumettre>
      </div>
    </form>
  );
}
