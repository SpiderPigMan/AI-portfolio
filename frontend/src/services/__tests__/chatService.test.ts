import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import * as chatService from '../chatService';

// 1. MOCK GLOBAL DE FETCH
const fetchMock = vi.fn() as Mock;
vi.stubGlobal('fetch', fetchMock);

describe('chatService - Comunicación con la API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe retornar la respuesta del agente (sendMessageToAgent)', async () => {
    const mockResponse: chatService.ChatResponse = { 
      answer: 'Respuesta del asistente', 
      source: 'RAG-CV' 
    };
    
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await chatService.sendMessageToAgent('¿Qué experiencia tiene Jesús?');
    
    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/chat'), 
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('debe retornar el análisis de la oferta (analyzeJobOffer)', async () => {
    const mockAnalysis: chatService.AnalysisResult = {
      match_percentage: 90,
      strengths: ['React', 'Node'],
      gaps: [],
      recommendation: 'Perfil ideal'
    };

    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAnalysis),
    });

    const result = await chatService.analyzeJobOffer('Oferta de trabajo...');
    
    expect(result.match_percentage).toBe(90);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/analyze'),
      expect.any(Object)
    );
  });

  it('debe lanzar un error cuando la API responde con fallo', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ detail: 'Error interno' })
    });

    await expect(chatService.sendMessageToAgent('test'))
      .rejects.toThrow('Error de conexión con el agente');
  });
});

describe('chatService - Validaciones del Analizador', () => {
  it('debe rechazar un texto vacío', () => {
    const result = chatService.validateAnalyzerInput('   ');
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('Por favor, introduce');
  });

  it('debe rechazar texto que contenga enlaces (URLs)', () => {
    const textWithLink = 'Buscamos desarrollador. Más info en www.linkedin.com/jobs';
    const result = chatService.validateAnalyzerInput(textWithLink);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('detectado un enlace');
  });

  it('debe rechazar textos demasiado cortos', () => {
    const shortText = 'Busco programador Java con 3 años de experiencia.';
    const result = chatService.validateAnalyzerInput(shortText);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('demasiado corto');
  });

  it('debe rechazar textos que no contengan palabras clave tecnológicas o de RRHH', () => {
    const randomText = 'Me gusta mucho ir a la montaña a caminar y luego comer una buena paella con mis amigos un domingo de sol.'.repeat(3);
    const result = chatService.validateAnalyzerInput(randomText);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('no parece una oferta tecnológica');
  });

  it('debe aceptar una descripción de oferta válida', () => {
    const validJD = `
      Estamos contratando un Desarrollador Senior Fullstack.
      Requisitos:
      - Al menos 5 años de experiencia con React y Node.js.
      - Conocimientos en AWS y Docker.
      Ofrecemos salario competitivo y trabajo remoto.
    `;
    const result = chatService.validateAnalyzerInput(validJD);
    expect(result.isValid).toBe(true);
    expect(result.errorMessage).toBeNull();
  });
});