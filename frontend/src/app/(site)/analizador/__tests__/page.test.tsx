import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AnalizadorPage from '../page';
import * as chatService from '@/services/chatService';

// 1. MOCK DEL SERVICIO DE API
vi.mock('@/services/chatService', () => ({
  analyzeJobOffer: vi.fn(),
}));

// 2. MOCK DE FRAMER MOTION (Para evitar errores de animación en el build)
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => 
      <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('AnalizadorPage', () => {
  const mockAnalysisResponse = {
    match_percentage: 85,
    recommendation: "Perfil muy sólido para el puesto.",
    strengths: ["Experiencia en React", "Arquitectura Cloud"],
    gaps: [
      { missing_skill: "Python", mitigation: "Tiene bases fuertes en Java" }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar correctamente el estado inicial', () => {
    render(<AnalizadorPage />);
    
    expect(screen.getByText(/AI/i)).toBeInTheDocument();
    expect(screen.getByText(/Offer Analyzer/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Pega aquí el texto de la oferta/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ejecutar Diagnóstico/i })).toBeDisabled();
  });

  it('debe habilitar el botón cuando el usuario escribe una oferta', () => {
    render(<AnalizadorPage />);
    
    const textarea = screen.getByPlaceholderText(/Pega aquí el texto de la oferta/i);
    fireEvent.change(textarea, { target: { value: 'Buscamos desarrollador React' } });
    
    expect(screen.getByRole('button', { name: /Ejecutar Diagnóstico/i })).not.toBeDisabled();
  });

  it('debe mostrar el cargando y luego los resultados de la IA', async () => {
    // Simulamos la respuesta del servicio
    const spy = vi.spyOn(chatService, 'analyzeJobOffer').mockResolvedValue(mockAnalysisResponse);
    
    render(<AnalizadorPage />);
    
    const textarea = screen.getByPlaceholderText(/Pega aquí el texto de la oferta/i);
    const button = screen.getByRole('button', { name: /Ejecutar Diagnóstico/i });

    fireEvent.change(textarea, { target: { value: 'Oferta de trabajo de prueba' } });
    fireEvent.click(button);

    // Verificamos estado de carga
    expect(screen.getByText(/Analizando Perfil.../i)).toBeInTheDocument();

    // Esperamos a que los resultados aparezcan en el DOM
    await waitFor(() => {
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText(/Perfil muy sólido/i)).toBeInTheDocument();
    });

    // Verificamos que se han renderizado las fortalezas y gaps
    expect(screen.getByText("Experiencia en React")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(spy).toHaveBeenCalledWith('Oferta de trabajo de prueba');
  });

  it('debe manejar errores en la petición de forma controlada', async () => {
    // Simulamos un fallo en la API
    vi.spyOn(chatService, 'analyzeJobOffer').mockRejectedValue(new Error('API Error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<AnalizadorPage />);
    
    const textarea = screen.getByPlaceholderText(/Pega aquí el texto de la oferta/i);
    fireEvent.change(textarea, { target: { value: 'Oferta fallida' } });
    fireEvent.click(screen.getByRole('button', { name: /Ejecutar Diagnóstico/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Analizando Perfil.../i)).not.toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});