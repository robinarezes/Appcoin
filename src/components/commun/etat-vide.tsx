import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * État vide explicite : on dit ce qui manque et on propose l'action qui
 * remplit l'écran, plutôt qu'un simple « aucun résultat ».
 */
export function EtatVide({
  Icone,
  titre,
  description,
  action,
  className,
}: {
  Icone?: LucideIcon;
  titre: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed bg-background px-6 py-14 text-center",
        className,
      )}
    >
      {Icone && (
        <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icone className="size-5" />
        </span>
      )}
      <p className="text-sm font-medium">{titre}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
