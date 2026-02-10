import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chatService } from '../chatService';

describe('chatService - API Communication', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('debe retornar la respuesta del asistente cuando la llamada es exitosa', async () => {
    const mockResponse = { answer: 'Diagnóstico: Eres un genio' };
    
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await chatService.askQuestion('¿Cómo va mi código?');
    expect(result).toBe('Diagnóstico: Eres un genio');
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/ask'), expect.any(Object));
  });

  it('debe lanzar un error cuando la API falla', async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
    });

    await expect(chatService.askQuestion('test')).rejects.toThrow('Error en la conexión');
  });
});