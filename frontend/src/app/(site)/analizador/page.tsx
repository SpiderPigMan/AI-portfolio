"use client";

import { useState } from 'react';
import { 
  Sparkles, Target, Zap, FileText, AlertCircle, 
  Loader2, CheckCircle2, Trash2 
} from 'lucide-react';
import { analyzeJobOffer, AnalysisResult, validateAnalyzerInput } from '@/services/chatService';

export default function AnalizadorPage() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleClear = () => {
    setInput("");
    setValidationError(null);
    setResult(null);
  };

  const handleAnalyze = async () => {
    const validation = validateAnalyzerInput(input);
    
    if (!validation.isValid) {
      setValidationError(validation.errorMessage);
      return;
    }

    setValidationError(null);
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Lado Izquierdo: Entrada de Datos */}
        <section className="space-y-6">
          <div className="analyzer-input-wrapper">
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="Pega aquí los requisitos, tecnologías y responsabilidades de la oferta de trabajo..."
              className={`analyzer-textarea ${validationError ? 'analyzer-textarea-error' : ''}`}
              disabled={isLoading}
            />
            
            {/* Botón de Borrado */}
            {input && !isLoading && (
              <button
                onClick={handleClear}
                className="analyzer-clear-btn"
                title="Limpiar descripción"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Aviso de Error de Validación */}
          {validationError && (
            <div className="feedback-card feedback-card-amber flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-200/90 leading-relaxed">
                {validationError}
              </p>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={isLoading || !input.trim()}
            className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:grayscale transition-all font-bold text-white flex items-center justify-center gap-3 shadow-lg shadow-blue-900/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analizando Perfil...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Ejecutar Diagnóstico IA
              </>
            )}
          </button>
        </section>

        {/* Lado Derecho: Reporte de Compatibilidad */}
        <section className="h-full">
          <div className={`glass-card p-8 h-full min-h-[400px] flex flex-col ${!result && !isLoading ? 'justify-center items-center border-dashed' : ''}`}>
            {!result && !isLoading && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                  <Target className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-slate-500 font-medium">Esperando datos de la vacante...</p>
                <p className="text-slate-600 text-sm max-w-[250px] mx-auto">
                  El análisis detallado de fortalezas y gaps aparecerá aquí.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="space-y-8 w-full">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Zap className="w-8 h-8 text-blue-400 animate-pulse" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-800 rounded-full w-1/2 animate-pulse" />
                    <div className="h-3 bg-slate-800 rounded-full w-3/4 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-4 pt-4">
                  <div className="h-20 skeleton-pulse" />
                  <div className="h-20 skeleton-pulse" />
                </div>
              </div>
            )}

            {result && !isLoading && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-6">
                  <div className="relative flex items-center justify-center">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-800" />
                      <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent" 
                        strokeDasharray={226}
                        strokeDashoffset={226 - (226 * result.match_percentage) / 100}
                        className="text-blue-500 transition-all duration-1000 ease-out" 
                      />
                    </svg>
                    <span className="absolute text-xl font-bold">{result.match_percentage}%</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Compatibilidad</h3>
                    <p className="text-slate-400 text-sm">{result.recommendation}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Fortalezas Clave
                  </h4>
                  {result.strengths.map((item, i) => (
                    <div key={i} className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                      <span className="text-sm text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Gaps y Mitigación */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Gaps Detectados & Mitigación
                  </h4>
                  {result.gaps.map((gap, i) => (
                    <div key={i} className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl space-y-2">
                      <span className="text-sm font-bold text-slate-200 block">Falta: {gap.missing_skill}</span>
                      <p className="text-xs text-slate-400 italic leading-relaxed">
                        <span className="text-amber-500/80 font-semibold not-italic">Defensa:</span> {gap.mitigation}
                      </p>
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