-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "couleur" TEXT NOT NULL DEFAULT '#2563eb',
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "entreprise" TEXT NOT NULL,
    "nomContact" TEXT,
    "email" TEXT,
    "telephone" TEXT,
    "adresse" TEXT,
    "ville" TEXT,
    "secteur" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'PROSPECT',
    "source" TEXT,
    "siteWebActuel" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "auteurId" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RendezVous" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "titre" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "lieu" TEXT,
    "type" TEXT NOT NULL DEFAULT 'PHYSIQUE',
    "participantId" TEXT NOT NULL,
    "notes" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'PREVU',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RendezVous_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appel" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "auteurId" TEXT NOT NULL,
    "resultat" TEXT NOT NULL,
    "note" TEXT,
    "dureeSecondes" INTEGER NOT NULL DEFAULT 0,
    "rappelLe" TIMESTAMP(3),
    "rendezVousId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tache" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "clientId" TEXT,
    "assigneeId" TEXT NOT NULL,
    "priorite" TEXT NOT NULL DEFAULT 'NORMALE',
    "dateEcheance" TIMESTAMP(3),
    "statut" TEXT NOT NULL DEFAULT 'A_FAIRE',
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Tache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offre" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "montantHTCents" INTEGER NOT NULL DEFAULT 0,
    "tauxTVA" INTEGER NOT NULL DEFAULT 2000,
    "montantTTCCents" INTEGER NOT NULL DEFAULT 0,
    "statut" TEXT NOT NULL DEFAULT 'BROUILLON',
    "dateEnvoi" TIMESTAMP(3),
    "dateReponse" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LigneOffre" (
    "id" TEXT NOT NULL,
    "offreId" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL DEFAULT 1,
    "prixUnitaireHTCents" INTEGER NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LigneOffre_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Client_statut_idx" ON "Client"("statut");

-- CreateIndex
CREATE INDEX "Client_ville_idx" ON "Client"("ville");

-- CreateIndex
CREATE INDEX "Client_entreprise_idx" ON "Client"("entreprise");

-- CreateIndex
CREATE INDEX "Note_clientId_createdAt_idx" ON "Note"("clientId", "createdAt");

-- CreateIndex
CREATE INDEX "RendezVous_dateDebut_idx" ON "RendezVous"("dateDebut");

-- CreateIndex
CREATE INDEX "RendezVous_clientId_idx" ON "RendezVous"("clientId");

-- CreateIndex
CREATE INDEX "Appel_clientId_createdAt_idx" ON "Appel"("clientId", "createdAt");

-- CreateIndex
CREATE INDEX "Appel_createdAt_idx" ON "Appel"("createdAt");

-- CreateIndex
CREATE INDEX "Tache_statut_ordre_idx" ON "Tache"("statut", "ordre");

-- CreateIndex
CREATE INDEX "Tache_clientId_idx" ON "Tache"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Offre_numero_key" ON "Offre"("numero");

-- CreateIndex
CREATE INDEX "Offre_clientId_idx" ON "Offre"("clientId");

-- CreateIndex
CREATE INDEX "Offre_statut_idx" ON "Offre"("statut");

-- CreateIndex
CREATE INDEX "LigneOffre_offreId_idx" ON "LigneOffre"("offreId");

-- CreateIndex
CREATE INDEX "MouvementFinancier_date_idx" ON "MouvementFinancier"("date");

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RendezVous" ADD CONSTRAINT "RendezVous_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RendezVous" ADD CONSTRAINT "RendezVous_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appel" ADD CONSTRAINT "Appel_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appel" ADD CONSTRAINT "Appel_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appel" ADD CONSTRAINT "Appel_rendezVousId_fkey" FOREIGN KEY ("rendezVousId") REFERENCES "RendezVous"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tache" ADD CONSTRAINT "Tache_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tache" ADD CONSTRAINT "Tache_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offre" ADD CONSTRAINT "Offre_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneOffre" ADD CONSTRAINT "LigneOffre_offreId_fkey" FOREIGN KEY ("offreId") REFERENCES "Offre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

