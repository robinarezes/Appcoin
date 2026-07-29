"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { PlusIcon, Trash2Icon } from "lucide-react";

import { BoutonSoumettre } from "@/components/commun/bouton-soumettre";
import { Champ } from "@/components/commun/champ";
import { SelectNatif } from "@/components/commun/select-natif";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { STATUTS_OFFRE, TVA_PAR_DEFAUT, optionsDepuis } from "@/lib/constantes";
import { appliquerTVA, centsDepuisSaisie, centsVersInput, formatEuros } from "@/lib/format";
import { ETAT_INITIAL, type EtatFormulaire } from "@/lib/validations";

const TAUX_TVA = [
  { value: 2000, label: "20 % (taux normal)" },
  { value: 1000, label: "10 % (taux intermédiaire)" },
  { value: 550, label: "5,5 % (taux réduit)" },
  { value: 0, label: "0 % (non assujetti)" },
];

type LigneSaisie = { cle: string; libelle: string; quantite: string; prix: string };

const ligneVide = (): LigneSaisie => ({
  cle: Math.random().toString(36).slice(2),
  libelle: "",
  quantite: "1",
  prix: "",
});

export type OffreFormulaire = {
  id: string;
  clientId: string;
  titre: string;
  description: string | null;
  tauxTVA: number;
  statut: string;
  lignes: { libelle: string; quantite: number; prixUnitaireHTCents: number }[];
};

