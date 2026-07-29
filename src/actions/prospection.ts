"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { STATUT_APRES_APPEL } from "@/lib/constantes";
import { depuisInputDate } from "@/lib/dates";
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

  const { clientId, resultat, note, dureeSecondes, rappelLe } = analyse.data;
  const dateRappel = rappelLe ? depuisInputDate(rappelLe) : null;

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
          titre: `Rappeler ${client.entreprise}`,
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
