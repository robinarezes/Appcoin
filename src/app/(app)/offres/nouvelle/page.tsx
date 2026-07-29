import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { creerOffre } from "@/actions/offres";
import { EnTetePage } from "@/components/commun/en-tete-page";
import { FormulaireOffre } from "@/components/offres/formulaire-offre";
import { optionsClients } from "@/lib/requetes/clients";
import { utilisateurRequis } from "@/lib/session";

export const metadata = { title: "Nouvelle offre" };

export default async function PageNouvelleOffre({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  await utilisateurRequis();
  const params = await searchParams;
  const clients = await optionsClients();

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/offres"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Retour aux offres
      </Link>

      <EnTetePage
        titre="Nouvelle offre"
        description="Le numéro est attribué automatiquement à l'enregistrement."
      />

      <FormulaireOffre
        action={creerOffre}
        clients={clients}
        clientParDefaut={params.client}
        retour="/offres"
      />
    </div>
  );
}
