"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { hash } from "bcryptjs";

import { signIn } from "@/lib/auth";
import { COULEURS_EQUIPE } from "@/lib/constantes";
import { prisma } from "@/lib/prisma";
import { utilisateurRequis } from "@/lib/session";
import {
  erreursDepuisZod,
  objetDepuisFormData,
  schemaChangementMotDePasse,
  schemaMembre,
  schemaNouveauCompte,
  schemaProfil,
  type EtatFormulaire,
} from "@/lib/validations";

/** Couleur libre encore disponible, sinon on boucle sur la palette. */
async function couleurSuivante(): Promise<string> {
  const prises = new Set((await prisma.user.findMany({ select: { couleur: true } })).map((u) => u.couleur));
  const libre = COULEURS_EQUIPE.find((c) => !prises.has(c.valeur));
  return libre?.valeur ?? COULEURS_EQUIPE[prises.size % COULEURS_EQUIPE.length].valeur;
}

/**
 * Création du tout premier compte, au premier lancement de l'application.
 *
 * Accessible uniquement tant que la base ne contient aucun compte : dès qu'il
 * en existe un, la page se ferme définitivement et les comptes suivants
 * s'ajoutent depuis l'écran Équipe, une fois connecté. C'est ce qui remplace
 * une page d'inscription publique, qu'on ne veut pas sur un outil interne.
 */
export async function creerPremierCompte(
  _precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  if ((await prisma.user.count()) > 0) {
    return {
      ok: false,
      erreurs: { _: "L'installation a déjà été faite. Connectez-vous." },
    };
  }

  const analyse = schemaNouveauCompte.safeParse(objetDepuisFormData(donnees));
  if (!analyse.success) return { ok: false, erreurs: erreursDepuisZod(analyse.error) };

  const { nom, email, motDePasse, couleur } = analyse.data;

  try {
    await prisma.$transaction(async (tx) => {
      // Deuxième vérification dans la transaction : deux requêtes simultanées
      // au premier démarrage ne doivent pas créer deux comptes.
      if ((await tx.user.count()) > 0) throw new Error("DEJA_INSTALLE");
      await tx.user.create({
        data: {
          nom,
          email,
          passwordHash: await hash(motDePasse, 10),
          couleur: couleur ?? COULEURS_EQUIPE[0].valeur,
        },
      });
    });
  } catch (erreur) {
    if (erreur instanceof Error && erreur.message === "DEJA_INSTALLE") {
      return { ok: false, erreurs: { _: "L'installation a déjà été faite. Connectez-vous." } };
    }
    throw erreur;
  }

  // On enchaîne directement sur la session : pas de retour à la connexion.
  try {
    await signIn("credentials", { email, motDePasse, redirectTo: "/" });
  } catch (erreur) {
    if (erreur instanceof AuthError) redirect("/login");
    throw erreur;
  }

  return { ok: true };
}

export async function ajouterMembre(
  _precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  await utilisateurRequis();

  const analyse = schemaMembre.safeParse(objetDepuisFormData(donnees));
  if (!analyse.success) return { ok: false, erreurs: erreursDepuisZod(analyse.error) };

  const { nom, email, motDePasse, couleur } = analyse.data;

  const existant = await prisma.user.findUnique({ where: { email } });
  if (existant) {
    return {
      ok: false,
      erreurs: { email: "Un compte utilise déjà cette adresse." },
    };
  }

  await prisma.user.create({
    data: {
      nom,
      email,
      passwordHash: await hash(motDePasse, 10),
      couleur: couleur ?? (await couleurSuivante()),
    },
  });

  revalidatePath("/equipe");
  return { ok: true, message: `Compte créé pour ${nom}.` };
}

export async function changerMotDePasse(
  _precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  await utilisateurRequis();

  const analyse = schemaChangementMotDePasse.safeParse(objetDepuisFormData(donnees));
  if (!analyse.success) return { ok: false, erreurs: erreursDepuisZod(analyse.error) };

  await prisma.user.update({
    where: { id: analyse.data.utilisateurId },
    data: { passwordHash: await hash(analyse.data.motDePasse, 10) },
  });

  revalidatePath("/equipe");
  return { ok: true, message: "Mot de passe modifié." };
}

export async function modifierProfil(
  _precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  const utilisateur = await utilisateurRequis();

  const analyse = schemaProfil.safeParse(objetDepuisFormData(donnees));
  if (!analyse.success) return { ok: false, erreurs: erreursDepuisZod(analyse.error) };

  await prisma.user.update({
    where: { id: utilisateur.id },
    data: analyse.data,
  });

  revalidatePath("/equipe");
  revalidatePath("/", "layout");
  return { ok: true, message: "Profil mis à jour." };
}

/**
 * Retirer ou rendre un accès. On ne supprime pas le compte : ses notes, ses
 * rendez-vous et ses appels restent attribués à leur auteur. La session en
 * cours de la personne concernée est coupée dès la requête suivante, puisque
 * la garde serveur revérifie le compte à chaque page.
 */
export async function basculerAcces(id: string, actif: boolean) {
  const utilisateur = await utilisateurRequis();

  if (id === utilisateur.id) {
    return { erreur: "Vous ne pouvez pas retirer votre propre accès." };
  }

  if (!actif) {
    const actifs = await prisma.user.count({ where: { actif: true } });
    if (actifs <= 1) {
      return { erreur: "Il doit rester au moins un compte actif." };
    }
  }

  await prisma.user.update({ where: { id }, data: { actif } });
  revalidatePath("/equipe");
}
