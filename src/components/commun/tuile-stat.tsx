import Link from "next/link";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";

import { formatPourcent } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Tuile de chiffre : une valeur lisible de loin, un libellé, et au besoin une
 * précision. La variation porte une flèche en plus de la couleur — la couleur
 * seule ne doit jamais porter le sens.
 */
export function TuileStat({
  valeur,
  libelle,
  precision,
  variation,
  href,
  accent,
}: {
  valeur: string;
  libelle: string;
  precision?: string;
  /** Écart relatif vs période précédente ; null si non calculable. */
  variation?: number | null;
  href?: string;
  accent?: "neutre" | "alerte";
}) {
  const contenu = (
    <>
      <p className="text-sm text-muted-foreground">{libelle}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold tracking-tight",
          accent === "alerte" && "text-rose-700 dark:text-rose-400",
        )}
      >
        {valeur}
      </p>

      <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs">
        {variation !== undefined && variation !== null && (
          <span
            className={cn(
              "inline-flex items-center gap-1 font-medium",
              variation >= 0
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-rose-700 dark:text-rose-400",
            )}
          >
            {variation >= 0 ? (
              <TrendingUpIcon className="size-3.5" />
            ) : (
              <TrendingDownIcon className="size-3.5" />
            )}
            {formatPourcent(Math.abs(variation))}
          </span>
        )}
        {precision && <span className="text-muted-foreground">{precision}</span>}
      </div>
    </>
  );

  const classes =
    "rounded-xl border bg-background p-4 transition-colors" +
    (href ? " hover:border-foreground/20 hover:bg-accent/40" : "");

  return href ? (
    <Link href={href} className={classes}>
      {contenu}
    </Link>
  ) : (
    <div className={classes}>{contenu}</div>
  );
}
