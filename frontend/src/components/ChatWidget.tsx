'use client';

import { useState, useRef, useEffect } from 'react';
import { sendMessageToAgent, isJobOffer, containsLink } from '@/services/chatService';
import { useChat } from '@/context/ChatContext';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { Send, Linkedin, UserCircle, FileText, ArrowRight, AlertTriangle } from 'lucide-react';

// --- COMPONENTE TARJETA LINKEDIN (Visual) ---
const LinkedInCard = () => (
  <div className="mt-4 p-4 bg-blue-950/20 border border-blue-500/30 rounded-xl animate-in fade-in slide-in-from-bottom-2">
    <div className="flex items-start gap-3">
      <div className="p-2 bg-blue-500/10 rounded-full shrink-0">
        <UserCircle className="w-5 h-5 text-blue-400" />
      </div>
      <div className="flex-1">
        <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">
          Contacto Directo
        </h4>
        <p className="text-sm text-slate-300 mb-3 leading-relaxed">
          Ese dato es sensible o muy específico. Lo mejor es que lo hables directamente con Jesús.
        </p>
        <a 
          href="https://linkedin.com/in/jesús-alberto-mora-san-andrés-5b0398112" 
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold rounded-lg transition-all hover:translate-x-1"
        >
          <Linkedin className="w-4 h-4" />
          Conectar en LinkedIn
        </a>
      </div>
    </div>
  </div>
);

// --- COMPONENTE TARJETA ANALIZADOR (Visual) ---
const AnalyzerActionCard = () => (
  <div className="mt-2 p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl animate-in fade-in slide-in-from-bottom-2">
    <div className="flex items-start gap-3">
      <div className="p-2 bg-emerald-500/10 rounded-full shrink-0">
        <FileText className="w-5 h-5 text-emerald-400" />
      </div>
      <div className="flex-1">
        <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
          ¡Oferta Detectada!
        </h4>
        <p className="text-sm text-slate-300 mb-3 leading-relaxed">
          Para darte un feedback profesional sobre esta vacante, es mejor usar mi herramienta de análisis dedicada.
        </p>
        <Link 
          href="/analizador"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all hover:translate-x-1"
        >
          Ir al Analizador <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  </div>
);

// --- COMPONENTE TARJETA DE AVISO DE LINKS (Visual) ---
const LinkLimitCard = () => (
  <div className="mt-2 p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl animate-in fade-in slide-in-from-bottom-2">
    <div className="flex items-start gap-3">
      <div className="p-2 bg-amber-500/10 rounded-full shrink-0">
        <AlertTriangle className="w-5 h-5 text-amber-400" />
      </div>
      <div className="flex-1">
        <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
          Enlace Externo Detectado
        </h4>
        <p className="text-sm text-slate-300 mb-3 leading-relaxed">
          Por seguridad, no tengo acceso a internet. Si esto es una oferta de empleo, usa mi herramienta especializada.
        </p>
        <Link 
          href="/analizador" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-all hover:translate-x-1"
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    
    addMessage('user', userText);

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
        // Usamos Markdown para las negritas
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