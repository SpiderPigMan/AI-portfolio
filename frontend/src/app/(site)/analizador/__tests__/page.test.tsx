import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AnalizadorPage from '../page';
import * as chatService from '@/services/chatService';

// 1. MOCK DEL SERVICIO DE API Y VALIDACIÓN
vi.mock('@/services/chatService', () => ({
  analyzeJobOffer: vi.fn(),
  validateAnalyzerInput: vi.fn((text: string) => {
    if (!text.trim()) return { isValid: false, errorMessage: 'Introduce una oferta.' };
    if (text.includes('http')) return { isValid: false, errorMessage: '⚠️ Copia el texto, no el link.' };
    if (text.length < 200) return { isValid: false, errorMessage: '⚠️ Texto demasiado corto.' };
    return { isValid: true, errorMessage: null };
  }),
}));

// 2. MOCK DE FRAMER MOTION
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

describe('AnalizadorPage', () => {
  const mockAnalysisResponse = {
    match_percentage: 85,
    recommendation: "Perfil muy sólido.",
    strengths: ["React"],
    gaps: [{ missing_skill: "Python", mitigation: "Bases en Java" }]
  };

  // Texto largo para pasar la validación (>200 caracteres)
  const validJobText = "Buscamos un desarrollador frontend senior con amplia experiencia en el ecosistema de React. El candidato ideal debe dominar TypeScript, Tailwind CSS y tener conocimientos sólidos en arquitecturas modernas y testing. Ofrecemos un entorno de trabajo remoto y proyectos innovadores con impacto real en millones de usuarios.".repeat(2);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar correctamente el estado inicial', () => {
    render(<AnalizadorPage />);
    expect(screen.getByText(/Offer Analyzer/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ejecutar Diagnóstico IA/i })).toBeDisabled();
  });

  it('debe mostrar error de validación si el texto es muy corto', () => {
    render(<AnalizadorPage />);
    const textarea = screen.getByPlaceholderText(/Pega aquí los requisitos/i);
    
    // Texto de menos de 200 caracteres
    fireEvent.change(textarea, { target: { value: 'Texto muy corto' } });
    fireEvent.click(screen.getByRole('button', { name: /Ejecutar Diagnóstico IA/i }));

    expect(screen.getByText(/Texto demasiado corto/i)).toBeInTheDocument();
  });

  it('debe limpiar el texto y errores al pulsar el botón de borrado', () => {
    render(<AnalizadorPage />);
    const textarea = screen.getByPlaceholderText(/Pega aquí los requisitos/i);
    
    fireEvent.change(textarea, { target: { value: 'Contenido a borrar' } });
    
    const clearBtn = screen.getByTitle(/Limpiar descripción/i);
    fireEvent.click(clearBtn);

    expect(textarea).toHaveValue('');
    expect(screen.queryByTitle(/Limpiar descripción/i)).not.toBeInTheDocument();
  });

  it('debe mostrar el cargando y luego los resultados si la validación pasa', async () => {
    const spy = vi.spyOn(chatService, 'analyzeJobOffer').mockResolvedValue(mockAnalysisResponse);
    
    render(<AnalizadorPage />);
    const textarea = screen.getByPlaceholderText(/Pega aquí los requisitos/i);
    const button = screen.getByRole('button', { name: /Ejecutar Diagnóstico IA/i });

    fireEvent.change(textarea, { target: { value: validJobText } });
    fireEvent.click(button);

    expect(screen.getByText(/Analizando Perfil.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText(/Perfil muy sólido/i)).toBeInTheDocument();
    });

    expect(spy).toHaveBeenCalledWith(validJobText);
  });
});