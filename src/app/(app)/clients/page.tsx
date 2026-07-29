import { Suspense } from "react";
import Link from "next/link";
import { PlusIcon, UsersIcon } from "lucide-react";

import { EnTetePage } from "@/components/commun/en-tete-page";
import { EtatVide } from "@/components/commun/etat-vide";
import { FiltresClients } from "@/components/clients/filtres-clients";
import { ListeClients } from "@/components/clients/liste-clients";
import { Button } from "@/components/ui/button";
import { listerClients, type TriClients } from "@/lib/requetes/clients";
import { utilisateurRequis } from "@/lib/session";

export const metadata = { title: "Clients" };

export default async function PageClients({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; statut?: string; ville?: string; tri?: string }>;
}) {
  await utilisateurRequis();
  const params = await searchParams;

  const { clients, total, villes } = await listerClients({
    recherche: params.q,
    statut: params.statut,
    ville: params.ville,
    tri: params.tri as TriClients | undefined,
  });

  const filtre = Boolean(params.q || params.statut || params.ville);

  return (
    <>
      <EnTetePage
        titre="Clients"
        description={
          total === 0
            ? undefined
            : `${clients.length} fiche${clients.length > 1 ? "s" : ""}${
                filtre ? ` sur ${total}` : ""
              }`
        }
      >
        <Button render={<Link href="/clients/nouveau" />}>
          <PlusIcon />
          Nouveau client
        </Button>
      </EnTetePage>

      {total > 0 && (
        <Suspense fallback={<div className="mb-4 h-8" />}>
          <FiltresClients villes={villes} />
        </Suspense>
      )}

      {total === 0 ? (
        <EtatVide
          Icone={UsersIcon}
          titre="Aucun client pour l'instant"
          description="Ajoutez votre première fiche, ou passez par la prospection téléphonique pour créer des contacts à la volée."
          action={
            <Button render={<Link href="/clients/nouveau" />}>
              <PlusIcon />
              Ajouter le premier client
            </Button>
          }
        />
      ) : clients.length === 0 ? (
        <EtatVide
          Icone={UsersIcon}
          titre="Aucun résultat"
          description="Aucune fiche ne correspond à cette recherche. Essayez avec moins de filtres."
        />
      ) : (
        <ListeClients clients={clients} />
      )}
    </>
  );
}
