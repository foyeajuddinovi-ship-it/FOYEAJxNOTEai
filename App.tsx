
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Home, Star, Plus, Bot, Settings, Search, Sun, Moon,
  Mic, Languages, User, ImagePlus, ImageIcon, 
  RotateCcw, RotateCw, ChevronLeft, ChevronRight, Share2, Download, Trash2, 
  Type as TypeIcon, X, RefreshCw, Edit3, Sparkles, Volume2, Square, Copy, Check, Info,
  MicOff, AudioLines, Loader2, Eraser, Cloud, ShieldCheck
} from 'lucide-react';
import { Note, View, Language, FormattingState } from './types';
import { LANGUAGES, DEFAULT_FORMATTING } from './constants';
import { NoteCard } from './components/NoteCard';
import { LanguageDropdown } from './components/LanguageDropdown';
import { StylingDropdown } from './components/StylingDropdown';
import { AIChat } from './components/AIChat';
import { AIArtModal } from './components/AIArtModal';
import { geminiService } from './services/geminiService';

type ThemeType = 'light' | 'dark' | 'indigo' | 'rose' | 'amber';

const Tooltip: React.FC<{ text: string; visible: boolean; position?: 'top' | 'bottom' }> = ({ text, visible, position = 'bottom' }) => {
  if (!visible) return null;
  
  const posClasses = position === 'bottom' 
    ? "top-full mt-3 left-1/2 -translate-x-1/2" 
    : "bottom-full mb-3 left-1/2 -translate-x-1/2";

  return (
    <div className={`absolute z-[9999] pointer-events-none animate-in fade-in zoom-in-95 duration-150 ${posClasses}`}>
      <div className="bg-white text-gray-900 px-5 py-3 rounded-[18px] shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col items-center min-w-max whitespace-nowrap ring-1 ring-black/5">
        <p className="text-[13px] font-black uppercase tracking-[0.1em]">{text}</p>
      </div>
      <div className={`w-3 h-3 bg-white rotate-45 absolute left-1/2 -translate-x-1/2 border-gray-100 ${
        position === 'bottom' ? '-top-1.5 border-t border-l' : '-bottom-1.5 border-b border-r'
      }`} />
    </div>
  );
};

const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg', onClick?: () => void, variant?: 'default' | 'white' }> = ({ size = 'md', onClick, variant = 'default' }) => {
  const iconSize = size === 'sm' ? 14 : size === 'md' ? 20 : 28;
  const textColor = variant === 'white' ? 'text-white' : 'text-gray-900';
  const subTextColor = variant === 'white' ? 'text-white/90' : 'text-[#4856a9]';
  
  return (
    <div 
      onClick={onClick}
      className={`flex items-center transition-all ${onClick ? 'cursor-pointer hover:opacity-80 active:scale-95' : ''} ${size === 'lg' ? 'gap-3' : 'gap-2'}`}
    >
      <div className={`relative ${size === 'sm' ? 'w-7 h-7' : size === 'md' ? 'w-10 h-10' : 'w-14 h-14'} bg-white rounded-xl border-2 border-gray-100 flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0`}>
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-50" />
        <X size={iconSize} className="text-[#4856a9] relative z-10" strokeWidth={4} />
      </div>
      <div className="flex flex-col">
        <span className={`font-black leading-none tracking-tighter ${textColor} ${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-2xl'}`}>
          FOYEAJ
        </span>
        <span className={`font-black uppercase tracking-[0.2em] leading-none mt-1 ${subTextColor} ${size === 'sm' ? 'text-[7px]' : size === 'md' ? 'text-[9px]' : 'text-[12px]'}`}>
          Note
        </span>
      </div>
    </div>
  );
};

