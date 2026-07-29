/**
 * Générateur de mot de passe, utilisable côté navigateur comme côté serveur
 * (crypto.getRandomValues est standard dans les deux).
 *
 * L'alphabet exclut les caractères ambigus (0/O, 1/l/I) : ces mots de passe
 * sont souvent recopiés à la main la première fois.
 */
const ALPHABET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function genererMotDePasse(longueur = 14): string {
  const octets = new Uint8Array(longueur);
  crypto.getRandomValues(octets);
  return Array.from(octets, (octet) => ALPHABET[octet % ALPHABET.length]).join("");
}
