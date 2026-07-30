import type { Prisma } from "@prisma/client";

/**
 * Numérotation OFF-2026-001, remise à 1 chaque année.
 *
 * Le calcul se fait à l'intérieur de la transaction qui crée le document :
 * deux créations simultanées ne peuvent pas obtenir le même numéro, et la
 * contrainte d'unicité en base sert de dernier filet.
 */
export async function numeroOffre(
  tx: Prisma.TransactionClient,
  date: Date,
): Promise<string> {
  const annee = date.getUTCFullYear();
  const derniere = await tx.offre.findFirst({
    where: { numero: { startsWith: `OFF-${annee}-` } },
    orderBy: { numero: "desc" },
    select: { numero: true },
  });

  const dernierRang = derniere ? Number(derniere.numero.split("-")[2]) : 0;
  const rang = Number.isFinite(dernierRang) ? dernierRang + 1 : 1;
  return `OFF-${annee}-${String(rang).padStart(3, "0")}`;
}
