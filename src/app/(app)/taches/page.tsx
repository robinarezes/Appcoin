import { Suspense } from "react";

import { EnTetePage } from "@/components/commun/en-tete-page";
import { FiltresTaches } from "@/components/taches/filtres-taches";
import { Kanban } from "@/components/taches/kanban";
import { optionsClients } from "@/lib/requetes/clients";
import { equipe, listerTaches } from "@/lib/requetes/taches";
import { utilisateurRequis } from "@/lib/session";

export const metadata = { title: "Tâches" };

export default async function PageTaches({
  searchParams,
}: {
  searchParams: Promise<{
    mien?: string;
    client?: string;
    priorite?: string;
    retard?: string;
  }>;
}) {
  const utilisateur = await utilisateurRequis();
  const params = await searchParams;

  const [{ colonnes, total }, clients, membres] = await Promise.all([
    listerTaches({
      assigneeId: params.mien === "1" ? utilisateur.id : undefined,
      clientId: params.client || undefined,
      priorite: params.priorite || undefined,
      enRetard: params.retard === "1",
    }),
    optionsClients(),
    equipe(),
  ]);

  return (
    <>
      <EnTetePage
        titre="Tâches"
        description={
          total === 0
            ? "Écrivez une tâche dans une colonne et validez avec Entrée."
            : `${total} tâche${total > 1 ? "s" : ""} affichée${total > 1 ? "s" : ""}`
        }
      />

      <Suspense fallback={<div className="mb-4 h-8" />}>
        <FiltresTaches clients={clients} />
      </Suspense>

      <Kanban
        colonnesInitiales={colonnes}
        clients={clients}
        membres={membres}
        utilisateurId={utilisateur.id}
        clientParDefaut={params.client || undefined}
      />
    </>
  );
}
