"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { CopyIcon, KeyRoundIcon, RefreshCwIcon, UserMinusIcon, UserPlusIcon } from "lucide-react";
import { toast } from "sonner";

import { basculerAcces, changerMotDePasse } from "@/actions/equipe";
import { BoutonSoumettre } from "@/components/commun/bouton-soumettre";
import { Champ } from "@/components/commun/champ";
import { PastilleUtilisateur } from "@/components/layout/pastille-utilisateur";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/dates";
import { genererMotDePasse } from "@/lib/mot-de-passe";
import type { MembreEquipe } from "@/lib/requetes/equipe";
import { ETAT_INITIAL } from "@/lib/validations";
import { cn } from "@/lib/utils";

export function ListeMembres({
  membres,
  utilisateurId,
}: {
  membres: MembreEquipe[];
  utilisateurId: string;
}) {
  const [cible, setCible] = useState<MembreEquipe | null>(null);
  const [enCours, demarrer] = useTransition();

  const basculer = (membre: MembreEquipe) =>
    demarrer(async () => {
      const resultat = await basculerAcces(membre.id, !membre.actif);
      if (resultat?.erreur) {
        toast.error(resultat.erreur);
        return;
      }
      toast.success(
        membre.actif
          ? `${membre.nom} n'a plus accès à l'application.`
          : `${membre.nom} a de nouveau accès.`,
      );
    });

  return (
    <>
      <ul className="grid divide-y">
        {membres.map((membre) => (
          <li
            key={membre.id}
            className={cn(
              "flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0",
              !membre.actif && "opacity-60",
            )}
          >
            <PastilleUtilisateur utilisateur={membre} />

            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-medium">
                {membre.nom}
                {membre.id === utilisateurId && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
                    vous
                  </span>
                )}
                {!membre.actif && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
                    accès retiré
                  </span>
                )}
              </p>
              <p className="truncate text-sm text-muted-foreground">{membre.email}</p>
              <p className="text-xs text-muted-foreground">
                Compte créé le {formatDate(membre.createdAt)}
                {membre.contributions > 0 && ` · ${membre.contributions} éléments à son nom`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCible(membre)}>
                <KeyRoundIcon />
                Mot de passe
              </Button>

              {membre.id !== utilisateurId && (
                <Button
                  variant={membre.actif ? "destructive" : "outline"}
                  size="sm"
                  disabled={enCours}
                  onClick={() => basculer(membre)}
                >
                  {membre.actif ? <UserMinusIcon /> : <UserPlusIcon />}
                  {membre.actif ? "Retirer l'accès" : "Rendre l'accès"}
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <DialogueMotDePasse membre={cible} onFermer={() => setCible(null)} />
    </>
  );
}

function DialogueMotDePasse({
  membre,
  onFermer,
}: {
  membre: MembreEquipe | null;
  onFermer: () => void;
}) {
  const [etat, envoyer] = useActionState(changerMotDePasse, ETAT_INITIAL);
  const [motDePasse, setMotDePasse] = useState("");

  useEffect(() => {
    if (membre) setMotDePasse(genererMotDePasse());
  }, [membre]);

  useEffect(() => {
    if (etat.ok) {
      toast.success(etat.message ?? "Mot de passe modifié");
      onFermer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etat]);

  return (
    <Dialog open={membre !== null} onOpenChange={(ouvert) => !ouvert && onFermer()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Changer le mot de passe</DialogTitle>
          <DialogDescription>
            {membre?.nom} devra utiliser ce nouveau mot de passe à sa prochaine
            connexion. Notez-le avant de valider.
          </DialogDescription>
        </DialogHeader>

        <form key={membre?.id} action={envoyer} className="grid gap-4">
          <input type="hidden" name="utilisateurId" value={membre?.id ?? ""} />

          <Champ
            id="nouveau-mdp"
            label="Nouveau mot de passe"
            obligatoire
            erreur={etat.erreurs?.motDePasse}
          >
            <div className="flex gap-2">
              <Input
                id="nouveau-mdp"
                name="motDePasse"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                className="font-mono"
                required
                minLength={8}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Générer un autre mot de passe"
                onClick={() => setMotDePasse(genererMotDePasse())}
              >
                <RefreshCwIcon />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Copier le mot de passe"
                onClick={() => {
                  navigator.clipboard.writeText(motDePasse);
                  toast.success("Mot de passe copié");
                }}
              >
                <CopyIcon />
              </Button>
            </div>
          </Champ>

          <Champ
            id="confirmation-mdp"
            label="Confirmer"
            obligatoire
            erreur={etat.erreurs?.confirmation}
          >
            <Input
              id="confirmation-mdp"
              name="confirmation"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="font-mono"
              required
            />
          </Champ>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onFermer}>
              Annuler
            </Button>
            <BoutonSoumettre>Enregistrer</BoutonSoumettre>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
