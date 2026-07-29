"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { depuisInputDateHeure } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { utilisateurRequis } from "@/lib/session";
import {
  erreursDepuisZod,
  objetDepuisFormData,
  schemaRendezVous,
  type EtatFormulaire,
} from "@/lib/validations";

function rafraichir(clientId?: string | null, id?: string) {
  revalidatePath("/rendez-vous");
  revalidatePath("/");
  if (id) revalidatePath(`/rendez-vous/${id}`);
  if (clientId) revalidatePath(`/clients/${clientId}`);
}

function convertir(donnees: ReturnType<typeof schemaRendezVous.parse>) {
  const { dateDebut, dateFin, ...reste } = donnees;
  return {
    ...reste,
    dateDebut: depuisInputDateHeure(dateDebut)!,
    dateFin: depuisInputDateHeure(dateFin)!,
  };
}

export async function creerRendezVous(
  _precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  await utilisateurRequis();

  const analyse = schemaRendezVous.safeParse(objetDepuisFormData(donnees));
  if (!analyse.success) return { ok: false, erreurs: erreursDepuisZod(analyse.error) };

  const rdv = await prisma.rendezVous.create({ data: convertir(analyse.data) });
  rafraichir(rdv.clientId, rdv.id);
  redirect(`/rendez-vous/${rdv.id}`);
}

export async function modifierRendezVous(
  id: string,
  _precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  await utilisateurRequis();

  const analyse = schemaRendezVous.safeParse(objetDepuisFormData(donnees));
  if (!analyse.success) return { ok: false, erreurs: erreursDepuisZod(analyse.error) };

  const rdv = await prisma.rendezVous.update({
    where: { id },
    data: convertir(analyse.data),
  });
  rafraichir(rdv.clientId, rdv.id);
  redirect(`/rendez-vous/${rdv.id}`);
}

export async function supprimerRendezVous(id: string) {
  await utilisateurRequis();
  const rdv = await prisma.rendezVous.delete({ where: { id } });
  rafraichir(rdv.clientId);
  redirect("/rendez-vous");
}

/** Marquer « fait » et consigner le compte-rendu, en une seule action. */
export async function cloturerRendezVous(
  id: string,
  _precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  await utilisateurRequis();

  const statut = String(donnees.get("statut") ?? "FAIT");
  const notes = String(donnees.get("notes") ?? "").trim() || null;

  const rdv = await prisma.rendezVous.update({
    where: { id },
    data: { statut, notes },
  });

  rafraichir(rdv.clientId, rdv.id);
  return { ok: true };
}

export async function changerStatutRendezVous(id: string, statut: string) {
  await utilisateurRequis();
  const rdv = await prisma.rendezVous.update({ where: { id }, data: { statut } });
  rafraichir(rdv.clientId, rdv.id);
}
