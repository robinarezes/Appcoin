"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/lib/auth";

export type EtatConnexion = { erreur?: string };

/** Empêche de rediriger vers un domaine externe via ?suite=. */
function destinationSure(valeur: FormDataEntryValue | null): string {
  const suite = typeof valeur === "string" ? valeur : "";
  return suite.startsWith("/") && !suite.startsWith("//") ? suite : "/";
}

export async function connexion(
  _precedent: EtatConnexion,
  donnees: FormData,
): Promise<EtatConnexion> {
  const email = String(donnees.get("email") ?? "").trim();
  const motDePasse = String(donnees.get("motDePasse") ?? "");

  if (!email || !motDePasse) {
    return { erreur: "Renseignez votre email et votre mot de passe." };
  }

  try {
    await signIn("credentials", {
      email,
      motDePasse,
      redirectTo: destinationSure(donnees.get("suite")),
    });
  } catch (erreur) {
    // signIn signale la redirection réussie en levant une erreur interne à
    // Next : seules les AuthError sont de vrais échecs de connexion.
    if (erreur instanceof AuthError) {
      return { erreur: "Email ou mot de passe incorrect." };
    }
    throw erreur;
  }

  return {};
}

export async function deconnexion() {
  await signOut({ redirectTo: "/login" });
}
