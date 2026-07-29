import { prisma } from "@/lib/prisma";
import { statutFacture } from "@/lib/metier";

export async function listerOffres(filtres: { statut?: string; clientId?: string }) {
  const offres = await prisma.offre.findMany({
    where: { statut: filtres.statut, clientId: filtres.clientId },
    orderBy: { createdAt: "desc" },
    include: { client: { select: { id: true, entreprise: true } } },
  });

  const total = await prisma.offre.count();
  return { offres, total };
}

export async function ficheOffre(id: string) {
  return prisma.offre.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, entreprise: true, nomContact: true, email: true } },
      lignes: { orderBy: { ordre: "asc" } },
      factures: { select: { id: true, numero: true, datePaiement: true, dateEcheance: true } },
    },
  });
}

export async function listerFactures(filtres: { statut?: string; clientId?: string }) {
  const factures = await prisma.facture.findMany({
    where: { clientId: filtres.clientId },
    orderBy: { dateEmission: "desc" },
    include: {
      client: { select: { id: true, entreprise: true } },
      offre: { select: { id: true, numero: true } },
    },
  });

  // Le statut « en retard » étant calculé, le filtre l'est aussi.
  const filtrees = filtres.statut
    ? factures.filter((f) => statutFacture(f) === filtres.statut)
    : factures;

  const impayeesCents = factures
    .filter((f) => f.datePaiement === null)
    .reduce((total, f) => total + f.montantTTCCents, 0);

  const enRetardCents = factures
    .filter((f) => statutFacture(f) === "RETARD")
    .reduce((total, f) => total + f.montantTTCCents, 0);

  return { factures: filtrees, total: factures.length, impayeesCents, enRetardCents };
}
