"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import { BoutonSoumettre } from "@/components/commun/bouton-soumettre";
import { Champ } from "@/components/commun/champ";
import { SelectNatif } from "@/components/commun/select-natif";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { STATUTS_RDV, TYPES_RDV, optionsDepuis } from "@/lib/constantes";
import { ETAT_INITIAL, type EtatFormulaire } from "@/lib/validations";

export type RendezVousFormulaire = {
  id: string;
  titre: string;
  clientId: string | null;
  dateDebut: string;
  dateFin: string;
  lieu: string | null;
  type: string;
  participantId: string;
  statut: string;
  notes: string | null;
};

export function FormulaireRendezVous({
  action,
  rdv,
  clients,
  membres,
  retour,
  valeursParDefaut,
}: {
  action: (precedent: EtatFormulaire, donnees: FormData) => Promise<EtatFormulaire>;
  rdv?: RendezVousFormulaire;
  clients: { id: string; entreprise: string }[];
  membres: { id: string; nom: string; couleur: string }[];
  retour: string;
  valeursParDefaut?: { dateDebut: string; dateFin: string; clientId?: string; participantId: string };
}) {
  const [etat, envoyer] = useActionState(action, ETAT_INITIAL);
  const erreur = (champ: string) => etat.erreurs?.[champ];

  // La fin suit automatiquement le début tant qu'on n'y a pas touché :
  // en pratique un rendez-vous dure une heure.
  const [debut, setDebut] = useState(rdv?.dateDebut ?? valeursParDefaut?.dateDebut ?? "");
  const [fin, setFin] = useState(rdv?.dateFin ?? valeursParDefaut?.dateFin ?? "");
  const [finTouchee, setFinTouchee] = useState(false);

  const majDebut = (valeur: string) => {
    setDebut(valeur);
    if (!finTouchee && valeur) {
      const dans1h = new Date(`${valeur}:00.000Z`);
      dans1h.setUTCHours(dans1h.getUTCHours() + 1);
      setFin(dans1h.toISOString().slice(0, 16));
    }
  };

  return (
    <form action={envoyer} className="grid gap-6">
      <section className="rounded-xl border bg-background p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Champ
            id="titre"
            label="Titre"
            obligatoire
            erreur={erreur("titre")}
            className="sm:col-span-2"
          >
            <Input
              id="titre"
              name="titre"
              defaultValue={rdv?.titre ?? ""}
              placeholder="Point d'avancement, présentation du devis…"
              required
              autoFocus
            />
          </Champ>

          <Champ id="dateDebut" label="Début" obligatoire erreur={erreur("dateDebut")}>
            <Input
              id="dateDebut"
              name="dateDebut"
              type="datetime-local"
              value={debut}
              onChange={(e) => majDebut(e.target.value)}
              required
            />
          </Champ>

          <Champ id="dateFin" label="Fin" obligatoire erreur={erreur("dateFin")}>
            <Input
              id="dateFin"
              name="dateFin"
              type="datetime-local"
              value={fin}
              onChange={(e) => {
                setFinTouchee(true);
                setFin(e.target.value);
              }}
              required
            />
          </Champ>

          <Champ id="clientId" label="Client" erreur={erreur("clientId")}>
            <SelectNatif
              id="clientId"
              name="clientId"
              defaultValue={rdv?.clientId ?? valeursParDefaut?.clientId ?? ""}
            >
              <option value="">Aucun (rendez-vous interne)</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.entreprise}
                </option>
              ))}
            </SelectNatif>
          </Champ>

          <Champ id="participantId" label="Qui y va" erreur={erreur("participantId")}>
            <SelectNatif
              id="participantId"
              name="participantId"
              defaultValue={rdv?.participantId ?? valeursParDefaut?.participantId ?? ""}
            >
              {membres.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nom}
                </option>
              ))}
            </SelectNatif>
          </Champ>

          <Champ id="type" label="Type" erreur={erreur("type")}>
            <SelectNatif id="type" name="type" defaultValue={rdv?.type ?? "PHYSIQUE"}>
              {optionsDepuis(TYPES_RDV).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectNatif>
          </Champ>

          <Champ id="statut" label="Statut" erreur={erreur("statut")}>
            <SelectNatif id="statut" name="statut" defaultValue={rdv?.statut ?? "PREVU"}>
              {optionsDepuis(STATUTS_RDV).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectNatif>
          </Champ>

          <Champ id="lieu" label="Lieu" erreur={erreur("lieu")} className="sm:col-span-2">
            <Input
              id="lieu"
              name="lieu"
              defaultValue={rdv?.lieu ?? ""}
              placeholder="12 rue Saint-Georges, Rennes — ou lien de visio"
            />
          </Champ>

          <Champ
            id="notes"
            label="Notes"
            indication="Ordre du jour avant, compte-rendu après."
            erreur={erreur("notes")}
            className="sm:col-span-2"
          >
            <Textarea id="notes" name="notes" rows={4} defaultValue={rdv?.notes ?? ""} />
          </Champ>
        </div>
      </section>

      <div className="flex items-center gap-2">
        <BoutonSoumettre size="lg">
          {rdv ? "Enregistrer les modifications" : "Créer le rendez-vous"}
        </BoutonSoumettre>
        <Button variant="ghost" size="lg" render={<Link href={retour} />}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
