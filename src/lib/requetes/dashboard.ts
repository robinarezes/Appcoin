import { prisma } from "@/lib/prisma";
import { ajouterJours, debutDeJour, maintenant } from "@/lib/dates";

export { caDuMois, soldeEntreprise } from "@/lib/requetes/finances";

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

/** Les derniers échanges notés dans les journaux clients, tous clients confondus. */
export async function dernieresNotes(limite = 5) {
  return prisma.note.findMany({
    orderBy: { createdAt: "desc" },
    take: limite,
    include: {
      client: { select: { id: true, entreprise: true } },
      auteur: { select: { id: true, nom: true, couleur: true } },
    },
  });
}
