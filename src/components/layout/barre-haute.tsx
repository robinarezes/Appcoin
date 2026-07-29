"use client";

import { useState } from "react";
import { LogOutIcon, MenuIcon } from "lucide-react";

import { deconnexion } from "@/actions/auth";
import { BasculeTheme } from "@/components/layout/bascule-theme";
import { LiensNavigation } from "@/components/layout/liens-navigation";
import { Marque } from "@/components/layout/marque";
import { PastilleUtilisateur } from "@/components/layout/pastille-utilisateur";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { UtilisateurConnecte } from "@/lib/session";

export function BarreHaute({ utilisateur }: { utilisateur: UtilisateurConnecte }) {
  const [menuOuvert, setMenuOuvert] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur-sm sm:px-6">
      <Sheet open={menuOuvert} onOpenChange={setMenuOuvert}>
        <SheetTrigger
          render={<Button variant="ghost" size="icon-sm" className="lg:hidden" />}
          aria-label="Ouvrir le menu"
        >
          <MenuIcon />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 sm:max-w-64">
          <div className="flex h-14 items-center border-b px-4">
            <SheetTitle render={<span />}>
              <Marque />
            </SheetTitle>
          </div>
          <div className="p-3">
            <LiensNavigation onNavigation={() => setMenuOuvert(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="lg:hidden">
        <Marque />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <BasculeTheme />

        <span className="mx-1 hidden items-center gap-2 sm:flex lg:hidden">
          <PastilleUtilisateur utilisateur={utilisateur} className="size-7" />
        </span>

        <form action={deconnexion}>
          <Button
            type="submit"
            variant="ghost"
            size="icon-sm"
            aria-label="Se déconnecter"
            title="Se déconnecter"
          >
            <LogOutIcon />
          </Button>
        </form>
      </div>
    </header>
  );
}
