import { EnConstruction } from "@/components/commun/en-construction";
import { EnTetePage } from "@/components/commun/en-tete-page";

export const metadata = { title: "Chiffre d'affaires" };

export default function PageChiffreAffaires() {
  return (
    <>
      <EnTetePage titre="Chiffre d'affaires" />
      <EnConstruction etape="Dashboard et CA" />
    </>
  );
}
