"use client";

import { useState } from 'react';
import { Briefcase, X, ChevronRight, BadgeCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Definición de la estructura de datos para evitar "Implicit Any Anemia"
interface ExperienceItem {
  id: number;
  company: string;
  role: string;
  period: string;
  description: string;
  details: string[];
  tags: string[];
  size: string;
}

const EXPERIENCE: ExperienceItem[] = [
  {
    id: 1,
    company: "Empresa Tecnológica A",
    role: "Senior Fullstack Developer",
    period: "2023 — Presente",
    description: "Liderazgo técnico en migración de arquitecturas legacy a Next.js 15 y FastAPI.",
    details: [
      "Reducción del 40% en latencia de API mediante optimización de dependencias en Python.",
      "Arquitectura de micro-frontends escalables bajo el App Router.",
      "Implementación de estrategias de caché distribuida."
    ],
    tags: ["Next.js", "FastAPI", "Docker"],
    size: "md:col-span-2"
  },
  {
    id: 2,
    company: "Freelance",
    role: "AI Integration Specialist",
    period: "2024",
    description: "Desarrollo de agentes RAG para análisis documental masivo.",
    details: [
      "Integración de modelos LLM con bases de datos vectoriales.",
      "Desarrollo de pipelines automatizados de limpieza de datos.",
      "Optimización de prompts para reducción de alucinaciones."
    ],
    tags: ["OpenAI", "Vector DB", "RAG"],
    size: "md:col-span-1"
  },
  {
    id: 3,
    company: "Consultora Software X",
    role: "Frontend Engineer",
    period: "2021 — 2023",
    description: "Optimización de Core Web Vitals en plataformas de alto tráfico.",
    details: [
      "Mejora del 30% en LCP mediante carga diferida y optimización de assets.",
      "Desarrollo de librerías de componentes internos reutilizables.",
      "Migración de RxJS complejo a señales de Angular."
    ],
    tags: ["Angular", "TypeScript", "RxJS"],
    size: "md:col-span-1"
  },
  {
    id: 4,
    company: "Orange",
    role: "Fullstack Developer",
    period: "2019 — 2021",
    description: "Sistemas de gestión de red y visualización de datos en tiempo real.",
    details: [
      "Desarrollo de dashboards interactivos para monitorización de red.",
      "Mantenimiento de microservicios robustos en Java Spring Boot.",
      "Colaboración en entornos ágiles con despliegue continuo."
    ],
    tags: ["Java", "Spring Boot", "React"],
    size: "md:col-span-2"
  }
];

// 'as const' asegura que el tipo sea exactamente este literal para Framer Motion
const transitionSpring = {
  type: "spring",
  stiffness: 400,
  damping: 35
} as const;

const COMMON_RADIUS = 24; // Radio en píxeles para interpolación numérica limpia

export default function ExperienciaPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedExp = EXPERIENCE.find(exp => exp.id === selectedId);

  return (
    <div className="space-y-12">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">
          Trayectoria <span className="text-gradient-ai">Profesional</span>
        </h1>
      </header>

      <section className="bento-grid relative z-10">
        {EXPERIENCE.map((item) => (
          <motion.article
            layoutId={`card-${item.id}`}
            key={item.id}
            onClick={() => setSelectedId(item.id)}
            transition={transitionSpring}
            initial={{ borderRadius: COMMON_RADIUS }}
            className={`cursor-pointer group relative flex flex-col bg-slate-900/40 border border-white/10 overflow-hidden ${item.size}`}
            style={{ borderRadius: COMMON_RADIUS }}
          >
            <div className="p-6 h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-blue-600/10 rounded-lg border border-blue-500/20 group-hover:bg-blue-600/20 transition-colors">
                    <Briefcase className="w-4 h-4 text-blue-400" />
                  </div>
                  <BadgeCheck className="w-4 h-4 text-slate-700 group-hover:text-blue-500 transition-colors" />
                </div>
                
                <motion.div layoutId={`header-container-${item.id}`} className="origin-top-left">
                    <h3 className="text-xl font-bold text-slate-100 leading-tight mb-1">{item.role}</h3>
                    <p className="text-blue-400 font-medium text-sm">{item.company}</p>
                </motion.div>
                <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">{item.description}</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {item.tags.map(tag => <span key={tag} className="tech-tag">{tag}</span>)}
              </div>
            </div>
          </motion.article>
        ))}
      </section>

      <AnimatePresence>
        {selectedId && selectedExp && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              className="fixed inset-0 bg-[#030712]/80 backdrop-blur-md z-[60]"
            />
            <div className="fixed inset-0 flex items-center justify-center z-[70] p-4 pointer-events-none">
              <motion.div
                layoutId={`card-${selectedId}`}
                transition={transitionSpring}
                initial={{ borderRadius: COMMON_RADIUS }}
                animate={{ borderRadius: COMMON_RADIUS }}
                exit={{ borderRadius: COMMON_RADIUS }}
                className="bg-slate-900/90 border border-white/20 w-full max-w-3xl pointer-events-auto relative overflow-hidden shadow-2xl"
                style={{ borderRadius: COMMON_RADIUS, maxHeight: '85vh' }}
              >
                <div className="p-8 h-full w-full overflow-y-auto">
                    <button onClick={() => setSelectedId(null)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors z-20">
                      <X className="w-5 h-5 text-slate-400" />
                    </button>

                    <div className="space-y-8">
                      <header>
                        <motion.div layoutId={`header-container-${selectedId}`} className="origin-top-left">
                            <h3 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">{selectedExp.role}</h3>
                            <p className="text-blue-400 text-lg font-medium">{selectedExp.company} • {selectedExp.period}</p>
                        </motion.div>
                      </header>
                      
                      <div className="space-y-6">
                        <h4 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Logros Clave</h4>
                        <ul className="space-y-4">
                          {/* Ahora TypeScript sabe que 'detail' es string e 'i' es number gracias a la interfaz */}
                          {selectedExp.details.map((detail, i) => (
                              <li key={i} className="flex gap-3 text-slate-300 items-start">
                                <ChevronRight className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                <span>{detail}</span>
                              </li>
                          ))}
                        </ul>
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