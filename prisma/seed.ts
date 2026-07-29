/**
 * Jeu de données de démarrage.
 *
 * Objectif : que l'application soit immédiatement lisible au premier lancement
 * — des clients à tous les stades, des rendez-vous passés et à venir, des
 * tâches dans les trois colonnes (dont des retards) et huit mois d'offres et
 * de factures pour que les graphiques aient quelque chose à montrer.
 *
 * Les dates sont relatives à aujourd'hui : le seed reste pertinent dans six
 * mois. Comme partout dans l'application, elles sont écrites en « heure murale »
 * dans le champ UTC (voir src/lib/dates.ts).
 */

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const MOT_DE_PASSE = "demo1234";

// --- Utilitaires de date (autonomes : le seed ne dépend pas de src/) ---

const AUJOURD_HUI = (() => {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const v = (t: string) => Number(p.find((x) => x.type === t)?.value ?? 0);
  return new Date(Date.UTC(v("year"), v("month") - 1, v("day")));
})();

/** Décalage en jours par rapport à aujourd'hui, avec une heure optionnelle. */
function jour(decalage: number, heures = 0, minutes = 0): Date {
  const d = new Date(AUJOURD_HUI);
  d.setUTCDate(d.getUTCDate() + decalage);
  d.setUTCHours(heures, minutes, 0, 0);
  return d;
}

/** Le `jourDuMois` du mois situé `decalage` mois avant aujourd'hui. */
function mois(decalage: number, jourDuMois = 12, heures = 0): Date {
  const d = new Date(
    Date.UTC(AUJOURD_HUI.getUTCFullYear(), AUJOURD_HUI.getUTCMonth() - decalage, 1),
  );
  const dernier = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(jourDuMois, dernier));
  d.setUTCHours(heures, 0, 0, 0);
  return d;
}

function ajouterJours(d: Date, n: number): Date {
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + n);
  return r;
}

const euros = (montant: number) => Math.round(montant * 100);
const TVA = 2000; // 20,00 %
const ttc = (ht: number) => Math.round(ht * (1 + TVA / 10_000));

// --- Données ---

type LigneSeed = { libelle: string; quantite: number; prixUnitaireHT: number };

type OffreSeed = {
  titre: string;
  description?: string;
  lignes: LigneSeed[];
  statut: "BROUILLON" | "ENVOYEE" | "ACCEPTEE" | "REFUSEE";
  /** Mois de création, en nombre de mois avant aujourd'hui. */
  moisAvant: number;
  jourDuMois?: number;
  /** Facture générée depuis l'offre : délai après la réponse et état du paiement. */
  facture?: { jourApresReponse: number; paiementJourApresEmission: number | null };
};

type ClientSeed = {
  entreprise: string;
  nomContact: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  secteur: string;
  statut: "PROSPECT" | "EN_DISCUSSION" | "CLIENT" | "INACTIF" | "PERDU";
  source: string;
  siteWebActuel?: string;
  notes?: string;
  creeIlYaJours: number;
  journal: { contenu: string; ilYaJours: number; auteur: 0 | 1 }[];
  offres: OffreSeed[];
};

