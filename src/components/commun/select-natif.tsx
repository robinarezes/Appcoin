import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Liste déroulante native, habillée aux couleurs de l'interface.
 *
 * On préfère le <select> du navigateur au composant Select de la librairie :
 * il s'envoie tout seul avec le formulaire (Server Actions), ouvre le sélecteur
 * natif du téléphone — indispensable en rendez-vous client — et ne coûte
 * aucun JavaScript.
 */
export function SelectNatif({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-8 w-full min-w-0 appearance-none rounded-lg border border-input bg-transparent py-1 pr-8 pl-2.5 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm dark:bg-input/30",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
