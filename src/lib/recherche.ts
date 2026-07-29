/**
 * Recherche « à la française » : insensible à la casse ET aux accents, pour
 * que « emeraude » trouve « Coiffure Émeraude » et « bistro » « Le Petit
 * Bistrot ». Le filtrage se fait en mémoire plutôt qu'en SQL : à l'échelle
 * d'une agence (quelques centaines de fiches) c'est instantané, et cela évite
 * les différences de comportement du LIKE entre SQLite et PostgreSQL.
 */
export function normaliser(texte: string | null | undefined): string {
  return (texte ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // supprime les diacritiques isolés par NFD
    .toLowerCase();
}

/** Vrai si la recherche apparaît dans l'un des champs fournis. */
export function correspond(recherche: string, ...champs: (string | null | undefined)[]): boolean {
  const terme = normaliser(recherche).trim();
  if (!terme) return true;
  return champs.some((champ) => normaliser(champ).includes(terme));
}

/** Numéro de téléphone réduit à ses chiffres, pour comparer « 0299… » et « 02 99 … ». */
export function chiffresSeuls(texte: string | null | undefined): string {
  return (texte ?? "").replace(/\D/g, "");
}
