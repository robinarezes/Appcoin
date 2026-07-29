"use client";

import { useActionState } from "react";
import { AlertCircleIcon } from "lucide-react";

import { creerPremierCompte } from "@/actions/equipe";
import { BoutonSoumettre } from "@/components/commun/bouton-soumettre";
import { Champ } from "@/components/commun/champ";
import { SelecteurCouleur } from "@/components/equipe/selecteur-couleur";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ETAT_INITIAL } from "@/lib/validations";

export function FormulaireInstallation() {
  const [etat, envoyer] = useActionState(creerPremierCompte, ETAT_INITIAL);
  const erreur = (champ: string) => etat.erreurs?.[champ];

  return (
    <form action={envoyer} className="grid gap-4">
      <Champ id="nom" label="Votre prénom" obligatoire erreur={erreur("nom")}>
        <Input id="nom" name="nom" placeholder="Robin" required autoFocus />
      </Champ>

      <Champ id="email" label="Votre email" obligatoire erreur={erreur("email")}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="robin@agence.fr"
          required
        />
      </Champ>

      <Champ
        id="motDePasse"
        label="Mot de passe"
        obligatoire
        indication="Au moins 8 caractères."
        erreur={erreur("motDePasse")}
      >
        <Input
          id="motDePasse"
          name="motDePasse"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </Champ>

      <Champ
        id="confirmation"
        label="Confirmer le mot de passe"
        obligatoire
        erreur={erreur("confirmation")}
      >
        <Input
          id="confirmation"
          name="confirmation"
          type="password"
          autoComplete="new-password"
          required
        />
      </Champ>

      <div className="grid gap-1.5">
        <Label>Votre couleur dans le calendrier</Label>
        <SelecteurCouleur />
      </div>

      {erreur("_") && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
          {erreur("_")}
        </p>
      )}

      <BoutonSoumettre size="lg" className="mt-2 w-full">
        Créer mon compte et démarrer
      </BoutonSoumettre>
    </form>
  );
}
