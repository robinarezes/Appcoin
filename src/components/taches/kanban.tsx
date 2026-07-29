"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { ajoutRapideTache, deplacerTache } from "@/actions/taches";
import { CarteTache, ContenuCarte } from "@/components/taches/carte-tache";
import {
  DialogueTache,
  type Membre,
  type OptionClient,
} from "@/components/taches/dialogue-tache";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STATUTS_TACHE, libelle } from "@/lib/constantes";
import type { TacheKanban } from "@/lib/requetes/taches";
import { ETAT_INITIAL } from "@/lib/validations";
import { cn } from "@/lib/utils";

type Colonne = { statut: string; taches: TacheKanban[] };

export function Kanban({
  colonnesInitiales,
  clients,
  membres,
  utilisateurId,
  clientParDefaut,
}: {
  colonnesInitiales: Colonne[];
  clients: OptionClient[];
  membres: Membre[];
  utilisateurId: string;
  clientParDefaut?: string;
}) {
  const [colonnes, setColonnes] = useState(colonnesInitiales);
  const [enDeplacement, setEnDeplacement] = useState<TacheKanban | null>(null);
  const [, demarrer] = useTransition();

  const [dialogueOuvert, setDialogueOuvert] = useState(false);
  const [tacheOuverte, setTacheOuverte] = useState<TacheKanban | null>(null);
  const [statutNouvelle, setStatutNouvelle] = useState("A_FAIRE");

  // Le serveur reste la source de vérité : on resynchronise après chaque
  // revalidation (déplacement, création, modification depuis un autre écran).
  useEffect(() => setColonnes(colonnesInitiales), [colonnesInitiales]);

  const capteurs = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const colonneDe = (id: UniqueIdentifier): string | null => {
    const identifiant = String(id);
    if (colonnes.some((c) => c.statut === identifiant)) return identifiant;
    return colonnes.find((c) => c.taches.some((t) => t.id === identifiant))?.statut ?? null;
  };

  const demarrerDeplacement = ({ active }: DragStartEvent) => {
    const tache = colonnes.flatMap((c) => c.taches).find((t) => t.id === active.id);
    setEnDeplacement(tache ?? null);
  };

  const terminerDeplacement = ({ active, over }: DragEndEvent) => {
    setEnDeplacement(null);
    if (!over) return;

    const statutSource = colonneDe(active.id);
    const statutCible = colonneDe(over.id);
    if (!statutSource || !statutCible) return;

    const tache = colonnes
      .find((c) => c.statut === statutSource)!
      .taches.find((t) => t.id === active.id);
    if (!tache) return;

    const suivantes = colonnes.map((c) => ({ ...c, taches: [...c.taches] }));
    const source = suivantes.find((c) => c.statut === statutSource)!;
    const cible = suivantes.find((c) => c.statut === statutCible)!;

    if (statutSource === statutCible) {
      const depuis = source.taches.findIndex((t) => t.id === active.id);
      const vers =
        String(over.id) === statutCible
          ? source.taches.length - 1
          : source.taches.findIndex((t) => t.id === over.id);
      if (depuis === vers || vers < 0) return;
      source.taches = arrayMove(source.taches, depuis, vers);
    } else {
      source.taches = source.taches.filter((t) => t.id !== active.id);
      const position =
        String(over.id) === statutCible
          ? cible.taches.length
          : cible.taches.findIndex((t) => t.id === over.id);
      cible.taches.splice(position < 0 ? cible.taches.length : position, 0, {
        ...tache,
        statut: statutCible,
      });
    }

    setColonnes(suivantes);

    const ids = suivantes.find((c) => c.statut === statutCible)!.taches.map((t) => t.id);
    demarrer(async () => {
      const resultat = await deplacerTache(tache.id, statutCible, ids);
      if (resultat?.erreur) {
        toast.error(resultat.erreur);
        setColonnes(colonnesInitiales);
      }
    });
  };

  const ouvrirNouvelle = (statut: string) => {
    setTacheOuverte(null);
    setStatutNouvelle(statut);
    setDialogueOuvert(true);
  };

  const ouvrirTache = (tache: TacheKanban) => {
    setTacheOuverte(tache);
    setDialogueOuvert(true);
  };

  return (
    <>
      <DndContext
        sensors={capteurs}
        collisionDetection={closestCorners}
        onDragStart={demarrerDeplacement}
        onDragEnd={terminerDeplacement}
        onDragCancel={() => setEnDeplacement(null)}
      >
        <div className="grid gap-3 lg:grid-cols-3">
          {colonnes.map((colonne) => (
            <ColonneKanban
              key={colonne.statut}
              colonne={colonne}
              onOuvrirTache={ouvrirTache}
              onNouvelle={() => ouvrirNouvelle(colonne.statut)}
              clientParDefaut={clientParDefaut}
            />
          ))}
        </div>

        <DragOverlay>
          {enDeplacement && (
            <div className="rounded-lg border bg-background p-2.5 shadow-lg">
              <ContenuCarte tache={enDeplacement} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <DialogueTache
        ouvert={dialogueOuvert}
        onOuvertChange={setDialogueOuvert}
        tache={tacheOuverte}
        clients={clients}
        membres={membres}
        utilisateurId={utilisateurId}
        statutParDefaut={statutNouvelle}
        clientParDefaut={clientParDefaut}
      />
    </>
  );
}

function ColonneKanban({
  colonne,
  onOuvrirTache,
  onNouvelle,
  clientParDefaut,
}: {
  colonne: Colonne;
  onOuvrirTache: (tache: TacheKanban) => void;
  onNouvelle: () => void;
  clientParDefaut?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: colonne.statut });

  return (
    <section
      className={cn(
        "flex flex-col rounded-xl border bg-muted/40 transition-colors",
        isOver && "border-foreground/25 bg-muted",
      )}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <h2 className="text-sm font-semibold">
          {libelle(STATUTS_TACHE, colonne.statut)}
          <span className="ml-1.5 font-normal text-muted-foreground tabular-nums">
            {colonne.taches.length}
          </span>
        </h2>
        <Button variant="ghost" size="icon-xs" onClick={onNouvelle} aria-label="Ajouter une tâche détaillée">
          <PlusIcon />
        </Button>
      </div>

      <div ref={setNodeRef} className="flex-1 px-2 pb-2">
        <SortableContext
          items={colonne.taches.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="grid min-h-16 gap-2">
            {colonne.taches.map((tache) => (
              <CarteTache key={tache.id} tache={tache} onOuvrir={onOuvrirTache} />
            ))}
          </ul>
        </SortableContext>

        <AjoutRapide statut={colonne.statut} clientId={clientParDefaut} />
      </div>
    </section>
  );
}

/** Champ texte + Entrée : la façon la plus rapide de vider sa tête. */
function AjoutRapide({ statut, clientId }: { statut: string; clientId?: string }) {
  const [etat, envoyer] = useActionState(ajoutRapideTache, ETAT_INITIAL);
  const formulaire = useRef<HTMLFormElement>(null);
  const champ = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (etat.ok) {
      formulaire.current?.reset();
      champ.current?.focus();
    }
  }, [etat]);

  return (
    <form ref={formulaire} action={envoyer} className="mt-2">
      <input type="hidden" name="statut" value={statut} />
      {clientId && <input type="hidden" name="clientId" value={clientId} />}
      <Input
        ref={champ}
        name="titre"
        placeholder="Ajouter une tâche…"
        aria-label={`Ajouter une tâche dans « ${libelle(STATUTS_TACHE, statut)} »`}
        className="border-dashed bg-background/60"
      />
    </form>
  );
}
