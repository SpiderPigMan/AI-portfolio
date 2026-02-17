export interface ChatResponse {
  answer: string;
  source?: string;
}

export interface GapDetail {
  missing_skill: string;
  mitigation: string;
}

export interface AnalysisResult {
  match_percentage: number;
  strengths: string[];
  gaps: GapDetail[];
  recommendation: string;
}

export const sendMessageToAgent = async (question: string): Promise<ChatResponse> => {
  try {
    const response = await fetch(`/api/chat`, {
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

export const analyzeJobOffer = async (jobText: string): Promise<AnalysisResult> => {
  try {
    const response = await fetch(`/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: jobText }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error analizando oferta: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en chatService (analyzeJobOffer):', error);
    throw error;
  }
};