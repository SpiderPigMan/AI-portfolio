"use client";

import { useState } from 'react';
import { Briefcase, X, ChevronRight, BadgeCheck, Code2, Terminal, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Definición de la estructura de datos
interface ExperienceItem {
  id: number;
  company: string;
  role: string;
  period: string;
  description: string;
  details: string[];
  tags: string[];
  size: string; // Para controlar el grid (md:col-span-2 o col-span-1)
  icon?: React.ReactNode; // Opcional: para diferenciar visualmente el Portfolio
}

const EXPERIENCE: ExperienceItem[] = [
  {
    id: 1,
    company: "Portfolio & Máster IA",
    role: "AI Software Architect & Full Stack",
    period: "Actualidad",
    description: "Desarrollo de un perfil interactivo que fusiona arquitectura web moderna con Inteligencia Artificial Generativa (RAG).",
    details: [
      "Arquitectura Frontend Escalable: Next.js 15 (App Router), Tailwind CSS y Framer Motion para una UX fluida (Glassmorphism).",
      "Ingeniería de IA: Implementación de sistema RAG (Retrieval-Augmented Generation) con LangChain y ChromaDB.",
      "Backend Híbrido: API de alto rendimiento en Python (FastAPI) orquestando modelos LLM (OpenAI/DeepSeek).",
      "Diseño de Producto: Creación de un 'Analizador de Candidatura' capaz de generar estrategias de defensa técnica frente a ofertas reales."
    ],
    tags: ["Next.js 15", "Python", "RAG / LangChain", "Vector DB"],
    size: "md:col-span-2",
    icon: <Cpu className="w-5 h-5 text-emerald-400" />
  },
  {
    id: 2,
    company: "Apiux Tech",
    role: "Analista Programador Full Stack",
    period: "Mar 2025 — Actualidad",
    description: "Especialista en el desarrollo moderno en sistemas legacy y refactorización.",
    details: [
      "Análisis de deuda técnica en sistemas heredados (Java J2EE/JSP).",
      "Optimización de consultas y refactorización de lógica de negocio crítica.",
      "Mantenimiento evolutivo y correctivo de aplicativos existentes, asegurando la estabilidad de la aplicación",
      "Garantía de continuidad operativa y soporte técnico durante las fases críticas de despliegue."
    ],
    tags: ["Java 6", "JSP", "SQL"],
    size: "md:col-span-1",
    icon: <Briefcase className="w-5 h-5 text-blue-400" />
  },
  {
    id: 3,
    company: "NTT DATA",
    role: "Angular Specialist",
    period: "Ago 2018 — Feb 2024",
    description: "Seniority técnico en proyectos críticos para la Junta de Andalucía, gestionando la evolución del Frontend durante 6 años.",
    details: [
      "Evolución de Arquitectura: Migración y mantenimiento de aplicaciones desde Angular JS hasta Angular 14.",
      "Optimización de Rendimiento: Manejo de grandes volúmenes de datos en cliente (Data Grids complejos).",
      "Tech Leadership: Definición de estándares de código, Code Reviews y mentoría a desarrolladores junior.",
      "Integración: Desarrollo de Micro-frontends y Web Components para módulos de venta.",
      "Testing: Cobertura de pruebas unitarias con Jasmine/Karma."
    ],
    tags: ["Angular", "TypeScript", "RxJS", "Micro-frontends"],
    size: "md:col-span-2",
    icon: <Terminal className="w-5 h-5 text-amber-400" />
  },
  {
    id: 4,
    company: "Delega y Funciona",
    role: "Desarrollador Front-end",
    period: "Abr 2017 — Ago 2018",
    description: "Desarrollo de fundamentos web y mantenimiento evolutivo de aplicaciones corporativas.",
    details: [
      "Implementación de interfaces con HTML5, CSS y JavaScript (ES6).",
      "Mantenimiento de sistemas en ASP Classic.",
      "Aplicación estricta de principios SOLID y DRY desde el inicio de la carrera.",
      "Debugging eficiente en entornos de producción."
    ],
    tags: ["ASP Classic", "HTML/CSS", "SQL"],
    size: "md:col-span-1",
    icon: <Code2 className="w-5 h-5 text-purple-400" />
  }
];

export default function ExperienciaPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selectedExp = EXPERIENCE.find((e) => e.id === selectedId);

  return (
    <div className="view-container">
      <header className="view-header">
        <h1 className="view-title">
          Trayectoria <span className="text-gradient-ai">Profesional</span>
        </h1>
        <p className="view-description">
          Un recorrido por mi evolución técnica: desde el desarrollo Full Stack 
          hasta la arquitectura de soluciones impulsadas por IA.
        </p>
      </header>

      {/* Grid de Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {EXPERIENCE.map((exp) => (
          <motion.div
            key={exp.id}
            layoutId={`card-container-${exp.id}`}
            onClick={() => setSelectedId(exp.id)}
            className={`${exp.size} group relative bg-slate-900/50 border border-white/5 rounded-3xl p-6 cursor-pointer hover:bg-slate-800/50 hover:border-blue-500/30 transition-all overflow-hidden`}
          >
            {/* Efecto Glow en Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 h-full flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform duration-300">
                  {exp.icon || <Briefcase className="w-6 h-6 text-blue-400" />}
                </div>
                <span className="text-xs font-mono text-slate-500 bg-black/30 px-2 py-1 rounded-lg border border-white/5">
                  {exp.period}
                </span>
              </div>

              <motion.h3 
                layoutId={`title-${exp.id}`}
                className="text-xl font-bold text-slate-100 mb-2 group-hover:text-blue-400 transition-colors"
              >
                {exp.role}
              </motion.h3>
              
              <p className="text-slate-400 text-sm mb-6 flex-grow leading-relaxed">
                {exp.description}
              </p>

              <div className="flex flex-wrap gap-2 mt-auto">
                {exp.tags.map((tag, i) => (
                  <span key={i} className="text-xs font-medium text-slate-300 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Expandido (AnimatePresence) */}
      <AnimatePresence>
        {selectedId && selectedExp && (
          <>
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Modal Card */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-none">
              <motion.div
                layoutId={`card-container-${selectedId}`}
                className="w-full max-w-2xl bg-[#0B1120] border border-white/10 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[85vh]"
              >
                {/* Header del Modal */}
                <div className="relative p-6 md:p-8 border-b border-white/5 bg-gradient-to-b from-blue-900/10 to-transparent">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedId(null); }}
                    className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                  >
                    <X size={20} />
                  </button>

                  <motion.div layoutId={`title-${selectedId}`} className="pr-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{selectedExp.role}</h2>
                  </motion.div>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-semibold text-blue-400 flex items-center gap-1">
                      <BadgeCheck className="w-4 h-4" />
                      {selectedExp.company}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400 font-mono">{selectedExp.period}</span>
                  </div>
                </div>

                {/* Contenido Scrollable */}
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                   <div className="space-y-8">
                      
                      {/* Sección de Logros / Detalles */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                          <Terminal className="w-4 h-4" />
                          Responsabilidades & Impacto
                        </h4>
                        <ul className="grid gap-3">
                          {selectedExp.details.map((detail, i) => (
                              <motion.li 
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex gap-4 text-slate-300 items-start bg-white/[0.02] p-3 rounded-xl border border-white/5 hover:border-blue-500/20 transition-colors"
                              >
                                <ChevronRight className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="leading-relaxed text-sm md:text-base">{detail}</span>
                              </motion.li>
                          ))}
                        </ul>
                      </div>

                      {/* Tags Footer */}
                      <div className="pt-6 border-t border-white/5">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Tecnologías Clave</h4>
                        <div className="flex flex-wrap gap-2">
                            {selectedExp.tags.map((tag, i) => (
                                <span key={i} className="text-xs font-mono text-cyan-300 bg-cyan-950/30 px-2 py-1 rounded border border-cyan-500/20">
                                    {tag}
                                </span>
                            ))}
                        </div>
                      </div>

                    </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}