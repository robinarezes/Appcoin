import { EnConstruction } from "@/components/commun/en-construction";
import { EnTetePage } from "@/components/commun/en-tete-page";

export const metadata = { title: "Offres" };

export default function PageOffres() {
  return (
    <>
      <EnTetePage titre="Offres" />
      <EnConstruction etape="Offres et factures" />
    </>
  );
}
