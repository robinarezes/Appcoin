"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CopyIcon, RefreshCwIcon, UserPlusIcon } from "lucide-react";
import { toast } from "sonner";

import { ajouterMembre } from "@/actions/equipe";
import { BoutonSoumettre } from "@/components/commun/bouton-soumettre";
import { Champ } from "@/components/commun/champ";
import { SelecteurCouleur } from "@/components/equipe/selecteur-couleur";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { genererMotDePasse } from "@/lib/mot-de-passe";
import { ETAT_INITIAL } from "@/lib/validations";

export function AjoutMembre({ couleurProposee }: { couleurProposee: string }) {
  const [etat, envoyer] = useActionState(ajouterMembre, ETAT_INITIAL);
  const [motDePasse, setMotDePasse] = useState("");
  const [dernierCree, setDernierCree] = useState<{ nom: string; motDePasse: string } | null>(
    null,
  );
  const formulaire = useRef<HTMLFormElement>(null);
  const nomSaisi = useRef("");

  // Le mot de passe est tiré côté navigateur au montage : rien à inventer,
  // et il reste affiché après création pour être transmis.
  useEffect(() => setMotDePasse(genererMotDePasse()), []);

  useEffect(() => {
    if (etat.ok) {
      setDernierCree({ nom: nomSaisi.current, motDePasse });
      formulaire.current?.reset();
      setMotDePasse(genererMotDePasse());
      toast.success(etat.message ?? "Compte créé");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etat]);

  const erreur = (champ: string) => etat.erreurs?.[champ];

  return (
    <>
      <form
        ref={formulaire}
        action={envoyer}
        onSubmit={(e) => {
          nomSaisi.current =
            (e.currentTarget.elements.namedItem("nom") as HTMLInputElement)?.value ?? "";
        }}
        className="grid gap-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Champ id="membre-nom" label="Prénom" obligatoire erreur={erreur("nom")}>
            <Input id="membre-nom" name="nom" placeholder="Camille" required />
          </Champ>

          <Champ id="membre-email" label="Email" obligatoire erreur={erreur("email")}>
            <Input
              id="membre-email"
              name="email"
              type="email"
              placeholder="camille@agence.fr"
              required
            />
          </Champ>
        </div>

        <Champ
          id="membre-motdepasse"
          label="Mot de passe"
          obligatoire
          indication="Généré automatiquement. Notez-le : il faudra le transmettre."
          erreur={erreur("motDePasse")}
        >
          <div className="flex gap-2">
            <Input
              id="membre-motdepasse"
              name="motDePasse"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="font-mono"
              required
              minLength={8}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Générer un autre mot de passe"
              title="Générer un autre mot de passe"
              onClick={() => setMotDePasse(genererMotDePasse())}
            >
              <RefreshCwIcon />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Copier le mot de passe"
              title="Copier"
              onClick={() => {
                navigator.clipboard.writeText(motDePasse);
                toast.success("Mot de passe copié");
              }}
            >
              <CopyIcon />
            </Button>
          </div>
        </Champ>

        <div className="grid gap-1.5">
          <Label>Sa couleur dans le calendrier</Label>
          <SelecteurCouleur defaut={couleurProposee} />
        </div>

        <div className="flex justify-end">
          <BoutonSoumettre>
            <UserPlusIcon />
            Créer le compte
          </BoutonSoumettre>
        </div>
      </form>

      {dernierCree && (
        <div className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <p className="font-medium text-emerald-900 dark:text-emerald-200">
            Compte créé pour {dernierCree.nom}
          </p>
          <p className="mt-1 text-emerald-800 dark:text-emerald-300">
            Transmettez-lui ces identifiants — ce mot de passe ne sera plus
            affiché après avoir quitté cette page.
          </p>
          <p className="mt-2 font-mono text-emerald-900 dark:text-emerald-200">
            {dernierCree.motDePasse}
          </p>
        </div>
      )}
    </>
  );
}
