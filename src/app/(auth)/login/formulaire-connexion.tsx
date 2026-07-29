"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircleIcon, LoaderCircleIcon } from "lucide-react";

import { connexion, type EtatConnexion } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function BoutonEnvoyer() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="mt-2 w-full" disabled={pending}>
      {pending && <LoaderCircleIcon className="animate-spin" />}
      Se connecter
    </Button>
  );
}

export function FormulaireConnexion({ suite }: { suite?: string }) {
  const [etat, action] = useActionState<EtatConnexion, FormData>(connexion, {});

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="suite" value={suite ?? "/"} />

      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="prenom@agence.fr"
          required
          autoFocus
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="motDePasse">Mot de passe</Label>
        <Input
          id="motDePasse"
          name="motDePasse"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      {etat.erreur && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
          {etat.erreur}
        </p>
      )}

      <BoutonEnvoyer />
    </form>
  );
}
