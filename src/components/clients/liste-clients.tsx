import Link from "next/link";

import { BadgeStatut } from "@/components/commun/badge-statut";
import { LienTelephone } from "@/components/commun/liens-contact";
import { STATUTS_CLIENT } from "@/lib/constantes";
import { formatEuros } from "@/lib/format";
import type { ClientListe } from "@/lib/requetes/clients";

/**
 * Tableau dense au-dessus de `md`, cartes empilées en dessous : sur téléphone,
 * un tableau qui défile latéralement est inutilisable en rendez-vous.
 */
export function ListeClients({ clients }: { clients: ClientListe[] }) {
  return (
    <>
      {/* Mobile */}
      <ul className="grid gap-2 md:hidden">
        {clients.map((client) => (
          <li key={client.id} className="rounded-xl border bg-background p-3">
            <div className="flex items-start justify-between gap-3">
              <Link href={`/clients/${client.id}`} className="min-w-0 font-medium hover:underline">
                {client.entreprise}
              </Link>
              <BadgeStatut map={STATUTS_CLIENT} valeur={client.statut} />
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {[client.nomContact, client.ville].filter(Boolean).join(" · ") || "—"}
            </p>
            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
              <LienTelephone numero={client.telephone} avecIcone />
              {client.caEncaisseCents > 0 && (
                <span className="tabular-nums text-muted-foreground">
                  {formatEuros(client.caEncaisseCents)}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop */}
      <div className="hidden overflow-hidden rounded-xl border bg-background md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Entreprise</th>
              <th className="px-4 py-2.5 font-medium">Statut</th>
              <th className="px-4 py-2.5 font-medium">Ville</th>
              <th className="px-4 py-2.5 font-medium">Téléphone</th>
              <th className="px-4 py-2.5 text-right font-medium">CA encaissé</th>
              <th className="px-4 py-2.5 text-right font-medium">Reste dû</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b last:border-0 hover:bg-muted/40">
                <td className="px-4 py-2.5">
                  <Link href={`/clients/${client.id}`} className="font-medium hover:underline">
                    {client.entreprise}
                  </Link>
                  {(client.nomContact || client.secteur) && (
                    <p className="text-xs text-muted-foreground">
                      {[client.nomContact, client.secteur].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <BadgeStatut map={STATUTS_CLIENT} valeur={client.statut} />
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{client.ville ?? "—"}</td>
                <td className="px-4 py-2.5">
                  <LienTelephone numero={client.telephone} className="text-muted-foreground" />
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {client.caEncaisseCents > 0 ? (
                    formatEuros(client.caEncaisseCents)
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {client.montantDuCents > 0 ? (
                    <span className="font-medium text-amber-700 dark:text-amber-400">
                      {formatEuros(client.montantDuCents)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
