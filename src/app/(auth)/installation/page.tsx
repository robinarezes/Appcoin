import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { baseVierge } from "@/lib/requetes/equipe";

import { FormulaireInstallation } from "./formulaire-installation";

export const metadata: Metadata = { title: "Installation" };

// Même raison que pour /login : l'existence d'un compte se vérifie à chaque
// visite, jamais au build.
export const dynamic = "force-dynamic";

/**
 * Page de premier lancement. Elle n'existe que tant que la base ne contient
 * aucun compte : une fois le premier créé, elle renvoie à la connexion et les
 * comptes suivants s'ajoutent depuis l'écran Équipe.
 */
export default async function PageInstallation() {
  if (!(await baseVierge())) redirect("/login");

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
            A
          </span>
          <div className="leading-tight">
            <p className="font-semibold tracking-tight">Atelier</p>
            <p className="text-xs text-muted-foreground">Gestion interne</p>
          </div>
        </div>

        <div className="rounded-xl border bg-background p-6 shadow-sm">
          <h1 className="text-lg font-semibold tracking-tight">Bienvenue</h1>
          <p className="mt-1 mb-5 text-sm text-muted-foreground">
            L&apos;application est installée mais ne contient encore aucun compte.
            Créez le vôtre : vous pourrez ensuite ajouter votre associé depuis
            l&apos;écran Équipe.
          </p>

          <FormulaireInstallation />
        </div>

        <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
          Cette page disparaît définitivement une fois le premier compte créé.
        </p>
      </div>
    </main>
  );
}
