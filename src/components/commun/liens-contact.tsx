import { MailIcon, PhoneIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Numéro cliquable : lance l'appel depuis un téléphone, Skype/Teams sur le poste. */
export function LienTelephone({
  numero,
  className,
  avecIcone = false,
}: {
  numero: string | null | undefined;
  className?: string;
  avecIcone?: boolean;
}) {
  if (!numero) return <span className="text-muted-foreground">—</span>;

  return (
    <a
      href={`tel:${numero.replace(/\s/g, "")}`}
      className={cn(
        "inline-flex items-center gap-1.5 tabular-nums hover:text-foreground hover:underline",
        className,
      )}
    >
      {avecIcone && <PhoneIcon className="size-3.5 shrink-0 text-muted-foreground" />}
      {numero}
    </a>
  );
}

export function LienEmail({
  email,
  className,
  avecIcone = false,
}: {
  email: string | null | undefined;
  className?: string;
  avecIcone?: boolean;
}) {
  if (!email) return <span className="text-muted-foreground">—</span>;

  return (
    <a
      href={`mailto:${email}`}
      className={cn(
        "inline-flex min-w-0 items-center gap-1.5 hover:text-foreground hover:underline",
        className,
      )}
    >
      {avecIcone && <MailIcon className="size-3.5 shrink-0 text-muted-foreground" />}
      <span className="truncate">{email}</span>
    </a>
  );
}
