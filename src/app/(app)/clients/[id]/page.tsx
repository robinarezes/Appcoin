import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  ExternalLinkIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
} from "lucide-react";

import { supprimerClient } from "@/actions/clients";
import { AjoutNote } from "@/components/clients/ajout-note";
import { BadgeStatut } from "@/components/commun/badge-statut";
import { ConfirmationSuppression } from "@/components/commun/confirmation-suppression";
import { LienEmail, LienTelephone } from "@/components/commun/liens-contact";
import { LigneVide, SectionFiche } from "@/components/commun/section-fiche";
import { PastilleUtilisateur } from "@/components/layout/pastille-utilisateur";
import { Button } from "@/components/ui/button";
import {
  PRIORITES_TACHE,
  RESULTATS_APPEL,
  SOURCES_CLIENT,
  STATUTS_CLIENT,
  STATUTS_FACTURE,
  STATUTS_OFFRE,
  STATUTS_RDV,
  STATUTS_TACHE,
} from "@/lib/constantes";
import { formatDate, formatDateHeure, formatDateLongue, maintenant } from "@/lib/dates";
import { formatEuros } from "@/lib/format";
import { statutFacture } from "@/lib/metier";
import { ficheClient } from "@/lib/requetes/clients";
import { utilisateurRequis } from "@/lib/session";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fiche = await ficheClient(id);
  return { title: fiche?.client.entreprise ?? "Client" };
}

