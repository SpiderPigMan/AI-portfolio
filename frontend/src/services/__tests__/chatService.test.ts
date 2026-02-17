import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import * as chatService from '../chatService';

// 1. MOCK GLOBAL DE FETCH SIN USAR 'ANY'
// Usamos el tipo Mock de vitest para mantener el tipado estricto
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
    
    // Configuramos el mock para una respuesta exitosa
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
    // Simulamos un error 500 del servidor
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ detail: 'Error interno' })
    });

    await expect(chatService.sendMessageToAgent('test'))
      .rejects.toThrow('Error de conexión con el agente');
  });
});