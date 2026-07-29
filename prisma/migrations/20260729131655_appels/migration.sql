-- CreateTable
CREATE TABLE "Appel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "auteurId" TEXT NOT NULL,
    "resultat" TEXT NOT NULL,
    "note" TEXT,
    "dureeSecondes" INTEGER NOT NULL DEFAULT 0,
    "rappelLe" DATETIME,
    "rendezVousId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Appel_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Appel_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appel_rendezVousId_fkey" FOREIGN KEY ("rendezVousId") REFERENCES "RendezVous" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Appel_clientId_createdAt_idx" ON "Appel"("clientId", "createdAt");

-- CreateIndex
CREATE INDEX "Appel_createdAt_idx" ON "Appel"("createdAt");
