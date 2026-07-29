/**
 * Convention de temps de l'application
 * ------------------------------------
 * Toutes les dates sont manipulées comme des « heures murales françaises »
 * écrites telles quelles dans le champ UTC de la base. Concrètement : un
 * rendez-vous saisi à 09:00 est stocké 09:00Z et réaffiché 09:00 partout —
 * quel que soit le fuseau du serveur (Vercel tourne en UTC) ou du navigateur.
 * On évite ainsi les décalages d'heure d'été et les erreurs d'hydratation React,
 * au prix d'une approximation sans conséquence pour une agence qui travaille
 * sur un seul fuseau horaire.
 *
 * `maintenant()` est le seul endroit qui traduit l'instant réel vers cette
 * convention. Toute l'arithmétique passe par Date.UTC, tout l'affichage par
 * Intl avec timeZone: "UTC".
 */

const FUSEAU_AGENCE = "Europe/Paris";

/** L'instant présent, exprimé en heure murale française. */
export function maintenant(): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSEAU_AGENCE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const v = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);

  // `hour` peut valoir 24 à minuit selon l'implémentation : Date.UTC le normalise.
  return new Date(
    Date.UTC(v("year"), v("month") - 1, v("day"), v("hour"), v("minute"), v("second")),
  );
}

/** Aujourd'hui à 00:00. */
export function aujourdHui(): Date {
  return debutDeJour(maintenant());
}

export function debutDeJour(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function finDeJour(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999),
  );
}

export function ajouterJours(d: Date, n: number): Date {
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + n);
  return r;
}

export function ajouterMinutes(d: Date, n: number): Date {
  return new Date(d.getTime() + n * 60_000);
}

export function ajouterMois(d: Date, n: number): Date {
  const r = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1, d.getUTCHours(), d.getUTCMinutes()),
  );
  // On borne le jour pour éviter le glissement 31 janvier + 1 mois → 3 mars.
  const dernierJour = new Date(
    Date.UTC(r.getUTCFullYear(), r.getUTCMonth() + 1, 0),
  ).getUTCDate();
  r.setUTCDate(Math.min(d.getUTCDate(), dernierJour));
  return r;
}

export function debutDeMois(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

export function finDeMois(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59, 999));
}

export function debutDAnnee(annee: number): Date {
  return new Date(Date.UTC(annee, 0, 1));
}

export function finDAnnee(annee: number): Date {
  return new Date(Date.UTC(annee, 11, 31, 23, 59, 59, 999));
}

/** Lundi de la semaine contenant `d`. */
export function debutDeSemaine(d: Date): Date {
  const jour = d.getUTCDay(); // 0 = dimanche
  const recul = jour === 0 ? 6 : jour - 1;
  return ajouterJours(debutDeJour(d), -recul);
}

export function memeJour(a: Date, b: Date): boolean {
  return debutDeJour(a).getTime() === debutDeJour(b).getTime();
}

/** Nombre de jours entiers entre deux dates (b - a), en ignorant les heures. */
export function differenceEnJours(a: Date, b: Date): number {
  return Math.round(
    (debutDeJour(b).getTime() - debutDeJour(a).getTime()) / 86_400_000,
  );
}

/** Clé de regroupement mensuel, ex. "2026-07". */
export function cleMois(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Les 42 cases d'une grille de calendrier mensuelle (6 semaines commençant
 * le lundi), débordant sur les mois voisins.
 */
export function grilleMois(annee: number, mois: number): Date[] {
  const premier = new Date(Date.UTC(annee, mois, 1));
  const depart = debutDeSemaine(premier);
  return Array.from({ length: 42 }, (_, i) => ajouterJours(depart, i));
}

// --- Ponts avec les <input type="date"> et <input type="datetime-local"> ---

export function versInputDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function versInputDateHeure(d: Date): string {
  return d.toISOString().slice(0, 16);
}

/** "2026-07-29" → 2026-07-29T00:00Z (heure murale). */
export function depuisInputDate(valeur: string): Date | null {
  if (!valeur) return null;
  const d = new Date(`${valeur}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "2026-07-29T09:00" → 2026-07-29T09:00Z (heure murale). */
export function depuisInputDateHeure(valeur: string): Date | null {
  if (!valeur) return null;
  const d = new Date(`${valeur.slice(0, 16)}:00.000Z`); // on ignore d'éventuelles secondes
  return Number.isNaN(d.getTime()) ? null : d;
}

// --- Affichage ---

const fmt = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", ...options });

const F_DATE = fmt({ day: "2-digit", month: "2-digit", year: "numeric" });
const F_DATE_COURTE = fmt({ day: "numeric", month: "short" });
const F_DATE_LONGUE = fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" });
const F_HEURE = fmt({ hour: "2-digit", minute: "2-digit" });
const F_MOIS = fmt({ month: "long", year: "numeric" });
const F_MOIS_COURT = fmt({ month: "short" });
const F_JOUR_SEMAINE = fmt({ weekday: "long" });

/** 29/07/2026 */
export const formatDate = (d: Date) => F_DATE.format(d);
/** 29 juil. */
export const formatDateCourte = (d: Date) => F_DATE_COURTE.format(d);
/** mercredi 29 juillet 2026 */
export const formatDateLongue = (d: Date) => F_DATE_LONGUE.format(d);
/** 09:00 */
export const formatHeure = (d: Date) => F_HEURE.format(d);
/** 29/07/2026 à 09:00 */
export const formatDateHeure = (d: Date) => `${F_DATE.format(d)} à ${F_HEURE.format(d)}`;
/** juillet 2026 */
export const formatMois = (d: Date) => F_MOIS.format(d);
/** juil. */
export const formatMoisCourt = (d: Date) => F_MOIS_COURT.format(d);
/** mercredi */
export const formatJourSemaine = (d: Date) => F_JOUR_SEMAINE.format(d);

export const JOURS_COURTS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"] as const;

/** « aujourd'hui », « demain », « il y a 3 jours »… pour les listes denses. */
export function formatDateRelative(d: Date, reference: Date = maintenant()): string {
  const ecart = differenceEnJours(reference, d);
  if (ecart === 0) return "aujourd'hui";
  if (ecart === 1) return "demain";
  if (ecart === -1) return "hier";
  if (ecart > 1 && ecart <= 7) return `dans ${ecart} jours`;
  if (ecart < -1 && ecart >= -7) return `il y a ${-ecart} jours`;
  return formatDate(d);
}

/** Une majuscule en tête, pour les libellés issus d'Intl (« juillet 2026 »). */
export function capitaliser(texte: string): string {
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}
