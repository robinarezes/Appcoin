"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { UploadIcon } from "lucide-react";
import { toast } from "sonner";

import { importerProspects } from "@/actions/prospection";
import { BoutonSoumettre } from "@/components/commun/bouton-soumettre";
import { Champ } from "@/components/commun/champ";
import { Textarea } from "@/components/ui/textarea";
import { ETAT_INITIAL } from "@/lib/validations";

const EXEMPLE = `Boulangerie du Marché ; 01 64 00 00 00 ; Moncourt-Fromonville ; Boulangerie
Garage Central ; 01 60 00 00 00 ; Nemours ; Garage
Coiffure Éclat ; 01 64 11 11 11 ; Grez-sur-Loing ; Coiffeur`;

/**
 * Import en masse : on colle une liste de commerces (une par ligne) et toutes
 * les fiches « prospect » sont créées d'un coup, prêtes à appeler.
 */
export function ImportProspects() {
  const [etat, envoyer] = useActionState(importerProspects, ETAT_INITIAL);
  const formulaire = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (etat.ok) {
      formulaire.current?.reset();
      toast.success(etat.message ?? "Import terminé");
    }
  }, [etat]);

  return (
    <form ref={formulaire} action={envoyer} className="grid gap-4">
      <Champ
        id="lignes"
        label="Liste à importer"
        obligatoire
        erreur={etat.erreurs?.lignes}
        indication="Une boutique par ligne. Colonnes séparées par « ; » : Entreprise ; Téléphone ; Ville ; Secteur. Seul le nom d'entreprise est obligatoire ; les doublons et lignes vides sont ignorés."
      >
        <Textarea
          id="lignes"
          name="lignes"
          rows={12}
          required
          placeholder={EXEMPLE}
          className="font-mono text-sm"
        />
      </Champ>

      <div className="flex items-center gap-3">
        <BoutonSoumettre>
          <UploadIcon />
          Importer les fiches
        </BoutonSoumettre>
        <Link
          href="/prospection"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}
