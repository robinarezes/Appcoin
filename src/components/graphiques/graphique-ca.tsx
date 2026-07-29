"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatEuros, formatEurosCompact } from "@/lib/format";
import type { PointMensuel } from "@/lib/requetes/ca";

type Serie = { cle: "factureCents" | "encaisseCents"; libelle: string; couleur: string };

const SERIES: Record<Serie["cle"], Serie> = {
  factureCents: { cle: "factureCents", libelle: "Facturé", couleur: "var(--viz-1)" },
  encaisseCents: { cle: "encaisseCents", libelle: "Encaissé", couleur: "var(--viz-2)" },
};

/**
 * Chiffre d'affaires mensuel en barres. Une seule série sur le tableau de bord,
 * deux sur la page CA (facturé vs encaissé) — jamais deux échelles d'axe.
 */
export function GraphiqueCA({
  donnees,
  series = ["factureCents", "encaisseCents"],
  hauteur = 260,
}: {
  donnees: PointMensuel[];
  series?: Serie["cle"][];
  hauteur?: number;
}) {
  const choisies = series.map((cle) => SERIES[cle]);
  const vide = donnees.every((d) => d.factureCents === 0 && d.encaisseCents === 0);

  if (vide) {
    return (
      <div
        style={{ height: hauteur }}
        className="flex items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground"
      >
        Aucune facture sur la période.
      </div>
    );
  }

  return (
    <>
      {choisies.length > 1 && (
        <div className="mb-2 flex flex-wrap items-center gap-4">
          {choisies.map((serie) => (
            <span key={serie.cle} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                aria-hidden
                className="size-2.5 rounded-[3px]"
                style={{ backgroundColor: serie.couleur }}
              />
              {serie.libelle} (HT)
            </span>
          ))}
        </div>
      )}

      <ResponsiveContainer width="100%" height={hauteur}>
        <BarChart data={donnees} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
          <CartesianGrid vertical={false} stroke="var(--viz-grille)" strokeDasharray="0" />
          <XAxis
            dataKey="mois"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--viz-axe)", fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={70}
            tick={{ fill: "var(--viz-axe)", fontSize: 11 }}
            tickFormatter={(valeur: number) => formatEurosCompact(valeur)}
          />
          <Tooltip
            cursor={{ fill: "var(--viz-grille)", fillOpacity: 0.35 }}
            content={<Infobulle series={choisies} />}
          />
          {choisies.map((serie) => (
            <Bar
              key={serie.cle}
              dataKey={serie.cle}
              name={serie.libelle}
              fill={serie.couleur}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}

type ChargeInfobulle = {
  active?: boolean;
  label?: string;
  payload?: { dataKey?: string | number; value?: number }[];
};

function Infobulle({
  active,
  label,
  payload,
  series,
}: ChargeInfobulle & { series: Serie[] }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium capitalize">{label}</p>
      <ul className="grid gap-0.5">
        {payload.map((entree) => {
          const serie = series.find((s) => s.cle === entree.dataKey);
          if (!serie) return null;
          return (
            <li key={serie.cle} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span
                  aria-hidden
                  className="size-2 rounded-[2px]"
                  style={{ backgroundColor: serie.couleur }}
                />
                {serie.libelle}
              </span>
              <span className="font-medium tabular-nums">{formatEuros(entree.value ?? 0)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
