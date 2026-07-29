import { HammerIcon } from "lucide-react";

import { EtatVide } from "@/components/commun/etat-vide";

/** Marque-page temporaire, remplacé au fur et à mesure des étapes. */
export function EnConstruction({ etape }: { etape: string }) {
  return (
    <EtatVide
      Icone={HammerIcon}
      titre="Écran à venir"
      description={`Cette section sera développée à l'étape « ${etape} ».`}
    />
  );
}
