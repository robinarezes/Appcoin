import { EnTetePage } from "@/components/commun/en-tete-page";
import { SectionFiche } from "@/components/commun/section-fiche";
import { AjoutMembre } from "@/components/equipe/ajout-membre";
import { ListeMembres } from "@/components/equipe/liste-membres";
import { MonProfil } from "@/components/equipe/mon-profil";
import { COULEURS_EQUIPE } from "@/lib/constantes";
import { listerEquipe } from "@/lib/requetes/equipe";
import { utilisateurRequis } from "@/lib/session";

export const metadata = { title: "Équipe" };

export default async function PageEquipe() {
  const utilisateur = await utilisateurRequis();
  const membres = await listerEquipe();

  const prises = new Set(membres.map((m) => m.couleur));
  const couleurProposee =
    COULEURS_EQUIPE.find((c) => !prises.has(c.valeur))?.valeur ??
    COULEURS_EQUIPE[membres.length % COULEURS_EQUIPE.length].valeur;

  return (
    <div className="mx-auto max-w-3xl">
      <EnTetePage
        titre="Équipe"
        description="Les comptes qui ont accès à l'application. Il n'y a pas d'inscription publique : c'est ici qu'on ouvre un accès."
      />

      <div className="grid gap-4">
        <SectionFiche titre="Mon profil">
          <MonProfil utilisateur={utilisateur} />
        </SectionFiche>

        <SectionFiche titre="Membres" compte={membres.length}>
          <ListeMembres membres={membres} utilisateurId={utilisateur.id} />
        </SectionFiche>

        <SectionFiche titre="Ajouter quelqu'un">
          <AjoutMembre couleurProposee={couleurProposee} />
        </SectionFiche>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Retirer un accès ne supprime pas le compte : les notes, rendez-vous et
        appels restent attribués à leur auteur, et l&apos;accès peut être rendu
        à tout moment. La personne est déconnectée dès sa page suivante.
      </p>
    </div>
  );
}
