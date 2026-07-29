import Link from "next/link";
import { AlertTriangleIcon } from "lucide-react";

import { BadgeStatut } from "@/components/commun/badge-statut";
import { EnTetePage } from "@/components/commun/en-tete-page";
import { SectionFiche } from "@/components/commun/section-fiche";
import { TuileStat } from "@/components/commun/tuile-stat";
import { BarresRepartition } from "@/components/graphiques/barres-repartition";
import { GraphiqueCA } from "@/components/graphiques/graphique-ca";
import { STATUTS_FACTURE } from "@/lib/constantes";
import { aujourdHui, differenceEnJours, formatDate, maintenant } from "@/lib/dates";
import { formatEuros, formatPourcent } from "@/lib/format";
import {
  anneesDisponibles,
  caAnnee,
  facturesImpayees,
  repartitionAnnee,
  transformationAnnee,
} from "@/lib/requetes/ca";
import { utilisateurRequis } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata = { title: "Chiffre d'affaires" };

export default async function PageChiffreAffaires({
  searchParams,
}: {
  searchParams: Promise<{ annee?: string }>;
}) {
  await utilisateurRequis();
  const params = await searchParams;

  const annees = await anneesDisponibles();
  const demandee = Number(params.annee);
  const annee = annees.includes(demandee) ? demandee : (annees[0] ?? maintenant().getUTCFullYear());

  const [mensuel, repartition, transformation, impayees] = await Promise.all([
    caAnnee(annee),
    repartitionAnnee(annee),
    transformationAnnee(annee),
    facturesImpayees(),
  ]);

  const factureCents = mensuel.reduce((somme, m) => somme + m.factureCents, 0);
  const encaisseCents = mensuel.reduce((somme, m) => somme + m.encaisseCents, 0);
  const impayeesCents = impayees.reduce((somme, f) => somme + f.montantTTCCents, 0);
  const today = aujourdHui();

  return (
    <>
      <EnTetePage titre="Chiffre d'affaires" description={`Année ${annee}`}>
        <div className="flex flex-wrap gap-1.5">
          {annees.map((a) => (
            <Link
              key={a}
              href={`/ca?annee=${a}`}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-sm font-medium tabular-nums transition-colors",
                a === annee
                  ? "border-foreground/20 bg-foreground text-background"
                  : "bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {a}
            </Link>
          ))}
        </div>
      </EnTetePage>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <TuileStat
          libelle={`CA facturé ${annee}`}
          valeur={formatEuros(factureCents)}
          precision="hors taxes"
        />
        <TuileStat
          libelle={`CA encaissé ${annee}`}
          valeur={formatEuros(encaisseCents)}
          precision={
            factureCents > 0
              ? `${formatPourcent(encaisseCents / factureCents)} du facturé`
              : undefined
          }
        />
        <TuileStat
          libelle="Taux de transformation"
          valeur={transformation.taux === null ? "—" : formatPourcent(transformation.taux)}
          precision={`${transformation.acceptees} acceptée${
            transformation.acceptees > 1 ? "s" : ""
          } sur ${transformation.envoyees} envoyée${transformation.envoyees > 1 ? "s" : ""}`}
        />
        <TuileStat
          href="/factures"
          libelle="Reste à encaisser"
          valeur={formatEuros(impayeesCents)}
          accent={impayees.some((f) => f.statutCalcule === "RETARD") ? "alerte" : "neutre"}
          precision={`${impayees.length} facture${impayees.length > 1 ? "s" : ""} ouverte${
            impayees.length > 1 ? "s" : ""
          }`}
        />
      </div>

      <div className="mt-4">
        <SectionFiche titre={`Facturé et encaissé mois par mois — ${annee}`}>
          <GraphiqueCA donnees={mensuel} hauteur={300} />
          <p className="mt-3 text-xs text-muted-foreground">
            « Facturé » compte les factures à leur date d&apos;émission, « encaissé » à leur
            date de paiement : l&apos;écart entre les deux, c&apos;est la trésorerie qui
            arrive en retard.
          </p>
        </SectionFiche>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <SectionFiche titre="Top 5 clients">
          <BarresRepartition
            lignes={repartition.topClients.map((c) => ({
              cle: c.id,
              libelle: c.nom,
              montantCents: c.montantCents,
              href: `/clients/${c.id}`,
            }))}
            vide={`Aucune facture émise en ${annee}.`}
          />
        </SectionFiche>

        <SectionFiche titre="Par secteur d'activité">
          <BarresRepartition
            lignes={repartition.secteurs.map((s) => ({
              cle: s.nom,
              libelle: s.nom,
              montantCents: s.montantCents,
            }))}
            vide={`Aucune facture émise en ${annee}.`}
          />
        </SectionFiche>
      </div>

      <div className="mt-4">
        <SectionFiche titre="Factures à encaisser" compte={impayees.length} corpsClassName="p-0">
          {impayees.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              Toutes les factures sont réglées.
            </p>
          ) : (
            /* Le tableau défile dans son propre cadre : la page, elle, ne
               défile jamais horizontalement, même sur un écran de téléphone. */
            <div className="overflow-x-auto">
            <table className="w-full min-w-[38rem] text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Numéro</th>
                  <th className="px-4 py-2.5 font-medium">Client</th>
                  <th className="px-4 py-2.5 font-medium">Échéance</th>
                  <th className="px-4 py-2.5 text-right font-medium">Montant TTC</th>
                  <th className="px-4 py-2.5 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {impayees.map((facture) => {
                  const retard = facture.statutCalcule === "RETARD";
                  const jours = differenceEnJours(facture.dateEcheance, today);

                  return (
                    <tr
                      key={facture.id}
                      className={cn(
                        "border-b last:border-0",
                        retard && "bg-rose-50/60 dark:bg-rose-500/5",
                      )}
                    >
                      <td className="px-4 py-2.5 font-mono text-xs">{facture.numero}</td>
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/clients/${facture.client.id}`}
                          className="hover:underline"
                        >
                          {facture.client.entreprise}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 tabular-nums">
                        <span className={retard ? "text-rose-700 dark:text-rose-400" : ""}>
                          {formatDate(facture.dateEcheance)}
                        </span>
                        {retard && (
                          <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                            <AlertTriangleIcon className="size-3" />
                            {jours} j de retard
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        {formatEuros(facture.montantTTCCents)}
                      </td>
                      <td className="px-4 py-2.5">
                        <BadgeStatut map={STATUTS_FACTURE} valeur={facture.statutCalcule} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          )}
        </SectionFiche>
      </div>
    </>
  );
}
