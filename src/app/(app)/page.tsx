import Link from "next/link";
import {
  CalendarDaysIcon,
  FileTextIcon,
  ListChecksIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import { EnTetePage } from "@/components/commun/en-tete-page";
import { aujourdHui, capitaliser, formatDateLongue, maintenant } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { utilisateurRequis } from "@/lib/session";

export default async function PageDashboard() {
  const utilisateur = await utilisateurRequis();

  // Version provisoire : le vrai tableau de bord (CA, impayés, graphiques)
  // arrive à l'étape 6. Ces compteurs valident déjà la chaîne Prisma → écran.
  const [clients, prospects, rdvAVenir, tachesOuvertes, offresEnCours] = await Promise.all([
    prisma.client.count(),
    prisma.client.count({ where: { statut: { in: ["PROSPECT", "EN_DISCUSSION"] } } }),
    prisma.rendezVous.count({
      where: { statut: "PREVU", dateDebut: { gte: maintenant() } },
    }),
    prisma.tache.count({ where: { statut: { not: "FAIT" } } }),
    prisma.offre.count({ where: { statut: "ENVOYEE" } }),
  ]);

  return (
    <>
      <EnTetePage
        titre={`Bonjour ${utilisateur.nom}`}
        description={capitaliser(formatDateLongue(aujourdHui()))}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Tuile
          href="/clients"
          Icone={UsersIcon}
          valeur={clients}
          libelle="clients et prospects"
          precision={`dont ${prospects} en prospection`}
        />
        <Tuile
          href="/rendez-vous"
          Icone={CalendarDaysIcon}
          valeur={rdvAVenir}
          libelle="rendez-vous à venir"
        />
        <Tuile
          href="/taches"
          Icone={ListChecksIcon}
          valeur={tachesOuvertes}
          libelle="tâches en cours"
        />
        <Tuile
          href="/offres"
          Icone={FileTextIcon}
          valeur={offresEnCours}
          libelle="offres en attente de réponse"
        />
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Le tableau de bord complet — chiffre d&apos;affaires, impayés, prochains
        rendez-vous et tâches du jour — arrive à la dernière étape.
      </p>
    </>
  );
}

function Tuile({
  href,
  Icone,
  valeur,
  libelle,
  precision,
}: {
  href: string;
  Icone: LucideIcon;
  valeur: number;
  libelle: string;
  precision?: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border bg-background p-4 transition-colors hover:border-foreground/20 hover:bg-accent/40"
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl font-semibold tabular-nums tracking-tight">{valeur}</span>
        <Icone className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{libelle}</p>
      {precision && <p className="mt-0.5 text-xs text-muted-foreground/80">{precision}</p>}
    </Link>
  );
}
