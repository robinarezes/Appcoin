# Mettre l'application en ligne (Vercel + Supabase)

Objectif : que l'application tourne sur un vrai serveur, avec une vraie base de
données, et que chaque membre de l'équipe ait son compte.

Hébergement : **Vercel** pour l'application (gratuit pour cet usage) et
**Supabase** pour la base PostgreSQL (gratuit jusqu'à 500 Mo — très largement
suffisant). Comptez trois quarts d'heure la première fois.

> **Pourquoi changer de base ?** En développement, les données sont dans un
> fichier `prisma/dev.db` (SQLite). Sur Vercel, le disque est remis à zéro à
> chaque déploiement : le fichier serait effacé. Il faut donc une base
> PostgreSQL hébergée, et c'est ce que fait Supabase.

**Deux choses à savoir avant de commencer**, elles expliquent les étapes 3 et 6 :

- Supabase fournit **deux adresses de connexion** à la même base. L'application
  utilise le *pooler* (il encaisse les connexions courtes et nombreuses de
  Vercel) ; les migrations utilisent la connexion *directe* (elles ont besoin de
  verrous que le pooler ne sait pas transmettre). Prisma gère les deux, à
  condition qu'on les lui déclare.
- Supabase publie par défaut une **API REST** sur les tables du schéma `public`.
  Vos tables clients et factures seraient lisibles par toute personne
  connaissant l'adresse du projet. On ferme cet accès à l'étape 6 : **ne sautez
  pas cette étape.**

---

## Étape 1 — Mettre le code sur GitHub

```bash
git remote add origin https://github.com/VOTRE-COMPTE/atelier-crm.git
git push -u origin master
```

Créez le dépôt **en privé** : il contient votre logique de facturation.

Le fichier `.env` n'est pas envoyé (il est dans `.gitignore`) — c'est voulu, les
secrets se configurent directement chez Vercel.

## Étape 2 — Créer le projet Supabase

1. Créez un compte sur [supabase.com](https://supabase.com) (connexion possible
   avec GitHub), puis **New project**.
2. Renseignez :
   - **Name** : `atelier`
   - **Database Password** : cliquez sur *Generate a password* et **copiez-le
     immédiatement dans votre gestionnaire de mots de passe**. Il n'est plus
     jamais affiché (il reste réinitialisable dans *Settings → Database*).
   - **Region** : `Europe (Paris)` ou `Europe (Frankfurt)` — la plus proche de
     vous, donc la plus rapide.
3. **Create new project**, puis patientez une à deux minutes pendant la création.

## Étape 3 — Récupérer les deux chaînes de connexion

En haut de la page du projet, cliquez sur **Connect**. Une fenêtre propose
plusieurs modes ; il vous en faut deux, et il faut y insérer le mot de passe de
l'étape 2 à la place de `[YOUR-PASSWORD]`.

**a) Transaction pooler** — c'est ce qu'utilisera l'application. Port **6543** :

```
postgresql://postgres.abcdefgh:MOTDEPASSE@aws-0-eu-west-3.pooler.supabase.com:6543/postgres
```

Ajoutez à la fin `?pgbouncer=true&connection_limit=1`, ce qui donne la valeur
finale de **`DATABASE_URL`** :

```
postgresql://postgres.abcdefgh:MOTDEPASSE@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

*Ces deux paramètres disent à Prisma qu'il parle à un pooler : il désactive les
requêtes préparées, incompatibles avec ce mode, et n'ouvre qu'une connexion par
instance — sans quoi Vercel épuiserait le quota de connexions.*

**b) Session pooler** — c'est ce qu'utiliseront les migrations. Même hôte,
port **5432**. C'est la valeur de **`DIRECT_URL`** :

```
postgresql://postgres.abcdefgh:MOTDEPASSE@aws-0-eu-west-3.pooler.supabase.com:5432/postgres
```

> Supabase propose aussi une « Direct connection » sur `db.xxxx.supabase.co`.
> Elle n'est joignable qu'en IPv6, ce que ni Vercel ni la plupart des connexions
> internet françaises ne gèrent. **Utilisez les deux adresses en
> `pooler.supabase.com` ci-dessus**, elles fonctionnent partout.

Notez les deux chaînes de côté, on s'en sert aux étapes 4, 5, 7 et 8.

## Étape 4 — Basculer le schéma sur PostgreSQL

Dans `prisma/schema.prisma`, remplacez le bloc `datasource` par :

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL") // pooler : l'application
  directUrl = env("DIRECT_URL")   // connexion de session : les migrations
}
```

