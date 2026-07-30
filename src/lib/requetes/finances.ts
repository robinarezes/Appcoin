import { prisma } from "@/lib/prisma";
import {
  ajouterMois,
  cleMois,
  debutDAnnee,
  debutDeMois,
  finDAnnee,
  finDeMois,
  formatMoisCourt,
  maintenant,
} from "@/lib/dates";

export type PointMensuel = {
  cle: string;
  mois: string;
  entreesCents: number;
  sortiesCents: number;
};

/**
 * Les douze mois d'une année civile, chacun avec ses encaissements (le chiffre
 * d'affaires) et ses dépenses. Les mois vides restent visibles : un graphique
 * qui saute des mois se lit mal.
 */
export async function mouvementsAnnee(annee: number): Promise<PointMensuel[]> {
  const mouvements = await prisma.mouvementFinancier.findMany({
    where: { date: { gte: debutDAnnee(annee), lte: finDAnnee(annee) } },
    select: { date: true, montantCents: true, type: true },
  });

  const points: PointMensuel[] = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(Date.UTC(annee, i, 1));
    return {
      cle: cleMois(date),
      mois: formatMoisCourt(date).replace(".", ""),
      entreesCents: 0,
      sortiesCents: 0,
    };
  });

  const index = new Map(points.map((p) => [p.cle, p]));
  for (const m of mouvements) {
    const point = index.get(cleMois(m.date));
    if (!point) continue;
    if (m.type === "SORTIE") point.sortiesCents += m.montantCents;
    else point.entreesCents += m.montantCents;
  }

  return points;
}

/** L'argent de l'entreprise : tout ce qui est rentré moins tout ce qui est sorti. */
export async function soldeEntreprise(): Promise<number> {
  const [entrees, sorties] = await Promise.all([
    prisma.mouvementFinancier.aggregate({
      where: { type: "ENTREE" },
      _sum: { montantCents: true },
    }),
    prisma.mouvementFinancier.aggregate({
      where: { type: "SORTIE" },
      _sum: { montantCents: true },
    }),
  ]);
  return (entrees._sum.montantCents ?? 0) - (sorties._sum.montantCents ?? 0);
}

/** CA du mois en cours et écart avec le mois précédent (pour le dashboard). */
export async function caDuMois() {
  const maintenantDate = maintenant();
  const moisPrecedent = ajouterMois(maintenantDate, -1);

  const somme = async (debut: Date, fin: Date) => {
    const r = await prisma.mouvementFinancier.aggregate({
      where: { type: "ENTREE", date: { gte: debut, lte: fin } },
      _sum: { montantCents: true },
    });
    return r._sum.montantCents ?? 0;
  };

  const [actuel, precedent] = await Promise.all([
    somme(debutDeMois(maintenantDate), finDeMois(maintenantDate)),
    somme(debutDeMois(moisPrecedent), finDeMois(moisPrecedent)),
  ]);

  return {
    actuelCents: actuel,
    precedentCents: precedent,
    variation: precedent === 0 ? null : (actuel - precedent) / precedent,
  };
}

export async function anneesDisponibles(): Promise<number[]> {
  const mouvements = await prisma.mouvementFinancier.findMany({
    select: { date: true },
  });
  const annees = new Set(mouvements.map((m) => m.date.getUTCFullYear()));
  annees.add(maintenant().getUTCFullYear());
  return [...annees].sort((a, b) => b - a);
}

/** L'historique d'une année, du plus récent au plus ancien. */
export async function listerMouvements(annee: number) {
  return prisma.mouvementFinancier.findMany({
    where: { date: { gte: debutDAnnee(annee), lte: finDAnnee(annee) } },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
}
