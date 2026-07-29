# Atelier — outil de gestion interne

Mini-CRM de l'agence : prospection téléphonique, clients, rendez-vous, tâches,
offres, factures et chiffre d'affaires. Des comptes nominatifs, des données
partagées, pensé pour aller vite au quotidien plutôt que pour faire le tour de
toutes les fonctionnalités possibles.

**Pour mettre l'application en ligne et ouvrir les comptes de l'équipe, suivez
[DEPLOIEMENT.md](DEPLOIEMENT.md).**

## Les écrans

| Écran            | À quoi il sert                                                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**    | CA du mois et variation, impayés, prospects actifs, offres en attente, graphique sur 12 mois, rendez-vous à 7 jours, mes tâches      |
| **Prospection**  | Ajout d'une boutique + numéro, bouton d'appel, compte-rendu juste après (rendez-vous pris, intéressé, à rappeler…) avec notes        |
| **Clients**      | Recherche et filtres, fiche avec coordonnées cliquables, journal, historique complet et CA généré                                    |
| **Rendez-vous**  | Calendrier mensuel coloré par personne, vue liste, compte-rendu après coup                                                          |
| **Tâches**       | Kanban à trois colonnes, glisser-déposer, ajout en une ligne                                                                         |
| **Offres**       | Lignes avec totaux HT/TVA/TTC, statuts, conversion en facture                                                                       |
| **Factures**     | Suivi des règlements et des retards                                                                                                 |
| **CA**           | Facturé vs encaissé par mois, top clients, secteurs, taux de transformation, impayés                                                |

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
| `npm run utilisateur`| Crée ou met à jour un compte (voir ci-dessous)      |

### Ouvrir un compte à quelqu'un

Il n'y a pas d'inscription publique : c'est un outil interne, les comptes se
créent en ligne de commande.

```bash
npm run utilisateur -- "Léa" lea@agence.fr
```

Un mot de passe solide est tiré au sort et affiché une seule fois. Pour le
changer plus tard, relancez la même commande avec le même email en ajoutant le
nouveau mot de passe. Pour créer un compte sur la base en ligne, voir
[DEPLOIEMENT.md](DEPLOIEMENT.md).

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

**Prospection et clients ne font qu'un.** Une fiche créée depuis l'écran de
prospection est un `Client` au statut « prospect » : pas de carnet d'adresses
parallèle qu'il faudrait ensuite recopier. Un compte-rendu d'appel fait avancer
le statut du client, écrit une note dans son journal, et crée la tâche de rappel
quand une date est donnée.

## Déploiement

Voir **[DEPLOIEMENT.md](DEPLOIEMENT.md)** : Vercel + Neon, variables
d'environnement, migration vers PostgreSQL et création des comptes de l'équipe,
étape par étape.

## Structure

```
prisma/            schéma, migrations, seed
scripts/           création de comptes
src/actions/       Server Actions, un fichier par domaine
src/app/(auth)/    page de connexion
src/app/(app)/     application (protégée par le layout)
src/components/    ui/ (shadcn), layout/, commun/, puis un dossier par domaine
src/lib/           prisma, auth, session, dates, format, constantes, métier
src/lib/requetes/  lectures réutilisables (clients, tâches, CA, prospection…)
```
