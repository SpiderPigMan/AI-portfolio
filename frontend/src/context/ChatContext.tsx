'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Definimos la forma de nuestro mensaje
type Message = {
  role: string;
  content: string;
};

// Definimos qué datos y funciones tendrá nuestro contexto global
interface ChatContextType {
  messages: Message[];
  addMessage: (role: string, content: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // OPCIONAL: Guardar en sessionStorage para que aguante si refrescas la página (F5)
  // Si prefieres que se borre al refrescar, borra este useEffect y el siguiente.
  useEffect(() => {
    const saved = sessionStorage.getItem('chat_history');
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  useEffect(() => {
    sessionStorage.setItem('chat_history', JSON.stringify(messages));
  }, [messages]);
  // ---------------------------------------------------------------------------

  const addMessage = (role: string, content: string) => {
    setMessages((prev) => [...prev, { role, content }]);
  };

  return (
    <ChatContext.Provider value={{ messages, addMessage, isLoading, setIsLoading }}>
      {children}
    </ChatContext.Provider>
  );
}

// Hook personalizado para usar el chat en cualquier parte
export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat debe usarse dentro de un ChatProvider');
  }
  return context;
}