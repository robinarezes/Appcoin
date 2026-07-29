import { cn } from "@/lib/utils";

/** Bloc de contenu d'une fiche : titre, action optionnelle, corps. */
export function SectionFiche({
  titre,
  compte,
  action,
  className,
  children,
}: {
  titre: string;
  compte?: number;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-xl border bg-background", className)}>
      <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
        <h2 className="text-sm font-semibold">
          {titre}
          {compte !== undefined && compte > 0 && (
            <span className="ml-1.5 font-normal text-muted-foreground tabular-nums">
              {compte}
            </span>
          )}
        </h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function LigneVide({ texte }: { texte: string }) {
  return <p className="py-1 text-sm text-muted-foreground">{texte}</p>;
}
