# Atelier — outil de gestion interne

Mini-CRM de l'agence : clients, rendez-vous, tâches, offres, factures et chiffre
d'affaires. Deux comptes, des données partagées, pensé pour aller vite au
quotidien plutôt que pour faire le tour de toutes les fonctionnalités possibles.

## Démarrage

```bash
npm install
cp .env.example .env      # puis ajuster AUTH_SECRET
npm run db:migrate        # crée la base SQLite et applique le schéma
npm run db:seed           # jeu de données de démonstration
npm run dev
```

L'application est disponible sur http://localhost:3000.

### Comptes de test (créés par le seed)

| Email               | Mot de passe |
| ------------------- | ------------ |
| `robin@agence.fr`   | `demo1234`   |
| `camille@agence.fr` | `demo1234`   |

Il n'y a pas d'inscription : les comptes se créent dans `prisma/seed.ts`.

## Commandes

| Commande             | Effet                                               |
| -------------------- | --------------------------------------------------- |
| `npm run dev`        | Serveur de développement                            |
| `npm run build`      | Build de production                                 |
| `npm start`          | Sert le build de production                         |
| `npm run lint`       | ESLint                                              |
| `npm run db:migrate` | Crée / applique une migration Prisma                |
| `npm run db:seed`    | Réinjecte le jeu de données de démonstration        |
| `npm run db:reset`   | Remet la base à zéro, rejoue migrations **et** seed |
| `npm run db:studio`  | Prisma Studio, pour inspecter la base               |

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Prisma
(SQLite en développement) · Auth.js v5 · Recharts · dnd-kit.

Les mutations passent par des Server Actions ; la seule route d'API est celle
d'Auth.js.

## Choix d'implémentation utiles à connaître

**Statuts en `String`, pas en `enum` Prisma.** SQLite ne supporte pas les enums
Prisma. Les valeurs autorisées (`PROSPECT`, `A_FAIRE`, `ACCEPTEE`…) sont
centralisées dans `src/lib/constantes.ts` avec leur libellé français et leur
couleur de badge, et validées par Zod avant écriture. Le schéma reste ainsi
directement compatible PostgreSQL.

**Montants en centimes.** Tous les champs monétaires sont des `Int` en centimes
(`montantHTCents`). Cela évite les arrondis flottants sur les calculs de TVA et
le type `Decimal` de Prisma, qui ne traverse pas la frontière Server → Client
Components. Le formatage est centralisé dans `src/lib/format.ts`
(`formatEuros(125050)` → `1 250,50 €`).

**Dates en « heure murale ».** Les dates sont écrites telles quelles dans le
champ UTC : un rendez-vous saisi à 09:00 est stocké 09:00Z et réaffiché 09:00,
quel que soit le fuseau du serveur ou du navigateur. On évite ainsi les
décalages d'heure d'été et les erreurs d'hydratation React. Toute l'arithmétique
et tout l'affichage passent par `src/lib/dates.ts`.

**Protection des pages.** `src/middleware.ts` ne fait qu'un pré-filtrage rapide
sur la présence du cookie de session (le runtime Edge n'a pas accès à la base).
La vérification qui fait foi est `utilisateurRequis()` dans
`src/app/(app)/layout.tsx`.

## Déploiement (Vercel + Neon)

1. Dans `prisma/schema.prisma`, passer `provider` de `sqlite` à `postgresql`.
2. Définir `DATABASE_URL` (chaîne Neon) et `AUTH_SECRET` dans les variables
   d'environnement Vercel.
3. `npx prisma migrate deploy` puis `npm run db:seed` une première fois pour
   créer les deux comptes.

## Structure

```
prisma/          schéma, migrations, seed
src/actions/     Server Actions, un fichier par domaine
src/app/(auth)/  page de connexion
src/app/(app)/   application (protégée par le layout)
src/components/  ui/ (shadcn), layout/, commun/, puis un dossier par domaine
src/lib/         prisma, auth, session, dates, format, constantes
```
