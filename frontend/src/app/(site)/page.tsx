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
          
          <div className="glass-card relative w-full aspect-video md:aspect-21/9 p-6 flex flex-col">
            {/* Cabecera Mockup */}
            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/40" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
              <div className="w-3 h-3 rounded-full bg-green-500/40" />
              <span className="ml-2 text-xs text-slate-500 font-mono">session — chat.sh</span>
            </div>
            
            {/* Contenido (Placeholder para Tarea 2) */}
            <div className="flex-1 flex flex-col justify-end gap-4 italic text-slate-500">
               // La lógica del chat se inyectará aquí...
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}