import { EnConstruction } from "@/components/commun/en-construction";
import { EnTetePage } from "@/components/commun/en-tete-page";

export const metadata = { title: "Tâches" };

export default function PageTaches() {
  return (
    <>
      <EnTetePage titre="Tâches" />
      <EnConstruction etape="Tâches" />
    </>
  );
}
