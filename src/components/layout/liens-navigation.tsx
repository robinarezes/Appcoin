"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDaysIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  ReceiptIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

export const LIENS = [
  { href: "/", label: "Dashboard", Icone: LayoutDashboardIcon },
  { href: "/clients", label: "Clients", Icone: UsersIcon },
  { href: "/rendez-vous", label: "Rendez-vous", Icone: CalendarDaysIcon },
  { href: "/taches", label: "Tâches", Icone: ListChecksIcon },
  { href: "/offres", label: "Offres", Icone: FileTextIcon },
  { href: "/factures", label: "Factures", Icone: ReceiptIcon },
  { href: "/ca", label: "Chiffre d'affaires", Icone: TrendingUpIcon },
] as const;

export function LiensNavigation({ onNavigation }: { onNavigation?: () => void }) {
  const chemin = usePathname();

  return (
    <nav className="grid gap-0.5">
      {LIENS.map(({ href, label, Icone }) => {
        const actif = href === "/" ? chemin === "/" : chemin.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigation}
            aria-current={actif ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
              actif
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icone className={cn("size-4 shrink-0", actif ? "opacity-100" : "opacity-70")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