const CLIENTS: ClientSeed[] = [
  {
    entreprise: "Le Petit Bistrot",
    nomContact: "Nathalie Perrin",
    email: "contact@lepetitbistrot-rennes.fr",
    telephone: "02 99 31 44 18",
    adresse: "12 rue Saint-Georges",
    ville: "Rennes",
    secteur: "Restaurant",
    statut: "CLIENT",
    source: "BOUCHE_A_OREILLE",
    siteWebActuel: "https://lepetitbistrot-rennes.fr",
    notes: "Ferme le dimanche et le lundi. Toujours appeler avant 11 h ou après 15 h.",
    creeIlYaJours: 260,
    journal: [
      { contenu: "Premier rendez-vous sur place. Veut surtout un menu à jour et la réservation en ligne.", ilYaJours: 240, auteur: 0 },
      { contenu: "Site livré, formation faite avec Nathalie sur la mise à jour du menu.", ilYaJours: 180, auteur: 1 },
      { contenu: "Appel : très contente des retours clients. Évoque une refonte des photos au printemps.", ilYaJours: 24, auteur: 0 },
    ],
    offres: [
      {
        titre: "Site vitrine + réservation en ligne",
        description: "Site 5 pages, module de réservation, mise en avant du menu du jour.",
        moisAvant: 8,
        jourDuMois: 6,
        statut: "ACCEPTEE",
        lignes: [
          { libelle: "Conception et intégration du site (5 pages)", quantite: 1, prixUnitaireHT: 2400 },
          { libelle: "Module de réservation en ligne", quantite: 1, prixUnitaireHT: 700 },
          { libelle: "Séance photo du restaurant", quantite: 1, prixUnitaireHT: 350 },
        ],
        facture: { jourApresReponse: 3, paiementJourApresEmission: 21 },
      },
      {
        titre: "Maintenance annuelle",
        description: "Hébergement, mises à jour, sauvegardes et petites retouches.",
        moisAvant: 2,
        jourDuMois: 4,
        statut: "ACCEPTEE",
        lignes: [{ libelle: "Forfait maintenance 12 mois", quantite: 1, prixUnitaireHT: 480 }],
        facture: { jourApresReponse: 2, paiementJourApresEmission: 12 },
      },
    ],
  },
  {
    entreprise: "Coiffure Émeraude",
    nomContact: "Sonia Le Guen",
    email: "sonia@coiffure-emeraude.fr",
    telephone: "02 99 40 27 63",
    adresse: "3 place Chateaubriand",
    ville: "Saint-Malo",
    secteur: "Coiffeur",
    statut: "CLIENT",
    source: "RESEAUX",
    siteWebActuel: "https://coiffure-emeraude.fr",
    notes: "Très active sur Instagram, veut que le site reprenne la même identité visuelle.",
    creeIlYaJours: 210,
    journal: [
      { contenu: "Contact via Instagram. Cherche surtout la prise de rendez-vous en ligne.", ilYaJours: 205, auteur: 1 },
      { contenu: "Devis envoyé et validé par téléphone dans la foulée.", ilYaJours: 190, auteur: 1 },
      { contenu: "Relance à prévoir : facture de maintenance envoyée il y a trois semaines, toujours pas réglée.", ilYaJours: 5, auteur: 0 },
    ],
    offres: [
      {
        titre: "Site vitrine + prise de rendez-vous",
        moisAvant: 6,
        jourDuMois: 9,
        statut: "ACCEPTEE",
        lignes: [
          { libelle: "Site vitrine 4 pages", quantite: 1, prixUnitaireHT: 1900 },
          { libelle: "Connexion à l'agenda de prise de rendez-vous", quantite: 1, prixUnitaireHT: 450 },
        ],
        facture: { jourApresReponse: 4, paiementJourApresEmission: 17 },
      },
      {
        titre: "Maintenance et retouches",
        moisAvant: 1,
        jourDuMois: 8,
        statut: "ACCEPTEE",
        lignes: [
          { libelle: "Forfait maintenance 12 mois", quantite: 1, prixUnitaireHT: 380 },
          { libelle: "Retouches graphiques", quantite: 2, prixUnitaireHT: 120 },
        ],
        facture: { jourApresReponse: 2, paiementJourApresEmission: null },
      },
    ],
  },
  {
    entreprise: "Menuiserie Lelièvre",
    nomContact: "Yann Lelièvre",
    email: "y.lelievre@menuiserie-lelievre.bzh",
    telephone: "02 99 52 71 09",
    adresse: "ZA de la Haie des Cognets, 8 rue des Artisans",
    ville: "Bruz",
    secteur: "Artisan / BTP",
    statut: "CLIENT",
    source: "PROSPECTION",
    notes: "Pas de site avant nous. Joignable surtout le soir, il est sur les chantiers la journée.",
    creeIlYaJours: 150,
    journal: [
      { contenu: "Prospection porte-à-porte sur la ZA. Intéressé, veut montrer ses réalisations.", ilYaJours: 145, auteur: 0 },
      { contenu: "Visite de l'atelier, photos des réalisations récupérées.", ilYaJours: 120, auteur: 0 },
      { contenu: "Facture envoyée. Il a prévenu qu'il réglerait avec un peu de retard.", ilYaJours: 60, auteur: 1 },
    ],
    offres: [
      {
        titre: "Site vitrine + galerie de réalisations",
        description: "Mise en avant des chantiers, formulaire de demande de devis.",
        moisAvant: 4,
        jourDuMois: 15,
        statut: "ACCEPTEE",
        lignes: [
          { libelle: "Site vitrine 6 pages", quantite: 1, prixUnitaireHT: 2100 },
          { libelle: "Galerie de réalisations", quantite: 1, prixUnitaireHT: 600 },
          { libelle: "Rédaction des textes", quantite: 1, prixUnitaireHT: 400 },
        ],
        facture: { jourApresReponse: 5, paiementJourApresEmission: null },
      },
    ],
  },
  {
    entreprise: "Garage Kervella",
    nomContact: "Pierrick Kervella",
    email: "contact@garage-kervella.fr",
    telephone: "02 23 45 88 12",
    adresse: "17 avenue des Peupliers",
    ville: "Cesson-Sévigné",
    secteur: "Automobile",
    statut: "EN_DISCUSSION",
    source: "BOUCHE_A_OREILLE",
    siteWebActuel: "https://garage-kervella.pagesjaunes.fr",
    notes: "Recommandé par Le Petit Bistrot. Hésite encore sur le budget.",
    creeIlYaJours: 45,
    journal: [
      { contenu: "Premier appel. Son site actuel est une page annuaire, il veut quelque chose à lui.", ilYaJours: 42, auteur: 1 },
      { contenu: "Rendez-vous au garage : devis présenté, il doit en parler à son associé.", ilYaJours: 12, auteur: 1 },
    ],
    offres: [
      {
        titre: "Site vitrine garage + demande de rendez-vous",
        moisAvant: 0,
        jourDuMois: Math.max(1, AUJOURD_HUI.getUTCDate() - 10),
        statut: "ENVOYEE",
        lignes: [
          { libelle: "Site vitrine 5 pages", quantite: 1, prixUnitaireHT: 1800 },
          { libelle: "Formulaire de demande de rendez-vous", quantite: 1, prixUnitaireHT: 350 },
          { libelle: "Référencement local (fiche Google)", quantite: 1, prixUnitaireHT: 250 },
        ],
      },
    ],
  },
  {
    entreprise: "Fleurs & Sens",
    nomContact: "Amandine Roussel",
    email: "bonjour@fleursetsens.fr",
    telephone: "02 99 78 15 40",
    adresse: "44 rue de Fougères",
    ville: "Rennes",
    secteur: "Commerce de détail",
    statut: "PROSPECT",
    source: "SALON",
    notes: "Rencontrée au salon des commerçants. À rappeler après la Toussaint, grosse période pour elle.",
    creeIlYaJours: 18,
    journal: [
      { contenu: "Échange sur le stand du salon. Curieuse, pas encore de budget défini.", ilYaJours: 18, auteur: 0 },
    ],
    offres: [],
  },
  {
    entreprise: "Le Fournil d'Ille",
    nomContact: "Mathieu Cadiou",
    email: "fournil.ille@orange.fr",
    telephone: "02 99 55 62 74",
    adresse: "2 place de l'Église",
    ville: "Betton",
    secteur: "Boulangerie",
    statut: "CLIENT",
    source: "PROSPECTION",
    notes: "Commande de pains spéciaux en ligne : demande récurrente de ses clients.",
    creeIlYaJours: 190,
    journal: [
      { contenu: "Rendez-vous à 6 h du matin (!) pour caler le projet.", ilYaJours: 175, auteur: 1 },
      { contenu: "Site en ligne, il a affiché le QR code en boutique.", ilYaJours: 130, auteur: 0 },
    ],
    offres: [
      {
        titre: "Site vitrine + commande de pains spéciaux",
        moisAvant: 5,
        jourDuMois: 20,
        statut: "ACCEPTEE",
        lignes: [
          { libelle: "Site vitrine 4 pages", quantite: 1, prixUnitaireHT: 1600 },
          { libelle: "Formulaire de commande sur mesure", quantite: 1, prixUnitaireHT: 800 },
        ],
        facture: { jourApresReponse: 3, paiementJourApresEmission: 9 },
      },
    ],
  },
  {
    entreprise: "Cabinet Marion Guyot — Ostéopathe",
    nomContact: "Marion Guyot",
    email: "contact@osteo-guyot.fr",
    telephone: "06 74 21 90 33",
    adresse: "9 boulevard de la Liberté",
    ville: "Rennes",
    secteur: "Santé / Bien-être",
    statut: "CLIENT",
    source: "SITE_WEB",
    notes: "Nous a trouvés via notre propre site. Dossier simple et rapide.",
    creeIlYaJours: 120,
    journal: [
      { contenu: "Demande via le formulaire du site. Besoin clair : présentation + prise de rendez-vous.", ilYaJours: 118, auteur: 0 },
      { contenu: "Livraison en trois semaines, aucun aller-retour. Client idéal.", ilYaJours: 85, auteur: 0 },
    ],
    offres: [
      {
        titre: "Site vitrine cabinet",
        moisAvant: 3,
        jourDuMois: 11,
        statut: "ACCEPTEE",
        lignes: [
          { libelle: "Site vitrine 3 pages", quantite: 1, prixUnitaireHT: 1250 },
          { libelle: "Intégration Doctolib", quantite: 1, prixUnitaireHT: 200 },
        ],
        facture: { jourApresReponse: 2, paiementJourApresEmission: 14 },
      },
    ],
  },
  {
    entreprise: "Studio Kalé — Yoga",
    nomContact: "Hélène Tanguy",
    email: "studio@kale-yoga.fr",
    telephone: "06 12 88 47 20",
    adresse: "5 rue Thiers",
    ville: "Vannes",
    secteur: "Sport",
    statut: "PERDU",
    source: "RESEAUX",
    notes: "Partie chez un concurrent moins cher. Reprendre contact dans un an.",
    creeIlYaJours: 165,
    journal: [
      { contenu: "Beaucoup d'échanges, projet ambitieux (planning de cours en ligne).", ilYaJours: 160, auteur: 1 },
      { contenu: "Devis refusé : budget trop élevé pour elle, elle a trouvé moins cher.", ilYaJours: 140, auteur: 1 },
    ],
    offres: [
      {
        titre: "Site + planning de cours en ligne",
        moisAvant: 5,
        jourDuMois: 3,
        statut: "REFUSEE",
        lignes: [
          { libelle: "Site vitrine 5 pages", quantite: 1, prixUnitaireHT: 1900 },
          { libelle: "Planning de cours dynamique", quantite: 1, prixUnitaireHT: 1200 },
          { libelle: "Réservation et paiement en ligne", quantite: 1, prixUnitaireHT: 900 },
        ],
      },
    ],
  },
  {
    entreprise: "Armor Immobilier",
    nomContact: "Franck Berthelot",
    email: "f.berthelot@armor-immobilier.fr",
    telephone: "02 96 39 55 71",
    adresse: "21 rue Levavasseur",
    ville: "Dinard",
    secteur: "Immobilier",
    statut: "INACTIF",
    source: "PROSPECTION",
    siteWebActuel: "https://armor-immobilier.fr",
    notes: "Site livré il y a longtemps, plus de nouvelles depuis. Relancer pour la maintenance.",
    creeIlYaJours: 320,
    journal: [
      { contenu: "Site livré, tout s'est bien passé.", ilYaJours: 250, auteur: 0 },
      { contenu: "Deux relances sans réponse pour le contrat de maintenance.", ilYaJours: 95, auteur: 1 },
    ],
    offres: [
      {
        titre: "Refonte du site agence",
        moisAvant: 7,
        jourDuMois: 18,
        statut: "ACCEPTEE",
        lignes: [
          { libelle: "Refonte complète (8 pages)", quantite: 1, prixUnitaireHT: 3200 },
          { libelle: "Import du catalogue de biens", quantite: 1, prixUnitaireHT: 950 },
        ],
        facture: { jourApresReponse: 4, paiementJourApresEmission: 28 },
      },
    ],
  },
];

