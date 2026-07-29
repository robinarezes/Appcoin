import Link from "next/link";
import { AlertTriangleIcon, ReceiptIcon } from "lucide-react";

import { BadgeStatut } from "@/components/commun/badge-statut";
import { EnTetePage } from "@/components/commun/en-tete-page";
import { EtatVide } from "@/components/commun/etat-vide";
import { ActionsFacture } from "@/components/factures/actions-facture";
import { CLES_STATUT_FACTURE, STATUTS_FACTURE, libelle } from "@/lib/constantes";
import { aujourdHui, differenceEnJours, formatDate } from "@/lib/dates";
import { formatEuros } from "@/lib/format";
import { statutFacture } from "@/lib/metier";
import { listerFactures } from "@/lib/requetes/offres";
import { utilisateurRequis } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata = { title: "Factures" };

export default async function PageFactures({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string }>;
}) {
  await utilisateurRequis();
  const params = await searchParams;

  const { factures, total, impayeesCents, enRetardCents } = await listerFactures({
    statut: params.statut,
  });
  const today = aujourdHui();

  return (
    <>
      <EnTetePage
        titre="Factures"
        description={
          total === 0
            ? undefined
            : `${impayeesCents > 0 ? `${formatEuros(impayeesCents)} en attente de règlement` : "Tout est réglé"}`
        }
      />

      {enRetardCents > 0 && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm dark:border-rose-500/25 dark:bg-rose-500/10">
          <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <p className="text-rose-800 dark:text-rose-200">
            <span className="font-medium">{formatEuros(enRetardCents)}</span> de factures ont
            dépassé leur date d&apos;échéance. Pensez à relancer.
          </p>
        </div>
      )}

      {total > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <FiltreStatut actif={!params.statut} href="/factures">
            Toutes
          </FiltreStatut>
          {CLES_STATUT_FACTURE.map((statut) => (
            <FiltreStatut
              key={statut}
              actif={params.statut === statut}
              href={`/factures?statut=${statut}`}
            >
              {libelle(STATUTS_FACTURE, statut)}
            </FiltreStatut>
          ))}
        </div>
      )}

      {total === 0 ? (
        <EtatVide
          Icone={ReceiptIcon}
          titre="Aucune facture pour l'instant"
          description="Les factures se créent depuis une offre acceptée, avec le bouton « Convertir en facture »."
        />
      ) : factures.length === 0 ? (
        <EtatVide Icone={ReceiptIcon} titre="Aucune facture avec ce statut" />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Numéro</th>
                <th className="px-4 py-2.5 font-medium">Client</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Émise le</th>
                <th className="px-4 py-2.5 font-medium">Échéance</th>
                <th className="px-4 py-2.5 text-right font-medium">Montant TTC</th>
                <th className="px-4 py-2.5 font-medium">Statut</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {factures.map((facture) => {
                const statut = statutFacture(facture);
                const retard = statut === "RETARD";
                const jours = differenceEnJours(facture.dateEcheance, today);

                return (
                  <tr
                    key={facture.id}
                    className={cn(
                      "border-b last:border-0 hover:bg-muted/40",
                      retard && "bg-rose-50/60 dark:bg-rose-500/5",
                    )}
                  >
                    <td className="px-4 py-2.5 font-mono text-xs">
                      {facture.offre ? (
                        <Link href={`/offres/${facture.offre.id}`} className="hover:underline">
                          {facture.numero}
                        </Link>
                      ) : (
                        facture.numero
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/clients/${facture.client.id}`}
                        className="hover:underline"
                      >
                        {facture.client.entreprise}
                      </Link>
                    </td>
                    <td className="hidden px-4 py-2.5 tabular-nums text-muted-foreground sm:table-cell">
                      {formatDate(facture.dateEmission)}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums">
                      <span className={retard ? "font-medium text-rose-700 dark:text-rose-400" : ""}>
                        {formatDate(facture.dateEcheance)}
                      </span>
                      {retard && (
                        <span className="block text-xs text-rose-600 dark:text-rose-400">
                          {jours} jour{jours > 1 ? "s" : ""} de retard
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {formatEuros(facture.montantTTCCents)}
                    </td>
                    <td className="px-4 py-2.5">
                      <BadgeStatut map={STATUTS_FACTURE} valeur={statut} />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <ActionsFacture
                        id={facture.id}
                        payee={facture.datePaiement !== null}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function FiltreStatut({
  href,
  actif,
  children,
}: {
  href: string;
  actif: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-lg border px-2.5 py-1 text-sm font-medium transition-colors",
        actif
          ? "border-foreground/20 bg-foreground text-background"
          : "bg-background text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
