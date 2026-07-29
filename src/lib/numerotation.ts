import type { Prisma } from "@prisma/client";

/**
 * Numérotation OFF-2026-001 / FAC-2026-001, remise à 1 chaque année.
 *
 * Le calcul se fait à l'intérieur de la transaction qui crée le document :
 * deux créations simultanées ne peuvent pas obtenir le même numéro, et la
 * contrainte d'unicité en base sert de dernier filet.
 */
async function suivant(
  dernierNumero: string | undefined,
  prefixe: string,
  annee: number,
): Promise<string> {
  const dernierRang = dernierNumero ? Number(dernierNumero.split("-")[2]) : 0;
  const rang = Number.isFinite(dernierRang) ? dernierRang + 1 : 1;
  return `${prefixe}-${annee}-${String(rang).padStart(3, "0")}`;
}

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
  return suivant(derniere?.numero, "OFF", annee);
}

export async function numeroFacture(
  tx: Prisma.TransactionClient,
  date: Date,
): Promise<string> {
  const annee = date.getUTCFullYear();
  const derniere = await tx.facture.findFirst({
    where: { numero: { startsWith: `FAC-${annee}-` } },
    orderBy: { numero: "desc" },
    select: { numero: true },
  });
  return suivant(derniere?.numero, "FAC", annee);
}
