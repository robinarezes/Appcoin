# Mettre l'application en ligne

Quatre étapes, une quinzaine de minutes, un seul compte à créer (Vercel). La
base de données se crée depuis le tableau de bord Vercel : rien à copier d'un
service à l'autre.

Ce que vous n'avez **pas** à faire, contrairement à ce que demandent la plupart
des tutoriels : aucune commande de migration à lancer (elles s'appliquent
automatiquement à chaque déploiement), et aucun compte à créer en ligne de
commande (vous créerez le vôtre depuis le navigateur, à la première visite).

---

## Étape 1 — Importer le projet dans Vercel

1. Créez un compte sur [vercel.com](https://vercel.com) en vous connectant avec
   GitHub.
2. **Add New → Project**, choisissez le dépôt `Appcoin`.
3. Vercel reconnaît Next.js tout seul : **ne changez aucun réglage de build.**
4. **Ne cliquez pas encore sur Deploy** — il manque la base et le secret. Passez
   à l'étape 2 dans un autre onglet, ou déployez maintenant en sachant que le
   premier déploiement échouera (c'est sans conséquence, on redéploiera).

## Étape 2 — Créer la base de données

Toujours dans Vercel, ouvrez votre projet puis l'onglet **Storage**.

1. **Create Database** → choisissez **Postgres** (Neon).
2. Région : **Frankfurt** ou **Paris**, la plus proche de vous.
3. Nom : `atelier`. Validez.
4. Vercel propose de connecter la base au projet : **acceptez**, en cochant les
   trois environnements (Production, Preview, Development).

C'est tout. Vercel a créé la base et injecté les variables de connexion dans
votre projet — vous n'avez rien copié.

## Étape 3 — Ajouter deux variables

Onglet **Settings → Environment Variables** de votre projet.

**a) `AUTH_SECRET`** — le secret qui signe les cookies de connexion. Générez-le
sur votre machine :

```bash
npx auth secret
```

Copiez la longue chaîne affichée et créez la variable `AUTH_SECRET` avec cette
valeur, sur les trois environnements.

**b) `DIRECT_URL`** — la connexion directe, dont les migrations ont besoin.
Dans la liste des variables, vous devez déjà voir `DATABASE_URL` et
`DATABASE_URL_UNPOOLED`, créées par Vercel à l'étape 2. Créez `DIRECT_URL` en
lui donnant **la même valeur que `DATABASE_URL_UNPOOLED`**.

> Si `DATABASE_URL_UNPOOLED` n'apparaît pas dans la liste, donnez à `DIRECT_URL`
> la même valeur que `DATABASE_URL`. Cela fonctionne aussi.
>
> Pourquoi deux adresses ? `DATABASE_URL` passe par un répartiteur de
> connexions, ce qui permet à l'application d'encaisser beaucoup de visites
> courtes. Les migrations, elles, ont besoin de verrous que ce répartiteur ne
> transmet pas — d'où la connexion directe.

## Étape 4 — Déployer

Onglet **Deployments** → sur le dernier déploiement, menu **⋯** →
**Redeploy** (ou poussez n'importe quel commit sur GitHub, ce qui redéploie
aussi).

Le build applique les migrations tout seul et crée les neuf tables. Comptez deux
à trois minutes.

Vercel vous donne alors une adresse du type `appcoin.vercel.app`.

## Et maintenant : créer votre compte

Ouvrez votre adresse Vercel. Comme la base est vide, l'application affiche une
page **Bienvenue** : renseignez votre prénom, votre email, un mot de passe et
choisissez votre couleur. Vous êtes connecté directement.

**Cette page ne réapparaît plus jamais** : dès qu'un compte existe, elle renvoie
à l'écran de connexion. C'est ce qui remplace une page d'inscription publique —
personne d'autre ne peut se créer un accès.

Pour ajouter votre associé : cliquez sur **votre nom, en bas de la barre
latérale** (ou en haut sur téléphone), ce qui ouvre l'écran **Équipe**. La
section « Ajouter quelqu'un » génère un mot de passe solide, qu'il vous suffit de
lui transmettre. Le même écran permet de changer un mot de passe, de modifier
votre profil et votre couleur, ou de retirer un accès.

## Vérifier que tout va bien

- Une page au hasard (par exemple `/clients`) renvoie vers la connexion quand
  vous n'êtes pas identifié — testez en navigation privée.
- Une fiche client créée depuis un poste apparaît sur l'autre après
  rafraîchissement : les données sont bien partagées.
- Depuis un téléphone, le bouton **Appeler** de l'écran Prospection lance
  vraiment le composeur.

---

## Ce qu'il faut savoir pour la suite

**Chaque `git push` redéploie**, et applique au passage les éventuelles
nouvelles migrations. Si le build échoue, la version précédente reste en ligne :
un mauvais commit ne peut pas casser le site.

**Retirer un accès est immédiat.** L'écran Équipe désactive le compte plutôt que
de le supprimer : l'historique reste attribué à son auteur, et la personne est
déconnectée dès sa page suivante, sans attendre l'expiration de sa session.

**Travailler en local.** Le projet n'utilise plus SQLite : il vous faut les
variables de la base en ligne. Une commande les récupère toutes :

```bash
npx vercel env pull .env.local
```

Puis `npm run dev` comme d'habitude. **Attention** : vous travaillez alors sur
les vraies données. Pour un bac à sable, créez une seconde base dans Vercel
(**Storage → Create Database**) et mettez ses valeurs dans `.env.local`.

**Ne lancez jamais `npm run db:seed` sur la base de production** : il efface tout
avant de réinjecter le jeu de démonstration. La commande refuse maintenant de
s'exécuter si la base contient déjà des données, mais mieux vaut ne pas compter
uniquement là-dessus.

**Si vous perdez l'accès à tous les comptes**, un script de secours permet de
recréer ou de réinitialiser un compte depuis votre machine, avec les variables
de la base dans l'environnement :

```bash
npm run utilisateur -- "Robin" robin@agence.fr
```

**Sauvegardes.** Neon conserve un historique permettant de revenir en arrière
(quelques jours sur l'offre gratuite). Pour une sauvegarde que vous maîtrisez,
exportez de temps en temps :

```bash
pg_dump "VOTRE_DIRECT_URL" > sauvegarde-2026-07-29.sql
```

**Nom de domaine.** Dans Vercel, **Settings → Domains**, ajoutez par exemple
`crm.votre-agence.fr` et suivez les instructions DNS. Le certificat HTTPS est
automatique.

**Coût.** À deux ou trois utilisateurs, les offres gratuites suffisent
largement. Seul effet visible : après une longue inactivité, le premier
chargement de la journée peut prendre deux à trois secondes, le temps que la
base se réveille.

---

## En cas de problème

| Message | Cause et solution |
| --- | --- |
| `Environment variable not found: DIRECT_URL` pendant le build | La variable `DIRECT_URL` de l'étape 3b manque, ou n'a pas été cochée pour l'environnement Production. |
| `Environment variable not found: DATABASE_URL` | La base n'est pas connectée au projet. Onglet **Storage**, ouvrez la base, section **Projects**, connectez-la. |
| Une erreur de verrou pendant l'application des migrations | `DIRECT_URL` pointe sur la connexion mutualisée. Reprenez la valeur de `DATABASE_URL_UNPOOLED`. |
| La page **Bienvenue** ne s'affiche pas et la connexion échoue | Il existe déjà un compte. Utilisez le script de secours ci-dessus pour réinitialiser son mot de passe. |
| Après avoir changé une variable, rien ne change | Les variables sont lues au build : redéployez (**Deployments → ⋯ → Redeploy**). |
