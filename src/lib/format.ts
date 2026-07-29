/**
 * Formatage des montants. Rappel : tout est stocké en CENTIMES (Int).
 * Intl en fr-FR produit exactement « 1 250,00 € » (espace fine insécable
 * comme séparateur de milliers, espace insécable avant le symbole).
 */

const EUROS = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const EUROS_ENTIER = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const NOMBRE = new Intl.NumberFormat("fr-FR");

/** 125050 → « 1 250,50 € » */
export function formatEuros(cents: number): string {
  return EUROS.format(cents / 100);
}

/** 125050 → « 1 251 € ». Pour les tuiles de chiffres et les infobulles. */
export function formatEurosEntier(cents: number): string {
  return EUROS_ENTIER.format(cents / 100);
}

/** Axes de graphiques : 1250000 → « 12,5 k€ ». */
export function formatEurosCompact(cents: number): string {
  const euros = cents / 100;
  if (Math.abs(euros) >= 1000) {
    return `${NOMBRE.format(Math.round(euros / 100) / 10)} k€`;
  }
  return `${NOMBRE.format(Math.round(euros))} €`;
}

export function formatNombre(n: number): string {
  return NOMBRE.format(n);
}

/** 0.427 → « 42,7 % » */
export function formatPourcent(ratio: number, decimales = 0): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "percent",
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(ratio);
}

/**
 * Saisie utilisateur → centimes. Tolère « 1 250,50 », « 1250.5 », « 1250 ».
 * Renvoie null si la saisie n'est pas un nombre.
 */
export function centsDepuisSaisie(valeur: string | number | null | undefined): number | null {
  if (valeur === null || valeur === undefined || valeur === "") return null;
  if (typeof valeur === "number") {
    return Number.isFinite(valeur) ? Math.round(valeur * 100) : null;
  }
  const normalise = valeur
    .replace(/\s/g, "") // \s couvre aussi les espaces insecables et fines
    .replace("€", "")
    .replace(",", ".");
  const n = Number(normalise);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

/** Centimes → chaîne pour un <input type="number" step="0.01"> : 125050 → « 1250.50 ». */
export function centsVersInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

/** Applique un taux de TVA exprimé en points de base (2000 = 20,00 %). */
export function appliquerTVA(montantHTCents: number, tauxTVABasisPoints: number): number {
  return Math.round(montantHTCents * (1 + tauxTVABasisPoints / 10_000));
}

/** 2000 → « 20 % » */
export function formatTauxTVA(basisPoints: number): string {
  return `${NOMBRE.format(basisPoints / 100)} %`;
}

/** « Le Petit Bistrot » → « LP », pour les pastilles. */
export function initiales(nom: string): string {
  return nom
    .split(/\s+/)
    .filter((mot) => /[a-zA-ZÀ-ÿ0-9]/.test(mot))
    .slice(0, 2)
    .map((mot) => mot[0]?.toUpperCase() ?? "")
    .join("");
}
