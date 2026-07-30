import Link from "next/link";

import { EnTetePage } from "@/components/commun/en-tete-page";
import { SectionFiche } from "@/components/commun/section-fiche";
import { TuileStat } from "@/components/commun/tuile-stat";
import { FormulaireMouvement } from "@/components/finances/formulaire-mouvement";
import { ListeMouvements } from "@/components/finances/liste-mouvements";
import { GraphiqueCA } from "@/components/graphiques/graphique-ca";
import { maintenant } from "@/lib/dates";
import { formatEuros } from "@/lib/format";
import {
  anneesDisponibles,
  listerMouvements,
  mouvementsAnnee,
  soldeEntreprise,
} from "@/lib/requetes/finances";
import { utilisateurRequis } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata = { title: "Chiffre d'affaires" };

export default async function PageFinances({
  searchParams,
}: {
  searchParams: Promise<{ annee?: string }>;
}) {
  await utilisateurRequis();
  const params = await searchParams;

  const annees = await anneesDisponibles();
  const demandee = Number(params.annee);
  const annee = annees.includes(demandee)
    ? demandee
    : (annees[0] ?? maintenant().getUTCFullYear());

  const [mensuel, mouvements, solde] = await Promise.all([
    mouvementsAnnee(annee),
    listerMouvements(annee),
    soldeEntreprise(),
  ]);

  const caCents = mensuel.reduce((somme, m) => somme + m.entreesCents, 0);
  const depensesCents = mensuel.reduce((somme, m) => somme + m.sortiesCents, 0);

  return (
    <>
      <EnTetePage
        titre="Chiffre d'affaires"
        description="Notez ce qui rentre et ce qui sort : le CA et l'argent de l'entreprise se calculent tout seuls."
      >
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

      <div className="grid gap-3 sm:grid-cols-3">
        <TuileStat
          libelle="Argent de l'entreprise"
          valeur={formatEuros(solde)}
          accent={solde < 0 ? "alerte" : "neutre"}
          precision="solde de tous les mouvements"
        />
        <TuileStat
          libelle={`CA encaissé ${annee}`}
          valeur={formatEuros(caCents)}
          precision="total des encaissements de l'année"
        />
        <TuileStat
          libelle={`Dépenses ${annee}`}
          valeur={formatEuros(depensesCents)}
          precision="total des sorties de l'année"
        />
      </div>

      <div className="mt-4">
        <SectionFiche titre="Noter un mouvement">
          <FormulaireMouvement />
        </SectionFiche>
      </div>

      <div className="mt-4">
        <SectionFiche titre={`Mois par mois — ${annee}`}>
          <GraphiqueCA donnees={mensuel} hauteur={280} />
        </SectionFiche>
      </div>

      <div className="mt-4">
        <SectionFiche titre={`Historique ${annee}`} compte={mouvements.length}>
          <ListeMouvements mouvements={mouvements} />
        </SectionFiche>
      </div>
    </>
  );
}
