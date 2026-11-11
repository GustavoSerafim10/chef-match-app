import type { Metadata, Viewport } from "next";
import { Archivo_Narrow, Figtree, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo_Narrow({ variable: "--font-archivo-narrow", subsets: ["latin"], weight: ["600", "700"] });
const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["400", "600"] });

export const metadata: Metadata = {
  title: "Chef's Match",
  description: "O ecossistema digital da gastronomia: talentos, fornecedores e negócios conectados. Brasília, DF.",
  applicationName: "Chef's Match",
};

export const viewport: Viewport = {
  themeColor: "#141210",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${figtree.variable} ${mono.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
