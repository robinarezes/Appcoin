import { debutDeJour, maintenant } from "@/lib/dates";

/**
 * Le statut « RETARD » d'une facture est déduit, pas stocké : sans cela il
 * faudrait une tâche planifiée pour faire basculer les factures chaque nuit.
 */
export function statutFacture(facture: {
  datePaiement: Date | null;
  dateEcheance: Date;
}): "PAYEE" | "RETARD" | "EN_ATTENTE" {
  if (facture.datePaiement) return "PAYEE";
  return facture.dateEcheance < debutDeJour(maintenant()) ? "RETARD" : "EN_ATTENTE";
}

export function factureImpayee(facture: { datePaiement: Date | null }): boolean {
  return facture.datePaiement === null;
}

/** Une tâche est en retard si elle a une échéance dépassée et n'est pas terminée. */
export function tacheEnRetard(tache: {
  statut: string;
  dateEcheance: Date | null;
}): boolean {
  if (tache.statut === "FAIT" || !tache.dateEcheance) return false;
  return tache.dateEcheance < debutDeJour(maintenant());
}

/** Taux de transformation : offres acceptées / offres ayant reçu une réponse. */
export function tauxTransformation(offres: { statut: string }[]): {
  envoyees: number;
  acceptees: number;
  refusees: number;
  taux: number | null;
} {
  const envoyees = offres.filter((o) => o.statut !== "BROUILLON").length;
  const acceptees = offres.filter((o) => o.statut === "ACCEPTEE").length;
  const refusees = offres.filter((o) => o.statut === "REFUSEE").length;
  const repondues = acceptees + refusees;
  return {
    envoyees,
    acceptees,
    refusees,
    taux: repondues === 0 ? null : acceptees / repondues,
  };
}
