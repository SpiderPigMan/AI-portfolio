"use client";

import { useState } from 'react';
import { Sparkles, Target, Zap, FileText, AlertCircle } from 'lucide-react';

export default function AnalizadorPage() {
  const [input, setInput] = useState("");

  return (
    <div className="space-y-10">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">
          AI <span className="text-gradient-ai">Offer Analyzer</span>
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed">
          Introduce la descripción de una vacante para diagnosticar la compatibilidad 
          técnica con mi perfil y detectar incompatibilidades en la oferta.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Lado Izquierdo: Entrada de Datos */}
        <section className="glass-card p-8 flex flex-col gap-6 ring-1 ring-white/10 hover:ring-blue-500/30 transition-all">
          <div className="flex items-center gap-2 pb-4 border-b border-white/5">
            <FileText className="w-5 h-5 text-blue-400" />
            <h2 className="font-semibold text-slate-200 uppercase tracking-wider text-sm">Descripción de la Oferta</h2>
          </div>
          
          <textarea 
            className="ai-textarea"
            placeholder="Pega aquí el contenido de la vacante (LinkedIn, Infojobs...)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <button className="group relative w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              Realizar Diagnóstico Técnico
            </span>
          </button>
        </section>

        {/* Lado Derecho: Dashboard de Resultados */}
        <section className="glass-card p-8 bg-slate-900/40 relative overflow-hidden">
          {/* Este overlay solo se muestra cuando no hay datos */}
          {!input && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#030712]/60 backdrop-blur-[2px] text-center p-6">
              <Target className="w-12 h-12 text-slate-700 mb-4" />
              <p className="text-slate-500 italic max-w-xs text-sm">
                Esperando el cuerpo de la oferta para iniciar el análisis de compatibilidad...
              </p>
            </div>
          )}

          <div className="results-panel">
            <div className="flex items-center gap-2 pb-4 border-b border-white/5">
              <Zap className="w-5 h-5 text-emerald-400" />
              <h2 className="font-semibold text-slate-200 uppercase tracking-wider text-sm">Reporte de Compatibilidad</h2>
            </div>

            {/* Métrica Principal */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-sm text-slate-400 font-medium">Match Score</span>
                <span className="text-2xl font-bold text-emerald-400">0%</span>
              </div>
              <div className="match-gauge">
                <div className="match-gauge-fill w-0" />
              </div>
            </div>

            {/* Categorías de Análisis */}
            <div className="grid grid-cols-1 gap-4 mt-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Análisis Tecnológico</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Se identificarán las keywords y stacks requeridos para contrastarlos con mi experiencia.
                  </p>
                </div>
              </div>
              {/* Espacio para más métricas (Soft Skills, Seniority, etc.) */}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}