import { z } from "zod";

import {
  CLES_PRIORITE,
  CLES_SOURCE,
  CLES_STATUT_CLIENT,
  CLES_STATUT_OFFRE,
  CLES_STATUT_RDV,
  CLES_STATUT_TACHE,
  CLES_TYPE_RDV,
} from "@/lib/constantes";

/** Forme de retour commune à toutes les Server Actions de formulaire. */
export type EtatFormulaire = {
  ok?: boolean;
  message?: string;
  erreurs?: Record<string, string>;
};

export const ETAT_INITIAL: EtatFormulaire = {};

/** FormData → objet simple, exploitable par Zod. */
export function objetDepuisFormData(donnees: FormData): Record<string, string> {
  const objet: Record<string, string> = {};
  for (const [cle, valeur] of donnees.entries()) {
    if (typeof valeur === "string") objet[cle] = valeur;
  }
  return objet;
}

/** Aplatit les erreurs Zod en { champ: "message" } pour l'affichage. */
export function erreursDepuisZod(erreur: z.ZodError): Record<string, string> {
  const erreurs: Record<string, string> = {};
  for (const probleme of erreur.issues) {
    const champ = probleme.path.join(".") || "_";
    if (!erreurs[champ]) erreurs[champ] = probleme.message;
  }
  return erreurs;
}

// --- Briques réutilisables ---

/** Champ texte facultatif : "" devient null en base. */
const optionnel = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .default(null);

/**
 * Email tolérant : on veut juste éviter les fautes de frappe grossières, pas
 * refuser une adresse exotique notée à la volée pendant un appel.
 */
const emailOptionnel = optionnel.refine(
  (v) => v === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  { message: "Adresse email invalide." },
);

const parmi = <T extends readonly [string, ...string[]]>(valeurs: T, message: string) =>
  z.enum(valeurs, { message });

const dateOptionnelle = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .default(null);

// --- Clients ---

export const schemaClient = z.object({
  entreprise: z.string().trim().min(1, "Le nom de l'entreprise est obligatoire."),
  nomContact: optionnel,
  email: emailOptionnel,
  telephone: optionnel,
  adresse: optionnel,
  ville: optionnel,
  secteur: optionnel,
  statut: parmi(
    CLES_STATUT_CLIENT as unknown as [string, ...string[]],
    "Statut inconnu.",
  ),
  source: optionnel.refine(
    (v) => v === null || (CLES_SOURCE as string[]).includes(v),
    { message: "Source inconnue." },
  ),
  siteWebActuel: optionnel,
  notes: optionnel,
});

export const schemaNote = z.object({
  clientId: z.string().min(1),
  contenu: z.string().trim().min(1, "La note ne peut pas être vide."),
});

// --- Tâches ---

export const schemaTache = z.object({
  titre: z.string().trim().min(1, "Le titre est obligatoire."),
  description: optionnel,
  clientId: optionnel,
  assigneeId: z.string().min(1, "Choisissez un responsable."),
  priorite: parmi(CLES_PRIORITE as unknown as [string, ...string[]], "Priorité inconnue."),
  statut: parmi(CLES_STATUT_TACHE as unknown as [string, ...string[]], "Statut inconnu."),
  dateEcheance: dateOptionnelle,
});

// --- Rendez-vous ---

export const schemaRendezVous = z
  .object({
    titre: z.string().trim().min(1, "Le titre est obligatoire."),
    clientId: optionnel,
    dateDebut: z.string().trim().min(1, "La date de début est obligatoire."),
    dateFin: z.string().trim().min(1, "La date de fin est obligatoire."),
    lieu: optionnel,
    type: parmi(CLES_TYPE_RDV as unknown as [string, ...string[]], "Type inconnu."),
    participantId: z.string().min(1, "Choisissez un participant."),
    statut: parmi(CLES_STATUT_RDV as unknown as [string, ...string[]], "Statut inconnu."),
    notes: optionnel,
  })
  .refine((v) => v.dateFin >= v.dateDebut, {
    message: "La fin doit être après le début.",
    path: ["dateFin"],
  });

// --- Offres ---

export const schemaLigneOffre = z.object({
  libelle: z.string().trim().min(1, "Libellé obligatoire."),
  quantite: z.coerce.number().int().min(1, "Quantité minimale : 1."),
  prixUnitaireHT: z.string().trim(),
});

export const schemaOffre = z.object({
  clientId: z.string().min(1, "Choisissez un client."),
  titre: z.string().trim().min(1, "Le titre est obligatoire."),
  description: optionnel,
  tauxTVA: z.coerce.number().int().min(0).max(10_000),
  statut: parmi(CLES_STATUT_OFFRE as unknown as [string, ...string[]], "Statut inconnu."),
});

// --- Comptes de l'équipe ---

const motDePasse = z
  .string()
  .min(8, "Le mot de passe doit faire au moins 8 caractères.");

export const schemaNouveauCompte = z
  .object({
    nom: z.string().trim().min(1, "Le prénom est obligatoire."),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Adresse email invalide."),
    motDePasse,
    confirmation: z.string(),
    couleur: optionnel,
  })
  .refine((v) => v.motDePasse === v.confirmation, {
    message: "Les deux mots de passe ne correspondent pas.",
    path: ["confirmation"],
  });

export const schemaMembre = z.object({
  nom: z.string().trim().min(1, "Le prénom est obligatoire."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Adresse email invalide."),
  motDePasse,
  couleur: optionnel,
});

export const schemaChangementMotDePasse = z
  .object({
    utilisateurId: z.string().min(1),
    motDePasse,
    confirmation: z.string(),
  })
  .refine((v) => v.motDePasse === v.confirmation, {
    message: "Les deux mots de passe ne correspondent pas.",
    path: ["confirmation"],
  });

export const schemaProfil = z.object({
  nom: z.string().trim().min(1, "Le prénom est obligatoire."),
  couleur: z.string().trim().min(1),
});

// --- Prospection téléphonique ---

export const schemaFicheAppel = z.object({
  entreprise: z.string().trim().min(1, "Le nom de la boutique est obligatoire."),
  telephone: z.string().trim().min(1, "Le numéro de téléphone est obligatoire."),
  nomContact: optionnel,
  ville: optionnel,
  secteur: optionnel,
  notes: optionnel,
});

export const schemaCompteRenduAppel = z.object({
  clientId: z.string().min(1),
  resultat: parmi(
    ["RDV_PRIS", "INTERESSE", "A_RAPPELER", "PAS_INTERESSE", "INJOIGNABLE"] as const,
    "Résultat inconnu.",
  ),
  note: optionnel,
  dureeSecondes: z.coerce.number().int().min(0).max(86_400).default(0),
  rappelLe: dateOptionnelle,
});
