import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  return (
    <div className="relative flex flex-col items-center">
      <section className="w-full py-20 flex flex-col items-center text-center">
        
        <div className="badge-ai mb-6">
          Powered by RAG & GPT-4o
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Jesús Mora <br />
          <span className="text-gradient-ai">AI Career Agent</span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-12">
          Explora mi trayectoria a través de un asistente inteligente.
        <br />
          Análisis de vacantes y consultas técnicas en un solo lugar.
        </p>

        {/* Contenedor del Chat Refactorizado */}
        <div className="w-full max-w-4xl group relative">
          <div className="glow-border group-hover:opacity-40"></div>
          
          {/* CAMBIO AQUÍ: Quitamos aspect-video y ponemos altura fija h-[600px] */}
          <div className="glass-card relative w-full h-[500px] p-0 flex flex-col overflow-hidden">
            
            {/* Cabecera Mockup (Añadimos p-4 aquí para mantener el padding solo arriba) */}
            <div className="flex items-center gap-2 p-4 border-b border-white/5 bg-black/20 shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-500/40" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
              <div className="w-3 h-3 rounded-full bg-green-500/40" />
              <span className="ml-2 text-xs text-slate-500 font-mono">session — chat.sh</span>
            </div>
            
            {/* Contenedor del Widget: Debe ocupar todo el espacio restante */}
            <div className="flex-1 relative min-h-0">
              <ChatWidget />
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}