# Atelier — outil de gestion interne

Mini-CRM de l'agence : prospection téléphonique, clients, rendez-vous, tâches,
offres et suivi du chiffre d'affaires. Des comptes nominatifs, des données
partagées, pensé pour aller vite au quotidien plutôt que pour faire le tour de
toutes les fonctionnalités possibles.

**Pour mettre l'application en ligne et ouvrir les comptes de l'équipe, suivez
[DEPLOIEMENT.md](DEPLOIEMENT.md).**

## Les écrans

| Écran            | À quoi il sert                                                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**    | Agenda des 7 prochains jours, mes tâches, dernières notes, puis CA du mois et argent de l'entreprise                                 |
| **Prospection**  | Ajout ou import de boutiques + numéros, bouton d'appel, compte-rendu juste après, onglets à rappeler (avec heure) et potentiels      |
| **Clients**      | Recherche et filtres, modification et suppression depuis la liste, fiche avec coordonnées cliquables, journal et CA signé            |
| **Rendez-vous**  | Calendrier mensuel coloré par personne, vue liste, compte-rendu après coup                                                          |
| **Tâches**       | Kanban à trois colonnes, glisser-déposer, ajout en une ligne                                                                         |
| **Offres**       | Lignes avec totaux HT/TVA/TTC, statuts en un clic                                                                                    |
| **CA**           | Saisie simple des encaissements et dépenses, solde de l'entreprise, graphique mois par mois                                          |
| **Équipe**       | Ajouter un compte, changer un mot de passe, sa couleur, retirer ou rendre un accès                                                  |

## Démarrage

L'application tourne sur PostgreSQL. Le plus simple est de la déployer d'abord
(voir [DEPLOIEMENT.md](DEPLOIEMENT.md)), puis de récupérer les variables de
connexion pour travailler en local :

```bash
npm install
npx vercel env pull .env.local
npm run dev
```

Pour un bac à sable séparé des vraies données, créez une seconde base dans
Vercel et mettez ses valeurs dans `.env.local`, puis :

```bash
npm run db:migrate
npm run db:seed
```

L'application est disponible sur http://localhost:3000.

### Comptes de test (uniquement dans le jeu de démonstration)

| Email               | Mot de passe |
| ------------------- | ------------ |
| `robin@agence.fr`   | `demo1234`   |
| `camille@agence.fr` | `demo1234`   |

En production, il n'y a pas de seed : au premier lancement, l'application
affiche une page d'installation pour créer le premier compte, puis tout se passe
depuis l'écran **Équipe**.

`npm run db:seed` **efface la base** avant de réinjecter le jeu de démonstration.
Il refuse de s'exécuter si la base contient déjà des données — pour forcer,
`SEED_FORCE=1`.

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
| `npm run utilisateur`| Secours : recrée ou réinitialise un compte           |

### Ouvrir un compte à quelqu'un

Depuis l'application, écran **Équipe** (votre nom en bas de la barre latérale).
La section « Ajouter quelqu'un » génère un mot de passe solide qu'il suffit de
transmettre. Aucune inscription publique : c'est le seul chemin pour ouvrir un
accès.

Le script `npm run utilisateur -- "Léa" lea@agence.fr` reste là pour un seul cas :
si plus personne ne peut se connecter.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Prisma +
PostgreSQL · Auth.js v5 · Recharts · dnd-kit.

Les mutations passent par des Server Actions ; la seule route d'API est celle
d'Auth.js.

## Choix d'implémentation utiles à connaître

**Statuts en `String`, pas en `enum` Prisma.** Choix hérité du démarrage sur
SQLite, qui ne supporte pas les enums Prisma — et conservé depuis le passage à
PostgreSQL : ajouter un statut ne demande aucune migration. Les valeurs
autorisées (`PROSPECT`, `A_FAIRE`, `ACCEPTEE`…) sont centralisées dans
`src/lib/constantes.ts` avec leur libellé français et leur couleur de badge, et
validées par Zod avant écriture.

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
`src/app/(app)/layout.tsx` : elle revalide le compte en base à chaque requête,
de sorte que retirer un accès le coupe immédiatement au lieu d'attendre
l'expiration de la session.

**Pas d'inscription publique.** La page `/installation` n'existe que tant que la
base ne contient aucun compte ; elle crée le premier et se ferme définitivement.
Les suivants s'ajoutent depuis l'écran **Équipe**. Un accès se retire en
désactivant le compte (`User.actif`), pas en le supprimant : l'historique reste
attribué à son auteur.

**Prospection et clients ne font qu'un.** Une fiche créée depuis l'écran de
prospection est un `Client` au statut « prospect » : pas de carnet d'adresses
parallèle qu'il faudrait ensuite recopier. Un compte-rendu d'appel fait avancer
le statut du client, écrit une note dans son journal, et crée la tâche de rappel
quand une date est donnée.

## Déploiement

Voir **[DEPLOIEMENT.md](DEPLOIEMENT.md)** : quatre étapes sur Vercel, base
PostgreSQL créée depuis le tableau de bord, migrations appliquées
automatiquement à chaque déploiement.

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
