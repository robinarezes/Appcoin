import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type UtilisateurConnecte = {
  id: string;
  nom: string;
  email: string;
  couleur: string;
};

/**
 * Vérification réelle de la session, côté serveur. Le middleware ne fait qu'un
 * pré-filtrage sur la présence du cookie ; c'est ici que la garde fait foi.
 *
 * On revalide le compte en base à chaque requête plutôt que de se contenter du
 * jeton : sans cela, la session d'une personne dont on supprime le compte
 * resterait valable jusqu'à son expiration (trente jours). Supprimer un compte
 * doit couper l'accès tout de suite. La requête est indexée sur la clé
 * primaire, son coût est négligeable.
 */
export async function utilisateurRequis(): Promise<UtilisateurConnecte> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const utilisateur = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, nom: true, email: true, couleur: true },
  });
  // Le paramètre évite la boucle avec le middleware : le cookie est encore là,
  // mais le compte derrière n'existe plus.
  if (!utilisateur) redirect("/login?session=expiree");

  return utilisateur;
}