`directUrl` est la ligne qui compte : sans elle, `prisma migrate` passerait par
le pooler et échouerait avec une erreur de verrou.

Les migrations existantes ont été écrites pour SQLite, elles ne sont pas
rejouables sur PostgreSQL. On repart d'une migration initiale propre, générée
directement contre Supabase :

```bash
rm -rf prisma/migrations
```

Sous Windows (PowerShell), placez les deux chaînes dans l'environnement puis
générez la migration :

```powershell
$env:DATABASE_URL="postgresql://…transaction pooler 6543…"
$env:DIRECT_URL="postgresql://…session pooler 5432…"
npx prisma migrate dev --name init
```

Sous macOS ou Linux :

```bash
export DATABASE_URL="postgresql://…transaction pooler 6543…"
export DIRECT_URL="postgresql://…session pooler 5432…"
npx prisma migrate dev --name init
```

La commande crée toutes les tables dans Supabase. Vérifiez dans le **Table
Editor** de Supabase que `Client`, `Facture`, `Offre`, `Appel`… sont bien là.

Commitez la nouvelle migration :

```bash
git add -A
git commit -m "Passage a PostgreSQL (Supabase)"
git push
```

> **Pour continuer à développer sans toucher aux données réelles**, créez un
> second projet Supabase (`atelier-dev`) et mettez ses deux chaînes dans votre
> `.env` local. Votre base locale n'est plus SQLite à partir d'ici.

## Étape 5 — Générer le secret de session

```bash
npx auth secret
```

Cette commande affiche une longue chaîne aléatoire. C'est votre `AUTH_SECRET` :
elle sert à signer les cookies de connexion. **N'utilisez pas celui du fichier
`.env` de développement.**

## Étape 6 — Fermer l'API publique de Supabase (important)

Par défaut, Supabase expose les tables du schéma `public` via une API REST
accessible avec la clé « anon », qui est publique par conception. Vos fiches
clients et vos factures seraient lisibles depuis l'extérieur. Notre application
n'utilise pas cette API — elle parle à PostgreSQL directement, via Prisma — donc
on peut la fermer sans rien casser.

**Solution recommandée**, dans *Settings → API* (ou *Settings → Data API* selon
la version) : **désactiver la Data API**. C'est le plus net et il n'y a rien à
maintenir.

Si l'option n'apparaît pas dans votre interface, activez la sécurité au niveau
des lignes sur toutes les tables. Allez dans **SQL Editor** et exécutez :

```sql
alter table "User"       enable row level security;
alter table "Client"     enable row level security;
alter table "Note"       enable row level security;
alter table "RendezVous" enable row level security;
alter table "Tache"      enable row level security;
alter table "Offre"      enable row level security;
alter table "LigneOffre" enable row level security;
alter table "Facture"    enable row level security;
alter table "Appel"      enable row level security;
```

Sans aucune politique définie, la sécurité au niveau des lignes refuse tout :
l'API publique ne renvoie plus rien. L'application, elle, se connecte avec le
rôle `postgres`, qui n'est pas soumis à cette restriction — elle continue de
fonctionner normalement.

**Si vous ajoutez des tables plus tard**, répétez la commande pour chacune.

## Étape 7 — Déployer sur Vercel

