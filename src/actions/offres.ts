"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { maintenant } from "@/lib/dates";
import { appliquerTVA, centsDepuisSaisie } from "@/lib/format";
import { numeroOffre } from "@/lib/numerotation";
import { prisma } from "@/lib/prisma";
import { utilisateurRequis } from "@/lib/session";
import {
  erreursDepuisZod,
  objetDepuisFormData,
  schemaOffre,
  type EtatFormulaire,
} from "@/lib/validations";

function rafraichir(clientId?: string | null, offreId?: string) {
  revalidatePath("/offres");
  revalidatePath("/");
  if (offreId) revalidatePath(`/offres/${offreId}`);
  if (clientId) revalidatePath(`/clients/${clientId}`);
}

type LignePreparee = {
  libelle: string;
  quantite: number;
  prixUnitaireHTCents: number;
  ordre: number;
};

/**
 * Les lignes arrivent sous forme de trois tableaux parallèles (un par colonne
 * du tableau de saisie) : c'est ce que produit un formulaire à lignes
 * dynamiques sans JavaScript de sérialisation.
 */
function lireLignes(donnees: FormData): { lignes: LignePreparee[]; erreur?: string } {
  const libelles = donnees.getAll("ligneLibelle").map(String);
  const quantites = donnees.getAll("ligneQuantite").map(String);
  const prix = donnees.getAll("lignePrix").map(String);

  const lignes: LignePreparee[] = [];

  libelles.forEach((libelle, index) => {
    const intitule = libelle.trim();
    if (!intitule) return; // ligne laissée vide : on l'ignore

    const quantite = Number(quantites[index] ?? "1");
    const prixCents = centsDepuisSaisie(prix[index] ?? "");

    if (!Number.isFinite(quantite) || quantite < 1 || prixCents === null) return;

    lignes.push({
      libelle: intitule,
      quantite: Math.round(quantite),
      prixUnitaireHTCents: prixCents,
      ordre: lignes.length,
    });
  });

  if (lignes.length === 0) {
    return { lignes, erreur: "Ajoutez au moins une ligne avec un libellé et un prix." };
  }
  return { lignes };
}

const totalHT = (lignes: LignePreparee[]) =>
  lignes.reduce((somme, l) => somme + l.prixUnitaireHTCents * l.quantite, 0);

export async function creerOffre(
  _precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  await utilisateurRequis();

  const analyse = schemaOffre.safeParse(objetDepuisFormData(donnees));
  if (!analyse.success) return { ok: false, erreurs: erreursDepuisZod(analyse.error) };

  const { lignes, erreur } = lireLignes(donnees);
  if (erreur) return { ok: false, erreurs: { lignes: erreur } };

  const montantHTCents = totalHT(lignes);
  const maintenantDate = maintenant();
  const envoyee = analyse.data.statut !== "BROUILLON";

  const offre = await prisma.$transaction(async (tx) =>
    tx.offre.create({
      data: {
        ...analyse.data,
        numero: await numeroOffre(tx, maintenantDate),
        montantHTCents,
        montantTTCCents: appliquerTVA(montantHTCents, analyse.data.tauxTVA),
        dateEnvoi: envoyee ? maintenantDate : null,
        dateReponse:
          analyse.data.statut === "ACCEPTEE" || analyse.data.statut === "REFUSEE"
            ? maintenantDate
            : null,
        lignes: { create: lignes },
      },
    }),
  );

  rafraichir(offre.clientId, offre.id);
  redirect(`/offres/${offre.id}`);
}

export async function modifierOffre(
  id: string,
  _precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  await utilisateurRequis();

  const analyse = schemaOffre.safeParse(objetDepuisFormData(donnees));
  if (!analyse.success) return { ok: false, erreurs: erreursDepuisZod(analyse.error) };

  const { lignes, erreur } = lireLignes(donnees);
  if (erreur) return { ok: false, erreurs: { lignes: erreur } };

  const montantHTCents = totalHT(lignes);
  const existante = await prisma.offre.findUnique({ where: { id } });

  await prisma.$transaction([
    prisma.ligneOffre.deleteMany({ where: { offreId: id } }),
    prisma.offre.update({
      where: { id },
      data: {
        ...analyse.data,
        montantHTCents,
        montantTTCCents: appliquerTVA(montantHTCents, analyse.data.tauxTVA),
        dateEnvoi:
          analyse.data.statut === "BROUILLON"
            ? null
            : (existante?.dateEnvoi ?? maintenant()),
        lignes: { create: lignes },
      },
    }),
  ]);

  rafraichir(analyse.data.clientId, id);
  redirect(`/offres/${id}`);
}

export async function changerStatutOffre(id: string, statut: string) {
  await utilisateurRequis();
  const maintenantDate = maintenant();
  const existante = await prisma.offre.findUnique({ where: { id } });

  const offre = await prisma.offre.update({
    where: { id },
    data: {
      statut,
      dateEnvoi:
        statut === "BROUILLON" ? null : (existante?.dateEnvoi ?? maintenantDate),
      dateReponse:
        statut === "ACCEPTEE" || statut === "REFUSEE" ? maintenantDate : null,
    },
  });

  rafraichir(offre.clientId, offre.id);
}

export async function supprimerOffre(id: string) {
  await utilisateurRequis();
  const offre = await prisma.offre.delete({ where: { id } });
  rafraichir(offre.clientId);
  redirect("/offres");
}
