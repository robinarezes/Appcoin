"use server";

import { revalidatePath } from "next/cache";

import { maintenant } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { utilisateurRequis } from "@/lib/session";

function rafraichir(clientId?: string | null) {
  revalidatePath("/factures");
  revalidatePath("/ca");
  revalidatePath("/");
  if (clientId) revalidatePath(`/clients/${clientId}`);
}

export async function marquerFacturePayee(id: string) {
  await utilisateurRequis();
  const facture = await prisma.facture.update({
    where: { id },
    data: { datePaiement: maintenant(), statut: "PAYEE" },
  });
  rafraichir(facture.clientId);
}

export async function marquerFactureImpayee(id: string) {
  await utilisateurRequis();
  const facture = await prisma.facture.update({
    where: { id },
    data: { datePaiement: null, statut: "EN_ATTENTE" },
  });
  rafraichir(facture.clientId);
}

export async function supprimerFacture(id: string) {
  await utilisateurRequis();
  const facture = await prisma.facture.delete({ where: { id } });
  rafraichir(facture.clientId);
}
