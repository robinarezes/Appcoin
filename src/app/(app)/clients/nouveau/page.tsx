import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { creerClient } from "@/actions/clients";
import { FormulaireClient } from "@/components/clients/formulaire-client";
import { EnTetePage } from "@/components/commun/en-tete-page";
import { utilisateurRequis } from "@/lib/session";

export const metadata = { title: "Nouveau client" };

export default async function PageNouveauClient() {
  await utilisateurRequis();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/clients"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Retour aux clients
      </Link>

      <EnTetePage titre="Nouveau client" />

      <FormulaireClient action={creerClient} retour="/clients" />
    </div>
  );
}
