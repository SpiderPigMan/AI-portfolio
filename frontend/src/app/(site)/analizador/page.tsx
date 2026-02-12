"use client";

import { useState } from 'react';
import { Sparkles, Target, Zap, FileText, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { analyzeJobOffer, AnalysisResult } from '@/services/chatService';

export default function AnalizadorPage() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    setResult(null);
    try {
      const data = await analyzeJobOffer(input);
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">
          AI <span className="text-gradient-ai">Offer Analyzer</span>
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed">
          Introduce la descripción de una vacante para diagnosticar la compatibilidad 
          técnica con mi perfil y detectar estrategias de adaptación.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Lado Izquierdo: Entrada de Datos */}
        <section className="glass-card p-8 flex flex-col gap-6 ring-1 ring-white/10 hover:ring-blue-500/30 transition-all">
          <div className="flex items-center gap-2 pb-4 border-b border-white/5">
            <FileText className="w-5 h-5 text-blue-400" />
            <h2 className="font-semibold text-slate-200 uppercase tracking-wider text-sm">Descripción de la Vacante</h2>
          </div>

          <div className="flex-1 min-h-[300px]">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pega aquí el texto de la oferta de trabajo..."
              className="ai-textarea"
              disabled={isLoading}
            />
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={isLoading || !input.trim()}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Zap className="w-5 h-5" />
            )}
            {isLoading ? "Analizando Perfil..." : "Ejecutar Diagnóstico"}
          </button>
        </section>

        {/* Lado Derecho: Reporte de Compatibilidad */}
        <section className="glass-card p-8 flex flex-col gap-8 ring-1 ring-white/10">
          <div className="flex items-center gap-2 pb-4 border-b border-white/5">
            <Target className="w-5 h-5 text-emerald-400" />
            <h2 className="font-semibold text-slate-200 uppercase tracking-wider text-sm">Reporte de Compatibilidad</h2>
          </div>

          {/* Métrica Principal (Match Score) */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-sm text-slate-400 font-medium">Match Score</span>
              <span className={`text-2xl font-bold ${result ? 'text-emerald-400' : 'text-slate-600'}`}>
                {result ? `${result.match_percentage}%` : '0%'}
              </span>
            </div>
            <div className="match-gauge">
              <div 
                className="match-gauge-fill" 
                style={{ width: `${result ? result.match_percentage : 0}%` }} 
              />
            </div>
          </div>

          <div className="results-panel overflow-y-auto max-h-[400px] pr-2">
            {!result && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center py-10 opacity-40">
                <Sparkles className="w-12 h-12 mb-4" />
                <p className="text-sm">Inicia el análisis para ver el reporte detallado</p>
              </div>
            )}

            {isLoading && (
              <div className="space-y-4">
                <div className="skeleton-pulse h-20 w-full" />
                <div className="skeleton-pulse h-20 w-full" />
                <div className="skeleton-pulse h-20 w-full" />
              </div>
            )}

            {result && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                {/* Veredicto IA */}
                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                  <p className="text-sm text-blue-200 italic leading-relaxed">
                    "{result.recommendation}"
                  </p>
                </div>

                {/* Fortalezas */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fortalezas Detectadas</h4>
                  {result.strengths.map((item, i) => (
                    <div key={i} className="analysis-card-item">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-300">{item}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Gaps y Mitigación */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Gaps & Aporte</h4>
                  {result.gaps.map((gap, i) => (
                    <div key={i} className="analysis-card-item">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-200">{gap.missing_skill}</span>
                          <div className="mitigation-box">
                            <span className="font-bold mr-1">Aporte:</span> {gap.mitigation}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}