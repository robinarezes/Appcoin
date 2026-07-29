import { prisma } from "@/lib/prisma";
import {
  ajouterMois,
  cleMois,
  debutDAnnee,
  debutDeMois,
  finDAnnee,
  formatMoisCourt,
  maintenant,
} from "@/lib/dates";
import { statutFacture, tauxTransformation } from "@/lib/metier";

export type PointMensuel = {
  cle: string;
  mois: string;
  factureCents: number;
  encaisseCents: number;
};

/** Squelette de 12 mois consécutifs, pour qu'un mois sans activité reste visible. */
function douzeMois(depuis: Date): PointMensuel[] {
  return Array.from({ length: 12 }, (_, i) => {
    const date = ajouterMois(depuis, i);
    return {
      cle: cleMois(date),
      mois: formatMoisCourt(date).replace(".", ""),
      factureCents: 0,
      encaisseCents: 0,
    };
  });
}

function remplir(points: PointMensuel[], factures: {
  montantHTCents: number;
  dateEmission: Date;
  datePaiement: Date | null;
}[]) {
  const index = new Map(points.map((p) => [p.cle, p]));

  for (const facture of factures) {
    const emission = index.get(cleMois(facture.dateEmission));
    if (emission) emission.factureCents += facture.montantHTCents;

    if (facture.datePaiement) {
      const paiement = index.get(cleMois(facture.datePaiement));
      if (paiement) paiement.encaisseCents += facture.montantHTCents;
    }
  }

  return points;
}

/** Les douze derniers mois glissants — c'est la vue du tableau de bord. */
export async function caDouzeDerniersMois() {
  const depart = debutDeMois(ajouterMois(maintenant(), -11));
  const factures = await prisma.facture.findMany({
    where: {
      OR: [{ dateEmission: { gte: depart } }, { datePaiement: { gte: depart } }],
    },
    select: { montantHTCents: true, dateEmission: true, datePaiement: true },
  });

  return remplir(douzeMois(depart), factures);
}

/** Année civile complète, pour la page Chiffre d'affaires. */
export async function caAnnee(annee: number) {
  const debut = debutDAnnee(annee);
  const fin = finDAnnee(annee);

  const factures = await prisma.facture.findMany({
    where: {
      OR: [
        { dateEmission: { gte: debut, lte: fin } },
        { datePaiement: { gte: debut, lte: fin } },
      ],
    },
    select: { montantHTCents: true, dateEmission: true, datePaiement: true },
  });

  return remplir(douzeMois(debut), factures);
}

export async function anneesDisponibles(): Promise<number[]> {
  const factures = await prisma.facture.findMany({ select: { dateEmission: true } });
  const annees = new Set(factures.map((f) => f.dateEmission.getUTCFullYear()));
  annees.add(maintenant().getUTCFullYear());
  return [...annees].sort((a, b) => b - a);
}

export async function repartitionAnnee(annee: number) {
  const debut = debutDAnnee(annee);
  const fin = finDAnnee(annee);

  const factures = await prisma.facture.findMany({
    where: { dateEmission: { gte: debut, lte: fin } },
    select: {
      montantHTCents: true,
      client: { select: { id: true, entreprise: true, secteur: true } },
    },
  });

  const parClient = new Map<string, { id: string; nom: string; montantCents: number }>();
  const parSecteur = new Map<string, number>();

  for (const facture of factures) {
    const client = parClient.get(facture.client.id) ?? {
      id: facture.client.id,
      nom: facture.client.entreprise,
      montantCents: 0,
    };
    client.montantCents += facture.montantHTCents;
    parClient.set(facture.client.id, client);

    const secteur = facture.client.secteur?.trim() || "Non renseigné";
    parSecteur.set(secteur, (parSecteur.get(secteur) ?? 0) + facture.montantHTCents);
  }

  const topClients = [...parClient.values()]
    .sort((a, b) => b.montantCents - a.montantCents)
    .slice(0, 5);

  const secteurs = [...parSecteur.entries()]
    .map(([nom, montantCents]) => ({ nom, montantCents }))
    .sort((a, b) => b.montantCents - a.montantCents);

  const totalCents = factures.reduce((somme, f) => somme + f.montantHTCents, 0);

  return { topClients, secteurs, totalCents };
}

export async function transformationAnnee(annee: number) {
  const offres = await prisma.offre.findMany({
    where: { createdAt: { gte: debutDAnnee(annee), lte: finDAnnee(annee) } },
    select: { statut: true, montantHTCents: true },
  });

  const montantAccepte = offres
    .filter((o) => o.statut === "ACCEPTEE")
    .reduce((somme, o) => somme + o.montantHTCents, 0);

  return { ...tauxTransformation(offres), montantAccepte };
}

export async function facturesImpayees() {
  const factures = await prisma.facture.findMany({
    where: { datePaiement: null },
    orderBy: { dateEcheance: "asc" },
    include: { client: { select: { id: true, entreprise: true } } },
  });

  return factures.map((facture) => ({ ...facture, statutCalcule: statutFacture(facture) }));
}
