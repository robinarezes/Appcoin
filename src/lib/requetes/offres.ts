import { prisma } from "@/lib/prisma";

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
    },
  });
}
