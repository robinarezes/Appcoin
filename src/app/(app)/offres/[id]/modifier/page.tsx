import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { modifierOffre } from "@/actions/offres";
import { EnTetePage } from "@/components/commun/en-tete-page";
import { FormulaireOffre } from "@/components/offres/formulaire-offre";
import { optionsClients } from "@/lib/requetes/clients";
import { ficheOffre } from "@/lib/requetes/offres";
import { utilisateurRequis } from "@/lib/session";

export const metadata = { title: "Modifier une offre" };

export default async function PageModifierOffre({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await utilisateurRequis();
  const { id } = await params;

  const [offre, clients] = await Promise.all([ficheOffre(id), optionsClients()]);
  if (!offre) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={`/offres/${offre.id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Retour à l&apos;offre
      </Link>

      <EnTetePage titre={offre.titre} description={`Modification de ${offre.numero}`} />

      <FormulaireOffre
        action={modifierOffre.bind(null, offre.id)}
        clients={clients}
        retour={`/offres/${offre.id}`}
        offre={{
          id: offre.id,
          clientId: offre.clientId,
          titre: offre.titre,
          description: offre.description,
          tauxTVA: offre.tauxTVA,
          statut: offre.statut,
          lignes: offre.lignes,
        }}
      />
    </div>
  );
}
