import Link from "next/link";
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react";

import { EnTetePage } from "@/components/commun/en-tete-page";
import { EtatVide } from "@/components/commun/etat-vide";
import { CalendrierMois } from "@/components/rendez-vous/calendrier-mois";
import { LigneRendezVous } from "@/components/rendez-vous/ligne-rendez-vous";
import { Button } from "@/components/ui/button";
import { capitaliser, formatMois, maintenant } from "@/lib/dates";
import { listerAgenda, listerMois } from "@/lib/requetes/rendez-vous";
import { utilisateurRequis } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata = { title: "Rendez-vous" };

/** "2026-07" → { annee, mois } ; à défaut, le mois courant. */
function lireMois(valeur: string | undefined) {
  const correspondance = valeur?.match(/^(\d{4})-(\d{2})$/);
  if (!correspondance) {
    const aujourdHui = maintenant();
    return { annee: aujourdHui.getUTCFullYear(), mois: aujourdHui.getUTCMonth() };
  }
  return { annee: Number(correspondance[1]), mois: Number(correspondance[2]) - 1 };
}

const cleMois = (annee: number, mois: number) =>
  `${annee}-${String(mois + 1).padStart(2, "0")}`;

export default async function PageRendezVous({
  searchParams,
}: {
  searchParams: Promise<{ vue?: string; mois?: string }>;
}) {
  await utilisateurRequis();
  const params = await searchParams;
  const vueListe = params.vue === "liste";
  const { annee, mois } = lireMois(params.mois);

  const [calendrier, agenda] = await Promise.all([
    vueListe ? null : listerMois(annee, mois),
    vueListe ? listerAgenda() : null,
  ]);

  const precedent = cleMois(mois === 0 ? annee - 1 : annee, mois === 0 ? 11 : mois - 1);
  const suivant = cleMois(mois === 11 ? annee + 1 : annee, mois === 11 ? 0 : mois + 1);

  return (
    <>
      <EnTetePage titre="Rendez-vous">
        <div className="flex overflow-hidden rounded-lg border">
          <OngletVue href="/rendez-vous" actif={!vueListe}>
            Calendrier
          </OngletVue>
          <OngletVue href="/rendez-vous?vue=liste" actif={vueListe}>
            Liste
          </OngletVue>
        </div>
        <Button render={<Link href="/rendez-vous/nouveau" />}>
          <PlusIcon />
          Nouveau
        </Button>
      </EnTetePage>

      {!vueListe && calendrier && (
        <>
          <div className="mb-3 flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Mois précédent"
              render={<Link href={`/rendez-vous?mois=${precedent}`} />}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Mois suivant"
              render={<Link href={`/rendez-vous?mois=${suivant}`} />}
            >
              <ChevronRightIcon />
            </Button>
            <h2 className="ml-1 text-sm font-semibold">
              {capitaliser(formatMois(new Date(Date.UTC(annee, mois, 1))))}
            </h2>
            <Button variant="ghost" size="sm" render={<Link href="/rendez-vous" />}>
              Aujourd&apos;hui
            </Button>
          </div>

          <CalendrierMois
            annee={annee}
            mois={mois}
            cases={calendrier.cases}
            rendezVous={calendrier.rendezVous}
          />

          <p className="mt-3 text-xs text-muted-foreground">
            Cliquez sur un numéro de jour pour créer un rendez-vous à cette date.
          </p>
        </>
      )}

      {vueListe && agenda && (
        <div className="grid gap-6">
          <section>
            <h2 className="mb-2 text-sm font-semibold">À venir</h2>
            {agenda.aVenir.length === 0 ? (
              <EtatVide
                Icone={CalendarDaysIcon}
                titre="Aucun rendez-vous à venir"
                description="Planifiez un rendez-vous depuis le calendrier ou depuis une fiche client."
                action={
                  <Button render={<Link href="/rendez-vous/nouveau" />}>
                    <PlusIcon />
                    Planifier un rendez-vous
                  </Button>
                }
              />
            ) : (
              <div className="divide-y overflow-hidden rounded-xl border bg-background">
                {agenda.aVenir.map((rdv) => (
                  <LigneRendezVous key={rdv.id} rdv={rdv} />
                ))}
              </div>
            )}
          </section>

          {agenda.passes.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold">Passés</h2>
              <div className="divide-y overflow-hidden rounded-xl border bg-background">
                {agenda.passes.map((rdv) => (
                  <LigneRendezVous key={rdv.id} rdv={rdv} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  );
}

function OngletVue({
  href,
  actif,
  children,
}: {
  href: string;
  actif: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "px-3 py-1.5 text-sm font-medium transition-colors",
        actif ? "bg-foreground text-background" : "bg-background hover:bg-muted",
      )}
    >
      {children}
    </Link>
  );
}
