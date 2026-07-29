import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface User {
    nom?: string;
    couleur?: string;
  }
  interface Session {
    user: {
      id: string;
      nom: string;
      couleur: string;
    } & DefaultSession["user"];
  }
}

const identifiants = z.object({
  email: z.string().email(),
  motDePasse: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Pas d'adapter : deux comptes fixes créés par le seed, session en JWT.
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        motDePasse: { label: "Mot de passe", type: "password" },
      },
      async authorize(donnees) {
        const parsed = identifiants.safeParse(donnees);
        if (!parsed.success) return null;

        const utilisateur = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase().trim() },
        });
        // Un compte désactivé ne peut plus ouvrir de session.
        if (!utilisateur || !utilisateur.actif) return null;

        const valide = await compare(parsed.data.motDePasse, utilisateur.passwordHash);
        if (!valide) return null;

        return {
          id: utilisateur.id,
          email: utilisateur.email,
          name: utilisateur.nom,
          nom: utilisateur.nom,
          couleur: utilisateur.couleur,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.nom = user.nom ?? user.name ?? "";
        token.couleur = user.couleur ?? "#2563eb";
      }
      return token;
    },
    // Le JWT d'Auth.js est un sac de claims non typées : on retypage à la
    // sortie plutôt que d'augmenter le module.
    session({ session, token }) {
      session.user.id = typeof token.id === "string" ? token.id : "";
      session.user.nom = typeof token.nom === "string" ? token.nom : "";
      session.user.couleur =
        typeof token.couleur === "string" ? token.couleur : "#2563eb";
      return session;
    },
  },
});
