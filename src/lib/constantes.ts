/**
 * Référentiel unique des valeurs « énumérées » : libellés français et couleurs
 * de badge. Les clés sont exactement les chaînes stockées en base (voir le
 * commentaire d'en-tête de prisma/schema.prisma).
 */

type Entree = { readonly label: string; readonly classe: string };

const badge = (couleur: string, sombre: string): string =>
  `${couleur} ${sombre} ring-1 ring-inset`;

export const STATUTS_CLIENT = {
  PROSPECT: {
    label: "Prospect",
    classe: badge(
      "bg-sky-50 text-sky-700 ring-sky-600/20",
      "dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/25",
    ),
  },
  EN_DISCUSSION: {
    label: "En discussion",
    classe: badge(
      "bg-amber-50 text-amber-800 ring-amber-600/20",
      "dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/25",
    ),
  },
  CLIENT: {
    label: "Client",
    classe: badge(
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
      "dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/25",
    ),
  },
  INACTIF: {
    label: "Inactif",
    classe: badge(
      "bg-zinc-100 text-zinc-600 ring-zinc-500/20",
      "dark:bg-zinc-500/10 dark:text-zinc-400 dark:ring-zinc-400/20",
    ),
  },
  PERDU: {
    label: "Perdu",
    classe: badge(
      "bg-rose-50 text-rose-700 ring-rose-600/20",
      "dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/25",
    ),
  },
} as const satisfies Record<string, Entree>;

export const SOURCES_CLIENT = {
  BOUCHE_A_OREILLE: "Bouche-à-oreille",
  PROSPECTION: "Prospection",
  RESEAUX: "Réseaux sociaux",
  SITE_WEB: "Site web",
  SALON: "Salon / événement",
  AUTRE: "Autre",
} as const;

/** Suggestions proposées en datalist — le champ reste libre. */
export const SECTEURS_SUGGERES = [
  "Restaurant",
  "Bar / Café",
  "Boulangerie",
  "Coiffeur",
  "Institut de beauté",
  "Artisan / BTP",
  "Commerce de détail",
  "Santé / Bien-être",
  "Immobilier",
  "Automobile",
  "Sport",
  "Services aux entreprises",
] as const;

export const STATUTS_TACHE = {
  A_FAIRE: {
    label: "À faire",
    classe: badge(
      "bg-zinc-100 text-zinc-700 ring-zinc-500/20",
      "dark:bg-zinc-500/10 dark:text-zinc-300 dark:ring-zinc-400/20",
    ),
  },
  EN_COURS: {
    label: "En cours",
    classe: badge(
      "bg-blue-50 text-blue-700 ring-blue-600/20",
      "dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/25",
    ),
  },
  FAIT: {
    label: "Fait",
    classe: badge(
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
      "dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/25",
    ),
  },
} as const satisfies Record<string, Entree>;

export const PRIORITES_TACHE = {
  BASSE: {
    label: "Basse",
    classe: badge(
      "bg-zinc-100 text-zinc-600 ring-zinc-500/20",
      "dark:bg-zinc-500/10 dark:text-zinc-400 dark:ring-zinc-400/20",
    ),
  },
  NORMALE: {
    label: "Normale",
    classe: badge(
      "bg-sky-50 text-sky-700 ring-sky-600/20",
      "dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/25",
    ),
  },
  HAUTE: {
    label: "Haute",
    classe: badge(
      "bg-rose-50 text-rose-700 ring-rose-600/20",
      "dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/25",
    ),
  },
} as const satisfies Record<string, Entree>;

export const TYPES_RDV = {
  PHYSIQUE: { label: "Sur place", classe: "" },
  TELEPHONE: { label: "Téléphone", classe: "" },
  VISIO: { label: "Visio", classe: "" },
} as const satisfies Record<string, Entree>;

export const STATUTS_RDV = {
  PREVU: {
    label: "Prévu",
    classe: badge(
      "bg-blue-50 text-blue-700 ring-blue-600/20",
      "dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/25",
    ),
  },
  FAIT: {
    label: "Fait",
    classe: badge(
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
      "dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/25",
    ),
  },
  ANNULE: {
    label: "Annulé",
    classe: badge(
      "bg-zinc-100 text-zinc-500 ring-zinc-500/20",
      "dark:bg-zinc-500/10 dark:text-zinc-400 dark:ring-zinc-400/20",
    ),
  },
} as const satisfies Record<string, Entree>;

export const STATUTS_OFFRE = {
  BROUILLON: {
    label: "Brouillon",
    classe: badge(
      "bg-zinc-100 text-zinc-600 ring-zinc-500/20",
      "dark:bg-zinc-500/10 dark:text-zinc-400 dark:ring-zinc-400/20",
    ),
  },
  ENVOYEE: {
    label: "Envoyée",
    classe: badge(
      "bg-sky-50 text-sky-700 ring-sky-600/20",
      "dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/25",
    ),
  },
  ACCEPTEE: {
    label: "Acceptée",
    classe: badge(
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
      "dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/25",
    ),
  },
  REFUSEE: {
    label: "Refusée",
    classe: badge(
      "bg-rose-50 text-rose-700 ring-rose-600/20",
      "dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/25",
    ),
  },
} as const satisfies Record<string, Entree>;

