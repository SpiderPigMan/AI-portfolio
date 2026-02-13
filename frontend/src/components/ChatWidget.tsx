'use client';

import { useState, useRef, useEffect } from 'react';
import { sendMessageToAgent } from '@/services/chatService';
import { useChat } from '@/context/ChatContext';
import ReactMarkdown from 'react-markdown';

export default function ChatWidget() {
  const [input, setInput] = useState('');
  // YA NO usamos useState para messages ni isLoading locales
  // Usamos los del contexto global
  const { messages, addMessage, isLoading, setIsLoading } = useChat();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll automático cuando cambian los mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input; // Guardamos el texto antes de borrar el input
    setInput(''); // Limpiamos input visualmente rápido
    
    // 1. Añadir al estado global
    addMessage('user', userText);
    setIsLoading(true);

    try {
      // 2. Llamar al Backend
      const response = await sendMessageToAgent(userText);
      
      // 3. Añadir respuesta al estado global
      addMessage('assistant', response.answer);
    } catch (error) {
      addMessage('system', '⚠️ Error de conexión. Inténtalo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      {/* Área de Mensajes */}
      <div className="chat-scroll-area">
        {messages.length === 0 && (
          <p className="chat-empty-state">
            Hola, soy el Agente de Jesús. <br/>
            Pregúntame sobre su experiencia, stack tecnológico o proyectos.
          </p>
        )}
        
        {messages.map((m, i) => (
          <div 
            key={i} 
            className={`chat-row ${m.role === 'user' ? 'chat-row-user' : 'chat-row-bot'}`}
          >
            <div className={`chat-bubble ${m.role === 'user' ? 'chat-bubble-user' : 'bg-[#0F172A]/80 backdrop-blur-md border border-white/10 rounded-2xl rounded-tl-sm chat-markdown shadow-lg ring-1 ring-white/5 text-left'}`}>
              {m.role === 'user' ? (
                m.content
              ) : (
                <ReactMarkdown>{m.content}</ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && <div className="chat-loading">Pensando...</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="chat-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ej: ¿Tienes experiencia en Java?"
          className="chat-input-field"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          className="chat-send-btn"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}