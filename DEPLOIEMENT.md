# Mettre l'application en ligne

Objectif : que l'application tourne sur un vrai serveur, avec une vraie base de
données, et que chaque membre de l'équipe ait son compte.

Hébergement retenu : **Vercel** (gratuit pour cet usage) + **Neon** (base
PostgreSQL, gratuit jusqu'à 0,5 Go — largement suffisant). Comptez trente à
quarante minutes la première fois.

> **Pourquoi changer de base ?** En développement, les données sont dans un
> fichier `prisma/dev.db` (SQLite). Sur Vercel, le disque est remis à zéro à
> chaque déploiement : le fichier serait effacé. Il faut donc une base
> PostgreSQL hébergée, et c'est ce que fait Neon.

---

## Étape 1 — Mettre le code sur GitHub

```bash
git remote add origin https://github.com/VOTRE-COMPTE/atelier-crm.git
git push -u origin master
```

Créez le dépôt **en privé** : il contient vos données clients et votre logique
de facturation.

Le fichier `.env` n'est pas envoyé (il est dans `.gitignore`) — c'est voulu,
les secrets se configurent directement chez Vercel.

## Étape 2 — Créer la base de données Neon

1. Créez un compte sur [neon.tech](https://neon.tech) (connexion possible avec GitHub).
2. **Create project** → nommez-le `atelier`, choisissez la région **Europe
   (Frankfurt)** : c'est la plus proche, donc la plus rapide depuis la France.
3. Neon affiche une **chaîne de connexion** de la forme :

   ```
   postgresql://utilisateur:motdepasse@ep-xxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

   Copiez-la, gardez-la sous la main : c'est votre `DATABASE_URL`.

## Étape 3 — Basculer le schéma sur PostgreSQL

Dans `prisma/schema.prisma`, remplacez :

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

par :

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Les migrations existantes ont été écrites pour SQLite : elles ne sont pas
rejouables sur PostgreSQL. On repart donc d'une migration initiale propre,
générée directement contre Neon :

```bash
rm -rf prisma/migrations
```

Puis, avec la chaîne Neon dans l'environnement :

```bash
DATABASE_URL="postgresql://…votre chaîne Neon…" npx prisma migrate dev --name init
```

Sous Windows (PowerShell) :

```powershell
$env:DATABASE_URL="postgresql://…votre chaîne Neon…"; npx prisma migrate dev --name init
```

Cette commande crée toutes les tables dans Neon et enregistre la migration dans
`prisma/migrations`, qu'il faut commiter :

```bash
git add -A; git commit -m "Passage à PostgreSQL"; git push
```

> **Attention** : à partir de là, votre base locale n'est plus SQLite. Pour
> continuer à développer sans toucher aux données réelles, créez une seconde
> base Neon (« atelier-dev ») et mettez sa chaîne dans votre `.env` local.

## Étape 4 — Générer le secret de session

```bash
npx auth secret
```

Cette commande affiche une longue chaîne aléatoire. C'est votre `AUTH_SECRET` :
elle sert à signer les cookies de connexion. **Ne réutilisez pas celui du
fichier `.env` de développement.**

## Étape 5 — Déployer sur Vercel

1. Créez un compte sur [vercel.com](https://vercel.com) avec GitHub.
2. **Add New → Project**, sélectionnez votre dépôt. Vercel reconnaît Next.js
   tout seul, ne changez aucun réglage de build.
3. Avant de cliquer sur **Deploy**, dépliez **Environment Variables** et
   ajoutez :

   | Nom            | Valeur                                    |
   | -------------- | ----------------------------------------- |
   | `DATABASE_URL` | la chaîne de connexion Neon de l'étape 2   |
   | `AUTH_SECRET`  | la chaîne générée à l'étape 4              |

   Cochez les trois environnements (Production, Preview, Development).

4. **Deploy**. Comptez deux à trois minutes.

Vercel vous donne une adresse du type `atelier-crm.vercel.app`. Elle fonctionne
immédiatement — mais la base est encore vide, personne ne peut se connecter.

## Étape 6 — Créer vos comptes

Les comptes se créent en ligne de commande, depuis votre machine, en visant la
base de production. Il n'y a volontairement **pas de page d'inscription** :
c'est un outil interne, on ne veut pas qu'un inconnu qui tombe sur l'adresse
puisse se créer un accès.

Placez la chaîne Neon dans l'environnement, puis lancez une fois par personne :

```bash
DATABASE_URL="postgresql://…votre chaîne Neon…" npm run utilisateur -- "Robin" robin@agence.fr
```

Sous Windows (PowerShell) :

```powershell
$env:DATABASE_URL="postgresql://…votre chaîne Neon…"; npm run utilisateur -- "Robin" robin@agence.fr
```

La commande affiche un mot de passe tiré au sort, **une seule fois** :
transmettez-le à la personne concernée. Recommencez pour chaque associé :

```bash
npm run utilisateur -- "Camille" camille@agence.fr
npm run utilisateur -- "Léa" lea@agence.fr
```

Chaque personne reçoit automatiquement sa couleur, celle qui l'identifie dans le
calendrier partagé.

**Pour changer un mot de passe plus tard**, relancez la même commande avec le
même email en ajoutant le nouveau mot de passe :

```bash
npm run utilisateur -- "Robin" robin@agence.fr nouveauMotDePasse
```

## Étape 7 — Vérifier

Ouvrez votre adresse Vercel et vérifiez dans l'ordre :

- une page au hasard (par exemple `/clients`) renvoie bien vers la connexion ;
- la connexion fonctionne avec l'un des comptes créés ;
- une fiche client créée depuis un poste apparaît sur l'autre après
  rafraîchissement — c'est la preuve que les données sont bien partagées ;
- depuis un téléphone, le bouton **Appeler** de l'écran Prospection lance
  vraiment le composeur.

---

## Ce qu'il faut savoir pour la suite

**Chaque `git push` redéploie.** Vercel reconstruit et met en ligne
automatiquement à chaque envoi sur la branche principale. Si le build échoue, la
version précédente reste en ligne : vous ne pouvez pas casser le site en
production par un mauvais commit.

**Les modifications de schéma se déploient à la main.** Si vous ajoutez un champ
dans `prisma/schema.prisma`, lancez avant de pousser :

```bash
DATABASE_URL="…chaîne Neon…" npx prisma migrate deploy
```

**Sauvegardes.** Neon garde un historique permettant de revenir en arrière (7
jours sur l'offre gratuite). Pour une sauvegarde que vous maîtrisez, exportez de
temps en temps :

```bash
pg_dump "postgresql://…chaîne Neon…" > sauvegarde-$(date +%F).sql
```

**Nom de domaine.** Dans Vercel, **Settings → Domains**, ajoutez par exemple
`crm.votre-agence.fr` et suivez les instructions DNS. Le certificat HTTPS est
automatique.

**Identifiants de démonstration.** Le rappel des comptes de test affiché sous le
formulaire de connexion ne s'affiche qu'en développement (`NODE_ENV`) : il
n'apparaîtra pas sur le site en ligne.

**Coût.** Tant que vous restez à deux ou trois utilisateurs, les offres
gratuites de Vercel et Neon suffisent. Le point de vigilance côté Neon est la
mise en veille de la base après inactivité : le premier chargement de la journée
peut prendre deux à trois secondes.
