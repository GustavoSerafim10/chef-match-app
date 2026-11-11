import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Chef's Match",
    short_name: "Chef's Match",
    description: "A gastronomia se conecta aqui.",
    start_url: "/painel",
    display: "standalone",
    background_color: "#141210",
    theme_color: "#141210",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