export default async function PageFicheClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await utilisateurRequis();
  const { id } = await params;

  const fiche = await ficheClient(id);
  if (!fiche) notFound();

  const { client, caEncaisseCents, caFactureCents, montantDuCents } = fiche;
  const maintenantDate = maintenant();

  const rdvAVenir = client.rendezVous.filter(
    (r) => r.dateDebut >= maintenantDate && r.statut === "PREVU",
  );
  const rdvPasses = client.rendezVous.filter(
    (r) => r.dateDebut < maintenantDate || r.statut !== "PREVU",
  );
  const tachesOuvertes = client.taches.filter((t) => t.statut !== "FAIT");

  return (
    <>
      <Link
        href="/clients"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Retour aux clients
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {client.entreprise}
            </h1>
            <BadgeStatut map={STATUTS_CLIENT} valeur={client.statut} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {[client.nomContact, client.secteur, client.ville].filter(Boolean).join(" · ") ||
              "Aucune précision"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {client.telephone && (
            <Button render={<a href={`tel:${client.telephone.replace(/\s/g, "")}`} />}>
              <PhoneIcon />
              Appeler
            </Button>
          )}
          <Button variant="outline" render={<Link href={`/clients/${client.id}/modifier`} />}>
            <PencilIcon />
            Modifier
          </Button>
          <ConfirmationSuppression
            action={supprimerClient.bind(null, client.id)}
            titre={`Supprimer ${client.entreprise} ?`}
            description="La fiche, son journal, ses offres, ses factures et ses appels seront supprimés définitivement. Les rendez-vous et les tâches seront conservés mais détachés du client."
            iconeSeule
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Colonne latérale */}
        <div className="grid content-start gap-4">
          <SectionFiche titre="Coordonnées">
            <dl className="grid gap-2.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Téléphone</dt>
                <dd className="text-right">
                  <LienTelephone numero={client.telephone} />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="shrink-0 text-muted-foreground">Email</dt>
                <dd className="min-w-0 text-right">
                  <LienEmail email={client.email} />
                </dd>
              </div>
              {(client.adresse || client.ville) && (
                <div className="flex items-start justify-between gap-3">
                  <dt className="shrink-0 text-muted-foreground">Adresse</dt>
                  <dd className="text-right">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        [client.adresse, client.ville].filter(Boolean).join(" "),
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 hover:underline"
                    >
                      <MapPinIcon className="size-3.5 shrink-0 text-muted-foreground" />
                      <span>{[client.adresse, client.ville].filter(Boolean).join(", ")}</span>
                    </a>
                  </dd>
                </div>
              )}
              {client.siteWebActuel && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="shrink-0 text-muted-foreground">Site actuel</dt>
                  <dd className="min-w-0 text-right">
                    <a
                      href={client.siteWebActuel}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-w-0 items-center gap-1.5 hover:underline"
                    >
                      <span className="truncate">
                        {client.siteWebActuel.replace(/^https?:\/\//, "")}
                      </span>
                      <ExternalLinkIcon className="size-3.5 shrink-0 text-muted-foreground" />
                    </a>
                  </dd>
                </div>
              )}
              {client.source && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Source</dt>
                  <dd>
                    {SOURCES_CLIENT[client.source as keyof typeof SOURCES_CLIENT] ??
                      client.source}
                  </dd>
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Client depuis</dt>
                <dd>{formatDate(client.createdAt)}</dd>
              </div>
            </dl>
          </SectionFiche>

          <SectionFiche titre="Chiffre d'affaires">
            <dl className="grid gap-2.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Encaissé (HT)</dt>
                <dd className="text-base font-semibold tabular-nums">
                  {formatEuros(caEncaisseCents)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Facturé (HT)</dt>
                <dd className="tabular-nums">{formatEuros(caFactureCents)}</dd>
              </div>
              {montantDuCents > 0 && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Reste dû (TTC)</dt>
                  <dd className="font-medium tabular-nums text-amber-700 dark:text-amber-400">
                    {formatEuros(montantDuCents)}
                  </dd>
                </div>
              )}
            </dl>
          </SectionFiche>

          {client.notes && (
            <SectionFiche titre="Bloc-notes">
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">{client.notes}</p>
            </SectionFiche>
          )}
        </div>

        {/* Colonne principale */}
        <div className="grid content-start gap-4 lg:col-span-2">
          <SectionFiche titre="Journal" compte={client.journal.length}>
            <AjoutNote clientId={client.id} />

            {client.journal.length > 0 && (
              <ul className="mt-5 grid gap-4 border-t pt-4">
                {client.journal.map((note) => (
                  <li key={note.id} className="flex gap-3">
                    <PastilleUtilisateur utilisateur={note.auteur} className="size-7 text-[10px]" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">
                        {note.auteur.nom} · {formatDateHeure(note.createdAt)}
                      </p>
                      <p className="mt-0.5 text-sm whitespace-pre-wrap">{note.contenu}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionFiche>

          <SectionFiche
            titre="Rendez-vous"
            compte={client.rendezVous.length}
            action={
              <Button
                variant="ghost"
                size="sm"
                render={<Link href={`/rendez-vous/nouveau?client=${client.id}`} />}
              >
                <PlusIcon />
                Planifier
              </Button>
            }
          >
            {client.rendezVous.length === 0 ? (
              <LigneVide texte="Aucun rendez-vous avec ce client." />
            ) : (
              <ul className="grid divide-y">
                {[...rdvAVenir, ...rdvPasses].slice(0, 8).map((rdv) => (
                  <li key={rdv.id} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                    <PastilleUtilisateur
                      utilisateur={rdv.participant}
                      className="size-7 text-[10px]"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/rendez-vous/${rdv.id}`}
                        className="truncate text-sm font-medium hover:underline"
                      >
                        {rdv.titre}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {formatDateHeure(rdv.dateDebut)}
                        {rdv.lieu ? ` · ${rdv.lieu}` : ""}
                      </p>
                    </div>
                    <BadgeStatut map={STATUTS_RDV} valeur={rdv.statut} />
                  </li>
                ))}
              </ul>
            )}
          </SectionFiche>

          <SectionFiche
            titre="Tâches"
            compte={tachesOuvertes.length}
            action={
              <Button variant="ghost" size="sm" render={<Link href={`/taches?client=${client.id}`} />}>
                Voir tout
              </Button>
            }
          >
            {client.taches.length === 0 ? (
              <LigneVide texte="Aucune tâche rattachée à ce client." />
            ) : (
              <ul className="grid divide-y">
                {client.taches.slice(0, 8).map((tache) => (
                  <li key={tache.id} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p
                        className={
                          tache.statut === "FAIT"
                            ? "truncate text-sm text-muted-foreground line-through"
                            : "truncate text-sm"
                        }
                      >
                        {tache.titre}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tache.assignee.nom}
                        {tache.dateEcheance ? ` · ${formatDate(tache.dateEcheance)}` : ""}
                      </p>
                    </div>
                    <BadgeStatut map={PRIORITES_TACHE} valeur={tache.priorite} />
                    <BadgeStatut map={STATUTS_TACHE} valeur={tache.statut} />
                  </li>
                ))}
              </ul>
            )}
          </SectionFiche>

          <SectionFiche
            titre="Offres"
            compte={client.offres.length}
            action={
              <Button
                variant="ghost"
                size="sm"
                render={<Link href={`/offres/nouvelle?client=${client.id}`} />}
              >
                <PlusIcon />
                Nouvelle offre
              </Button>
            }
          >
            {client.offres.length === 0 ? (
              <LigneVide texte="Aucune offre pour ce client." />
            ) : (
              <ul className="grid divide-y">
                {client.offres.map((offre) => (
                  <li key={offre.id} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/offres/${offre.id}`}
                        className="truncate text-sm font-medium hover:underline"
                      >
                        {offre.titre}
                      </Link>
                      <p className="font-mono text-xs text-muted-foreground">{offre.numero}</p>
                    </div>
                    <span className="tabular-nums text-sm">
                      {formatEuros(offre.montantHTCents)}
                    </span>
                    <BadgeStatut map={STATUTS_OFFRE} valeur={offre.statut} />
                  </li>
                ))}
              </ul>
            )}
          </SectionFiche>

          <SectionFiche titre="Factures" compte={client.factures.length}>
            {client.factures.length === 0 ? (
              <LigneVide texte="Aucune facture pour ce client." />
            ) : (
              <ul className="grid divide-y">
                {client.factures.map((facture) => (
                  <li
                    key={facture.id}
                    className="flex items-center gap-3 py-2 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-sm">{facture.numero}</p>
                      <p className="text-xs text-muted-foreground">
                        Émise le {formatDate(facture.dateEmission)} · échéance{" "}
                        {formatDate(facture.dateEcheance)}
                      </p>
                    </div>
                    <span className="tabular-nums text-sm">
                      {formatEuros(facture.montantTTCCents)}
                    </span>
                    <BadgeStatut map={STATUTS_FACTURE} valeur={statutFacture(facture)} />
                  </li>
                ))}
              </ul>
            )}
          </SectionFiche>

          {client.appels.length > 0 && (
            <SectionFiche titre="Appels de prospection" compte={client.appels.length}>
              <ul className="grid gap-3">
                {client.appels.map((appel) => (
                  <li key={appel.id} className="flex gap-3">
                    <PastilleUtilisateur
                      utilisateur={appel.auteur}
                      className="size-7 text-[10px]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <BadgeStatut map={RESULTATS_APPEL} valeur={appel.resultat} />
                        {appel.auteur.nom} · {formatDateHeure(appel.createdAt)}
                      </p>
                      {appel.note && (
                        <p className="mt-1 text-sm whitespace-pre-wrap">{appel.note}</p>
                      )}
                      {appel.rappelLe && (
                        <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                          À rappeler le {formatDateLongue(appel.rappelLe)}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </SectionFiche>
          )}
        </div>
      </div>
    </>
  );
}
