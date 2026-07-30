import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { EnTetePage } from "@/components/commun/en-tete-page";
import { ImportProspects } from "@/components/prospection/import-prospects";
import { utilisateurRequis } from "@/lib/session";

export const metadata = { title: "Importer des prospects" };

export default async function PageImportProspection() {
  await utilisateurRequis();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/prospection"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Retour à la prospection
      </Link>

      <EnTetePage
        titre="Importer des prospects"
        description="Collez une liste de commerces pour créer toutes les fiches d'un seul coup."
      />

      <div className="mb-5 rounded-xl border bg-muted/40 p-4 text-sm">
        <p className="font-medium">Pour obtenir une liste toute prête</p>
        <p className="mt-1 text-muted-foreground">
          Demandez à Claude (ou à votre IA préférée) une recherche du type&nbsp;:
        </p>
        <p className="mt-2 rounded-lg border bg-background px-3 py-2 font-mono text-xs">
          Cherche-moi 20 restaurants à Rennes avec leur téléphone, au format une
          ligne par commerce : Entreprise ; Téléphone ; Ville ; Secteur
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Puis collez le résultat ci-dessous. Vérifiez les numéros au premier
          appel : les listes générées peuvent contenir des erreurs.
        </p>
      </div>

      <ImportProspects />
    </div>
  );
}
