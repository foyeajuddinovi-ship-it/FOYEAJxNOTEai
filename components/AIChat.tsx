
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, X, Bot, Sparkles, User, Clock, Zap, MessageSquareText, 
  BrainCircuit, History, Wand2, Languages, ListRestart, 
  Mic, MicOff, Volume2, VolumeX, Loader2, Waves
} from 'lucide-react';
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

const SUGGESTIONS = [
  { icon: <Zap size={14} />, label: "Fix Grammar", prompt: "Please check the grammar and flow of my note." },
  { icon: <Languages size={14} />, label: "Translate to French", prompt: "Translate this note to French for me." },
  { icon: <ListRestart size={14} />, label: "List Key Points", prompt: "Extract the top 5 key points from this note." },
  { icon: <BrainCircuit size={14} />, label: "Expand Idea", prompt: "Can you elaborate more on the main ideas in this note?" },
];

export const AIChat: React.FC<AIChatProps> = ({ onClose, noteContext = '', isDark }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      text: "Welcome to foyeajX Intelligent Insight. I am synced with your neural creative context. Shall we refine your vision?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoSpeak, setIsAutoSpeak] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading, isProcessingVoice]);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(date);
  };

  const handleSend = async (customPrompt?: string) => {
    const messageToSend = customPrompt || input;
    if (!messageToSend.trim() || isLoading) return;
    
    const userMsg = messageToSend.trim();
    if (!customPrompt) setInput('');
    
    const userMessage: Message = { role: 'user', text: userMsg, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await geminiService.chat(userMsg, noteContext);
      const assistantMessage: Message = { role: 'assistant', text: response, timestamp: new Date() };
      setMessages(prev => [...prev, assistantMessage]);
      
      if (isAutoSpeak) {
        await geminiService.speak(response);
      }
    } catch (error) {
      const errorMessage: Message = { role: 'assistant', text: "I apologize, but my neural link encountered a brief sync error. Please re-initiate.", timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            setIsProcessingVoice(true);
            try {
              const transcription = await geminiService.transcribe(base64Audio, mediaRecorder.mimeType, 'English');
              if (transcription?.trim()) setInput(transcription);
            } catch (e) { console.error("Transcription failed", e); } finally { setIsProcessingVoice(false); }
          };
          stream.getTracks().forEach(track => track.stop());
        };
        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) { alert("Audio access denied."); }
    }
  };

  return (
    <div className={`flex flex-col h-full relative transition-all duration-700 ${isDark ? 'bg-[#0a0c14]' : 'bg-white'}`}>
      <div className={`flex items-center justify-between px-8 py-8 border-b sticky top-0 z-30 transition-all ${isDark ? 'bg-[#0a0c14]/90 border-gray-800' : 'bg-white/90 border-gray-100'} backdrop-blur-2xl`}>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 animate-gradient-x"></div>
            <div className={`relative w-12 h-12 bg-indigo-600 rounded-2xl text-white shadow-xl flex items-center justify-center overflow-hidden`}>
              <BrainCircuit size={26} strokeWidth={2.5} className={isLoading ? "animate-pulse" : ""} />
            </div>
          </div>
          <div>
            <h2 className={`font-black uppercase text-[11px] tracking-[0.3em] leading-none mb-1.5 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>foyeajX Insight</h2>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Neural Sync: Optimized</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsAutoSpeak(!isAutoSpeak)} className={`p-3 rounded-2xl transition-all active:scale-90 flex items-center justify-center gap-2 ${isAutoSpeak ? 'bg-indigo-600 text-white shadow-lg' : (isDark ? 'text-gray-500 bg-gray-800/50' : 'text-gray-400 bg-gray-50')}`}>
            {isAutoSpeak ? <Volume2 size={20} /> : <VolumeX size={20} />}
            <span className="text-[9px] font-black uppercase tracking-widest hidden sm:block">Talk Back</span>
          </button>
          <button onClick={onClose} className={`p-3 rounded-2xl transition-all hover:bg-red-50 hover:text-red-500 active:scale-90 ${isDark ? 'text-gray-500 hover:bg-gray-800' : 'text-gray-400'}`}><X size={24} strokeWidth={3} /></button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-10 space-y-12 no-scrollbar">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-5 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out`}>
            <div className={`w-11 h-11 rounded-[20px] flex-shrink-0 flex items-center justify-center shadow-xl transition-all ${m.role === 'user' ? (isDark ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-50 text-indigo-600') : 'bg-gradient-to-br from-[#4856a9] to-[#6373d1] text-white'}`}>
              {m.role === 'user' ? <User size={20} strokeWidth={3} /> : <Sparkles size={20} strokeWidth={3} />}
            </div>
            <div className={`flex flex-col gap-2.5 max-w-[85%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-7 shadow-sm transition-all ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-[32px] rounded-tr-none' : (isDark ? 'bg-[#151825] border-gray-800 text-gray-200 rounded-[32px] rounded-tl-none border backdrop-blur-md' : 'bg-white border border-gray-100 text-gray-800 rounded-[32px] rounded-tl-none')}`}>
                <p className="text-[15px] font-medium leading-[1.65] whitespace-pre-wrap">{m.text}</p>
              </div>
              <div className="flex items-center gap-2 px-3">
                 <Clock size={10} className="text-gray-400 opacity-40" />
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 opacity-60">{formatTime(m.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-5 animate-in fade-in duration-500">
            <div className="w-11 h-11 rounded-[20px] bg-indigo-600 text-white shadow-xl flex items-center justify-center"><BrainCircuit size={20} strokeWidth={3} className="animate-spin-slow" /></div>
            <div className="flex flex-col gap-3">
              <span className={`text-[9px] font-black uppercase tracking-[0.4em] opacity-50 animate-pulse ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Synthesizing Intelligence</span>
              <div className={`${isDark ? 'bg-gray-800/20' : 'bg-white'} border border-indigo-100/30 p-7 rounded-[32px] rounded-tl-none shadow-sm flex items-center gap-2`}>
                <div className="flex space-x-2.5"><div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div><div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div><div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"></div></div>
              </div>
            </div>
          </div>
        )}
        {isProcessingVoice && (
          <div className="flex flex-row-reverse gap-5 animate-in fade-in duration-500">
            <div className="w-11 h-11 rounded-[20px] bg-indigo-900/30 text-indigo-300 shadow-xl flex items-center justify-center"><Waves size={20} strokeWidth={3} className="animate-pulse" /></div>
            <div className="flex flex-col items-end gap-3"><span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-50 animate-pulse text-indigo-400">Decoding Neural Audio</span><div className="bg-indigo-900/10 border border-indigo-900/20 p-5 rounded-[32px] rounded-tr-none shadow-sm"><div className="flex space-x-1.5">{[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-6 bg-indigo-400/50 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>)}</div></div></div>
          </div>
        )}
      </div>

      <div className={`p-8 border-t transition-all duration-500 z-30 ${isDark ? 'bg-[#0a0c14] border-gray-800' : 'bg-white border-gray-100'}`}>
        {!isLoading && messages.length < 5 && !isRecording && (
          <div className="flex flex-wrap gap-2.5 mb-8">
            {SUGGESTIONS.map((s, idx) => (
              <button key={idx} onClick={() => handleSend(s.prompt)} className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border ${isDark ? 'bg-gray-800/40 border-gray-700 text-gray-400 hover:text-indigo-300 hover:border-indigo-900/50' : 'bg-indigo-50/50 border-indigo-50 text-indigo-500 hover:bg-indigo-50 hover:border-indigo-100'}`}>
                {s.icon}{s.label}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-4 items-center">
          <button onClick={toggleRecording} className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all active:scale-90 border-2 ${isRecording ? 'bg-red-500 border-red-400 text-white animate-pulse shadow-xl' : (isDark ? 'bg-gray-800/50 border-gray-700 text-gray-400 hover:text-indigo-400 hover:border-indigo-900/50' : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100')}`}>
            {isRecording ? <MicOff size={24} strokeWidth={3} /> : <Mic size={24} strokeWidth={3} />}
          </button>
          <div className="relative flex-1 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[28px] blur opacity-0 group-focus-within:opacity-10 transition duration-500"></div>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={isRecording ? "Listening to your thoughts..." : "Command foyeajX Insight..."} className={`relative w-full border rounded-[28px] px-8 py-5 text-[15px] font-semibold focus:outline-none focus:ring-4 transition-all shadow-sm ${isDark ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-indigo-400/5 placeholder:text-gray-600' : 'bg-gray-50 border-gray-100 text-gray-900 focus:ring-indigo-500/5 placeholder:text-gray-300'}`} />
          </div>
          <button onClick={() => handleSend()} disabled={!input.trim() || isLoading} className={`w-16 h-16 rounded-3xl shadow-2xl transition-all active:scale-90 disabled:opacity-40 flex items-center justify-center ${isDark ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20' : 'bg-[#4856a9] hover:bg-[#3b4791] shadow-[#4856a9]/20'} text-white`}>
            <Send size={24} strokeWidth={3} className={isLoading ? "animate-ping" : ""} />
          </button>
        </div>
        <div className="flex items-center justify-center gap-3 mt-10 opacity-40 group hover:opacity-100 transition-all cursor-default">
           <Waves size={14} className="text-indigo-500 animate-pulse" />
           <p className="text-[9px] font-black uppercase tracking-[0.6em] text-gray-400">Neural Link Sync System</p>
        </div>
      </div>
      <style>{`
        @keyframes gradient-x { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 15s ease infinite; }
        .animate-spin-slow { animation: spin 6s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
