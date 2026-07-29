import { EnConstruction } from "@/components/commun/en-construction";
import { EnTetePage } from "@/components/commun/en-tete-page";

export const metadata = { title: "Rendez-vous" };

export default function PageRendezVous() {
  return (
    <>
      <EnTetePage titre="Rendez-vous" />
      <EnConstruction etape="Rendez-vous" />
    </>
  );
}
