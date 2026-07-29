import { prisma } from "@/lib/prisma";
import {
  ajouterJours,
  ajouterMois,
  debutDeJour,
  debutDeMois,
  finDeMois,
  maintenant,
} from "@/lib/dates";
import { statutFacture } from "@/lib/metier";

/** CA facturé du mois en cours, et écart avec le mois précédent. */
export async function caDuMois() {
  const maintenantDate = maintenant();
  const debutMois = debutDeMois(maintenantDate);
  const finMois = finDeMois(maintenantDate);
  const moisPrecedent = ajouterMois(maintenantDate, -1);

  const [ceMois, precedent] = await Promise.all([
    prisma.facture.aggregate({
      where: { dateEmission: { gte: debutMois, lte: finMois } },
      _sum: { montantHTCents: true },
    }),
    prisma.facture.aggregate({
      where: {
        dateEmission: { gte: debutDeMois(moisPrecedent), lte: finDeMois(moisPrecedent) },
      },
      _sum: { montantHTCents: true },
    }),
  ]);

  const actuel = ceMois._sum.montantHTCents ?? 0;
  const ancien = precedent._sum.montantHTCents ?? 0;

  return {
    actuelCents: actuel,
    precedentCents: ancien,
    // Sans mois précédent, une variation en pourcentage n'a pas de sens.
    variation: ancien === 0 ? null : (actuel - ancien) / ancien,
  };
}

export async function impayes() {
  const factures = await prisma.facture.findMany({
    where: { datePaiement: null },
    select: { montantTTCCents: true, dateEcheance: true, datePaiement: true },
  });

  return {
    totalCents: factures.reduce((somme, f) => somme + f.montantTTCCents, 0),
    nombre: factures.length,
    enRetardCents: factures
      .filter((f) => statutFacture(f) === "RETARD")
      .reduce((somme, f) => somme + f.montantTTCCents, 0),
    nombreEnRetard: factures.filter((f) => statutFacture(f) === "RETARD").length,
  };
}

export async function prospectsActifs() {
  return prisma.client.count({
    where: { statut: { in: ["PROSPECT", "EN_DISCUSSION"] } },
  });
}

/** Tâches de l'utilisateur connecté : en retard, puis pour aujourd'hui. */
export async function mesTachesDuJour(utilisateurId: string) {
  const debutAujourdHui = debutDeJour(maintenant());
  const finAujourdHui = ajouterJours(debutAujourdHui, 1);

  const taches = await prisma.tache.findMany({
    where: {
      assigneeId: utilisateurId,
      statut: { not: "FAIT" },
      dateEcheance: { lt: finAujourdHui },
    },
    orderBy: [{ dateEcheance: "asc" }],
    include: { client: { select: { id: true, entreprise: true } } },
  });

  return {
    enRetard: taches.filter((t) => t.dateEcheance! < debutAujourdHui),
    aujourdHui: taches.filter((t) => t.dateEcheance! >= debutAujourdHui),
  };
}

export async function offresEnAttente() {
  const offres = await prisma.offre.findMany({
    where: { statut: "ENVOYEE" },
    select: { montantHTCents: true },
  });

  return {
    nombre: offres.length,
    montantCents: offres.reduce((somme, o) => somme + o.montantHTCents, 0),
  };
}
