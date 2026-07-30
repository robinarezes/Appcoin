import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Le navigateur réutilise pendant 30 s le rendu d'une page déjà visitée :
    // revenir sur Clients ou le Dashboard est instantané au lieu de repasser
    // par le serveur. Les enregistrements (Server Actions) invalident ce cache,
    // donc une modification reste visible immédiatement.
    staleTimes: {
      dynamic: 30,
    },
  },
};

export default nextConfig;
