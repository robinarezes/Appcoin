import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { modifierClient } from "@/actions/clients";
import { FormulaireClient } from "@/components/clients/formulaire-client";
import { EnTetePage } from "@/components/commun/en-tete-page";
import { prisma } from "@/lib/prisma";
import { utilisateurRequis } from "@/lib/session";

export const metadata = { title: "Modifier un client" };

export default async function PageModifierClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await utilisateurRequis();
  const { id } = await params;

  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/clients/${client.id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Retour à la fiche
      </Link>

      <EnTetePage titre={client.entreprise} description="Modification de la fiche" />

      <FormulaireClient
        action={modifierClient.bind(null, client.id)}
        client={client}
        retour={`/clients/${client.id}`}
      />
    </div>
  );
}
