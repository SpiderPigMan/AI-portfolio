const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface ChatResponse {
  answer: string;
  source?: string;
}

export const sendMessageToAgent = async (question: string): Promise<ChatResponse> => {
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) throw new Error('Error de conexión con el agente');
    
    return await response.json();
  } catch (error) {
    console.error('Chat Service Error:', error);
    throw error;
  }
};