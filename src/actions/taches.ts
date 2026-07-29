"use server";

import { revalidatePath } from "next/cache";

import { depuisInputDate, maintenant } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { utilisateurRequis } from "@/lib/session";
import {
  erreursDepuisZod,
  objetDepuisFormData,
  schemaTache,
  type EtatFormulaire,
} from "@/lib/validations";

function rafraichir(clientId?: string | null) {
  revalidatePath("/taches");
  revalidatePath("/");
  if (clientId) revalidatePath(`/clients/${clientId}`);
}

/** Ajout en une ligne depuis le kanban : titre + colonne, le reste par défaut. */
export async function ajoutRapideTache(
  _precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  const utilisateur = await utilisateurRequis();

  const titre = String(donnees.get("titre") ?? "").trim();
  const statut = String(donnees.get("statut") ?? "A_FAIRE");
  const clientId = String(donnees.get("clientId") ?? "") || null;

  if (!titre) return { ok: false, erreurs: { titre: "Écrivez d'abord la tâche." } };

  const premiere = await prisma.tache.findFirst({
    where: { statut },
    orderBy: { ordre: "asc" },
    select: { ordre: true },
  });

  await prisma.tache.create({
    data: {
      titre,
      statut,
      clientId,
      assigneeId: utilisateur.id,
      priorite: "NORMALE",
      ordre: (premiere?.ordre ?? 0) - 1, // la nouvelle tâche arrive en haut
      completedAt: statut === "FAIT" ? maintenant() : null,
    },
  });

  rafraichir(clientId);
  return { ok: true };
}

export async function creerTache(
  _precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  await utilisateurRequis();

  const analyse = schemaTache.safeParse(objetDepuisFormData(donnees));
  if (!analyse.success) return { ok: false, erreurs: erreursDepuisZod(analyse.error) };

  const { dateEcheance, ...reste } = analyse.data;
  await prisma.tache.create({
    data: {
      ...reste,
      dateEcheance: dateEcheance ? depuisInputDate(dateEcheance) : null,
      completedAt: reste.statut === "FAIT" ? maintenant() : null,
    },
  });

  rafraichir(reste.clientId);
  return { ok: true };
}

export async function modifierTache(
  id: string,
  _precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  await utilisateurRequis();

  const analyse = schemaTache.safeParse(objetDepuisFormData(donnees));
  if (!analyse.success) return { ok: false, erreurs: erreursDepuisZod(analyse.error) };

  const existante = await prisma.tache.findUnique({ where: { id } });
  const { dateEcheance, ...reste } = analyse.data;

  await prisma.tache.update({
    where: { id },
    data: {
      ...reste,
      dateEcheance: dateEcheance ? depuisInputDate(dateEcheance) : null,
      // On ne réécrit la date d'achèvement que si le statut change vraiment.
      completedAt:
        reste.statut === "FAIT"
          ? (existante?.completedAt ?? maintenant())
          : null,
    },
  });

  rafraichir(reste.clientId);
  if (existante?.clientId && existante.clientId !== reste.clientId) {
    revalidatePath(`/clients/${existante.clientId}`);
  }
  return { ok: true };
}

export async function supprimerTache(id: string) {
  await utilisateurRequis();
  const tache = await prisma.tache.delete({ where: { id } });
  rafraichir(tache.clientId);
}

/**
 * Glisser-déposer : on enregistre la colonne d'arrivée et l'ordre complet de
 * cette colonne, en une transaction pour éviter un état intermédiaire visible.
 */
export async function deplacerTache(
  id: string,
  nouveauStatut: string,
  idsOrdonnes: string[],
) {
  await utilisateurRequis();

  const tache = await prisma.tache.findUnique({ where: { id } });
  if (!tache) return { erreur: "Tâche introuvable." };

  await prisma.$transaction([
    prisma.tache.update({
      where: { id },
      data: {
        statut: nouveauStatut,
        completedAt:
          nouveauStatut === "FAIT" ? (tache.completedAt ?? maintenant()) : null,
      },
    }),
    ...idsOrdonnes.map((identifiant, position) =>
      prisma.tache.update({ where: { id: identifiant }, data: { ordre: position } }),
    ),
  ]);

  rafraichir(tache.clientId);
}