export function FormulaireOffre({
  action,
  offre,
  clients,
  clientParDefaut,
  retour,
}: {
  action: (precedent: EtatFormulaire, donnees: FormData) => Promise<EtatFormulaire>;
  offre?: OffreFormulaire;
  clients: { id: string; entreprise: string }[];
  clientParDefaut?: string;
  retour: string;
}) {
  const [etat, envoyer] = useActionState(action, ETAT_INITIAL);
  const erreur = (champ: string) => etat.erreurs?.[champ];

  const [lignes, setLignes] = useState<LigneSaisie[]>(
    offre && offre.lignes.length > 0
      ? offre.lignes.map((l) => ({
          cle: Math.random().toString(36).slice(2),
          libelle: l.libelle,
          quantite: String(l.quantite),
          prix: centsVersInput(l.prixUnitaireHTCents),
        }))
      : [ligneVide()],
  );
  const [tauxTVA, setTauxTVA] = useState(offre?.tauxTVA ?? TVA_PAR_DEFAUT);

  const majLigne = (cle: string, champ: keyof LigneSaisie, valeur: string) =>
    setLignes((precedentes) =>
      precedentes.map((l) => (l.cle === cle ? { ...l, [champ]: valeur } : l)),
    );

  // Totaux recalculés à la frappe, avec la même arithmétique en centimes que
  // côté serveur : ce qui est affiché est exactement ce qui sera enregistré.
  const montantHTCents = lignes.reduce((somme, l) => {
    const prix = centsDepuisSaisie(l.prix) ?? 0;
    const quantite = Number(l.quantite) || 0;
    return somme + prix * quantite;
  }, 0);
  const montantTTCCents = appliquerTVA(montantHTCents, tauxTVA);
  const tvaCents = montantTTCCents - montantHTCents;

  return (
    <form action={envoyer} className="grid gap-6">
      <section className="rounded-xl border bg-background p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Champ id="clientId" label="Client" obligatoire erreur={erreur("clientId")}>
            <SelectNatif
              id="clientId"
              name="clientId"
              defaultValue={offre?.clientId ?? clientParDefaut ?? ""}
              required
            >
              <option value="">Choisir un client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.entreprise}
                </option>
              ))}
            </SelectNatif>
          </Champ>

          <Champ id="statut" label="Statut" erreur={erreur("statut")}>
            <SelectNatif id="statut" name="statut" defaultValue={offre?.statut ?? "BROUILLON"}>
              {optionsDepuis(STATUTS_OFFRE).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectNatif>
          </Champ>

          <Champ
            id="titre"
            label="Titre de l'offre"
            obligatoire
            erreur={erreur("titre")}
            className="sm:col-span-2"
          >
            <Input
              id="titre"
              name="titre"
              defaultValue={offre?.titre ?? ""}
              placeholder="Site vitrine + réservation en ligne"
              required
              autoFocus
            />
          </Champ>

          <Champ
            id="description"
            label="Description"
            erreur={erreur("description")}
            className="sm:col-span-2"
          >
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={offre?.description ?? ""}
              placeholder="Ce que comprend la prestation, les délais, ce qui reste à la charge du client…"
            />
          </Champ>
        </div>
      </section>

      <section className="rounded-xl border bg-background p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-semibold">Lignes</h2>

        <div className="grid gap-2">
          <div className="hidden gap-2 px-1 text-xs text-muted-foreground sm:grid sm:grid-cols-[1fr_5rem_8rem_7rem_2rem]">
            <span>Libellé</span>
            <span>Quantité</span>
            <span>Prix unitaire HT</span>
            <span className="text-right">Total HT</span>
            <span />
          </div>

          {lignes.map((ligne) => {
            const totalLigne =
              (centsDepuisSaisie(ligne.prix) ?? 0) * (Number(ligne.quantite) || 0);

            return (
              <div
                key={ligne.cle}
                className="grid gap-2 rounded-lg border p-2 sm:grid-cols-[1fr_5rem_8rem_7rem_2rem] sm:items-center sm:border-0 sm:p-0"
              >
                <Input
                  name="ligneLibelle"
                  value={ligne.libelle}
                  onChange={(e) => majLigne(ligne.cle, "libelle", e.target.value)}
                  placeholder="Conception et intégration du site"
                  aria-label="Libellé de la ligne"
                />
                <Input
                  name="ligneQuantite"
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  value={ligne.quantite}
                  onChange={(e) => majLigne(ligne.cle, "quantite", e.target.value)}
                  aria-label="Quantité"
                />
                <Input
                  name="lignePrix"
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={ligne.prix}
                  onChange={(e) => majLigne(ligne.cle, "prix", e.target.value)}
                  placeholder="0.00"
                  aria-label="Prix unitaire hors taxes"
                />
                <span className="text-right text-sm tabular-nums text-muted-foreground">
                  {formatEuros(totalLigne)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Supprimer la ligne"
                  disabled={lignes.length === 1}
                  onClick={() => setLignes((p) => p.filter((l) => l.cle !== ligne.cle))}
                >
                  <Trash2Icon />
                </Button>
              </div>
            );
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => setLignes((p) => [...p, ligneVide()])}
        >
          <PlusIcon />
          Ajouter une ligne
        </Button>

        {erreur("lignes") && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {erreur("lignes")}
          </p>
        )}

        <div className="mt-5 grid gap-3 border-t pt-4 sm:grid-cols-2">
          <Champ id="tauxTVA" label="Taux de TVA">
            <SelectNatif
              id="tauxTVA"
              name="tauxTVA"
              value={tauxTVA}
              onChange={(e) => setTauxTVA(Number(e.target.value))}
            >
              {TAUX_TVA.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </SelectNatif>
          </Champ>

          <dl className="grid content-end gap-1 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Total HT</dt>
              <dd className="tabular-nums">{formatEuros(montantHTCents)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">TVA</dt>
              <dd className="tabular-nums">{formatEuros(tvaCents)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-t pt-1">
              <dt className="font-medium">Total TTC</dt>
              <dd className="text-base font-semibold tabular-nums">
                {formatEuros(montantTTCCents)}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="flex items-center gap-2">
        <BoutonSoumettre size="lg">
          {offre ? "Enregistrer les modifications" : "Créer l'offre"}
        </BoutonSoumettre>
        <Button variant="ghost" size="lg" render={<Link href={retour} />}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
