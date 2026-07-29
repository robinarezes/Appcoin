"use client";

import { useActionState, useEffect } from "react";
import { CheckIcon } from "lucide-react";
import { toast } from "sonner";

import { cloturerRendezVous } from "@/actions/rendez-vous";
import { BoutonSoumettre } from "@/components/commun/bouton-soumettre";
import { SelectNatif } from "@/components/commun/select-natif";
import { Champ } from "@/components/commun/champ";
import { Textarea } from "@/components/ui/textarea";
import { STATUTS_RDV, optionsDepuis } from "@/lib/constantes";
import { ETAT_INITIAL } from "@/lib/validations";

/** Après le rendez-vous : on change le statut et on écrit le compte-rendu. */
export function ClotureRendezVous({
  id,
  statut,
  notes,
}: {
  id: string;
  statut: string;
  notes: string | null;
}) {
  const [etat, envoyer] = useActionState(cloturerRendezVous.bind(null, id), ETAT_INITIAL);

  useEffect(() => {
    if (etat.ok) toast.success("Rendez-vous mis à jour");
  }, [etat]);

  return (
    <form action={envoyer} className="grid gap-4">
      <Champ id="statut" label="Statut">
        <SelectNatif id="statut" name="statut" defaultValue={statut}>
          {optionsDepuis(STATUTS_RDV).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </SelectNatif>
      </Champ>

      <Champ id="notes" label="Compte-rendu">
        <Textarea
          id="notes"
          name="notes"
          rows={5}
          defaultValue={notes ?? ""}
          placeholder="Ce qui s'est dit, ce qui a été décidé, la suite à donner…"
        />
      </Champ>

      <div className="flex justify-end">
        <BoutonSoumettre>
          <CheckIcon />
          Enregistrer
        </BoutonSoumettre>
      </div>
    </form>
  );
}
