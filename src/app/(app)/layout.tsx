import { BarreHaute } from "@/components/layout/barre-haute";
import { BarreLaterale } from "@/components/layout/barre-laterale";
import { utilisateurRequis } from "@/lib/session";

export default async function LayoutApplication({
  children,
}: {
  children: React.ReactNode;
}) {
  const utilisateur = await utilisateurRequis();

  return (
    <div className="min-h-svh bg-muted/30">
      <BarreLaterale utilisateur={utilisateur} />

      <div className="flex min-h-svh flex-col lg:pl-60">
        <BarreHaute utilisateur={utilisateur} />
        <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
