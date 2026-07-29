import { prisma } from "@/lib/prisma";

/** Y a-t-il au moins un compte ? Détermine l'accès à la page d'installation. */
export async function baseVierge(): Promise<boolean> {
  return (await prisma.user.count()) === 0;
}

export async function listerEquipe() {
  const membres = await prisma.user.findMany({
    orderBy: [{ actif: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      nom: true,
      email: true,
      couleur: true,
      actif: true,
      createdAt: true,
      _count: {
        select: { tachesAssignees: true, rendezVous: true, notes: true, appels: true },
      },
    },
  });

  return membres.map((membre) => ({
    ...membre,
    // Nombre d'éléments encore ouverts, pour prévenir avant de retirer un accès.
    contributions:
      membre._count.tachesAssignees +
      membre._count.rendezVous +
      membre._count.notes +
      membre._count.appels,
  }));
}

export type MembreEquipe = Awaited<ReturnType<typeof listerEquipe>>[number];

export async function nombreComptesActifs(): Promise<number> {
  return prisma.user.count({ where: { actif: true } });
}
