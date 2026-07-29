import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { creerRendezVous } from "@/actions/rendez-vous";
import { EnTetePage } from "@/components/commun/en-tete-page";
import { FormulaireRendezVous } from "@/components/rendez-vous/formulaire-rendez-vous";
import { aujourdHui, depuisInputDate, versInputDateHeure } from "@/lib/dates";
import { optionsClients } from "@/lib/requetes/clients";
import { equipe } from "@/lib/requetes/taches";
import { utilisateurRequis } from "@/lib/session";

export const metadata = { title: "Nouveau rendez-vous" };

export default async function PageNouveauRendezVous({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; client?: string }>;
}) {
  const utilisateur = await utilisateurRequis();
  const params = await searchParams;

  const [clients, membres] = await Promise.all([optionsClients(), equipe()]);

  // Par défaut : 9 h – 10 h le jour cliqué dans le calendrier (ou aujourd'hui).
  const jour = (params.date && depuisInputDate(params.date)) || aujourdHui();
  const debut = new Date(jour);
  debut.setUTCHours(9, 0, 0, 0);
  const fin = new Date(debut);
  fin.setUTCHours(10, 0, 0, 0);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/rendez-vous"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Retour au calendrier
      </Link>

      <EnTetePage titre="Nouveau rendez-vous" />

      <FormulaireRendezVous
        action={creerRendezVous}
        clients={clients}
        membres={membres}
        retour="/rendez-vous"
        valeursParDefaut={{
          dateDebut: versInputDateHeure(debut),
          dateFin: versInputDateHeure(fin),
          clientId: params.client,
          participantId: utilisateur.id,
        }}
      />
    </div>
  );
}
