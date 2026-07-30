import Link from "next/link";
import { PencilIcon } from "lucide-react";

import { supprimerClient } from "@/actions/clients";
import { BadgeStatut } from "@/components/commun/badge-statut";
import { ConfirmationSuppression } from "@/components/commun/confirmation-suppression";
import { LienTelephone } from "@/components/commun/liens-contact";
import { Button } from "@/components/ui/button";
import { STATUTS_CLIENT } from "@/lib/constantes";
import { formatEuros } from "@/lib/format";
import type { ClientListe } from "@/lib/requetes/clients";

/** Modifier / supprimer, disponibles depuis la liste sans ouvrir la fiche. */
function ActionsLigne({ client }: { client: ClientListe }) {
  return (
    <span className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Modifier ${client.entreprise}`}
        title="Modifier"
        render={<Link href={`/clients/${client.id}/modifier`} />}
      >
        <PencilIcon />
      </Button>
      <ConfirmationSuppression
        action={supprimerClient.bind(null, client.id)}
        titre={`Supprimer ${client.entreprise} ?`}
        description="La fiche, son journal, ses offres et ses appels seront supprimés définitivement."
        variante="ghost"
        iconeSeule
      />
    </span>
  );
}

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
              <span className="flex items-center gap-2">
                {client.caSigneCents > 0 && (
                  <span className="tabular-nums text-muted-foreground">
                    {formatEuros(client.caSigneCents)}
                  </span>
                )}
                <ActionsLigne client={client} />
              </span>
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
              <th className="px-4 py-2.5 text-right font-medium">CA signé</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b last:border-0 hover:bg-muted/40">
                <td className="px-4 py-2">
                  <Link href={`/clients/${client.id}`} className="font-medium hover:underline">
                    {client.entreprise}
                  </Link>
                  {(client.nomContact || client.secteur) && (
                    <p className="text-xs text-muted-foreground">
                      {[client.nomContact, client.secteur].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </td>
                <td className="px-4 py-2">
                  <BadgeStatut map={STATUTS_CLIENT} valeur={client.statut} />
                </td>
                <td className="px-4 py-2 text-muted-foreground">{client.ville ?? "—"}</td>
                <td className="px-4 py-2">
                  <LienTelephone numero={client.telephone} className="text-muted-foreground" />
                </td>
                <td className="px-4 py-2 text-right tabular-nums">
                  {client.caSigneCents > 0 ? (
                    formatEuros(client.caSigneCents)
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <ActionsLigne client={client} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