const ToolbarIcon: React.FC<{ 
  children: React.ReactNode; 
  onClick?: () => void; 
  active?: boolean; 
  loading?: boolean; 
  badge?: string;
  tooltipTitle: string;
  className?: string;
}> = ({ children, onClick, active, loading, badge, tooltipTitle, className = '' }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative flex-shrink-0 overflow-visible">
      <button 
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={loading}
        className={`w-11 h-11 relative flex items-center justify-center rounded-xl transition-all text-white hover:bg-white/20 active:scale-90 ${active ? 'bg-white text-[#4856a9] shadow-inner scale-105' : ''} ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        {children}
        {badge && !loading && (
          <div className="absolute -bottom-1 -right-1 bg-white text-[#4856a9] text-[8px] font-black px-1 rounded-md shadow-sm border border-indigo-100 uppercase tracking-tighter pointer-events-none">
            {badge}
          </div>
        )}
      </button>
      <Tooltip text={tooltipTitle} visible={showTooltip} position="bottom" />
    </div>
  );
};

const NavItem = ({ icon, active, onClick, tooltipTitle, isDark }: any) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative flex flex-col items-center overflow-visible">
      <button 
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`flex flex-col items-center justify-center transition-all ${active ? 'text-[#4856a9]' : isDark ? 'text-gray-500' : 'text-gray-400'}`}
      >
        <div className={`p-2.5 rounded-2xl transition-all ${active ? (isDark ? 'bg-[#4856a9]/20' : 'bg-indigo-50') : isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
          {icon}
        </div>
      </button>
      <Tooltip text={tooltipTitle} visible={showTooltip} position="top" />
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [theme, setTheme] = useState<ThemeType>('light');
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('foyeajx-notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isLouding, setIsLouding] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isProcessingSTT, setIsProcessingSTT] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [showTranslateDropdown, setShowTranslateDropdown] = useState(false);
  const [showDictateDropdown, setShowDictateDropdown] = useState(false);
  const [showAIArtModal, setShowAIArtModal] = useState(false);
  
  const [selectedLang, setSelectedLang] = useState<Language>(LANGUAGES[0]);
  const [dictateLang, setDictateLang] = useState<Language>(LANGUAGES[0]);
  
  const [showStyling, setShowStyling] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showSummaryPopUp, setShowSummaryPopUp] = useState(false);
  const [summaryContent, setSummaryContent] = useState('');
  const [showAddTooltip, setShowAddTooltip] = useState(false);
  const [showAITooltip, setShowAITooltip] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const isDarkMode = theme === 'dark';

  useEffect(() => {
    setIsSyncing(true);
    // Simulate cloud sync: update localStorage and signal "Cloud Storage" logic
    localStorage.setItem('foyeajx-notes', JSON.stringify(notes));
    const timer = setTimeout(() => setIsSyncing(false), 1200);
    return () => clearTimeout(timer);
  }, [notes]);

  const getPlainText = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const addToHistory = useCallback((content: string) => {
    setHistory(prev => {
      if (prev[historyIndex] === content) return prev;
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(content);
      if (newHistory.length > 100) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 99));
  }, [historyIndex]);

  const handleDownload = () => {
    if (!currentNote) return;
    const plainText = getPlainText(editorRef.current?.innerHTML || '');
    const title = currentNote.title || 'Untitled Note';
    const content = `TITLE: ${title.toUpperCase()}\nDATE: ${currentNote.date}\n\n${plainText}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    
    if (editorRef.current) {
      const h = editorRef.current.innerHTML;
      setCurrentNote(prev => prev ? { ...prev, content: h } : null);
      addToHistory(h);
    }
  };

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: '',
      content: '',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase(),
      images: [],
      isPinned: false,
      isStarred: false,
      language: 'en',
      formatting: { ...DEFAULT_FORMATTING },
    };
    setCurrentNote(newNote);
    setSelectedLang(LANGUAGES[0]);
    setDictateLang(LANGUAGES[0]);
    setHistory(['']);
    setHistoryIndex(0);
    setView('editor');
    setSummaryContent('');
    setShowSummaryPopUp(false);
  };

  const handleSaveNote = () => {
    if (!currentNote) return;
    const content = editorRef.current?.innerHTML || '';
    const updatedNote = { ...currentNote, content };
    setNotes(prev => {
      const exists = prev.find(n => n.id === currentNote.id);
      if (exists) return prev.map(n => n.id === currentNote.id ? updatedNote : n);
      return [updatedNote, ...prev];
    });
    setView('home');
  };

  const handleLoud = async () => {
    if (!currentNote) return;
    const text = getPlainText(editorRef.current?.innerHTML || '');
    if (!text) return;
    
    setIsLouding(true);
    setShowDictateDropdown(false);
    setShowTranslateDropdown(false);
    setShowStyling(false);

    try {
      await geminiService.speak(text);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLouding(false);
    }
  };

  const startRecording = async (lang: Language) => {
    setDictateLang(lang);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          setIsProcessingSTT(true);
          try {
            const transcription = await geminiService.transcribe(base64Audio, mediaRecorder.mimeType, lang.native);
            if (transcription && transcription.trim()) {
              const currentHtml = editorRef.current?.innerHTML || '';
              const newHtml = currentHtml + (currentHtml ? ' ' : '') + transcription;
              if (editorRef.current) editorRef.current.innerHTML = newHtml;
              setCurrentNote(prev => prev ? { ...prev, content: newHtml } : null);
              addToHistory(newHtml);
            }
          } catch (e) {
            console.error(e);
          } finally {
            setIsProcessingSTT(false);
          }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsTranscribing(true);
    } catch (err) {
      alert("Microphone access denied.");
    }
  };

  const handleDictateToggle = () => {
    if (isTranscribing) {
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
      setIsTranscribing(false);
    } else {
      setShowDictateDropdown(true);
      setShowTranslateDropdown(false);
      setShowStyling(false);
    }
  };

  const handleTranslate = async (lang: Language) => {
    if (!currentNote) return;
    const text = getPlainText(editorRef.current?.innerHTML || '');
    setSelectedLang(lang);
    if (!text.trim()) return;
    setIsTranslating(true);
    try {
      const translated = await geminiService.translate(text, lang.name);
      if (editorRef.current) editorRef.current.innerHTML = translated;
      setCurrentNote(prev => prev ? { ...prev, content: translated, language: lang.code } : null);
      addToHistory(translated);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSummarize = async () => {
    if (!currentNote) return;
    const text = getPlainText(editorRef.current?.innerHTML || '');
    if (!text) return;
    setIsSummarizing(true);
    try {
      const summary = await geminiService.summarize(text);
      setSummaryContent(summary);
      setShowSummaryPopUp(true);
    } catch (error) {
      console.error(error);
    } finally { setIsSummarizing(false); }
  };

  const handleApplySummary = () => {
    if (!currentNote || !summaryContent) return;
    const currentHtml = editorRef.current?.innerHTML || '';
    const newContent = `<p style="font-weight:bold;color:#4856a9;margin-bottom:10px;">[AI SUMMARY] ${summaryContent}</p><hr style="margin:20px 0;" />` + currentHtml;
    if (editorRef.current) editorRef.current.innerHTML = newContent;
    setCurrentNote(prev => prev ? { ...prev, content: newContent } : null);
    addToHistory(newContent);
    setShowSummaryPopUp(false);
  };

  const onGenerateImage = async (prompt: string) => {
    if (!currentNote) return;
    setIsGeneratingImage(true);
    try {
      const imageUrl = await geminiService.generateImage(prompt);
      const updatedNote = { ...currentNote, images: [...currentNote.images, imageUrl] };
      setCurrentNote(updatedNote);
      
      setNotes(prev => {
        const exists = prev.some(n => n.id === updatedNote.id);
        if (exists) {
          return prev.map(n => n.id === updatedNote.id ? updatedNote : n);
        } else {
          return [updatedNote, ...prev];
        }
      });
    } catch (e) { 
      console.error(e); 
      alert("Failed to generate image. Please try a different prompt.");
    } finally { 
      setIsGeneratingImage(false); 
    }
  };

  const handleUpdateFormatting = (formatting: FormattingState) => {
    document.execCommand('styleWithCSS', false, 'true');
    const currentFormatting = currentNote?.formatting || DEFAULT_FORMATTING;
    if (formatting.bold !== currentFormatting.bold) document.execCommand('bold', false);
    if (formatting.italic !== currentFormatting.italic) document.execCommand('italic', false);
    if (formatting.underline !== currentFormatting.underline) document.execCommand('underline', false);
    if (formatting.fontSize !== currentFormatting.fontSize) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.fontSize = `${formatting.fontSize}px`;
        range.surroundContents(span);
      }
    }
    if (formatting.alignment !== currentFormatting.alignment) {
      const alignCmd = formatting.alignment === 'center' ? 'justifyCenter' : 
                       formatting.alignment === 'right' ? 'justifyRight' : 'justifyLeft';
      document.execCommand(alignCmd, false);
    }
    setCurrentNote(prev => prev ? { ...prev, formatting } : null);
  };

  const handleGallery = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          if (currentNote) {
            const updatedNote = { ...currentNote, images: [...currentNote.images, re.target?.result as string] };
            setCurrentNote(updatedNote);
            setNotes(prev => {
              const exists = prev.some(n => n.id === updatedNote.id);
              if (exists) return prev.map(n => n.id === updatedNote.id ? updatedNote : n);
              return [updatedNote, ...prev];
            });
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className={`h-screen w-full flex overflow-hidden font-['Inter'] antialiased transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-[#F9FAFF]'}`}>
      <style>{`
        .rich-editor:empty:before { content: attr(data-placeholder); color: ${isDarkMode ? '#374151' : '#e5e7eb'}; font-weight: bold; text-transform: uppercase; }
        .rich-editor { outline: none; }
        .rich-editor b, .rich-editor strong { font-weight: bold; }
        .rich-editor i, .rich-editor em { font-style: italic; }
        .rich-editor u { text-decoration: underline; }
        .rich-editor * { 
          background-color: transparent !important; 
          color: inherit !important; 
        }
      `}</style>

      {(isProcessingSTT || isTranslating || isLouding || isGeneratingImage || isSummarizing) && (
        <div className="fixed top-0 left-0 right-0 z-[10000] flex justify-center pt-4 animate-in slide-in-from-top-4 duration-300">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-indigo-50'} px-6 py-2.5 rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.1)] border flex items-center gap-3`}>
            <Loader2 className="animate-spin text-[#4856a9]" size={16} />
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-indigo-300' : 'text-[#4856a9]'}`}>AI Processing Insight...</span>
          </div>
        </div>
      )}

      {showAIArtModal && currentNote && (
        <AIArtModal 
          onClose={() => setShowAIArtModal(false)} 
          onGenerate={onGenerateImage}
          noteContent={getPlainText(currentNote.content)}
          isDark={isDarkMode}
        />
      )}

      <div className="flex-1 h-full overflow-hidden relative">
        {view === 'editor' && currentNote ? (
          <div className={`flex flex-col h-full transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} font-['Inter'] relative overflow-visible`}>
            {showSummaryPopUp && (
              <div className="absolute top-0 left-0 right-0 z-[1000] px-6 pt-4 animate-in slide-in-from-top duration-500 ease-out">
                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-indigo-100'} rounded-[32px] border shadow-[0_40px_80px_rgba(72,86,169,0.15)] overflow-hidden`}>
                  <div className={`px-8 py-6 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-indigo-50/50 border-indigo-50'} flex items-center justify-between border-b`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#4856a9] rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-indigo-300' : 'text-[#4856a9]'} leading-none mb-1`}>FoyeajX Insight</h4>
                        <p className={`text-[12px] font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-tight`}>AI Generated Summary</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={handleApplySummary} className="flex items-center gap-2 bg-[#4856a9] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all hover:bg-[#3b4791]">
                        <Copy size={12} /> Apply on Note
                      </button>
                      <button onClick={() => setShowSummaryPopUp(false)} className={`p-2.5 rounded-xl transition-all active:scale-90 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-white border border-indigo-100 text-indigo-400 hover:text-red-500 hover:border-red-100'}`}>
                        <X size={18} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                  <div className="px-8 py-7">
                    <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'} font-medium leading-relaxed italic text-sm`}>"{summaryContent}"</p>
                  </div>
                </div>
              </div>
            )}

            <div className={`px-6 py-8 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100/50'} z-20 border-b`}>
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => { handleSaveNote(); setView('home'); }} className="flex items-center gap-1 group">
                  <ChevronLeft size={32} className="text-[#4856a9] transition-transform group-hover:-translate-x-1" strokeWidth={3} />
                  <span className={`text-2xl font-black ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} tracking-tight`}>Title</span>
                </button>
                <div className="flex items-center gap-3">
                  <button onClick={handleSaveNote} className="bg-[#4856a9] text-white font-black text-lg px-8 py-3.5 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-[#3b4791] active:scale-95 transition-all tracking-[0.15em] flex items-center justify-center uppercase">SAVE</button>
                  <button onClick={() => { const n = window.prompt("ENTER NOTE TITLE:", currentNote.title); if (n !== null) setCurrentNote({...currentNote, title: n}); }} className={`${isDarkMode ? 'bg-gray-800 border-gray-700 text-indigo-300' : 'bg-[#f4f6ff] border-indigo-100 text-[#4856a9]'} font-black text-lg px-8 py-3.5 rounded-2xl shadow-sm border active:scale-90 transition-all uppercase tracking-[0.1em] hover:bg-opacity-80`}>TITLE</button>
                </div>
              </div>
              <div className="pl-11">
                <input type="text" value={currentNote.title} onChange={(e) => setCurrentNote({...currentNote, title: e.target.value})} placeholder="ENTER NOTE TITLE..." className={`w-full text-xl font-bold tracking-tight uppercase bg-transparent focus:outline-none focus:text-[#4856a9] transition-colors ${isDarkMode ? 'text-gray-500 placeholder:text-gray-700' : 'text-gray-300 placeholder:text-gray-100'}`} />
              </div>
            </div>
            
            <div className="px-6 py-2 relative overflow-visible">
              {showTranslateDropdown && (
                <div className="absolute top-[60px] left-6 z-[100]">
                  <LanguageDropdown position="bottom" onClose={() => setShowTranslateDropdown(false)} onSelect={handleTranslate} activeLangCode={selectedLang.code} />
                </div>
              )}
              {showDictateDropdown && (
                <div className="absolute top-[60px] left-6 z-[100]">
                  <LanguageDropdown title="Speak to Text" subtitle="What language will you speak in?" position="bottom" onClose={() => setShowDictateDropdown(false)} onSelect={(lang) => { startRecording(lang); setShowDictateDropdown(false); }} activeLangCode={dictateLang.code} />
                </div>
              )}
              {showStyling && (
                <div className="absolute top-[60px] left-6 z-[100]">
                  <StylingDropdown formatting={currentNote.formatting} onChange={handleUpdateFormatting} onClose={() => setShowStyling(false)} />
                </div>
              )}

              <div className="overflow-visible pb-12 -mb-12">
                <div className={`${isDarkMode ? 'bg-[#313b7a]' : 'bg-[#4856a9]'} rounded-2xl p-1.5 flex items-center justify-between shadow-[0_15px_40px_rgba(72,86,169,0.25)] overflow-visible transition-colors duration-300`}>
                  <div className="flex items-center gap-1.5 overflow-visible">
                    <ToolbarIcon onClick={handleLoud} active={isLouding} loading={isLouding} tooltipTitle="Vocalizer">
                      <Volume2 size={20} />
                    </ToolbarIcon>

                    <ToolbarIcon onClick={handleDictateToggle} active={isTranscribing} badge={isTranscribing ? dictateLang.icon : undefined} className={isTranscribing ? "bg-red-500 hover:bg-red-600 animate-pulse" : ""} tooltipTitle="Dictation">
                      {isTranscribing ? <MicOff size={20} /> : <AudioLines size={20} />}
                    </ToolbarIcon>
                    
                    <ToolbarIcon onClick={() => { setShowTranslateDropdown(!showTranslateDropdown); setShowStyling(false); setShowDictateDropdown(false); }} active={showTranslateDropdown} loading={isTranslating} badge={selectedLang.icon} tooltipTitle="Translate">
                      <Languages size={20} />
                    </ToolbarIcon>
                    
                    <ToolbarIcon onClick={handleSummarize} loading={isSummarizing} active={isSummarizing} tooltipTitle="Summary">
                      <User size={20} />
                    </ToolbarIcon>
                    
                    <ToolbarIcon onClick={handleGallery} tooltipTitle="Gallery">
                      <ImageIcon size={20} />
                    </ToolbarIcon>
                    
                    <ToolbarIcon onClick={() => setShowAIArtModal(true)} loading={isGeneratingImage} tooltipTitle="AI Art">
                      <ImagePlus size={20} />
                    </ToolbarIcon>
                    
                    <div className="w-[1.5px] h-7 bg-white/20 mx-1.5"></div>
                    
                    <ToolbarIcon onClick={() => { if (historyIndex > 0) { const p = history[historyIndex - 1]; setHistoryIndex(historyIndex - 1); if (editorRef.current) editorRef.current.innerHTML = p; } }} active={historyIndex > 0} tooltipTitle="Undo">
                      <RotateCcw size={20} />
                    </ToolbarIcon>
                    
                    <ToolbarIcon onClick={() => { if (historyIndex < history.length - 1) { const n = history[historyIndex + 1]; setHistoryIndex(historyIndex + 1); if (editorRef.current) editorRef.current.innerHTML = n; } }} active={historyIndex < history.length - 1} tooltipTitle="Redo">
                      <RotateCw size={20} />
                    </ToolbarIcon>
                    
                    <ToolbarIcon onClick={() => { setShowStyling(!showStyling); setShowTranslateDropdown(false); setShowDictateDropdown(false); }} active={showStyling} tooltipTitle="Styling">
                      <TypeIcon size={20} />
                    </ToolbarIcon>
                  </div>
                  
                  <div className="flex items-center gap-1.5 ml-8 overflow-visible pr-2">
                    <ToolbarIcon onClick={handleDownload} tooltipTitle="Download Note">
                      <Download size={20} />
                    </ToolbarIcon>
                    <ToolbarIcon onClick={() => { if (confirm("PROCEED TO CLEAR ALL CONTENT?")) { if (editorRef.current) editorRef.current.innerHTML = ''; setCurrentNote({...currentNote, content: ''}); addToHistory(''); } }} tooltipTitle="Clear Content">
                      <Eraser size={20} />
                    </ToolbarIcon>
                    <ToolbarIcon onClick={async () => { try { await navigator.share({ title: currentNote.title, text: getPlainText(editorRef.current?.innerHTML || '') }); } catch (e) {} }} tooltipTitle="Share">
                      <Share2 size={20} />
                    </ToolbarIcon>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 flex relative overflow-hidden">
              <main className="flex-1 px-8 py-6 flex flex-col overflow-y-auto no-scrollbar">
                {currentNote.images.length > 0 && (
                  <div className="flex gap-4 mb-6 overflow-x-auto no-scrollbar pb-2">
                    {currentNote.images.map((img, idx) => (
                      <div key={idx} className="relative group flex-shrink-0">
                        <img src={img} className="h-40 w-auto rounded-2xl shadow-md" alt="" />
                        <button onClick={() => {
                           const newImages = currentNote.images.filter((_, i) => i !== idx);
                           const updatedNote = {...currentNote, images: newImages};
                           setCurrentNote(updatedNote);
                           setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
                        }} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div 
                  ref={editorRef} 
                  contentEditable 
                  onPaste={handlePaste}
                  data-placeholder="BEGIN YOUR CREATIVE JOURNEY..." 
                  className={`flex-1 w-full rich-editor leading-relaxed text-xl transition-colors duration-300 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`} 
                  onInput={(e) => { const h = e.currentTarget.innerHTML; setCurrentNote({...currentNote, content: h}); addToHistory(h); }} 
                  dangerouslySetInnerHTML={{ __html: currentNote.content }} 
                />
              </main>
            </div>

            <div className="absolute bottom-10 right-10 z-[5000] overflow-visible">
              <div className="relative overflow-visible">
                <button onClick={() => setShowAIChat(true)} onMouseEnter={() => setShowAITooltip(true)} onMouseLeave={() => setShowAITooltip(false)} className={`w-24 h-24 rounded-full border-[6px] flex flex-col items-center justify-center text-white active:scale-95 transition-all overflow-hidden group shadow-2xl ${isDarkMode ? 'bg-[#313b7a] border-gray-800' : 'bg-[#4856a9] border-white'}`}>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex flex-col items-center leading-none">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">FOYEAJ</span>
                    <span className="text-4xl font-black tracking-tighter">Ai</span>
                  </div>
                </button>
                <Tooltip text="Foyeaj Intelligence" visible={showAITooltip} position="top" />
              </div>
            </div>
          </div>
        ) : (
          <div className={`flex flex-col h-full transition-colors duration-300 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-[#F9FAFF]'} overflow-hidden relative overflow-visible`}>
            <header className="px-6 pt-10 pb-4 flex items-center justify-between overflow-visible">
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-[#4856a9]'} px-12 py-4 rounded-3xl shadow-2xl transition-colors`}><Logo variant="white" size="md" /></div>
              <div className="relative overflow-visible">
                <button onClick={() => setShowThemeMenu(!showThemeMenu)} className={`w-16 h-16 rounded-3xl border flex items-center justify-center shadow-lg active:scale-95 transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 text-indigo-300' : 'bg-white border-gray-100 text-[#4856a9]'}`}>{isDarkMode ? <Moon size={28} /> : <Sun size={28} />}</button>
                {showThemeMenu && (
                  <div className={`absolute right-0 mt-4 p-3 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border flex flex-col gap-2 z-[100] animate-in slide-in-from-top-4 duration-300 w-44 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-50'}`}>
                    {(['light', 'dark', 'indigo', 'rose', 'amber'] as ThemeType[]).map(t => (
                      <button key={t} onClick={() => { setTheme(t); setShowThemeMenu(false); }} className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                        <div className={`w-4 h-4 rounded-full ${t === 'dark' ? 'bg-indigo-300' : 'bg-[#4856a9]'} shadow-sm`} />
                        <span className={`text-xs font-black uppercase tracking-[0.15em] ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </header>

            <div className="px-6 py-6">
              <div className="relative w-full group">
                <Search className={`absolute left-8 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? 'text-gray-600 group-focus-within:text-indigo-400' : 'text-[#4856a9]/30 group-focus-within:text-[#4856a9]'}`} size={26} strokeWidth={3} />
                <input type="text" placeholder="SEARCH YOUR NOTES..." className={`w-full border rounded-[32px] py-7 pl-20 pr-10 text-xl font-bold shadow-sm focus:outline-none focus:ring-4 transition-all tracking-tight ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-indigo-400/10 placeholder:text-gray-600' : 'bg-white border-gray-100 text-gray-900 focus:ring-[#4856a9]/5 placeholder:text-gray-200'}`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>

            <main className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar">
              <div className="space-y-8 max-w-4xl mx-auto">
                {notes
                  .filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase()))
                  .filter(n => view === 'starred' ? n.isStarred : true)
                  .sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1))
                  .map(note => (
                    <NoteCard key={note.id} note={note} onClick={() => { setCurrentNote(note); setView('editor'); setHistory([note.content]); setHistoryIndex(0); }} onTogglePin={(e) => { e.stopPropagation(); setNotes(prev => prev.map(n => n.id === note.id ? { ...n, isPinned: !n.isPinned } : n)); }} onToggleStar={(e) => { e.stopPropagation(); setNotes(prev => prev.map(n => n.id === note.id ? { ...n, isStarred: !n.isStarred } : n)); }} onDelete={(e) => { e.stopPropagation(); if (confirm("PERMANENTLY DELETE THIS NOTE?")) setNotes(prev => prev.filter(n => n.id !== note.id)); }} isDark={isDarkMode} />
                ))}
                {notes.length === 0 && (
                   <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
                     <Edit3 size={64} className="mb-4" />
                     <p className="text-sm font-black uppercase tracking-[0.2em]">Your foyeajX journey begins here.</p>
                   </div>
                )}
              </div>
            </main>

            <div className={`fixed bottom-0 left-0 right-0 border-t flex flex-col items-center z-[100] transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-50'}`}>
              <div className="w-full flex items-center justify-around px-4 py-4 pb-8 shadow-[0_-15px_40px_rgba(0,0,0,0.02)]">
                <NavItem icon={<Home size={30} strokeWidth={2.5} />} active={view === 'home'} onClick={() => setView('home')} tooltipTitle="Home" isDark={isDarkMode} />
                <NavItem icon={<Star size={30} strokeWidth={2.5} />} active={view === 'starred'} onClick={() => setView('starred')} tooltipTitle="Starred" isDark={isDarkMode} />
                <div className="relative overflow-visible">
                  <button onClick={handleCreateNote} onMouseEnter={() => setShowAddTooltip(true)} onMouseLeave={() => setShowAddTooltip(false)} className={`w-22 h-22 rounded-[32px] flex items-center justify-center shadow-2xl -mt-12 border-[8px] active:scale-90 transition-all ${isDarkMode ? 'bg-[#4856a9] text-white border-gray-900 shadow-indigo-900/50' : 'bg-[#4856a9] text-white border-[#F9FAFF] shadow-indigo-200'}`}>
                    <Plus size={44} strokeWidth={4} />
                  </button>
                  <Tooltip text="Create New" visible={showAddTooltip} position="top" />
                </div>
                <NavItem icon={<Bot size={34} strokeWidth={2.5} className={isDarkMode ? 'text-indigo-400' : 'text-[#4856a9]'} />} active={view === 'ai'} onClick={() => setShowAIChat(true)} tooltipTitle="AI Intel" isDark={isDarkMode} />
                <NavItem icon={<Settings size={30} strokeWidth={2.5} />} active={view === 'settings'} onClick={() => setView('settings')} tooltipTitle="Settings" isDark={isDarkMode} />
              </div>
              <div className={`w-full py-2.5 flex items-center justify-center gap-2 border-t ${isDarkMode ? 'border-gray-800 bg-gray-950/20' : 'border-gray-100 bg-gray-50/50'}`}>
                {isSyncing ? <Loader2 size={12} className="animate-spin text-indigo-400" /> : <ShieldCheck size={12} className="text-green-500" />}
                <span className={`text-[8px] font-black uppercase tracking-[0.25em] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {isSyncing ? 'Syncing foyeajX Cloud Assets...' : 'Cloud Storage Synchronized'}
                </span>
                {!isSyncing && <Cloud size={10} className="text-indigo-200" />}
              </div>
            </div>
          </div>
        )}
      </div>

      {showAIChat && (
        <div className="fixed inset-0 z-[6000] bg-black/40 backdrop-blur-md flex items-center justify-end">
          <div className={`w-full max-w-md h-full sm:h-[90vh] sm:rounded-[48px] sm:mr-10 shadow-2xl overflow-hidden animate-in slide-in-from-right duration-500 ease-out border transition-colors ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-white/50'}`}>
            <AIChat onClose={() => setShowAIChat(false)} noteContext={getPlainText(currentNote?.content || '')} isDark={isDarkMode} />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