1. Créez un compte sur [vercel.com](https://vercel.com) avec GitHub.
2. **Add New → Project**, sélectionnez votre dépôt. Vercel reconnaît Next.js
   tout seul, ne changez aucun réglage de build.
3. Avant de cliquer sur **Deploy**, dépliez **Environment Variables** et
   ajoutez les trois lignes :

   | Nom            | Valeur                                                  |
   | -------------- | ------------------------------------------------------- |
   | `DATABASE_URL` | transaction pooler, port 6543, avec `?pgbouncer=true&connection_limit=1` |
   | `DIRECT_URL`   | session pooler, port 5432                               |
   | `AUTH_SECRET`  | la chaîne générée à l'étape 5                           |

   Cochez les trois environnements (Production, Preview, Development).

4. **Deploy**. Comptez deux à trois minutes.

Vercel vous donne une adresse du type `atelier-crm.vercel.app`. Elle fonctionne
immédiatement — mais la base est encore vide, personne ne peut se connecter.

## Étape 8 — Créer vos comptes

Les comptes se créent en ligne de commande, depuis votre machine, en visant la
base de production. Il n'y a volontairement **pas de page d'inscription** : c'est
un outil interne, on ne veut pas qu'un inconnu tombant sur l'adresse puisse se
créer un accès.

Avec les deux chaînes toujours dans votre environnement (étape 4), lancez une
commande par personne :

```bash
npm run utilisateur -- "Robin" robin@agence.fr
npm run utilisateur -- "Camille" camille@agence.fr
npm run utilisateur -- "Lea" lea@agence.fr
```

Chaque commande affiche un mot de passe tiré au sort, **une seule fois** :
transmettez-le à la personne concernée. Chacun reçoit automatiquement sa
couleur, celle qui l'identifie dans le calendrier partagé.

**Pour changer un mot de passe plus tard**, relancez la même commande avec le
même email en ajoutant le nouveau mot de passe :

```bash
npm run utilisateur -- "Robin" robin@agence.fr nouveauMotDePasse
```

## Étape 9 — Vérifier

Ouvrez votre adresse Vercel et vérifiez dans l'ordre :

- une page au hasard (par exemple `/clients`) renvoie bien vers la connexion ;
- la connexion fonctionne avec l'un des comptes créés ;
- une fiche client créée depuis un poste apparaît sur l'autre après
  rafraîchissement — c'est la preuve que les données sont bien partagées ;
- depuis un téléphone, le bouton **Appeler** de l'écran Prospection lance
  vraiment le composeur ;
- l'API publique est bien fermée. Dans un onglet privé, ouvrez :

  ```
  https://VOTRE-REF.supabase.co/rest/v1/Client?apikey=VOTRE_CLE_ANON
  ```

  Vous devez obtenir une erreur ou une liste vide — **jamais vos clients**. Si
  vous voyez vos données, reprenez l'étape 6.

---

## Ce qu'il faut savoir pour la suite

**Chaque `git push` redéploie.** Vercel reconstruit et met en ligne
automatiquement à chaque envoi sur la branche principale. Si le build échoue, la
version précédente reste en ligne : un mauvais commit ne peut pas casser le site
en production.

**Les modifications de schéma se déploient à la main.** Si vous ajoutez un champ
dans `prisma/schema.prisma`, lancez avant de pousser, avec les deux variables
dans l'environnement :

```bash
npx prisma migrate deploy
```

Puis pensez à activer la sécurité au niveau des lignes sur toute nouvelle table
(étape 6).

**Mise en veille.** Sur l'offre gratuite, Supabase met le projet en pause après
une semaine sans aucune activité ; il faut alors le réactiver depuis le tableau
de bord. À raison d'un usage quotidien, cela n'arrivera pas.

**Sauvegardes.** L'offre gratuite ne fait pas de sauvegarde automatique
récupérable : prenez l'habitude d'exporter de temps en temps.

```bash
pg_dump "postgresql://…session pooler 5432…" > sauvegarde-2026-07-29.sql
```

Supabase propose aussi un export depuis *Database → Backups* sur les offres
payantes.

**Inspecter les données.** Le **Table Editor** de Supabase permet de regarder et
corriger une ligne à la main en cas de besoin — pratique, mais évitez d'y
modifier les montants ou les statuts : passez par l'application, qui tient les
totaux et les dates à jour.

**Nom de domaine.** Dans Vercel, **Settings → Domains**, ajoutez par exemple
`crm.votre-agence.fr` et suivez les instructions DNS. Le certificat HTTPS est
automatique.

**Identifiants de démonstration.** Le rappel des comptes de test affiché sous le
formulaire de connexion ne s'affiche qu'en développement : il n'apparaîtra pas
sur le site en ligne.

**Coût.** À deux ou trois utilisateurs, les offres gratuites de Vercel et
Supabase suffisent largement.

---

## En cas de problème

| Message | Cause et solution |
| --- | --- |
| `Can't reach database server` pendant la migration | Vous utilisez la « Direct connection » en `db.xxxx.supabase.co`, joignable seulement en IPv6. Reprenez les adresses en `pooler.supabase.com` (étape 3). |
| `prepared statement "s0" already exists` | `?pgbouncer=true` manque à la fin de `DATABASE_URL`. |
| `Error: ERROR: cannot insert multiple commands` ou une erreur de verrou pendant `migrate` | `DIRECT_URL` est absent, ou pointe sur le port 6543 au lieu de 5432. |
| `Too many connections` | `connection_limit=1` manque à la fin de `DATABASE_URL`. |
| `Tenant or user not found` | L'identifiant du pooler est `postgres.VOTRE-REF`, pas `postgres`. Recopiez la chaîne depuis le bouton **Connect**. |
| La connexion échoue avec le bon mot de passe | Un caractère spécial du mot de passe doit être encodé dans l'URL (`@` devient `%40`, `#` devient `%23`). Le plus simple : réinitialiser le mot de passe en n'utilisant que des lettres et des chiffres. |
