import { Navbar } from "@/components/Navbar";

/**
 * Layout específico para el grupo de rutas (site).
 * Implementa la interfaz de usuario común para todas las vistas públicas.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div className="mesh-gradient" />
      <Navbar />
      <main className="relative z-10 pt-32 px-6 max-w-5xl mx-auto">
        {children}
      </main>
    </div>
  );
}