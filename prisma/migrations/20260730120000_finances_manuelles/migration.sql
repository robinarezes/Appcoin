-- Remplace le module de facturation par un suivi financier manuel.
--
-- La table Facture est supprimée (elle était vide en production) et laisse
-- place à MouvementFinancier : une ligne par encaissement ou dépense, dont le
-- cumul donne « l'argent de l'entreprise ».

-- DropForeignKey
ALTER TABLE "Facture" DROP CONSTRAINT "Facture_offreId_fkey";

-- DropForeignKey
ALTER TABLE "Facture" DROP CONSTRAINT "Facture_clientId_fkey";

-- DropTable
DROP TABLE "Facture";

-- CreateTable
CREATE TABLE "MouvementFinancier" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "libelle" TEXT NOT NULL,
    "montantCents" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MouvementFinancier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MouvementFinancier_date_idx" ON "MouvementFinancier"("date");