import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { FournisseurTheme } from "@/components/layout/fournisseur-theme";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const sans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Atelier — gestion interne",
    template: "%s · Atelier",
  },
  description: "Outil de gestion interne de l'agence : clients, rendez-vous, tâches, offres et chiffre d'affaires.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} antialiased`}>
        <FournisseurTheme>
          {children}
          <Toaster position="bottom-right" />
        </FournisseurTheme>
      </body>
    </html>
  );
}