/** Mouvements financiers : ce qui rentre (CA) et ce qui sort (dépenses). */
export const TYPES_MOUVEMENT = {
  ENTREE: {
    label: "Encaissement",
    classe: badge(
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
      "dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/25",
    ),
  },
  SORTIE: {
    label: "Dépense",
    classe: badge(
      "bg-rose-50 text-rose-700 ring-rose-600/20",
      "dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/25",
    ),
  },
} as const satisfies Record<string, Entree>;

/**
 * Issue d'un appel de prospection. L'ordre compte : c'est celui des boutons
 * proposés juste après avoir raccroché, du plus positif au plus négatif.
 */
export const RESULTATS_APPEL = {
  RDV_PRIS: {
    label: "Rendez-vous pris",
    classe: badge(
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
      "dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/25",
    ),
  },
  INTERESSE: {
    label: "Intéressé",
    classe: badge(
      "bg-sky-50 text-sky-700 ring-sky-600/20",
      "dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/25",
    ),
  },
  A_RAPPELER: {
    label: "À rappeler",
    classe: badge(
      "bg-amber-50 text-amber-800 ring-amber-600/20",
      "dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/25",
    ),
  },
  PAS_INTERESSE: {
    label: "Pas intéressé",
    classe: badge(
      "bg-rose-50 text-rose-700 ring-rose-600/20",
      "dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/25",
    ),
  },
  INJOIGNABLE: {
    label: "Injoignable",
    classe: badge(
      "bg-zinc-100 text-zinc-600 ring-zinc-500/20",
      "dark:bg-zinc-500/10 dark:text-zinc-400 dark:ring-zinc-400/20",
    ),
  },
} as const satisfies Record<string, Entree>;

/** Statut client appliqué automatiquement selon l'issue de l'appel. */
export const STATUT_APRES_APPEL: Record<string, StatutClient | null> = {
  RDV_PRIS: "EN_DISCUSSION",
  INTERESSE: "EN_DISCUSSION",
  A_RAPPELER: null, // on ne touche à rien : le dossier n'a pas avancé
  PAS_INTERESSE: "PERDU",
  INJOIGNABLE: null,
};

export type ResultatAppel = keyof typeof RESULTATS_APPEL;
export const CLES_RESULTAT_APPEL = Object.keys(RESULTATS_APPEL) as ResultatAppel[];

export type StatutClient = keyof typeof STATUTS_CLIENT;
export type SourceClient = keyof typeof SOURCES_CLIENT;
export type StatutTache = keyof typeof STATUTS_TACHE;
export type PrioriteTache = keyof typeof PRIORITES_TACHE;
export type TypeRdv = keyof typeof TYPES_RDV;
export type StatutRdv = keyof typeof STATUTS_RDV;
export type StatutOffre = keyof typeof STATUTS_OFFRE;
export type TypeMouvement = keyof typeof TYPES_MOUVEMENT;

export const CLES_STATUT_CLIENT = Object.keys(STATUTS_CLIENT) as StatutClient[];
export const CLES_STATUT_TACHE = Object.keys(STATUTS_TACHE) as StatutTache[];
export const CLES_PRIORITE = Object.keys(PRIORITES_TACHE) as PrioriteTache[];
export const CLES_TYPE_RDV = Object.keys(TYPES_RDV) as TypeRdv[];
export const CLES_STATUT_RDV = Object.keys(STATUTS_RDV) as StatutRdv[];
export const CLES_STATUT_OFFRE = Object.keys(STATUTS_OFFRE) as StatutOffre[];
export const CLES_TYPE_MOUVEMENT = Object.keys(TYPES_MOUVEMENT) as TypeMouvement[];
export const CLES_SOURCE = Object.keys(SOURCES_CLIENT) as SourceClient[];

/** Options prêtes à l'emploi pour un <select>. */
export function optionsDepuis<T extends Record<string, Entree>>(
  map: T,
): { value: keyof T & string; label: string }[] {
  return Object.entries(map).map(([value, e]) => ({
    value: value as keyof T & string,
    label: e.label,
  }));
}

export const OPTIONS_SOURCE = Object.entries(SOURCES_CLIENT).map(([value, label]) => ({
  value,
  label,
}));

/** Libellé d'un statut inconnu (donnée héritée) : on affiche la clé brute. */
export function libelle<T extends Record<string, Entree>>(map: T, cle: string): string {
  return map[cle]?.label ?? cle;
}

export function classeBadge<T extends Record<string, Entree>>(map: T, cle: string): string {
  return map[cle]?.classe ?? "bg-muted text-muted-foreground ring-1 ring-inset ring-border";
}

/**
 * Couleurs de repère de l'équipe : c'est ce qui permet de voir d'un coup d'œil
 * qui va à quel rendez-vous. Choisies pour rester distinctes entre elles et
 * lisibles sur fond clair comme sur fond sombre.
 */
export const COULEURS_EQUIPE = [
  { valeur: "#2563eb", nom: "Bleu" },
  { valeur: "#c026d3", nom: "Fuchsia" },
  { valeur: "#059669", nom: "Vert" },
  { valeur: "#ea580c", nom: "Orange" },
  { valeur: "#7c3aed", nom: "Violet" },
  { valeur: "#0891b2", nom: "Cyan" },
  { valeur: "#be123c", nom: "Framboise" },
  { valeur: "#4d7c0f", nom: "Olive" },
] as const;

/** TVA par défaut, en points de base (2000 = 20,00 %). */
export const TVA_PAR_DEFAUT = 2000;

