import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, PencilIcon, ReceiptIcon } from "lucide-react";

import { supprimerOffre } from "@/actions/offres";
import { BadgeStatut } from "@/components/commun/badge-statut";
import { ConfirmationSuppression } from "@/components/commun/confirmation-suppression";
import { SectionFiche } from "@/components/commun/section-fiche";
import { ActionsOffre } from "@/components/offres/actions-offre";
import { Button } from "@/components/ui/button";
import { STATUTS_OFFRE } from "@/lib/constantes";
import { formatDate } from "@/lib/dates";
import { formatEuros, formatTauxTVA } from "@/lib/format";
import { ficheOffre } from "@/lib/requetes/offres";
import { utilisateurRequis } from "@/lib/session";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offre = await ficheOffre(id);
  return { title: offre ? `${offre.numero} — ${offre.titre}` : "Offre" };
}

export default async function PageFicheOffre({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await utilisateurRequis();
  const { id } = await params;

  const offre = await ficheOffre(id);
  if (!offre) notFound();

  const tvaCents = offre.montantTTCCents - offre.montantHTCents;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/offres"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Retour aux offres
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs text-muted-foreground">{offre.numero}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{offre.titre}</h1>
            <BadgeStatut map={STATUTS_OFFRE} valeur={offre.statut} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            <Link href={`/clients/${offre.client.id}`} className="hover:underline">
              {offre.client.entreprise}
            </Link>
            {offre.client.nomContact ? ` · ${offre.client.nomContact}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" render={<Link href={`/offres/${offre.id}/modifier`} />}>
            <PencilIcon />
            Modifier
          </Button>
          <ConfirmationSuppression
            action={supprimerOffre.bind(null, offre.id)}
            titre="Supprimer cette offre ?"
            description={`${offre.numero} et ses lignes seront définitivement supprimés.`}
            iconeSeule
          />
        </div>
      </div>

      <div className="mb-4 rounded-xl border bg-background p-4">
        <ActionsOffre
          id={offre.id}
          statut={offre.statut}
          dejaFacturee={offre.factures.length > 0}
        />
      </div>

      <div className="grid gap-4">
        <SectionFiche titre="Détail de la prestation">
          {offre.description && (
            <p className="mb-4 text-sm whitespace-pre-wrap text-muted-foreground">
              {offre.description}
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 font-medium">Libellé</th>
                  <th className="py-2 text-right font-medium">Qté</th>
                  <th className="py-2 text-right font-medium">P.U. HT</th>
                  <th className="py-2 text-right font-medium">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {offre.lignes.map((ligne) => (
                  <tr key={ligne.id} className="border-b last:border-0">
                    <td className="py-2 pr-3">{ligne.libelle}</td>
                    <td className="py-2 text-right tabular-nums">{ligne.quantite}</td>
                    <td className="py-2 text-right tabular-nums">
                      {formatEuros(ligne.prixUnitaireHTCents)}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {formatEuros(ligne.prixUnitaireHTCents * ligne.quantite)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <dl className="mt-4 ml-auto grid max-w-xs gap-1 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Total HT</dt>
              <dd className="tabular-nums">{formatEuros(offre.montantHTCents)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">
                TVA {formatTauxTVA(offre.tauxTVA)}
              </dt>
              <dd className="tabular-nums">{formatEuros(tvaCents)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-t pt-1">
              <dt className="font-medium">Total TTC</dt>
              <dd className="text-base font-semibold tabular-nums">
                {formatEuros(offre.montantTTCCents)}
              </dd>
            </div>
          </dl>
        </SectionFiche>

        <SectionFiche titre="Suivi">
          <dl className="grid gap-2.5 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Créée le</dt>
              <dd className="tabular-nums">{formatDate(offre.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Envoyée le</dt>
              <dd className="tabular-nums">
                {offre.dateEnvoi ? formatDate(offre.dateEnvoi) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Réponse le</dt>
              <dd className="tabular-nums">
                {offre.dateReponse ? formatDate(offre.dateReponse) : "—"}
              </dd>
            </div>
          </dl>

          {offre.factures.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <p className="mb-2 text-xs text-muted-foreground">Facture générée</p>
              <ul className="grid gap-1.5">
                {offre.factures.map((facture) => (
                  <li key={facture.id} className="flex items-center gap-2 text-sm">
                    <ReceiptIcon className="size-3.5 text-muted-foreground" />
                    <Link href="/factures" className="font-mono hover:underline">
                      {facture.numero}
                    </Link>
                    <span className="text-muted-foreground">
                      {facture.datePaiement
                        ? `payée le ${formatDate(facture.datePaiement)}`
                        : `échéance le ${formatDate(facture.dateEcheance)}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </SectionFiche>
      </div>
    </div>
  );
}
