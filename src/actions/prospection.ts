"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { STATUT_APRES_APPEL } from "@/lib/constantes";
import { depuisInputDate, depuisInputDateHeure, formatHeure } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { utilisateurRequis } from "@/lib/session";
import {
  erreursDepuisZod,
  objetDepuisFormData,
  schemaCompteRenduAppel,
  schemaFicheAppel,
  type EtatFormulaire,
} from "@/lib/validations";

function rafraichir(clientId?: string) {
  revalidatePath("/prospection");
  revalidatePath("/clients");
  revalidatePath("/");
  if (clientId) revalidatePath(`/clients/${clientId}`);
}

/**
 * Ajout d'une fiche depuis l'écran de prospection : un nom de boutique et un
 * numéro suffisent. C'est un client comme un autre, au statut « prospect » —
 * on ne veut pas d'un carnet d'adresses parallèle qu'il faudrait ensuite
 * recopier.
 */
export async function ajouterFicheProspection(
  _precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  await utilisateurRequis();

  const analyse = schemaFicheAppel.safeParse(objetDepuisFormData(donnees));
  if (!analyse.success) return { ok: false, erreurs: erreursDepuisZod(analyse.error) };

  await prisma.client.create({
    data: {
      ...analyse.data,
      statut: "PROSPECT",
      source: "PROSPECTION",
    },
  });

  rafraichir();
  return { ok: true };
}

/**
 * Compte-rendu enregistré juste après avoir raccroché.
 *
 * Trois effets de bord voulus :
 *  - le statut du client suit l'issue de l'appel (voir STATUT_APRES_APPEL) ;
 *  - « à rappeler » avec une date crée la tâche de rappel correspondante ;
 *  - « rendez-vous pris » enchaîne sur le formulaire de rendez-vous, pré-rempli.
 */
export async function enregistrerAppel(
  _precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  const utilisateur = await utilisateurRequis();

  const analyse = schemaCompteRenduAppel.safeParse(objetDepuisFormData(donnees));
  if (!analyse.success) return { ok: false, erreurs: erreursDepuisZod(analyse.error) };

  const { clientId, resultat, note, dureeSecondes, rappelLe, rappelHeure } = analyse.data;
  // Date seule → rappel « dans la journée » (minuit) ; avec une heure → rappel précis.
  const dateRappel = rappelLe
    ? rappelHeure
      ? depuisInputDateHeure(`${rappelLe}T${rappelHeure}`)
      : depuisInputDate(rappelLe)
    : null;

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { entreprise: true, statut: true },
  });
  if (!client) return { ok: false, erreurs: { _: "Fiche introuvable." } };

  const nouveauStatut = STATUT_APRES_APPEL[resultat];

  await prisma.$transaction(async (tx) => {
    await tx.appel.create({
      data: {
        clientId,
        auteurId: utilisateur.id,
        resultat,
        note,
        dureeSecondes,
        rappelLe: dateRappel,
      },
    });

    // On n'écrase pas un client acquis parce qu'un appel s'est mal passé.
    if (nouveauStatut && client.statut !== "CLIENT") {
      await tx.client.update({ where: { id: clientId }, data: { statut: nouveauStatut } });
    }

    if (note) {
      await tx.note.create({
        data: {
          clientId,
          auteurId: utilisateur.id,
          contenu: `Appel de prospection — ${note}`,
        },
      });
    }

    if (resultat === "A_RAPPELER" && dateRappel) {
      await tx.tache.create({
        data: {
          titre: rappelHeure
            ? `Rappeler ${client.entreprise} à ${formatHeure(dateRappel)}`
            : `Rappeler ${client.entreprise}`,
          clientId,
          assigneeId: utilisateur.id,
          priorite: "NORMALE",
          statut: "A_FAIRE",
          dateEcheance: dateRappel,
        },
      });
    }
  });

  rafraichir(clientId);
  revalidatePath("/taches");

  if (resultat === "RDV_PRIS") {
    redirect(`/rendez-vous/nouveau?client=${clientId}&depuis=prospection`);
  }

  return { ok: true };
}

/**
 * Suppression d'une fiche depuis l'écran de prospection : numéro erroné,
 * doublon d'import, commerce fermé… La fiche étant un client, son journal,
 * ses offres et ses appels partent avec elle (cascade).
 */
export async function supprimerFicheProspection(id: string) {
  await utilisateurRequis();
  await prisma.client.delete({ where: { id } });
  rafraichir();
}

/**
 * Import en masse de prospects. On colle une liste, une boutique par ligne,
 * colonnes séparées par « ; » ou une tabulation, dans l'ordre :
 *   Entreprise ; Téléphone ; Ville ; Secteur ; Contact
 * Seul le nom d'entreprise est obligatoire. Toutes les fiches sont créées au
 * statut « prospect ». Les lignes vides et les doublons (même entreprise +
 * ville déjà en base, ou répétés dans le collage) sont ignorés.
 */
export async function importerProspects(
  _precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  await utilisateurRequis();

  const brut = donnees.get("lignes");
  const texte = typeof brut === "string" ? brut : "";
  const lignes = texte
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lignes.length === 0) {
    return { ok: false, erreurs: { lignes: "Collez au moins une ligne à importer." } };
  }

  const vus = new Set<string>();
  const aCreer: {
    entreprise: string;
    telephone: string | null;
    ville: string | null;
    secteur: string | null;
    nomContact: string | null;
    statut: string;
    source: string;
  }[] = [];
  let ignorees = 0;

  for (const ligne of lignes) {
    const cols = ligne.split(/\t|;/).map((c) => c.trim());
    const entreprise = cols[0] ?? "";
    if (!entreprise) {
      ignorees++;
      continue;
    }

    const telephone = cols[1] || null;
    const ville = cols[2] || null;
    const secteur = cols[3] || null;
    const nomContact = cols[4] || null;

    const cle = `${entreprise.toLowerCase()}|${(telephone ?? "").replace(/\D/g, "")}`;
    if (vus.has(cle)) {
      ignorees++;
      continue;
    }
    vus.add(cle);

    aCreer.push({
      entreprise,
      telephone,
      ville,
      secteur,
      nomContact,
      statut: "PROSPECT",
      source: "PROSPECTION",
    });
  }

  if (aCreer.length === 0) {
    return {
      ok: false,
      erreurs: {
        lignes:
          "Aucune ligne exploitable. Format attendu : Entreprise ; Téléphone ; Ville ; Secteur",
      },
    };
  }

  // On évite de recréer des fiches déjà présentes (même entreprise + ville).
  const existants = await prisma.client.findMany({
    select: { entreprise: true, ville: true },
  });
  const dejaLa = new Set(
    existants.map((c) => `${c.entreprise.toLowerCase()}|${(c.ville ?? "").toLowerCase()}`),
  );

  const filtres = aCreer.filter((c) => {
    const cle = `${c.entreprise.toLowerCase()}|${(c.ville ?? "").toLowerCase()}`;
    if (dejaLa.has(cle)) {
      ignorees++;
      return false;
    }
    return true;
  });

  if (filtres.length > 0) {
    await prisma.client.createMany({ data: filtres });
  }

  rafraichir();

  const n = filtres.length;
  return {
    ok: true,
    message:
      `${n} fiche${n > 1 ? "s" : ""} importée${n > 1 ? "s" : ""}` +
      (ignorees > 0 ? ` · ${ignorees} ignorée${ignorees > 1 ? "s" : ""} (vides ou doublons)` : ""),
  };
}
