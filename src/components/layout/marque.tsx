import Link from "next/link";

export function Marque() {
  return (
    <Link href="/" className="flex items-center gap-2.5 outline-none focus-visible:underline">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
        A
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold tracking-tight">Atelier</span>
        <span className="block text-[11px] text-muted-foreground">Gestion interne</span>
      </span>
    </Link>
  );
}
