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

export const isJobOffer = (text: string): boolean => {
  // 1. Longitud mínima para evitar falsos positivos en preguntas cortas
  if (text.length < 150) return false;

  // 2. Palabras clave típicas de una Descripción de Trabajo (JD)
  const keywords = [
    'requisitos', 'experiencia', 'sueldo', 'salario', 'vacante', 
    'beneficios', 'híbrido', 'remoto', 'responsabilidades', 
    'nice to have', 'imprescindible', 'stack', 'tecnologías',
    'job description', 'skills', 'hiring'
  ];

  // 3. Contamos coincidencias (case-insensitive)
  const lowerText = text.toLowerCase();
  const matches = keywords.filter(word => lowerText.includes(word));
  
  // Si tiene al menos 2 palabras clave y la longitud adecuada, es una oferta
  return matches.length >= 2;
};

export const containsLink = (text: string): boolean => {
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
  return urlRegex.test(text);
};

export interface ValidationResult {
  isValid: boolean;
  errorMessage: string | null;
}

export const validateAnalyzerInput = (text: string): ValidationResult => {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return { isValid: false, errorMessage: 'Por favor, introduce la descripción de una oferta.' };
  }

  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
  if (urlRegex.test(trimmedText)) {
    return { 
      isValid: false, 
      errorMessage: '⚠️ He detectado un enlace. Por favor, copia y pega el texto de la descripción de la oferta, no incluyas el link directo.' 
    };
  }

  if (trimmedText.length < 200) {
    return { 
      isValid: false, 
      errorMessage: '⚠️ El texto es demasiado corto. Pega la descripción completa (requisitos, responsabilidades) para un análisis preciso.' 
    };
  }

  const techHRKeywords = [
    'requisitos', 'experiencia', 'stack', 'tecnologías', 'desarrollador', 
    'developer', 'frontend', 'backend', 'fullstack', 'salario', 'remoto', 
    'proyecto', 'conocimientos', 'años', 'years', 'skills', 'oferta', 'puesto'
  ];
  
  const lowerText = trimmedText.toLowerCase();
  const keywordMatches = techHRKeywords.filter(kw => lowerText.includes(kw));

  if (keywordMatches.length < 2) {
    return { 
      isValid: false, 
      errorMessage: '⚠️ El texto no parece una oferta tecnológica válida. Asegúrate de incluir la sección de requisitos o tecnologías.' 
    };
  }

  return { isValid: true, errorMessage: null };
};