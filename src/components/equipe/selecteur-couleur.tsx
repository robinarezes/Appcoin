"use client";

import { useState } from "react";
import { CheckIcon } from "lucide-react";

import { COULEURS_EQUIPE } from "@/lib/constantes";
import { cn } from "@/lib/utils";

/** Choix de la couleur de repère, envoyée avec le formulaire. */
export function SelecteurCouleur({
  name = "couleur",
  defaut,
}: {
  name?: string;
  defaut?: string;
}) {
  const [couleur, setCouleur] = useState(defaut ?? COULEURS_EQUIPE[0].valeur);

  return (
    <>
      <input type="hidden" name={name} value={couleur} />
      <div className="flex flex-wrap gap-1.5">
        {COULEURS_EQUIPE.map((c) => (
          <button
            key={c.valeur}
            type="button"
            onClick={() => setCouleur(c.valeur)}
            aria-label={c.nom}
            aria-pressed={couleur === c.valeur}
            title={c.nom}
            style={{ backgroundColor: c.valeur }}
            className={cn(
              "flex size-7 items-center justify-center rounded-full text-white transition-transform",
              couleur === c.valeur
                ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                : "hover:scale-110",
            )}
          >
            {couleur === c.valeur && <CheckIcon className="size-3.5" />}
          </button>
        ))}
      </div>
    </>
  );
}
