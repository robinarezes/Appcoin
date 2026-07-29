import Link from "next/link";
import { SettingsIcon } from "lucide-react";

import { LiensNavigation } from "@/components/layout/liens-navigation";
import { Marque } from "@/components/layout/marque";
import { PastilleUtilisateur } from "@/components/layout/pastille-utilisateur";
import type { UtilisateurConnecte } from "@/lib/session";

/** Barre latérale fixe, affichée à partir de `lg`. */
export function BarreLaterale({ utilisateur }: { utilisateur: UtilisateurConnecte }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r bg-sidebar lg:flex">
      <div className="flex h-14 items-center border-b px-4">
        <Marque />
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <LiensNavigation />
      </div>

      <div className="border-t p-3">
        <Link
          href="/equipe"
          title="Mon profil et l'équipe"
          className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-sidebar-accent/60"
        >
          <PastilleUtilisateur utilisateur={utilisateur} />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium">{utilisateur.nom}</p>
            <p className="truncate text-xs text-muted-foreground">{utilisateur.email}</p>
          </div>
          <SettingsIcon className="ml-auto size-4 shrink-0 text-muted-foreground" />
        </Link>
      </div>
    </aside>
  );
}
