"use client";

import { useActionState } from "react";
import Link from "next/link";

import { BoutonSoumettre } from "@/components/commun/bouton-soumettre";
import { Champ } from "@/components/commun/champ";
import { SelectNatif } from "@/components/commun/select-natif";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  OPTIONS_SOURCE,
  SECTEURS_SUGGERES,
  STATUTS_CLIENT,
  optionsDepuis,
} from "@/lib/constantes";
import { ETAT_INITIAL, type EtatFormulaire } from "@/lib/validations";

export type ClientFormulaire = {
  id: string;
  entreprise: string;
  nomContact: string | null;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
  ville: string | null;
  secteur: string | null;
  statut: string;
  source: string | null;
  siteWebActuel: string | null;
  notes: string | null;
};

export function FormulaireClient({
  action,
  client,
  retour,
}: {
  action: (precedent: EtatFormulaire, donnees: FormData) => Promise<EtatFormulaire>;
  client?: ClientFormulaire;
  retour: string;
}) {
  const [etat, envoyer] = useActionState(action, ETAT_INITIAL);
  const erreur = (champ: string) => etat.erreurs?.[champ];

  return (
    <form action={envoyer} className="grid gap-6">
      <section className="rounded-xl border bg-background p-4 sm:p-5">
        <h2 className="mb-4 text-sm font-semibold">Identité</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Champ
            id="entreprise"
            label="Entreprise"
            obligatoire
            erreur={erreur("entreprise")}
            className="sm:col-span-2"
          >
            <Input
              id="entreprise"
              name="entreprise"
              defaultValue={client?.entreprise ?? ""}
              placeholder="Le Petit Bistrot"
              required
              autoFocus={!client}
            />
          </Champ>

          <Champ id="nomContact" label="Contact" erreur={erreur("nomContact")}>
            <Input
              id="nomContact"
              name="nomContact"
              defaultValue={client?.nomContact ?? ""}
              placeholder="Nathalie Perrin"
            />
          </Champ>

          <Champ id="secteur" label="Secteur" erreur={erreur("secteur")}>
            <Input
              id="secteur"
              name="secteur"
              defaultValue={client?.secteur ?? ""}
              list="secteurs"
              placeholder="Restaurant"
            />
            <datalist id="secteurs">
              {SECTEURS_SUGGERES.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Champ>

          <Champ id="statut" label="Statut" erreur={erreur("statut")}>
            <SelectNatif id="statut" name="statut" defaultValue={client?.statut ?? "PROSPECT"}>
              {optionsDepuis(STATUTS_CLIENT).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectNatif>
          </Champ>

          <Champ id="source" label="Source" erreur={erreur("source")}>
            <SelectNatif id="source" name="source" defaultValue={client?.source ?? ""}>
              <option value="">—</option>
              {OPTIONS_SOURCE.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectNatif>
          </Champ>
        </div>
      </section>

      <section className="rounded-xl border bg-background p-4 sm:p-5">
        <h2 className="mb-4 text-sm font-semibold">Coordonnées</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Champ id="telephone" label="Téléphone" erreur={erreur("telephone")}>
            <Input
              id="telephone"
              name="telephone"
              type="tel"
              inputMode="tel"
              defaultValue={client?.telephone ?? ""}
              placeholder="02 99 31 44 18"
            />
          </Champ>

          <Champ id="email" label="Email" erreur={erreur("email")}>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={client?.email ?? ""}
              placeholder="contact@exemple.fr"
            />
          </Champ>

          <Champ
            id="adresse"
            label="Adresse"
            erreur={erreur("adresse")}
            className="sm:col-span-2"
          >
            <Input
              id="adresse"
              name="adresse"
              defaultValue={client?.adresse ?? ""}
              placeholder="12 rue Saint-Georges"
            />
          </Champ>

          <Champ id="ville" label="Ville" erreur={erreur("ville")}>
            <Input id="ville" name="ville" defaultValue={client?.ville ?? ""} placeholder="Rennes" />
          </Champ>

          <Champ id="siteWebActuel" label="Site web actuel" erreur={erreur("siteWebActuel")}>
            <Input
              id="siteWebActuel"
              name="siteWebActuel"
              defaultValue={client?.siteWebActuel ?? ""}
              placeholder="https://…"
            />
          </Champ>
        </div>
      </section>

      <section className="rounded-xl border bg-background p-4 sm:p-5">
        <Champ
          id="notes"
          label="Bloc-notes"
          indication="Les informations permanentes (horaires, préférences, code d'accès…). Les échanges datés se notent dans le journal de la fiche."
          erreur={erreur("notes")}
        >
          <Textarea
            id="notes"
            name="notes"
            rows={4}
            defaultValue={client?.notes ?? ""}
            placeholder="Ferme le dimanche et le lundi. Appeler avant 11 h."
          />
        </Champ>
      </section>

      {etat.erreurs?._ && (
        <p role="alert" className="text-sm text-destructive">
          {etat.erreurs._}
        </p>
      )}

      <div className="flex items-center gap-2">
        <BoutonSoumettre size="lg">
          {client ? "Enregistrer les modifications" : "Créer le client"}
        </BoutonSoumettre>
        <Button variant="ghost" size="lg" render={<Link href={retour} />}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
