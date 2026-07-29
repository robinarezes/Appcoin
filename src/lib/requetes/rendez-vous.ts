import { prisma } from "@/lib/prisma";
import { debutDeMois, finDeMois, grilleMois, maintenant } from "@/lib/dates";

const inclusions = {
  client: { select: { id: true, entreprise: true, telephone: true } },
  participant: { select: { id: true, nom: true, couleur: true } },
} as const;

export type RendezVousComplet = Awaited<ReturnType<typeof listerMois>>["rendezVous"][number];

/**
 * Rendez-vous couvrant la grille affichée — les 42 cases débordent sur les
 * mois voisins, on charge donc la période réellement visible.
 */
export async function listerMois(annee: number, mois: number) {
  const cases = grilleMois(annee, mois);
  const debut = cases[0];
  const fin = new Date(cases[cases.length - 1].getTime() + 86_399_999);

  const rendezVous = await prisma.rendezVous.findMany({
    where: { dateDebut: { gte: debut, lte: fin } },
    orderBy: { dateDebut: "asc" },
    include: inclusions,
  });

  return { rendezVous, cases, debut, fin };
}

export async function listerAgenda() {
  const maintenantDate = maintenant();

  const [aVenir, passes] = await Promise.all([
    prisma.rendezVous.findMany({
      where: { dateDebut: { gte: maintenantDate }, statut: { not: "ANNULE" } },
      orderBy: { dateDebut: "asc" },
      include: inclusions,
    }),
    prisma.rendezVous.findMany({
      where: { OR: [{ dateDebut: { lt: maintenantDate } }, { statut: "ANNULE" }] },
      orderBy: { dateDebut: "desc" },
      take: 40,
      include: inclusions,
    }),
  ]);

  return { aVenir, passes };
}

export async function ficheRendezVous(id: string) {
  return prisma.rendezVous.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, entreprise: true, telephone: true, email: true, adresse: true, ville: true } },
      participant: { select: { id: true, nom: true, couleur: true } },
    },
  });
}

/** Les prochains rendez-vous, pour le tableau de bord. */
export async function prochainsRendezVous(jours: number) {
  const debut = maintenant();
  const fin = new Date(debut.getTime() + jours * 86_400_000);

  return prisma.rendezVous.findMany({
    where: { dateDebut: { gte: debut, lte: fin }, statut: "PREVU" },
    orderBy: { dateDebut: "asc" },
    include: inclusions,
  });
}

export async function bornesMois(annee: number, mois: number) {
  const reference = new Date(Date.UTC(annee, mois, 1));
  return { debut: debutDeMois(reference), fin: finDeMois(reference) };
}
