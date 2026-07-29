import { classeBadge, libelle } from "@/lib/constantes";
import { cn } from "@/lib/utils";

type Entree = { readonly label: string; readonly classe: string };

/**
 * Badge de statut. On passe le référentiel (STATUTS_CLIENT, STATUTS_OFFRE…)
 * et la valeur brute stockée en base ; les libellés et couleurs viennent de
 * src/lib/constantes.ts.
 */
export function BadgeStatut({
  map,
  valeur,
  className,
}: {
  map: Record<string, Entree>;
  valeur: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-medium",
        classeBadge(map, valeur),
        className,
      )}
    >
      {libelle(map, valeur)}
    </span>
  );
}
