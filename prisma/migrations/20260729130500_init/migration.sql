-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "couleur" TEXT NOT NULL DEFAULT '#2563eb',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "auteurId" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Note_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Note_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RendezVous" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT,
    "titre" TEXT NOT NULL,
    "dateDebut" DATETIME NOT NULL,
    "dateFin" DATETIME NOT NULL,
    "lieu" TEXT,
    "type" TEXT NOT NULL DEFAULT 'PHYSIQUE',
    "participantId" TEXT NOT NULL,
    "notes" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'PREVU',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RendezVous_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RendezVous_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "clientId" TEXT,
    "assigneeId" TEXT NOT NULL,
    "priorite" TEXT NOT NULL DEFAULT 'NORMALE',
    "dateEcheance" DATETIME,
    "statut" TEXT NOT NULL DEFAULT 'A_FAIRE',
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "Tache_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Tache_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Offre" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "montantHTCents" INTEGER NOT NULL DEFAULT 0,
    "tauxTVA" INTEGER NOT NULL DEFAULT 2000,
    "montantTTCCents" INTEGER NOT NULL DEFAULT 0,
    "statut" TEXT NOT NULL DEFAULT 'BROUILLON',
    "dateEnvoi" DATETIME,
    "dateReponse" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Offre_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LigneOffre" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "offreId" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL DEFAULT 1,
    "prixUnitaireHTCents" INTEGER NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "LigneOffre_offreId_fkey" FOREIGN KEY ("offreId") REFERENCES "Offre" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Facture" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "offreId" TEXT,
    "clientId" TEXT NOT NULL,
    "montantHTCents" INTEGER NOT NULL,
    "tauxTVA" INTEGER NOT NULL DEFAULT 2000,
    "montantTTCCents" INTEGER NOT NULL,
    "dateEmission" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateEcheance" DATETIME NOT NULL,
    "datePaiement" DATETIME,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Facture_offreId_fkey" FOREIGN KEY ("offreId") REFERENCES "Offre" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Facture_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
CREATE UNIQUE INDEX "Facture_numero_key" ON "Facture"("numero");

-- CreateIndex
CREATE INDEX "Facture_clientId_idx" ON "Facture"("clientId");

-- CreateIndex
CREATE INDEX "Facture_statut_dateEcheance_idx" ON "Facture"("statut", "dateEcheance");
