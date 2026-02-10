// src/services/chatService.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const sendMessage = async (question: string, context?: any) => {
  try {
    // 1. Llamada al endpoint del Backend
    // IMPORTANTE: Verifica si tu endpoint en Python es "/ask", "/chat" o "/api/chat"
    const response = await fetch(`${API_URL}/ask`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        context, // Si tu backend espera contexto
      }),
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Debería devolver { answer: "...", source: "..." }
  } catch (error) {
    console.error('Error conectando con el agente:', error);
    throw error;
  }
};