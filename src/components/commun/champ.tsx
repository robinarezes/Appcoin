import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Libellé + contrôle + message d'erreur, mise en forme unique pour tous les formulaires. */
export function Champ({
  id,
  label,
  erreur,
  indication,
  obligatoire,
  className,
  children,
}: {
  id: string;
  label: string;
  erreur?: string;
  indication?: string;
  obligatoire?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {obligatoire && (
          <span className="text-destructive" aria-hidden>
            *
          </span>
        )}
      </Label>
      {children}
      {indication && !erreur && (
        <p className="text-xs text-muted-foreground">{indication}</p>
      )}
      {erreur && (
        <p role="alert" className="text-xs text-destructive">
          {erreur}
        </p>
      )}
    </div>
  );
}
