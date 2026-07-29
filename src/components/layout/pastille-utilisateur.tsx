import { initiales } from "@/lib/format";
import type { UtilisateurConnecte } from "@/lib/session";
import { cn } from "@/lib/utils";

/**
 * Pastille colorée aux initiales. La couleur vient du profil : c'est le même
 * repère visuel que dans le calendrier, pour savoir d'un coup d'œil qui fait quoi.
 */
export function PastilleUtilisateur({
  utilisateur,
  className,
}: {
  utilisateur: Pick<UtilisateurConnecte, "nom" | "couleur">;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      style={{ backgroundColor: utilisateur.couleur }}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
        className,
      )}
    >
      {initiales(utilisateur.nom)}
    </span>
  );
}
