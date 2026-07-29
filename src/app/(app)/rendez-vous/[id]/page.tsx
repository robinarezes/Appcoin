import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  BuildingIcon,
  MapPinIcon,
  MonitorIcon,
  PencilIcon,
  PhoneIcon,
} from "lucide-react";

import { supprimerRendezVous } from "@/actions/rendez-vous";
import { BadgeStatut } from "@/components/commun/badge-statut";
import { ConfirmationSuppression } from "@/components/commun/confirmation-suppression";
import { LienTelephone } from "@/components/commun/liens-contact";
import { SectionFiche } from "@/components/commun/section-fiche";
import { PastilleUtilisateur } from "@/components/layout/pastille-utilisateur";
import { ClotureRendezVous } from "@/components/rendez-vous/cloture-rendez-vous";
import { Button } from "@/components/ui/button";
import { STATUTS_RDV, TYPES_RDV, libelle } from "@/lib/constantes";
import { capitaliser, formatDateLongue, formatHeure } from "@/lib/dates";
import { ficheRendezVous } from "@/lib/requetes/rendez-vous";
import { utilisateurRequis } from "@/lib/session";

const ICONES = {
  PHYSIQUE: MapPinIcon,
  TELEPHONE: PhoneIcon,
  VISIO: MonitorIcon,
} as const;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rdv = await ficheRendezVous(id);
  return { title: rdv?.titre ?? "Rendez-vous" };
}

export default async function PageFicheRendezVous({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await utilisateurRequis();
  const { id } = await params;

  const rdv = await ficheRendezVous(id);
  if (!rdv) notFound();

  const Icone = ICONES[rdv.type as keyof typeof ICONES] ?? MapPinIcon;
  const adresse = [rdv.client?.adresse, rdv.client?.ville].filter(Boolean).join(", ");

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/rendez-vous"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Retour aux rendez-vous
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{rdv.titre}</h1>
            <BadgeStatut map={STATUTS_RDV} valeur={rdv.statut} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {capitaliser(formatDateLongue(rdv.dateDebut))} · {formatHeure(rdv.dateDebut)} –{" "}
            {formatHeure(rdv.dateFin)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" render={<Link href={`/rendez-vous/${rdv.id}/modifier`} />}>
            <PencilIcon />
            Modifier
          </Button>
          <ConfirmationSuppression
            action={supprimerRendezVous.bind(null, rdv.id)}
            titre="Supprimer ce rendez-vous ?"
            description={`« ${rdv.titre} » sera définitivement supprimé.`}
            iconeSeule
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SectionFiche titre="Détails">
          <dl className="grid gap-2.5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Type</dt>
              <dd className="inline-flex items-center gap-1.5">
                <Icone className="size-3.5 text-muted-foreground" />
                {libelle(TYPES_RDV, rdv.type)}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Qui y va</dt>
              <dd className="inline-flex items-center gap-2">
                <PastilleUtilisateur
                  utilisateur={rdv.participant}
                  className="size-6 text-[10px]"
                />
                {rdv.participant.nom}
              </dd>
            </div>

            {rdv.lieu && (
              <div className="flex items-start justify-between gap-3">
                <dt className="shrink-0 text-muted-foreground">Lieu</dt>
                <dd className="text-right">{rdv.lieu}</dd>
              </div>
            )}

            {rdv.client && (
              <>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Client</dt>
                  <dd>
                    <Link
                      href={`/clients/${rdv.client.id}`}
                      className="inline-flex items-center gap-1.5 hover:underline"
                    >
                      <BuildingIcon className="size-3.5 text-muted-foreground" />
                      {rdv.client.entreprise}
                    </Link>
                  </dd>
                </div>
                {rdv.client.telephone && (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Téléphone</dt>
                    <dd>
                      <LienTelephone numero={rdv.client.telephone} />
                    </dd>
                  </div>
                )}
              </>
            )}
          </dl>

          {(rdv.client?.telephone || adresse) && (
            <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
              {rdv.client?.telephone && (
                <Button
                  size="sm"
                  render={<a href={`tel:${rdv.client.telephone.replace(/\s/g, "")}`} />}
                >
                  <PhoneIcon />
                  Appeler
                </Button>
              )}
              {adresse && (
                <Button
                  variant="outline"
                  size="sm"
                  render={
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adresse)}`}
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                >
                  <MapPinIcon />
                  Itinéraire
                </Button>
              )}
            </div>
          )}
        </SectionFiche>

        <SectionFiche titre="Après le rendez-vous">
          <ClotureRendezVous id={rdv.id} statut={rdv.statut} notes={rdv.notes} />
        </SectionFiche>
      </div>
    </div>
  );
}
