"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function BasculeTheme() {
  const { resolvedTheme, setTheme } = useTheme();
  const [monte, setMonte] = useState(false);

  // Le thème résolu n'est connu qu'au montage : on réserve la place pour
  // éviter un décalage de mise en page et une erreur d'hydratation.
  useEffect(() => setMonte(true), []);

  const sombre = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={sombre ? "Passer en thème clair" : "Passer en thème sombre"}
      title={sombre ? "Thème clair" : "Thème sombre"}
      onClick={() => setTheme(sombre ? "light" : "dark")}
    >
      {monte ? sombre ? <SunIcon /> : <MoonIcon /> : <span className="size-4" />}
    </Button>
  );
}
