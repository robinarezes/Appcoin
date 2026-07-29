"use client";

import { useFormStatus } from "react-dom";
import { LoaderCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Bouton de soumission qui se désactive et tourne pendant l'envoi. */
export function BoutonSoumettre({
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending && <LoaderCircleIcon className="animate-spin" />}
      {children}
    </Button>
  );
}
