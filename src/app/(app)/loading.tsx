import { Skeleton } from "@/components/ui/skeleton";

/**
 * Écran de chargement affiché instantanément pendant la navigation entre les
 * pages (Next.js l'utilise comme fallback de Suspense). Il évite l'impression
 * de « page figée » : on voit tout de suite la structure, puis le contenu réel
 * la remplace dès qu'il est prêt.
 */
export default function Chargement() {
  return (
    <div>
      <div className="mb-6 grid gap-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
