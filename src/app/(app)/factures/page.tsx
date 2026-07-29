import { EnConstruction } from "@/components/commun/en-construction";
import { EnTetePage } from "@/components/commun/en-tete-page";

export const metadata = { title: "Factures" };

export default function PageFactures() {
  return (
    <>
      <EnTetePage titre="Factures" />
      <EnConstruction etape="Offres et factures" />
    </>
  );
}
