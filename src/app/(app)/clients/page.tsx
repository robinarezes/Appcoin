import { EnConstruction } from "@/components/commun/en-construction";
import { EnTetePage } from "@/components/commun/en-tete-page";

export const metadata = { title: "Clients" };

export default function PageClients() {
  return (
    <>
      <EnTetePage titre="Clients" />
      <EnConstruction etape="Clients" />
    </>
  );
}
