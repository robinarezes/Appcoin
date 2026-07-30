"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { ajouterMouvement } from "@/actions/finances";
import { BoutonSoumettre } from "@/components/commun/bouton-soumettre";
import { Champ } from "@/components/commun/champ";
import { Input } from "@/components/ui/input";
import { maintenant, versInputDate } from "@/lib/dates";
import { ETAT_INITIAL } from "@/lib/validations";
import { cn } from "@/lib/utils";

/**
 * Saisie d'un mouvement en une ligne : ce qui rentre (un règlement client) ou
 * ce qui sort (une dépense). Après l'ajout, le formulaire se vide et reste
 * prêt pour le suivant.
 */
export function FormulaireMouvement() {
  const [etat, envoyer] = useActionState(ajouterMouvement, ETAT_INITIAL);
  const [type, setType] = useState<"ENTREE" | "SORTIE">("ENTREE");
  const formulaire = useRef<HTMLFormElement>(null);
  const premierChamp = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (etat.ok) {
      formulaire.current?.reset();
      premierChamp.current?.focus();
      toast.success(type === "ENTREE" ? "Encaissement noté" : "Dépense notée");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etat]);

  const erreur = (champ: string) => etat.erreurs?.[champ];

  return (
    <form ref={formulaire} action={envoyer} className="grid gap-3">
      <input type="hidden" name="type" value={type} />

      <div className="flex overflow-hidden rounded-lg border" role="group" aria-label="Type de mouvement">
        <button
          type="button"
          onClick={() => setType("ENTREE")}
          aria-pressed={type === "ENTREE"}
          className={cn(
            "flex-1 px-3 py-1.5 text-sm font-medium transition-colors",
            type === "ENTREE"
              ? "bg-emerald-600 text-white"
              : "bg-background text-muted-foreground hover:text-foreground",
          )}
        >
          + Encaissement
        </button>
        <button
          type="button"
          onClick={() => setType("SORTIE")}
          aria-pressed={type === "SORTIE"}
          className={cn(
            "flex-1 border-l px-3 py-1.5 text-sm font-medium transition-colors",
            type === "SORTIE"
              ? "bg-rose-600 text-white"
              : "bg-background text-muted-foreground hover:text-foreground",
          )}
        >
          − Dépense
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_8rem_10rem_auto] sm:items-end">
        <Champ id="mvt-libelle" label="Libellé" obligatoire erreur={erreur("libelle")}>
          <Input
            ref={premierChamp}
            id="mvt-libelle"
            name="libelle"
            placeholder={
              type === "ENTREE" ? "Site du Petit Bistrot — acompte" : "Hébergement des sites"
            }
            required
          />
        </Champ>

        <Champ id="mvt-montant" label="Montant (€)" obligatoire erreur={erreur("montant")}>
          <Input
            id="mvt-montant"
            name="montant"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            placeholder="1250.00"
            required
          />
        </Champ>

        <Champ id="mvt-date" label="Date" obligatoire erreur={erreur("date")}>
          <Input
            id="mvt-date"
            name="date"
            type="date"
            defaultValue={versInputDate(maintenant())}
            required
          />
        </Champ>

        <BoutonSoumettre className="sm:mb-0">Ajouter</BoutonSoumettre>
      </div>
    </form>
  );
}
