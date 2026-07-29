import Link from "next/link";
import { AlarmClockIcon, CalendarDaysIcon, CheckCircle2Icon, PhoneIcon } from "lucide-react";

import { EnTetePage } from "@/components/commun/en-tete-page";
import { SectionFiche } from "@/components/commun/section-fiche";
import { TuileStat } from "@/components/commun/tuile-stat";
import { GraphiqueCA } from "@/components/graphiques/graphique-ca";
import { LigneRendezVous } from "@/components/rendez-vous/ligne-rendez-vous";
import { Button } from "@/components/ui/button";
import { aujourdHui, capitaliser, formatDate, formatDateLongue } from "@/lib/dates";
import { formatEuros } from "@/lib/format";
import { caDouzeDerniersMois } from "@/lib/requetes/ca";
import {
  caDuMois,
  impayes,
  mesTachesDuJour,
  offresEnAttente,
  prospectsActifs,
} from "@/lib/requetes/dashboard";
import { prochainsRendezVous } from "@/lib/requetes/rendez-vous";
import { utilisateurRequis } from "@/lib/session";

export default async function PageDashboard() {
  const utilisateur = await utilisateurRequis();

  const [ca, dus, prospects, offres, douzeMois, rdv, taches] = await Promise.all([
    caDuMois(),
    impayes(),
    prospectsActifs(),
    offresEnAttente(),
    caDouzeDerniersMois(),
    prochainsRendezVous(7),
    mesTachesDuJour(utilisateur.id),
  ]);

  const totalTaches = taches.enRetard.length + taches.aujourdHui.length;

  return (
    <>
      <EnTetePage
        titre={`Bonjour ${utilisateur.nom}`}
        description={capitaliser(formatDateLongue(aujourdHui()))}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <TuileStat
          href="/ca"
          libelle="CA facturé ce mois-ci"
          valeur={formatEuros(ca.actuelCents)}
          variation={ca.variation}
          precision={`${formatEuros(ca.precedentCents)} le mois dernier`}
        />
        <TuileStat
          href="/factures"
          libelle="Factures impayées"
          valeur={formatEuros(dus.totalCents)}
          accent={dus.nombreEnRetard > 0 ? "alerte" : "neutre"}
          precision={
            dus.nombreEnRetard > 0
              ? `dont ${formatEuros(dus.enRetardCents)} en retard`
              : `${dus.nombre} facture${dus.nombre > 1 ? "s" : ""} en attente`
          }
        />
        <TuileStat
          href="/clients?statut=PROSPECT"
          libelle="Prospects actifs"
          valeur={String(prospects)}
          precision="prospects et discussions en cours"
        />
        <TuileStat
          href="/offres?statut=ENVOYEE"
          libelle="Offres en attente"
          valeur={String(offres.nombre)}
          precision={`${formatEuros(offres.montantCents)} HT en jeu`}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <SectionFiche titre="Chiffre d'affaires sur 12 mois" className="lg:col-span-2">
          <GraphiqueCA donnees={douzeMois} hauteur={260} />
        </SectionFiche>

        <SectionFiche
          titre="Prochains rendez-vous"
          compte={rdv.length}
          action={
            <Button variant="ghost" size="sm" render={<Link href="/rendez-vous" />}>
              Calendrier
            </Button>
          }
          corpsClassName="p-0"
        >
          {rdv.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              Rien de prévu dans les sept prochains jours.
            </p>
          ) : (
            <div className="divide-y">
              {rdv.map((r) => (
                <LigneRendezVous key={r.id} rdv={r} compact />
              ))}
            </div>
          )}
        </SectionFiche>
      </div>

      <div className="mt-4">
        <SectionFiche
          titre="Mes tâches"
          compte={totalTaches}
          action={
            <Button variant="ghost" size="sm" render={<Link href="/taches?mien=1" />}>
              Voir le kanban
            </Button>
          }
        >
          {totalTaches === 0 ? (
            <p className="flex items-center gap-2 py-1 text-sm text-muted-foreground">
              <CheckCircle2Icon className="size-4 text-emerald-600 dark:text-emerald-400" />
              Rien en retard ni pour aujourd&apos;hui. Bonne journée.
            </p>
          ) : (
            <ul className="grid divide-y">
              {[...taches.enRetard, ...taches.aujourdHui].map((tache) => {
                const enRetard = taches.enRetard.includes(tache);
                return (
                  <li
                    key={tache.id}
                    className="flex items-center gap-3 py-2 first:pt-0 last:pb-0"
                  >
                    <AlarmClockIcon
                      className={
                        enRetard
                          ? "size-4 shrink-0 text-rose-600 dark:text-rose-400"
                          : "size-4 shrink-0 text-muted-foreground"
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{tache.titre}</p>
                      {tache.client && (
                        <Link
                          href={`/clients/${tache.client.id}`}
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          {tache.client.entreprise}
                        </Link>
                      )}
                    </div>
                    <span
                      className={
                        enRetard
                          ? "shrink-0 text-xs font-medium tabular-nums text-rose-600 dark:text-rose-400"
                          : "shrink-0 text-xs tabular-nums text-muted-foreground"
                      }
                    >
                      {enRetard ? formatDate(tache.dateEcheance!) : "aujourd'hui"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionFiche>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Button variant="outline" size="lg" render={<Link href="/prospection" />}>
          <PhoneIcon />
          Passer des appels de prospection
        </Button>
        <Button variant="outline" size="lg" render={<Link href="/rendez-vous/nouveau" />}>
          <CalendarDaysIcon />
          Planifier un rendez-vous
        </Button>
      </div>
    </>
  );
}
