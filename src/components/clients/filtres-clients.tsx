"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LoaderCircleIcon, SearchIcon, XIcon } from "lucide-react";

import { SelectNatif } from "@/components/commun/select-natif";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STATUTS_CLIENT, optionsDepuis } from "@/lib/constantes";

const TRIS = [
  { value: "entreprise", label: "Nom (A → Z)" },
  { value: "recent", label: "Ajout le plus récent" },
  { value: "ca", label: "Chiffre d'affaires" },
  { value: "ville", label: "Ville" },
];

/**
 * Les filtres vivent dans l'URL : un état partageable, qui survit au
 * rafraîchissement et au bouton « précédent ».
 */
export function FiltresClients({ villes }: { villes: string[] }) {
  const router = useRouter();
  const chemin = usePathname();
  const parametres = useSearchParams();
  const [enCours, demarrer] = useTransition();

  const [recherche, setRecherche] = useState(parametres.get("q") ?? "");
  const premierRendu = useRef(true);

  const appliquer = (modifications: Record<string, string>) => {
    const suivants = new URLSearchParams(parametres.toString());
    for (const [cle, valeur] of Object.entries(modifications)) {
      if (valeur) suivants.set(cle, valeur);
      else suivants.delete(cle);
    }
    const requete = suivants.toString();
    demarrer(() => router.replace(requete ? `${chemin}?${requete}` : chemin, { scroll: false }));
  };

  // Recherche différée : on ne relance pas une requête à chaque frappe.
  useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false;
      return;
    }
    const minuteur = setTimeout(() => appliquer({ q: recherche.trim() }), 250);
    return () => clearTimeout(minuteur);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recherche]);

  const statut = parametres.get("statut") ?? "";
  const ville = parametres.get("ville") ?? "";
  const tri = parametres.get("tri") ?? "entreprise";
  const filtreActif = Boolean(recherche || statut || ville || tri !== "entreprise");

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="relative min-w-0 flex-1 sm:max-w-xs">
        {enCours ? (
          <LoaderCircleIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : (
          <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        )}
        <Input
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Nom, contact, email, téléphone…"
          aria-label="Rechercher un client"
          className="pl-8"
        />
      </div>

      <SelectNatif
        value={statut}
        onChange={(e) => appliquer({ statut: e.target.value })}
        aria-label="Filtrer par statut"
        className="w-auto"
      >
        <option value="">Tous les statuts</option>
        {optionsDepuis(STATUTS_CLIENT).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </SelectNatif>

      <SelectNatif
        value={ville}
        onChange={(e) => appliquer({ ville: e.target.value })}
        aria-label="Filtrer par ville"
        className="w-auto"
      >
        <option value="">Toutes les villes</option>
        {villes.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </SelectNatif>

      <SelectNatif
        value={tri}
        onChange={(e) => appliquer({ tri: e.target.value })}
        aria-label="Trier"
        className="w-auto"
      >
        {TRIS.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </SelectNatif>

      {filtreActif && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setRecherche("");
            demarrer(() => router.replace(chemin, { scroll: false }));
          }}
        >
          <XIcon />
          Réinitialiser
        </Button>
      )}
    </div>
  );
}
