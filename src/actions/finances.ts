"use server";

import { revalidatePath } from "next/cache";

import { depuisInputDate } from "@/lib/dates";
import { centsDepuisSaisie } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { utilisateurRequis } from "@/lib/session";
import {
  erreursDepuisZod,
  objetDepuisFormData,
  schemaMouvement,
  type EtatFormulaire,
} from "@/lib/validations";

function rafraichir() {
  revalidatePath("/ca");
  revalidatePath("/");
}

export async function ajouterMouvement(
  _precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  await utilisateurRequis();

  const analyse = schemaMouvement.safeParse(objetDepuisFormData(donnees));
  if (!analyse.success) return { ok: false, erreurs: erreursDepuisZod(analyse.error) };

  const montantCents = centsDepuisSaisie(analyse.data.montant);
  if (montantCents === null || montantCents <= 0) {
    return { ok: false, erreurs: { montant: "Montant invalide." } };
  }

  const date = depuisInputDate(analyse.data.date);
  if (!date) return { ok: false, erreurs: { date: "Date invalide." } };

  await prisma.mouvementFinancier.create({
    data: {
      type: analyse.data.type,
      libelle: analyse.data.libelle,
      montantCents,
      date,
    },
  });

  rafraichir();
  return { ok: true };
}

export async function supprimerMouvement(id: string) {
  await utilisateurRequis();
  await prisma.mouvementFinancier.delete({ where: { id } });
  rafraichir();
}
