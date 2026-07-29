import Link from "next/link";
import { PhoneOffIcon } from "lucide-react";

import { EnTetePage } from "@/components/commun/en-tete-page";
import { EtatVide } from "@/components/commun/etat-vide";
import { AjoutFiche } from "@/components/prospection/ajout-fiche";
import { CarteProspect } from "@/components/prospection/carte-prospect";
import { bilanDuJour, listerProspection, type FiltreProspection } from "@/lib/requetes/prospection";
import { utilisateurRequis } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata = { title: "Prospection" };

const FILTRES: { cle: FiltreProspection; label: string }[] = [
  { cle: "a_appeler", label: "À appeler" },
  { cle: "rappels", label: "Rappels du jour" },
  { cle: "tous", label: "Toutes les fiches" },
];

export default async function PageProspection({
  searchParams,
}: {
  searchParams: Promise<{ filtre?: string; q?: string }>;
}) {
  const utilisateur = await utilisateurRequis();
  const params = await searchParams;

  const filtre = (FILTRES.find((f) => f.cle === params.filtre)?.cle ??
    "a_appeler") as FiltreProspection;

  const [{ fiches, compteurs }, bilan] = await Promise.all([
    listerProspection(filtre, params.q),
    bilanDuJour(utilisateur.id),
  ]);

  return (
    <>
      <EnTetePage
        titre="Prospection téléphonique"
        description="Ajoutez une boutique et son numéro, appelez, notez le résultat. Chaque fiche devient un prospect dans les clients."
      />

      {bilan.total > 0 && (
        <div className="mb-4 flex flex-wrap gap-x-6 gap-y-1 rounded-xl border bg-background px-4 py-3 text-sm">
          <span>
            <span className="font-semibold tabular-nums">{bilan.total}</span>{" "}
            <span className="text-muted-foreground">
              appel{bilan.total > 1 ? "s" : ""} aujourd&apos;hui
            </span>
            {bilan.miens !== bilan.total && (
              <span className="text-muted-foreground"> (dont {bilan.miens} par vous)</span>
            )}
          </span>
          <span>
            <span className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
              {bilan.rdvPris}
            </span>{" "}
            <span className="text-muted-foreground">
              rendez-vous pris
            </span>
          </span>
          <span>
            <span className="font-semibold tabular-nums">{bilan.interesses}</span>{" "}
            <span className="text-muted-foreground">intéressés à relancer</span>
          </span>
        </div>
      )}

      <AjoutFiche />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTRES.map((f) => (
          <Link
            key={f.cle}
            href={f.cle === "a_appeler" ? "/prospection" : `/prospection?filtre=${f.cle}`}
            className={cn(
              "rounded-lg border px-2.5 py-1 text-sm font-medium transition-colors",
              filtre === f.cle
                ? "border-foreground/20 bg-foreground text-background"
                : "bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
            <span className="ml-1.5 tabular-nums opacity-70">
              {f.cle === "a_appeler"
                ? compteurs.aAppeler
                : f.cle === "rappels"
                  ? compteurs.rappels
                  : compteurs.tous}
            </span>
          </Link>
        ))}
      </div>

      {fiches.length === 0 ? (
        <EtatVide
          Icone={PhoneOffIcon}
          titre={
            filtre === "a_appeler"
              ? "Personne à appeler pour l'instant"
              : "Aucune fiche dans cette liste"
          }
          description={
            filtre === "a_appeler"
              ? "Ajoutez une boutique avec son numéro ci-dessus pour commencer une session d'appels."
              : "Les rappels apparaissent ici le jour prévu."
          }
        />
      ) : (
        <ul className="grid gap-2">
          {fiches.map((fiche) => (
            <CarteProspect key={fiche.id} fiche={fiche} />
          ))}
        </ul>
      )}
    </>
  );
}
