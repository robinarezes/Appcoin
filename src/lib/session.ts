import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export type UtilisateurConnecte = {
  id: string;
  nom: string;
  email: string;
  couleur: string;
};

/**
 * Vérification réelle de la session, côté serveur. Le middleware ne fait qu'un
 * pré-filtrage sur la présence du cookie ; c'est ici que la garde fait foi.
 */
export async function utilisateurRequis(): Promise<UtilisateurConnecte> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return {
    id: session.user.id,
    nom: session.user.nom || session.user.name || "",
    email: session.user.email ?? "",
    couleur: session.user.couleur || "#2563eb",
  };
}
