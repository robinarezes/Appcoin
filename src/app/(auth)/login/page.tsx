import type { Metadata } from "next";

import { FormulaireConnexion } from "./formulaire-connexion";

export const metadata: Metadata = { title: "Connexion" };

export default async function PageConnexion({
  searchParams,
}: {
  searchParams: Promise<{ suite?: string }>;
}) {
  const { suite } = await searchParams;

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
          <h1 className="text-lg font-semibold tracking-tight">Connexion</h1>
          <p className="mt-1 mb-5 text-sm text-muted-foreground">
            Accès réservé à l&apos;équipe de l&apos;agence.
          </p>

          <FormulaireConnexion suite={suite} />
        </div>

        {process.env.NODE_ENV !== "production" && (
          <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
            Comptes de démonstration&nbsp;:{" "}
            <span className="font-mono">robin@agence.fr</span> ou{" "}
            <span className="font-mono">camille@agence.fr</span>
            <br />
            mot de passe <span className="font-mono">demo1234</span>
          </p>
        )}
      </div>
    </main>
  );
}
