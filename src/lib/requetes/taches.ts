import { prisma } from "@/lib/prisma";
import { debutDeJour, maintenant } from "@/lib/dates";
import { CLES_STATUT_TACHE } from "@/lib/constantes";

export type FiltresTaches = {
  assigneeId?: string;
  clientId?: string;
  priorite?: string;
  enRetard?: boolean;
};

export type TacheKanban = {
  id: string;
  titre: string;
  description: string | null;
  priorite: string;
  statut: string;
  ordre: number;
  dateEcheance: Date | null;
  completedAt: Date | null;
  client: { id: string; entreprise: string } | null;
  assignee: { id: string; nom: string; couleur: string };
};

export async function listerTaches(filtres: FiltresTaches) {
  const taches = await prisma.tache.findMany({
    where: {
      assigneeId: filtres.assigneeId,
      clientId: filtres.clientId,
      priorite: filtres.priorite,
      ...(filtres.enRetard
        ? {
            statut: { not: "FAIT" },
            dateEcheance: { lt: debutDeJour(maintenant()) },
          }
        : {}),
    },
    orderBy: [{ ordre: "asc" }, { createdAt: "asc" }],
    include: {
      client: { select: { id: true, entreprise: true } },
      assignee: { select: { id: true, nom: true, couleur: true } },
    },
  });

  const colonnes = CLES_STATUT_TACHE.map((statut) => ({
    statut,
    taches: taches.filter((t) => t.statut === statut) as TacheKanban[],
  }));

  return { colonnes, total: taches.length };
}

export async function equipe() {
  return prisma.user.findMany({
    select: { id: true, nom: true, couleur: true },
    orderBy: { nom: "asc" },
  });
}
