"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { utilisateurRequis } from "@/lib/session";
import {
  erreursDepuisZod,
  objetDepuisFormData,
  schemaClient,
  schemaNote,
  type EtatFormulaire,
} from "@/lib/validations";

function rafraichir(id?: string) {
  revalidatePath("/clients");
  revalidatePath("/prospection");
  revalidatePath("/");
  if (id) revalidatePath(`/clients/${id}`);
}

export async function creerClient(
  _precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  await utilisateurRequis();

  const analyse = schemaClient.safeParse(objetDepuisFormData(donnees));
  if (!analyse.success) {
    return { ok: false, erreurs: erreursDepuisZod(analyse.error) };
  }

  const client = await prisma.client.create({ data: analyse.data });
  rafraichir(client.id);
  redirect(`/clients/${client.id}`);
}

export async function modifierClient(
  id: string,
  _precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  await utilisateurRequis();

  const analyse = schemaClient.safeParse(objetDepuisFormData(donnees));
  if (!analyse.success) {
    return { ok: false, erreurs: erreursDepuisZod(analyse.error) };
  }

  await prisma.client.update({ where: { id }, data: analyse.data });
  rafraichir(id);
  redirect(`/clients/${id}`);
}

export async function supprimerClient(id: string) {
  await utilisateurRequis();

  // Les offres, factures, notes et appels partent avec le client (cascade) ;
  // les rendez-vous et tâches sont conservés mais détachés.
  await prisma.client.delete({ where: { id } });
  rafraichir();
  redirect("/clients");
}

export async function ajouterNote(
  _precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  const utilisateur = await utilisateurRequis();

  const analyse = schemaNote.safeParse(objetDepuisFormData(donnees));
  if (!analyse.success) {
    return { ok: false, erreurs: erreursDepuisZod(analyse.error) };
  }

  await prisma.note.create({
    data: { ...analyse.data, auteurId: utilisateur.id },
  });

  rafraichir(analyse.data.clientId);
  return { ok: true };
}

export async function supprimerNote(id: string) {
  await utilisateurRequis();
  const note = await prisma.note.delete({ where: { id } });
  rafraichir(note.clientId);
}
