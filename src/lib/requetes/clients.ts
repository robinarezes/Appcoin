import { prisma } from "@/lib/prisma";
import { chiffresSeuls, correspond, normaliser } from "@/lib/recherche";

export type TriClients = "entreprise" | "recent" | "ca" | "ville";

export type FiltresClients = {
  recherche?: string;
  statut?: string;
  ville?: string;
  tri?: TriClients;
};

export type ClientListe = {
  id: string;
  entreprise: string;
  nomContact: string | null;
  email: string | null;
  telephone: string | null;
  ville: string | null;
  secteur: string | null;
  statut: string;
  createdAt: Date;
  caEncaisseCents: number;
  montantDuCents: number;
};

/**
 * Liste des clients, filtrée et triée en mémoire.
 * Voir src/lib/recherche.ts pour le pourquoi : recherche insensible aux accents
 * et comportement identique sur SQLite et PostgreSQL.
 */
export async function listerClients(filtres: FiltresClients) {
  const [clients, encaisse, du] = await Promise.all([
    prisma.client.findMany({
      select: {
        id: true,
        entreprise: true,
        nomContact: true,
        email: true,
        telephone: true,
        ville: true,
        secteur: true,
        statut: true,
        createdAt: true,
      },
    }),
    prisma.facture.groupBy({
      by: ["clientId"],
      where: { datePaiement: { not: null } },
      _sum: { montantHTCents: true },
    }),
    prisma.facture.groupBy({
      by: ["clientId"],
      where: { datePaiement: null },
      _sum: { montantTTCCents: true },
    }),
  ]);

  const parClientEncaisse = new Map(
    encaisse.map((e) => [e.clientId, e._sum.montantHTCents ?? 0]),
  );
  const parClientDu = new Map(du.map((e) => [e.clientId, e._sum.montantTTCCents ?? 0]));

  const enrichis: ClientListe[] = clients.map((c) => ({
    ...c,
    caEncaisseCents: parClientEncaisse.get(c.id) ?? 0,
    montantDuCents: parClientDu.get(c.id) ?? 0,
  }));

  const recherche = filtres.recherche?.trim() ?? "";
  const chiffres = chiffresSeuls(recherche);

  const filtres_appliques = enrichis.filter((c) => {
    if (filtres.statut && c.statut !== filtres.statut) return false;
    if (filtres.ville && normaliser(c.ville) !== normaliser(filtres.ville)) return false;
    if (!recherche) return true;

    // Une recherche composée uniquement de chiffres vise le téléphone.
    if (chiffres.length >= 3 && chiffresSeuls(c.telephone).includes(chiffres)) return true;

    return correspond(
      recherche,
      c.entreprise,
      c.nomContact,
      c.email,
      c.telephone,
      c.ville,
      c.secteur,
    );
  });

  const tri = filtres.tri ?? "entreprise";
  filtres_appliques.sort((a, b) => {
    switch (tri) {
      case "recent":
        return b.createdAt.getTime() - a.createdAt.getTime();
      case "ca":
        return b.caEncaisseCents - a.caEncaisseCents;
      case "ville":
        return (
          normaliser(a.ville).localeCompare(normaliser(b.ville)) ||
          a.entreprise.localeCompare(b.entreprise, "fr")
        );
      default:
        return a.entreprise.localeCompare(b.entreprise, "fr");
    }
  });

  const villes = [...new Set(clients.map((c) => c.ville).filter((v): v is string => !!v))].sort(
    (a, b) => a.localeCompare(b, "fr"),
  );

  return { clients: filtres_appliques, total: clients.length, villes };
}

/** Fiche complète : coordonnées, journal, rendez-vous, tâches, offres, factures. */
export async function ficheClient(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      journal: {
        orderBy: { createdAt: "desc" },
        include: { auteur: { select: { id: true, nom: true, couleur: true } } },
      },
      rendezVous: {
        orderBy: { dateDebut: "desc" },
        include: { participant: { select: { id: true, nom: true, couleur: true } } },
      },
      taches: {
        orderBy: [{ statut: "asc" }, { dateEcheance: "asc" }],
        include: { assignee: { select: { id: true, nom: true, couleur: true } } },
      },
      offres: { orderBy: { createdAt: "desc" } },
      factures: { orderBy: { dateEmission: "desc" } },
      appels: {
        orderBy: { createdAt: "desc" },
        include: { auteur: { select: { id: true, nom: true, couleur: true } } },
      },
    },
  });

  if (!client) return null;

  const caEncaisseCents = client.factures
    .filter((f) => f.datePaiement !== null)
    .reduce((total, f) => total + f.montantHTCents, 0);

  const caFactureCents = client.factures.reduce((total, f) => total + f.montantHTCents, 0);

  const montantDuCents = client.factures
    .filter((f) => f.datePaiement === null)
    .reduce((total, f) => total + f.montantTTCCents, 0);

  return { client, caEncaisseCents, caFactureCents, montantDuCents };
}

/** Liste allégée pour les listes déroulantes (tâches, rendez-vous, offres). */
export async function optionsClients() {
  const clients = await prisma.client.findMany({
    select: { id: true, entreprise: true, ville: true },
    orderBy: { entreprise: "asc" },
  });
  return clients;
}
