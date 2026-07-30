import Link from "next/link";
import {
  AlarmClockIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  MessageSquareTextIcon,
  PhoneIcon,
} from "lucide-react";

import { EnTetePage } from "@/components/commun/en-tete-page";
import { SectionFiche } from "@/components/commun/section-fiche";
import { TuileStat } from "@/components/commun/tuile-stat";
import { PastilleUtilisateur } from "@/components/layout/pastille-utilisateur";
import { LigneRendezVous } from "@/components/rendez-vous/ligne-rendez-vous";
import { Button } from "@/components/ui/button";
import {
  aujourdHui,
  capitaliser,
  formatDate,
  formatDateHeure,
  formatDateLongue,
} from "@/lib/dates";
import { formatEuros } from "@/lib/format";
import {
  caDuMois,
  dernieresNotes,
  mesTachesDuJour,
  offresEnAttente,
  prospectsActifs,
  soldeEntreprise,
} from "@/lib/requetes/dashboard";
import { prochainsRendezVous } from "@/lib/requetes/rendez-vous";
import { utilisateurRequis } from "@/lib/session";

export default async function PageDashboard() {
  const utilisateur = await utilisateurRequis();

  const [rdv, taches, notes, ca, solde, prospects, offres] = await Promise.all([
    prochainsRendezVous(7),
    mesTachesDuJour(utilisateur.id),
    dernieresNotes(5),
    caDuMois(),
    soldeEntreprise(),
    prospectsActifs(),
    offresEnAttente(),
  ]);

  const totalTaches = taches.enRetard.length + taches.aujourdHui.length;

  return (
    <>
      <EnTetePage
        titre={`Bonjour ${utilisateur.nom}`}
        description={capitaliser(formatDateLongue(aujourdHui()))}
      >
        <Button variant="outline" render={<Link href="/prospection" />}>
          <PhoneIcon />
          Prospection
        </Button>
        <Button render={<Link href="/rendez-vous/nouveau" />}>
          <CalendarDaysIcon />
          Nouveau RDV
        </Button>
      </EnTetePage>

      {/* L'agenda et les tâches d'abord : c'est ce qu'on vient chercher le matin. */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionFiche
          titre="Agenda des 7 prochains jours"
          compte={rdv.length}
          action={
            <Button variant="ghost" size="sm" render={<Link href="/rendez-vous" />}>
              Calendrier
            </Button>
          }
          corpsClassName="p-0"
          className="lg:col-span-2"
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

        <SectionFiche
          titre="Mes tâches"
          compte={totalTaches}
          action={
            <Button variant="ghost" size="sm" render={<Link href="/taches?mien=1" />}>
              Kanban
            </Button>
          }
        >
          {totalTaches === 0 ? (
            <p className="flex items-center gap-2 py-1 text-sm text-muted-foreground">
              <CheckCircle2Icon className="size-4 text-emerald-600 dark:text-emerald-400" />
              Rien en retard ni pour aujourd&apos;hui.
            </p>
          ) : (
            <ul className="grid divide-y">
              {[...taches.enRetard, ...taches.aujourdHui].map((tache) => {
                const enRetard = taches.enRetard.includes(tache);
                return (
                  <li key={tache.id} className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0">
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

      <div className="mt-4">
        <SectionFiche titre="Dernières notes" compte={notes.length}>
          {notes.length === 0 ? (
            <p className="flex items-center gap-2 py-1 text-sm text-muted-foreground">
              <MessageSquareTextIcon className="size-4" />
              Les notes ajoutées aux fiches clients apparaîtront ici.
            </p>
          ) : (
            <ul className="grid gap-3">
              {notes.map((note) => (
                <li key={note.id} className="flex gap-3">
                  <PastilleUtilisateur utilisateur={note.auteur} className="size-7 text-[10px]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">
                      <Link
                        href={`/clients/${note.client.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {note.client.entreprise}
                      </Link>{" "}
                      · {note.auteur.nom} · {formatDateHeure(note.createdAt)}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-sm whitespace-pre-wrap">
                      {note.contenu}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionFiche>
      </div>

      {/* Les chiffres, visibles d'un coup d'œil mais sans voler la vedette. */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <TuileStat
          href="/ca"
          libelle="CA encaissé ce mois-ci"
          valeur={formatEuros(ca.actuelCents)}
          variation={ca.variation}
          precision={`${formatEuros(ca.precedentCents)} le mois dernier`}
        />
        <TuileStat
          href="/ca"
          libelle="Argent de l'entreprise"
          valeur={formatEuros(solde)}
          accent={solde < 0 ? "alerte" : "neutre"}
          precision="encaissements moins dépenses"
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
    </>
  );
}
