import Link from "next/link";

import { formatEuros, formatPourcent } from "@/lib/format";

export type LigneRepartition = {
  cle: string;
  libelle: string;
  montantCents: number;
  href?: string;
};

/**
 * Répartition en barres horizontales, en HTML plutôt qu'avec la librairie de
 * graphiques : sur cinq à dix lignes nommées, le libellé compte plus que la
 * forme, et un graphique en camembert rendrait la comparaison plus difficile.
 */
export function BarresRepartition({
  lignes,
  vide = "Aucune donnée sur la période.",
}: {
  lignes: LigneRepartition[];
  vide?: string;
}) {
  if (lignes.length === 0) {
    return <p className="py-2 text-sm text-muted-foreground">{vide}</p>;
  }

  const total = lignes.reduce((somme, l) => somme + l.montantCents, 0);
  const maximum = Math.max(...lignes.map((l) => l.montantCents), 1);

  return (
    <ul className="grid gap-2.5">
      {lignes.map((ligne) => (
        <li key={ligne.cle}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">
              {ligne.href ? (
                <Link href={ligne.href} className="hover:underline">
                  {ligne.libelle}
                </Link>
              ) : (
                ligne.libelle
              )}
            </span>
            <span className="shrink-0 tabular-nums">
              {formatEuros(ligne.montantCents)}
              {total > 0 && (
                <span className="ml-1.5 text-xs text-muted-foreground">
                  {formatPourcent(ligne.montantCents / total)}
                </span>
              )}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max((ligne.montantCents / maximum) * 100, 2)}%`,
                backgroundColor: "var(--viz-1)",
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
