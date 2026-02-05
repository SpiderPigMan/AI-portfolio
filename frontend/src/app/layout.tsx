import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jesús Mora | AI Career Agent",
  description: "Senior Portfolio & AI Offer Analyzer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        {/* Luces animadas definidas en globals.css */}
        <div className="mesh-gradient" />
        
        <Navbar />
        
        {/* Contenedor adaptativo: max-w-5xl en desktop, padding en móvil */}
        <main className="relative z-10 w-full max-w-5xl mx-auto pt-32 pb-20 px-6 sm:px-10">
          {children}
        </main>
      </body>
    </html>
  );
}