async function main() {
  console.log("Nettoyage de la base…");
  await prisma.ligneOffre.deleteMany();
  await prisma.facture.deleteMany();
  await prisma.offre.deleteMany();
  await prisma.tache.deleteMany();
  await prisma.rendezVous.deleteMany();
  await prisma.note.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hash(MOT_DE_PASSE, 10);

  const robin = await prisma.user.create({
    data: {
      nom: "Robin",
      email: "robin@agence.fr",
      passwordHash,
      couleur: "#2563eb", // bleu
    },
  });

  const camille = await prisma.user.create({
    data: {
      nom: "Camille",
      email: "camille@agence.fr",
      passwordHash,
      couleur: "#c026d3", // fuchsia
    },
  });

  const equipe = [robin, camille] as const;
  console.log(`2 utilisateurs créés (mot de passe : ${MOT_DE_PASSE})`);

  // --- Clients et journal ---

  const idsClients = new Map<string, string>();

  for (const c of CLIENTS) {
    const client = await prisma.client.create({
      data: {
        entreprise: c.entreprise,
        nomContact: c.nomContact,
        email: c.email,
        telephone: c.telephone,
        adresse: c.adresse,
        ville: c.ville,
        secteur: c.secteur,
        statut: c.statut,
        source: c.source,
        siteWebActuel: c.siteWebActuel ?? null,
        notes: c.notes ?? null,
        createdAt: jour(-c.creeIlYaJours),
        journal: {
          create: c.journal.map((n) => ({
            contenu: n.contenu,
            auteurId: equipe[n.auteur].id,
            createdAt: jour(-n.ilYaJours, 10, 30),
          })),
        },
      },
    });
    idsClients.set(c.entreprise, client.id);
  }

  console.log(`${CLIENTS.length} clients créés`);

  // --- Offres, lignes et factures ---
  // On numérote dans l'ordre chronologique pour que OFF-2026-001 soit bien la
  // première offre de l'année.

  const offresAPlat = CLIENTS.flatMap((c) =>
    c.offres.map((o) => ({
      offre: o,
      clientId: idsClients.get(c.entreprise)!,
      date: mois(o.moisAvant, o.jourDuMois ?? 12, 9),
    })),
  ).sort((a, b) => a.date.getTime() - b.date.getTime());

  const compteurOffres = new Map<number, number>();
  const compteurFactures = new Map<number, number>();

  const numeroter = (prefixe: string, d: Date, compteur: Map<number, number>) => {
    const annee = d.getUTCFullYear();
    const n = (compteur.get(annee) ?? 0) + 1;
    compteur.set(annee, n);
    return `${prefixe}-${annee}-${String(n).padStart(3, "0")}`;
  };

  const facturesACreer: {
    clientId: string;
    offreId: string;
    montantHTCents: number;
    montantTTCCents: number;
    dateEmission: Date;
    datePaiement: Date | null;
  }[] = [];

  for (const { offre, clientId, date } of offresAPlat) {
    const montantHTCents = offre.lignes.reduce(
      (total, l) => total + euros(l.prixUnitaireHT) * l.quantite,
      0,
    );

    const dateEnvoi = offre.statut === "BROUILLON" ? null : ajouterJours(date, 1);
    const dateReponse =
      offre.statut === "ACCEPTEE" || offre.statut === "REFUSEE"
        ? ajouterJours(date, 8)
        : null;

    const creee = await prisma.offre.create({
      data: {
        numero: numeroter("OFF", date, compteurOffres),
        clientId,
        titre: offre.titre,
        description: offre.description ?? null,
        montantHTCents,
        tauxTVA: TVA,
        montantTTCCents: ttc(montantHTCents),
        statut: offre.statut,
        dateEnvoi,
        dateReponse,
        createdAt: date,
        lignes: {
          create: offre.lignes.map((l, index) => ({
            libelle: l.libelle,
            quantite: l.quantite,
            prixUnitaireHTCents: euros(l.prixUnitaireHT),
            ordre: index,
          })),
        },
      },
    });

    if (offre.facture && dateReponse) {
      const dateEmission = ajouterJours(dateReponse, offre.facture.jourApresReponse);
      facturesACreer.push({
        clientId,
        offreId: creee.id,
        montantHTCents,
        montantTTCCents: ttc(montantHTCents),
        dateEmission,
        datePaiement:
          offre.facture.paiementJourApresEmission === null
            ? null
            : ajouterJours(dateEmission, offre.facture.paiementJourApresEmission),
      });
    }
  }

  facturesACreer.sort((a, b) => a.dateEmission.getTime() - b.dateEmission.getTime());

  for (const f of facturesACreer) {
    const dateEcheance = ajouterJours(f.dateEmission, 30);
    const enRetard = f.datePaiement === null && dateEcheance < AUJOURD_HUI;
    await prisma.facture.create({
      data: {
        numero: numeroter("FAC", f.dateEmission, compteurFactures),
        offreId: f.offreId,
        clientId: f.clientId,
        montantHTCents: f.montantHTCents,
        tauxTVA: TVA,
        montantTTCCents: f.montantTTCCents,
        dateEmission: f.dateEmission,
        dateEcheance,
        datePaiement: f.datePaiement,
        statut: f.datePaiement ? "PAYEE" : enRetard ? "RETARD" : "EN_ATTENTE",
        createdAt: f.dateEmission,
      },
    });
  }

  console.log(`${offresAPlat.length} offres et ${facturesACreer.length} factures créées`);

  // --- Rendez-vous ---

  const rdv = [
    {
      titre: "Point d'avancement — refonte photos",
      client: "Le Petit Bistrot",
      debut: jour(2, 9, 30),
      fin: jour(2, 10, 30),
      lieu: "12 rue Saint-Georges, Rennes",
      type: "PHYSIQUE",
      participant: 0,
      statut: "PREVU",
    },
    {
      titre: "Présentation du devis à l'associé",
      client: "Garage Kervella",
      debut: jour(3, 14, 0),
      fin: jour(3, 15, 0),
      lieu: "17 avenue des Peupliers, Cesson-Sévigné",
      type: "PHYSIQUE",
      participant: 1,
      statut: "PREVU",
    },
    {
      titre: "Appel de relance facture",
      client: "Menuiserie Lelièvre",
      debut: jour(1, 18, 30),
      fin: jour(1, 18, 45),
      lieu: null,
      type: "TELEPHONE",
      participant: 1,
      statut: "PREVU",
    },
    {
      titre: "Premier contact — projet fleuriste",
      client: "Fleurs & Sens",
      debut: jour(5, 11, 0),
      fin: jour(5, 12, 0),
      lieu: "44 rue de Fougères, Rennes",
      type: "PHYSIQUE",
      participant: 0,
      statut: "PREVU",
    },
    {
      titre: "Formation back-office",
      client: "Cabinet Marion Guyot — Ostéopathe",
      debut: jour(6, 16, 0),
      fin: jour(6, 17, 0),
      lieu: null,
      type: "VISIO",
      participant: 0,
      statut: "PREVU",
    },
    {
      titre: "Réunion interne — planning du mois",
      client: null,
      debut: jour(4, 9, 0),
      fin: jour(4, 10, 0),
      lieu: "Bureau",
      type: "PHYSIQUE",
      participant: 1,
      statut: "PREVU",
    },
    {
      titre: "Visite de l'atelier",
      client: "Menuiserie Lelièvre",
      debut: jour(-38, 17, 0),
      fin: jour(-38, 18, 0),
      lieu: "ZA de la Haie des Cognets, Bruz",
      type: "PHYSIQUE",
      participant: 0,
      statut: "FAIT",
      notes:
        "Photos des réalisations récupérées. Il veut mettre en avant les escaliers sur mesure.",
    },
    {
      titre: "Démonstration du site",
      client: "Coiffure Émeraude",
      debut: jour(-22, 10, 0),
      fin: jour(-22, 11, 0),
      lieu: null,
      type: "VISIO",
      participant: 1,
      statut: "FAIT",
      notes: "Validation de la maquette. Deux retouches demandées sur les couleurs.",
    },
    {
      titre: "Rendez-vous découverte",
      client: "Garage Kervella",
      debut: jour(-12, 15, 0),
      fin: jour(-12, 16, 0),
      lieu: "17 avenue des Peupliers, Cesson-Sévigné",
      type: "PHYSIQUE",
      participant: 1,
      statut: "FAIT",
      notes: "Devis présenté. Il doit valider avec son associé, réponse sous quinze jours.",
    },
    {
      titre: "Café avec Hélène (relance)",
      client: "Studio Kalé — Yoga",
      debut: jour(-30, 14, 0),
      fin: jour(-30, 15, 0),
      lieu: "Vannes",
      type: "PHYSIQUE",
      participant: 1,
      statut: "ANNULE",
    },
  ] as const;

  for (const r of rdv) {
    await prisma.rendezVous.create({
      data: {
        titre: r.titre,
        clientId: r.client ? idsClients.get(r.client)! : null,
        dateDebut: r.debut,
        dateFin: r.fin,
        lieu: r.lieu,
        type: r.type,
        participantId: equipe[r.participant].id,
        statut: r.statut,
        notes: "notes" in r ? r.notes : null,
      },
    });
  }

  console.log(`${rdv.length} rendez-vous créés`);

  // --- Tâches ---

  const taches = [
    // En retard
    { titre: "Relancer la facture de la Menuiserie Lelièvre", client: "Menuiserie Lelièvre", assignee: 1, priorite: "HAUTE", echeance: -6, statut: "A_FAIRE" },
    { titre: "Envoyer les accès FTP à Armor Immobilier", client: "Armor Immobilier", assignee: 0, priorite: "NORMALE", echeance: -3, statut: "A_FAIRE" },
    // Aujourd'hui / cette semaine
    { titre: "Préparer les photos du Petit Bistrot", client: "Le Petit Bistrot", assignee: 0, priorite: "NORMALE", echeance: 0, statut: "A_FAIRE" },
    { titre: "Rappeler Amandine (Fleurs & Sens) après la Toussaint", client: "Fleurs & Sens", assignee: 0, priorite: "BASSE", echeance: 9, statut: "A_FAIRE" },
    { titre: "Devis maintenance pour Armor Immobilier", client: "Armor Immobilier", assignee: 1, priorite: "NORMALE", echeance: 7, statut: "A_FAIRE" },
    { titre: "Trier les prospects du salon", client: null, assignee: 0, priorite: "BASSE", echeance: 14, statut: "A_FAIRE" },
    // En cours
    { titre: "Intégrer la galerie de réalisations", client: "Menuiserie Lelièvre", assignee: 0, priorite: "HAUTE", echeance: 2, statut: "EN_COURS", description: "Les photos sont dans le dossier partagé. Prévoir un affichage en grille avec zoom." },
    { titre: "Rédiger les textes du garage Kervella", client: "Garage Kervella", assignee: 1, priorite: "NORMALE", echeance: 4, statut: "EN_COURS" },
    { titre: "Mettre à jour notre page tarifs", client: null, assignee: 1, priorite: "BASSE", echeance: null, statut: "EN_COURS" },
    // Fait
    { titre: "Livrer le site du Fournil d'Ille", client: "Le Fournil d'Ille", assignee: 0, priorite: "HAUTE", echeance: -40, statut: "FAIT", faitIlYa: 41 },
    { titre: "Configurer la fiche Google du cabinet Guyot", client: "Cabinet Marion Guyot — Ostéopathe", assignee: 0, priorite: "NORMALE", echeance: -25, statut: "FAIT", faitIlYa: 26 },
    { titre: "Envoyer le devis au garage Kervella", client: "Garage Kervella", assignee: 1, priorite: "HAUTE", echeance: -11, statut: "FAIT", faitIlYa: 11 },
    { titre: "Sauvegarder les sites clients", client: null, assignee: 1, priorite: "NORMALE", echeance: -2, statut: "FAIT", faitIlYa: 2 },
  ] as const;

  const compteurOrdre: Record<string, number> = { A_FAIRE: 0, EN_COURS: 0, FAIT: 0 };

  for (const t of taches) {
    await prisma.tache.create({
      data: {
        titre: t.titre,
        description: "description" in t ? t.description : null,
        clientId: t.client ? idsClients.get(t.client)! : null,
        assigneeId: equipe[t.assignee].id,
        priorite: t.priorite,
        dateEcheance: t.echeance === null ? null : jour(t.echeance),
        statut: t.statut,
        ordre: compteurOrdre[t.statut]++,
        createdAt: jour(t.echeance === null ? -20 : Math.min(t.echeance - 10, -1)),
        completedAt: "faitIlYa" in t ? jour(-t.faitIlYa, 17) : null,
      },
    });
  }

  // --- Fiches de prospection téléphonique ---
  // Des boutiques repérées mais pas encore travaillées : c'est la file
  // d'appel du jour au premier lancement.

  const prospection = [
    {
      entreprise: "Pizzeria Da Vinci",
      telephone: "02 99 63 21 40",
      ville: "Rennes",
      secteur: "Restaurant",
      appel: null,
    },
    {
      entreprise: "Toilettage Patte de Velours",
      telephone: "02 99 84 12 07",
      ville: "Chantepie",
      secteur: "Services aux entreprises",
      appel: null,
    },
    {
      entreprise: "Garage Moto Kerlann",
      telephone: "02 99 77 30 55",
      ville: "Pacé",
      secteur: "Automobile",
      appel: {
        resultat: "A_RAPPELER",
        note: "Le patron était sur un chantier. Rappeler en fin de semaine, plutôt le matin.",
        ilYaJours: 9,
        rappelDans: -1, // rappel prévu hier : la fiche remonte en tête
        auteur: 0 as const,
      },
    },
    {
      entreprise: "Cave Les Trois Tonneaux",
      telephone: "02 99 38 64 92",
      ville: "Saint-Grégoire",
      secteur: "Commerce de détail",
      appel: {
        resultat: "INTERESSE",
        note: "Intéressée mais pas avant janvier. Budget évoqué : autour de 1 500 €.",
        ilYaJours: 4,
        rappelDans: null,
        auteur: 1 as const,
      },
    },
    {
      entreprise: "Institut Belle Époque",
      telephone: "02 99 51 77 18",
      ville: "Bruz",
      secteur: "Institut de beauté",
      appel: {
        resultat: "PAS_INTERESSE",
        note: "A déjà un site refait l'an dernier. Ne pas relancer avant longtemps.",
        ilYaJours: 15,
        rappelDans: null,
        auteur: 0 as const,
      },
    },
  ];

  for (const p of prospection) {
    const client = await prisma.client.create({
      data: {
        entreprise: p.entreprise,
        telephone: p.telephone,
        ville: p.ville,
        secteur: p.secteur,
        statut:
          p.appel?.resultat === "PAS_INTERESSE"
            ? "PERDU"
            : p.appel?.resultat === "INTERESSE"
              ? "EN_DISCUSSION"
              : "PROSPECT",
        source: "PROSPECTION",
        createdAt: jour(-20),
      },
    });

    if (p.appel) {
      await prisma.appel.create({
        data: {
          clientId: client.id,
          auteurId: equipe[p.appel.auteur].id,
          resultat: p.appel.resultat,
          note: p.appel.note,
          dureeSecondes: 120 + Math.round(Math.random() * 180),
          rappelLe: p.appel.rappelDans === null ? null : jour(p.appel.rappelDans),
          createdAt: jour(-p.appel.ilYaJours, 11),
        },
      });
    }
  }

  console.log(`${taches.length} tâches créées`);
  console.log(`${prospection.length} fiches de prospection créées`);
  console.log("\nSeed terminé.");
  console.log("  robin@agence.fr / demo1234");
  console.log("  camille@agence.fr / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
