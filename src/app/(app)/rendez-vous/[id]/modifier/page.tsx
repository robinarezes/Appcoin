import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { modifierRendezVous } from "@/actions/rendez-vous";
import { EnTetePage } from "@/components/commun/en-tete-page";
import { FormulaireRendezVous } from "@/components/rendez-vous/formulaire-rendez-vous";
import { versInputDateHeure } from "@/lib/dates";
import { optionsClients } from "@/lib/requetes/clients";
import { ficheRendezVous } from "@/lib/requetes/rendez-vous";
import { equipe } from "@/lib/requetes/taches";
import { utilisateurRequis } from "@/lib/session";

export const metadata = { title: "Modifier un rendez-vous" };

export default async function PageModifierRendezVous({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await utilisateurRequis();
  const { id } = await params;

  const [rdv, clients, membres] = await Promise.all([
    ficheRendezVous(id),
    optionsClients(),
    equipe(),
  ]);
  if (!rdv) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/rendez-vous/${rdv.id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Retour au rendez-vous
      </Link>

      <EnTetePage titre={rdv.titre} description="Modification du rendez-vous" />

      <FormulaireRendezVous
        action={modifierRendezVous.bind(null, rdv.id)}
        clients={clients}
        membres={membres}
        retour={`/rendez-vous/${rdv.id}`}
        rdv={{
          id: rdv.id,
          titre: rdv.titre,
          clientId: rdv.clientId,
          dateDebut: versInputDateHeure(rdv.dateDebut),
          dateFin: versInputDateHeure(rdv.dateFin),
          lieu: rdv.lieu,
          type: rdv.type,
          participantId: rdv.participantId,
          statut: rdv.statut,
          notes: rdv.notes,
        }}
      />
    </div>
  );
}
