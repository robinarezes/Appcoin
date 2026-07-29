/**
 * Création (ou mise à jour) d'un compte, sans passer par le seed.
 *
 *   npm run utilisateur -- "Léa" lea@agence.fr
 *   npm run utilisateur -- "Léa" lea@agence.fr monMotDePasse "#0ea5e9"
 *
 * Sans mot de passe, un mot de passe solide est tiré au sort et affiché une
 * seule fois : c'est la façon la plus sûre d'ouvrir un compte à quelqu'un,
 * sans laisser le mot de passe dans l'historique du terminal.
 *
 * Pour créer un compte sur la base de production, exporter d'abord la même
 * DATABASE_URL que Vercel — voir DEPLOIEMENT.md.
 */

import { randomBytes } from "node:crypto";

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

/** Couleurs de repère dans le calendrier, distinctes les unes des autres. */
const COULEURS = ["#2563eb", "#c026d3", "#059669", "#ea580c", "#7c3aed", "#0891b2"];

function motDePasseAleatoire(): string {
  // Alphabet sans caractères ambigus (0/O, 1/l/I) : le mot de passe est
  // souvent recopié à la main la première fois.
  const alphabet = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(randomBytes(14))
    .map((octet) => alphabet[octet % alphabet.length])
    .join("");
}

async function main() {
  const [nom, email, motDePasseFourni, couleurFournie] = process.argv.slice(2);

  if (!nom || !email) {
    console.error(
      'Usage : npm run utilisateur -- "Prénom" email@agence.fr [motDePasse] [#couleur]',
    );
    process.exit(1);
  }

  const emailNormalise = email.toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalise)) {
    console.error(`Adresse email invalide : ${email}`);
    process.exit(1);
  }

  const motDePasse = motDePasseFourni || motDePasseAleatoire();
  if (motDePasse.length < 8) {
    console.error("Le mot de passe doit faire au moins 8 caractères.");
    process.exit(1);
  }

  const existant = await prisma.user.findUnique({ where: { email: emailNormalise } });
  const nombreComptes = await prisma.user.count();
  const couleur =
    couleurFournie || existant?.couleur || COULEURS[nombreComptes % COULEURS.length];

  const passwordHash = await hash(motDePasse, 10);

  await prisma.user.upsert({
    where: { email: emailNormalise },
    update: { nom, passwordHash, couleur },
    create: { nom, email: emailNormalise, passwordHash, couleur },
  });

  console.log("");
  console.log(existant ? "Compte mis à jour :" : "Compte créé :");
  console.log(`  Nom      ${nom}`);
  console.log(`  Email    ${emailNormalise}`);
  console.log(`  Couleur  ${couleur}`);
  if (!motDePasseFourni) {
    console.log("");
    console.log(`  Mot de passe : ${motDePasse}`);
    console.log("  (à transmettre à la personne — il ne sera plus affiché)");
  }
  console.log("");
}

main()
  .catch((erreur) => {
    console.error(erreur);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
