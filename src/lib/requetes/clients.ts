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
  /** Total HT des offres acceptées : le « CA signé » avec ce client. */
  caSigneCents: number;
};

/**
 * Liste des clients, filtrée et triée en mémoire.
 * Voir src/lib/recherche.ts pour le pourquoi : recherche insensible aux accents
 * et comportement identique quelle que soit la base.
 */
export async function listerClients(filtres: FiltresClients) {
  const [clients, offresAcceptees] = await Promise.all([
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
    prisma.offre.groupBy({
      by: ["clientId"],
      where: { statut: "ACCEPTEE" },
      _sum: { montantHTCents: true },
    }),
  ]);

  const caParClient = new Map(
    offresAcceptees.map((o) => [o.clientId, o._sum.montantHTCents ?? 0]),
  );

  const enrichis: ClientListe[] = clients.map((c) => ({
    ...c,
    caSigneCents: caParClient.get(c.id) ?? 0,
  }));

  const recherche = filtres.recherche?.trim() ?? "";
  const chiffres = chiffresSeuls(recherche);

  const filtresAppliques = enrichis.filter((c) => {
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
  filtresAppliques.sort((a, b) => {
    switch (tri) {
      case "recent":
        return b.createdAt.getTime() - a.createdAt.getTime();
      case "ca":
        return b.caSigneCents - a.caSigneCents;
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

  return { clients: filtresAppliques, total: clients.length, villes };
}

/** Fiche complète : coordonnées, journal, rendez-vous, tâches, offres, appels. */
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
      appels: {
        orderBy: { createdAt: "desc" },
        include: { auteur: { select: { id: true, nom: true, couleur: true } } },
      },
    },
  });

  if (!client) return null;

  const caSigneCents = client.offres
    .filter((o) => o.statut === "ACCEPTEE")
    .reduce((total, o) => total + o.montantHTCents, 0);

  return { client, caSigneCents };
}

/** Liste allégée pour les listes déroulantes (tâches, rendez-vous, offres). */
export async function optionsClients() {
  const clients = await prisma.client.findMany({
    select: { id: true, entreprise: true, ville: true },
    orderBy: { entreprise: "asc" },
  });
  return clients;
}
