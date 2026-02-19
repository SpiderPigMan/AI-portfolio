'use client';

import { useState, useRef, useEffect } from 'react';
import { sendMessageToAgent, isJobOffer, containsLink } from '@/services/chatService';
import { useChat } from '@/context/ChatContext';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { Send, Linkedin, UserCircle, FileText, ArrowRight, AlertTriangle } from 'lucide-react';

/* --- COMPONENTES VISUALES (Tarjetas) --- */

const LinkedInCard = () => (
  <div className="feedback-card feedback-card-blue">
    <div className="flex items-start gap-3">
      <div className="feedback-icon-wrapper icon-blue">
        <UserCircle className="w-5 h-5 text-blue-400" />
      </div>
      <div className="flex-1">
        <h4 className="feedback-title text-blue-glow">
          Contacto Directo
        </h4>
        <p className="feedback-text">
          Ese dato es sensible o muy específico. Lo mejor es que lo hables directamente con Jesús.
        </p>
        <a 
          href="https://linkedin.com/in/jesús-alberto-mora-san-andrés-5b0398112" 
          target="_blank"
          rel="noopener noreferrer"
          className="feedback-btn btn-linkedin"
        >
          <Linkedin className="w-4 h-4" />
          Conectar en LinkedIn
        </a>
      </div>
    </div>
  </div>
);

const AnalyzerActionCard = () => (
  <div className="feedback-card feedback-card-emerald">
    <div className="flex items-start gap-3">
      <div className="feedback-icon-wrapper icon-emerald">
        <FileText className="w-5 h-5 text-emerald-400" />
      </div>
      <div className="flex-1">
        <h4 className="feedback-title text-emerald-glow">
          ¡Oferta Detectada!
        </h4>
        <p className="feedback-text">
          Para darte un feedback profesional sobre esta vacante, es mejor usar mi herramienta de análisis dedicada.
        </p>
        <Link 
          href="/analizador"
          className="feedback-btn btn-emerald"
        >
          Ir al Analizador <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  </div>
);

const LinkLimitCard = () => (
  <div className="feedback-card feedback-card-amber">
    <div className="flex items-start gap-3">
      <div className="feedback-icon-wrapper icon-amber">
        <AlertTriangle className="w-5 h-5 text-amber-400" />
      </div>
      <div className="flex-1">
        <h4 className="feedback-title text-amber-glow">
          Enlace Externo Detectado
        </h4>
        <p className="feedback-text">
          Por seguridad, no tengo acceso a internet. Si quieres que analice una oferta, por favor <strong>utiliza la herramienta de análisis dedicada</strong>.
        </p>
        <Link 
          href="/analizador" 
          className="feedback-btn btn-amber"
        >
          Ir al Analizador <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  </div>
);

export default function ChatWidget() {
  const [input, setInput] = useState('');
  const { messages, addMessage, isLoading, setIsLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  
  // REF PARA CONTROLAR EL FOCO Y LA ALTURA
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
  if (isFirstRender.current) {
    isFirstRender.current = false;
    return;
  }

  messagesEndRef.current?.scrollIntoView({ 
    behavior: 'smooth',
    block: 'nearest'
  });
};

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Cada vez que isLoading cambia a false (la IA termina), devolvemos el foco
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isLoading, messages.length]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    
    // Resetear altura del textarea tras enviar
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    addMessage('user', userText);

    // --- INTERCEPTORES ---
    if (isJobOffer(userText)) {
      setIsLoading(true);
      setTimeout(() => {
        addMessage('assistant', 'He detectado una descripción de puesto. [OFFER_DETECTED]');
        setIsLoading(false);
      }, 600);
      return; 
    }

    if (containsLink(userText)) {
      setIsLoading(true);
      setTimeout(() => {
        addMessage('assistant', '⚠️ **No puedo leer enlaces externos.**\n\nPor seguridad y privacidad, no tengo acceso a internet para navegar. \n\nSi quieres que analice una oferta, por favor **utiliza la herramienta de análisis dedicada**. [LINK_DETECTED]'); 
        setIsLoading(false);
      }, 500);
      return;
    }

    setIsLoading(true);
    try {
      const response = await sendMessageToAgent(userText);
      addMessage('assistant', response.answer);
    } catch (_error) {
      addMessage('system', '⚠️ Error de conexión. Inténtalo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Ajuste dinámico de altura
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="chat-container">
      <div className="chat-scroll-area">
        {messages.length === 0 && (
          <p className="chat-empty-state">
            Hola, soy el Agente de Jesús. <br/>
            Pregúntame sobre su experiencia, stack tecnológico o proyectos.
          </p>
        )}
        
        {messages.map((m, i) => {
          const hasContactTag = m.content.includes('[CONTACT_INFO]');
          const hasOfferTag = m.content.includes('[OFFER_DETECTED]');
          const hasLinkTag = m.content.includes('[LINK_DETECTED]');

          const cleanContent = m.content
            .replace('[CONTACT_INFO]', '')
            .replace('[OFFER_DETECTED]', '')
            .replace('[LINK_DETECTED]', '')
            .trim();

          return (
            <div 
              key={i} 
              className={`chat-row ${m.role === 'user' ? 'chat-row-user' : 'chat-row-bot'}`}
            >
              <div className={`chat-bubble ${m.role === 'user' ? 'chat-bubble-user' : 'bg-[#0F172A]/80 backdrop-blur-md border border-white/10 rounded-2xl rounded-tl-sm chat-markdown shadow-lg ring-1 ring-white/5 text-left'}`}>
                {m.role === 'user' ? (
                  m.content
                ) : (
                  <>
                    <ReactMarkdown>{cleanContent}</ReactMarkdown>
                    {hasContactTag && <LinkedInCard />}
                    {hasOfferTag && <AnalyzerActionCard />}
                    {hasLinkTag && <LinkLimitCard />}
                  </>
                )}
              </div>
            </div>
          );
        })}
        
        {isLoading && <div className="chat-loading">Pensando...</div>}
        <div ref={messagesEndRef} />
      </div>

      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
        className="chat-input-area"
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ej: ¿Tienes experiencia en Java?"
          rows={1}
          className="chat-input-field resize-none overflow-hidden min-h-[48px] max-h-[150px]"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          className="chat-send-btn group"
          aria-label="Enviar mensaje"
        >
          <Send className="w-5 h-5 md:w-4 md:h-4 transition-transform group-hover:scale-110" />
          <span className="hidden md:inline font-medium">Enviar</span>
        </button>
      </form>
    </div>
  );
}