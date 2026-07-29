import Link from "next/link";
import { FileTextIcon, PlusIcon } from "lucide-react";

import { BadgeStatut } from "@/components/commun/badge-statut";
import { EnTetePage } from "@/components/commun/en-tete-page";
import { EtatVide } from "@/components/commun/etat-vide";
import { Button } from "@/components/ui/button";
import { CLES_STATUT_OFFRE, STATUTS_OFFRE, libelle } from "@/lib/constantes";
import { formatDate } from "@/lib/dates";
import { formatEuros } from "@/lib/format";
import { tauxTransformation } from "@/lib/metier";
import { listerOffres } from "@/lib/requetes/offres";
import { utilisateurRequis } from "@/lib/session";
import { formatPourcent } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Offres" };

export default async function PageOffres({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string }>;
}) {
  await utilisateurRequis();
  const params = await searchParams;

  const { offres, total } = await listerOffres({ statut: params.statut });
  const { taux, acceptees, envoyees } = tauxTransformation(offres);
  const montantTotal = offres.reduce((somme, o) => somme + o.montantHTCents, 0);

  return (
    <>
      <EnTetePage
        titre="Offres"
        description={
          total === 0
            ? undefined
            : `${offres.length} offre${offres.length > 1 ? "s" : ""} · ${formatEuros(montantTotal)} HT${
                taux !== null ? ` · ${formatPourcent(taux)} de transformation` : ""
              }`
        }
      >
        <Button render={<Link href="/offres/nouvelle" />}>
          <PlusIcon />
          Nouvelle offre
        </Button>
      </EnTetePage>

      {total > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <FiltreStatut actif={!params.statut} href="/offres">
            Toutes
          </FiltreStatut>
          {CLES_STATUT_OFFRE.map((statut) => (
            <FiltreStatut
              key={statut}
              actif={params.statut === statut}
              href={`/offres?statut=${statut}`}
            >
              {libelle(STATUTS_OFFRE, statut)}
            </FiltreStatut>
          ))}
        </div>
      )}

      {total === 0 ? (
        <EtatVide
          Icone={FileTextIcon}
          titre="Aucune offre pour l'instant"
          description="Créez une offre avec ses lignes : les totaux HT, TVA et TTC se calculent tout seuls."
          action={
            <Button render={<Link href="/offres/nouvelle" />}>
              <PlusIcon />
              Créer la première offre
            </Button>
          }
        />
      ) : offres.length === 0 ? (
        <EtatVide Icone={FileTextIcon} titre="Aucune offre avec ce statut" />
      ) : (
        <>
          <ul className="grid gap-2 md:hidden">
            {offres.map((offre) => (
              <li key={offre.id} className="rounded-xl border bg-background p-3">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/offres/${offre.id}`} className="min-w-0 font-medium hover:underline">
                    {offre.titre}
                  </Link>
                  <BadgeStatut map={STATUTS_OFFRE} valeur={offre.statut} />
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{offre.client.entreprise}</p>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="font-mono text-xs text-muted-foreground">{offre.numero}</span>
                  <span className="tabular-nums">{formatEuros(offre.montantHTCents)} HT</span>
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-hidden rounded-xl border bg-background md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Numéro</th>
                  <th className="px-4 py-2.5 font-medium">Offre</th>
                  <th className="px-4 py-2.5 font-medium">Client</th>
                  <th className="px-4 py-2.5 font-medium">Créée le</th>
                  <th className="px-4 py-2.5 font-medium">Statut</th>
                  <th className="px-4 py-2.5 text-right font-medium">Montant HT</th>
                </tr>
              </thead>
              <tbody>
                {offres.map((offre) => (
                  <tr key={offre.id} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                      {offre.numero}
                    </td>
                    <td className="px-4 py-2.5">
                      <Link href={`/offres/${offre.id}`} className="font-medium hover:underline">
                        {offre.titre}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/clients/${offre.client.id}`}
                        className="text-muted-foreground hover:underline"
                      >
                        {offre.client.entreprise}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-muted-foreground">
                      {formatDate(offre.createdAt)}
                    </td>
                    <td className="px-4 py-2.5">
                      <BadgeStatut map={STATUTS_OFFRE} valeur={offre.statut} />
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {formatEuros(offre.montantHTCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {envoyees > 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              {acceptees} offre{acceptees > 1 ? "s" : ""} acceptée{acceptees > 1 ? "s" : ""} sur{" "}
              {envoyees} envoyée{envoyees > 1 ? "s" : ""}.
            </p>
          )}
        </>
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
