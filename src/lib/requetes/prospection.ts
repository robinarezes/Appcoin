import { prisma } from "@/lib/prisma";
import { aujourdHui, finDeJour, maintenant } from "@/lib/dates";
import { correspond } from "@/lib/recherche";

export type FiltreProspection = "a_appeler" | "rappels" | "tous";

export type FicheProspection = {
  id: string;
  entreprise: string;
  nomContact: string | null;
  telephone: string;
  ville: string | null;
  secteur: string | null;
  statut: string;
  notes: string | null;
  dernierAppel: {
    resultat: string;
    note: string | null;
    createdAt: Date;
    auteur: string;
    rappelLe: Date | null;
  } | null;
  nombreAppels: number;
};

/**
 * File d'appel. L'ordre est celui dans lequel on veut décrocher le téléphone :
 * d'abord les rappels dus, puis les fiches jamais appelées, puis les plus
 * anciennement contactées.
 */
export async function listerProspection(filtre: FiltreProspection, recherche?: string) {
  const clients = await prisma.client.findMany({
    where: { NOT: { telephone: null } },
    include: {
      appels: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { auteur: { select: { nom: true } } },
      },
      _count: { select: { appels: true } },
    },
  });

  const finAujourdHui = finDeJour(maintenant());

  const fiches: FicheProspection[] = clients
    .filter((c) => c.telephone && c.telephone.trim() !== "")
    .map((c) => {
      const dernier = c.appels[0];
      return {
        id: c.id,
        entreprise: c.entreprise,
        nomContact: c.nomContact,
        telephone: c.telephone!,
        ville: c.ville,
        secteur: c.secteur,
        statut: c.statut,
        notes: c.notes,
        nombreAppels: c._count.appels,
        dernierAppel: dernier
          ? {
              resultat: dernier.resultat,
              note: dernier.note,
              createdAt: dernier.createdAt,
              auteur: dernier.auteur.nom,
              rappelLe: dernier.rappelLe,
            }
          : null,
      };
    });

  const rappelDu = (fiche: FicheProspection) =>
    fiche.dernierAppel?.rappelLe !== null &&
    fiche.dernierAppel?.rappelLe !== undefined &&
    fiche.dernierAppel.rappelLe <= finAujourdHui;

  const aAppeler = (fiche: FicheProspection) => {
    // Un client acquis ou un dossier perdu ne remonte pas dans la file d'appel.
    if (fiche.statut === "CLIENT" || fiche.statut === "PERDU" || fiche.statut === "INACTIF") {
      return false;
    }
    if (!fiche.dernierAppel) return true;
    if (fiche.dernierAppel.resultat === "RDV_PRIS") return false;
    if (fiche.dernierAppel.resultat === "PAS_INTERESSE") return false;
    if (fiche.dernierAppel.rappelLe) return rappelDu(fiche);
    return true;
  };

  let selection = fiches;
  if (filtre === "a_appeler") selection = fiches.filter(aAppeler);
  if (filtre === "rappels") selection = fiches.filter(rappelDu);

  if (recherche?.trim()) {
    selection = selection.filter((f) =>
      correspond(recherche, f.entreprise, f.nomContact, f.ville, f.secteur, f.telephone),
    );
  }

  selection.sort((a, b) => {
    const rappelA = rappelDu(a) ? 0 : 1;
    const rappelB = rappelDu(b) ? 0 : 1;
    if (rappelA !== rappelB) return rappelA - rappelB;

    const jamaisA = a.dernierAppel ? 1 : 0;
    const jamaisB = b.dernierAppel ? 1 : 0;
    if (jamaisA !== jamaisB) return jamaisA - jamaisB;

    const dateA = a.dernierAppel?.createdAt.getTime() ?? 0;
    const dateB = b.dernierAppel?.createdAt.getTime() ?? 0;
    return dateA - dateB;
  });

  return {
    fiches: selection,
    compteurs: {
      aAppeler: fiches.filter(aAppeler).length,
      rappels: fiches.filter(rappelDu).length,
      tous: fiches.length,
    },
  };
}

/** Bilan de la journée, affiché en haut de l'écran de prospection. */
export async function bilanDuJour(utilisateurId: string) {
  const debut = aujourdHui();

  const appels = await prisma.appel.findMany({
    where: { createdAt: { gte: debut } },
    select: { resultat: true, auteurId: true },
  });

  const miens = appels.filter((a) => a.auteurId === utilisateurId);

  return {
    total: appels.length,
    miens: miens.length,
    rdvPris: appels.filter((a) => a.resultat === "RDV_PRIS").length,
    interesses: appels.filter((a) => a.resultat === "INTERESSE").length,
  };
}
