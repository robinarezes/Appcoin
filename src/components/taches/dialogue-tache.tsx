"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { creerTache, modifierTache, supprimerTache } from "@/actions/taches";
import { BoutonSoumettre } from "@/components/commun/bouton-soumettre";
import { Champ } from "@/components/commun/champ";
import { ConfirmationSuppression } from "@/components/commun/confirmation-suppression";
import { SelectNatif } from "@/components/commun/select-natif";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PRIORITES_TACHE, STATUTS_TACHE, optionsDepuis } from "@/lib/constantes";
import { versInputDate } from "@/lib/dates";
import type { TacheKanban } from "@/lib/requetes/taches";
import { ETAT_INITIAL } from "@/lib/validations";

export type OptionClient = { id: string; entreprise: string };
export type Membre = { id: string; nom: string; couleur: string; actif: boolean };

export function DialogueTache({
  ouvert,
  onOuvertChange,
  tache,
  clients,
  membres,
  utilisateurId,
  statutParDefaut = "A_FAIRE",
  clientParDefaut,
}: {
  ouvert: boolean;
  onOuvertChange: (ouvert: boolean) => void;
  /** Absent = création. */
  tache?: TacheKanban | null;
  clients: OptionClient[];
  membres: Membre[];
  utilisateurId: string;
  statutParDefaut?: string;
  clientParDefaut?: string;
}) {
  const action = tache ? modifierTache.bind(null, tache.id) : creerTache;
  const [etat, envoyer] = useActionState(action, ETAT_INITIAL);

  useEffect(() => {
    if (etat.ok) {
      toast.success(tache ? "Tâche mise à jour" : "Tâche créée");
      onOuvertChange(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etat]);

  const erreur = (champ: string) => etat.erreurs?.[champ];

  return (
    <Dialog open={ouvert} onOpenChange={onOuvertChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{tache ? "Modifier la tâche" : "Nouvelle tâche"}</DialogTitle>
          <DialogDescription>
            {tache
              ? "Les modifications sont visibles immédiatement par toute l'équipe."
              : "Une tâche peut être rattachée à un client ou rester interne."}
          </DialogDescription>
        </DialogHeader>

        {/* La clé force la réinitialisation des champs quand on ouvre une autre tâche. */}
        <form key={tache?.id ?? "nouvelle"} action={envoyer} className="grid gap-4">
          <Champ id="titre" label="Titre" obligatoire erreur={erreur("titre")}>
            <Input
              id="titre"
              name="titre"
              defaultValue={tache?.titre ?? ""}
              placeholder="Relancer le client, préparer la maquette…"
              required
              autoFocus
            />
          </Champ>

          <Champ id="description" label="Description" erreur={erreur("description")}>
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={tache?.description ?? ""}
              placeholder="Précisions, liens, contexte…"
            />
          </Champ>

          <div className="grid gap-4 sm:grid-cols-2">
            <Champ id="clientId" label="Client" erreur={erreur("clientId")}>
              <SelectNatif
                id="clientId"
                name="clientId"
                defaultValue={tache?.client?.id ?? clientParDefaut ?? ""}
              >
                <option value="">Aucun (tâche interne)</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.entreprise}
                  </option>
                ))}
              </SelectNatif>
            </Champ>

            <Champ id="assigneeId" label="Responsable" erreur={erreur("assigneeId")}>
              <SelectNatif
                id="assigneeId"
                name="assigneeId"
                defaultValue={tache?.assignee.id ?? utilisateurId}
              >
                {membres.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.actif ? m.nom : `${m.nom} (accès retiré)`}
                  </option>
                ))}
              </SelectNatif>
            </Champ>

            <Champ id="priorite" label="Priorité" erreur={erreur("priorite")}>
              <SelectNatif
                id="priorite"
                name="priorite"
                defaultValue={tache?.priorite ?? "NORMALE"}
              >
                {optionsDepuis(PRIORITES_TACHE).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </SelectNatif>
            </Champ>

            <Champ id="statut" label="Colonne" erreur={erreur("statut")}>
              <SelectNatif
                id="statut"
                name="statut"
                defaultValue={tache?.statut ?? statutParDefaut}
              >
                {optionsDepuis(STATUTS_TACHE).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </SelectNatif>
            </Champ>

            <Champ
              id="dateEcheance"
              label="Échéance"
              erreur={erreur("dateEcheance")}
              className="sm:col-span-2"
            >
              <Input
                id="dateEcheance"
                name="dateEcheance"
                type="date"
                defaultValue={tache?.dateEcheance ? versInputDate(tache.dateEcheance) : ""}
              />
            </Champ>
          </div>

          <DialogFooter className="sm:justify-between">
            {tache ? (
              <ConfirmationSuppression
                action={async () => {
                  await supprimerTache(tache.id);
                  onOuvertChange(false);
                }}
                titre="Supprimer cette tâche ?"
                description={`« ${tache.titre} » sera définitivement supprimée.`}
                variante="ghost"
                taille="default"
              />
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <DialogClose render={<Button variant="outline" />}>Annuler</DialogClose>
              <BoutonSoumettre>{tache ? "Enregistrer" : "Créer la tâche"}</BoutonSoumettre>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
