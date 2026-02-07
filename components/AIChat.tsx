
import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, Sparkles, User, Clock } from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface AIChatProps {
  onClose: () => void;
  noteContext?: string;
  isDark?: boolean;
}

export const AIChat: React.FC<AIChatProps> = ({ onClose, noteContext = '', isDark }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      text: "Hello! I'm your foyeajX Intelligent Note Assistant. How can I help you refine or transform your notes today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input.trim();
    setInput('');
    const userMessage: Message = { role: 'user', text: userMsg, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await geminiService.chat(userMsg, noteContext);
      const assistantMessage: Message = { role: 'assistant', text: response, timestamp: new Date() };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = { role: 'assistant', text: "I'm having a little trouble connecting. Please try again in a moment.", timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-full relative transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <div className={`flex items-center justify-between px-8 py-7 border-b sticky top-0 z-10 transition-colors ${
        isDark ? 'bg-gray-900/90 border-gray-800' : 'bg-white/90 border-gray-100'
      } backdrop-blur-md`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#4a5ab5] to-[#6373d1] rounded-2xl text-white shadow-xl shadow-indigo-100 flex items-center justify-center">
            <Sparkles size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className={`font-black uppercase text-xs tracking-widest leading-none mb-1 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>foyeajX Intel</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <p className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Active Insight</p>
            </div>
          </div>
        </div>
        <button onClick={onClose} className={`p-3 rounded-2xl transition-all hover:rotate-90 ${isDark ? 'bg-gray-800 text-gray-500 hover:bg-gray-700' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
          <X size={24} strokeWidth={2.5} />
        </button>
      </div>

      <div ref={scrollRef} className={`flex-1 overflow-y-auto px-8 py-8 space-y-10 no-scrollbar ${isDark ? 'bg-gray-900' : 'bg-[#FBFCFF]'}`}>
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm ${
              m.role === 'user' ? (isDark ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-50 text-[#4856a9]') : 'bg-[#4856a9] text-white'
            }`}>
              {m.role === 'user' ? <User size={18} strokeWidth={3} /> : <Sparkles size={18} strokeWidth={3} />}
            </div>
            <div className="flex flex-col space-y-2 max-w-[80%]">
              <div className={`p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all ${
                m.role === 'user' 
                  ? 'bg-[#4856a9] text-white rounded-[28px] rounded-tr-none' 
                  : (isDark ? 'bg-gray-800 border-gray-700 text-gray-200 rounded-[28px] rounded-tl-none border' : 'bg-white border border-gray-100 text-gray-800 rounded-[28px] rounded-tl-none')
              }`}>
                <p className="text-[14px] font-medium leading-relaxed whitespace-pre-wrap">{m.text}</p>
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-300 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <Clock size={10} />
                {formatTime(m.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#4856a9] text-white shadow-md flex items-center justify-center">
              <Sparkles size={18} strokeWidth={3} />
            </div>
            <div className="flex flex-col gap-2">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-50 animate-pulse ${isDark ? 'text-indigo-400' : 'text-[#4856a9]'}`}>
                FoyeajX is thinking...
              </span>
              <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border p-5 rounded-[28px] rounded-tl-none shadow-sm inline-block`}>
                <div className="flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={`p-8 border-t transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe what you need..."
            className={`flex-1 border rounded-[20px] px-6 py-4.5 text-sm font-semibold focus:outline-none focus:ring-4 transition-all shadow-inner ${
              isDark ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-indigo-400/10 placeholder:text-gray-600' : 'bg-gray-50 border-gray-100 text-gray-900 focus:ring-[#4856a9]/5 placeholder:text-gray-200'
            }`}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-4.5 bg-[#4856a9] text-white rounded-[20px] shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 hover:bg-[#3b4791]"
          >
            <Send size={24} strokeWidth={2.5} />
          </button>
        </div>
        <p className="text-[9px] text-center text-gray-400 font-black uppercase tracking-[0.3em] mt-6 opacity-60">
          Powered by Gemini AI Intelligence
        </p>
      </div>
    </div>
  );
};
