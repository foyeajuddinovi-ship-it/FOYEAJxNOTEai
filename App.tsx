
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Home, Star, Plus, Bot, Settings, Search, Sun, Moon,
  Mic, Languages, User, ImagePlus, ImageIcon, 
  RotateCcw, RotateCw, ChevronLeft, ChevronRight, Share2, Download, Trash2, 
  Type as TypeIcon, X, RefreshCw, Edit3, Sparkles, Volume2, Square, Copy, Check, Info,
  MicOff, AudioLines, Loader2, Eraser, Cloud, ShieldCheck
} from 'lucide-react';
import { Note, View, Language, FormattingState } from './types.ts';
import { LANGUAGES, DEFAULT_FORMATTING } from './constants.ts';
import { NoteCard } from './components/NoteCard.tsx';
import { LanguageDropdown } from './components/LanguageDropdown.tsx';
import { StylingDropdown } from './components/StylingDropdown.tsx';
import { AIChat } from './components/AIChat.tsx';
import { AIArtModal } from './components/AIArtModal.tsx';
import { geminiService } from './services/geminiService.ts';

type ThemeType = 'light' | 'dark' | 'indigo' | 'rose' | 'amber';

const Tooltip: React.FC<{ text: string; visible: boolean; position?: 'top' | 'bottom' }> = ({ text, visible, position = 'bottom' }) => {
  if (!visible) return null;
  const posClasses = position === 'bottom' ? "top-full mt-3 left-1/2 -translate-x-1/2" : "bottom-full mb-3 left-1/2 -translate-x-1/2";
  return (
    <div className={`absolute z-[9999] pointer-events-none animate-in fade-in zoom-in-95 duration-150 ${posClasses}`}>
      <div className="bg-white text-gray-900 px-5 py-3 rounded-[18px] shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col items-center min-w-max whitespace-nowrap ring-1 ring-black/5">
        <p className="text-[13px] font-black uppercase tracking-[0.1em]">{text}</p>
      </div>
      <div className={`w-3 h-3 bg-white rotate-45 absolute left-1/2 -translate-x-1/2 border-gray-100 ${position === 'bottom' ? '-top-1.5 border-t border-l' : '-bottom-1.5 border-b border-r'}`} />
    </div>
  );
};

const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg', onClick?: () => void, variant?: 'default' | 'white' }> = ({ size = 'md', onClick, variant = 'default' }) => {
  const iconSize = size === 'sm' ? 14 : size === 'md' ? 20 : 28;
  const textColor = variant === 'white' ? 'text-white' : 'text-gray-900';
  const subTextColor = variant === 'white' ? 'text-white/90' : 'text-[#4856a9]';
  return (
    <div onClick={onClick} className={`flex items-center transition-all ${onClick ? 'cursor-pointer hover:opacity-80 active:scale-95' : ''} ${size === 'lg' ? 'gap-3' : 'gap-2'}`}>
      <div className={`relative ${size === 'sm' ? 'w-7 h-7' : size === 'md' ? 'w-10 h-10' : 'w-14 h-14'} bg-[#4856a9] rounded-2xl flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0`}>
        <X size={iconSize} className="text-white" strokeWidth={4} />
      </div>
      <div className="flex flex-col">
        <span className={`font-black leading-none tracking-tighter ${textColor} ${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-xl' : 'text-2xl'}`}>FOYEAJ</span>
        <span className={`font-black uppercase tracking-[0.2em] mt-1 ${subTextColor} ${size === 'sm' ? 'text-[7px]' : size === 'md' ? 'text-[10px]' : 'text-[12px]'}`}>Note</span>
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
  return (
    <div className="relative flex-shrink-0 flex flex-col items-center group">
      <button 
        onClick={onClick} 
        disabled={loading} 
        className={`w-11 h-11 relative flex items-center justify-center rounded-xl transition-all text-white hover:bg-white/20 active:scale-90 ${active ? 'bg-white text-[#4856a9] shadow-inner scale-105' : ''} ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        {children}
        {badge && !loading && <div className="absolute -bottom-1 -right-1 bg-white text-[#4856a9] text-[8px] font-black px-1 rounded-md shadow-sm border border-indigo-100 uppercase tracking-tighter pointer-events-none">{badge}</div>}
      </button>
      <span className={`text-[8px] font-black uppercase tracking-tighter mt-1 whitespace-nowrap transition-colors duration-200 ${active ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
        {tooltipTitle}
      </span>
    </div>
  );
};

const NavItem = ({ icon, active, onClick, tooltipTitle, isDark }: any) => {
  return (
    <div className="relative flex flex-col items-center group">
      <button 
        onClick={onClick} 
        className={`flex flex-col items-center justify-center transition-all ${active ? 'text-[#4856a9]' : isDark ? 'text-gray-500' : 'text-gray-400'}`}
      >
        <div className={`p-2.5 rounded-2xl transition-all ${active ? (isDark ? 'bg-[#4856a9]/20' : 'bg-indigo-50') : isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
          {icon}
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest mt-1 ${active ? (isDark ? 'text-indigo-400' : 'text-[#4856a9]') : isDark ? 'text-gray-600' : 'text-gray-400'}`}>
          {tooltipTitle}
        </span>
      </button>
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [theme, setTheme] = useState<ThemeType>('light');
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
  const [summaryContent, setSummaryContent] = useState('');
  const [showAddTooltip, setShowAddTooltip] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const historyTimeoutRef = useRef<number | null>(null);
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    setIsSyncing(true);
    localStorage.setItem('foyeajx-notes', JSON.stringify(notes));
    const timer = setTimeout(() => setIsSyncing(false), 800);
    return () => clearTimeout(timer);
  }, [notes]);

  const getPlainText = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const addToHistory = useCallback((content: string, immediate = false) => {
    const performUpdate = () => {
      setHistory(prev => {
        if (prev[historyIndex] === content) return prev;
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(content);
        if (newHistory.length > 50) newHistory.shift();
        return newHistory;
      });
      setHistoryIndex(prev => Math.min(prev + 1, 49));
    };

    if (historyTimeoutRef.current) window.clearTimeout(historyTimeoutRef.current);

    if (immediate) {
      performUpdate();
    } else {
      historyTimeoutRef.current = window.setTimeout(performUpdate, 1000);
    }
  }, [historyIndex]);

  const handleUpdateFormatting = (formatting: FormattingState) => {
    document.execCommand('styleWithCSS', false, 'true');
    const currentFormatting = currentNote?.formatting || DEFAULT_FORMATTING;
    if (formatting.bold !== currentFormatting.bold) document.execCommand('bold', false);
    if (formatting.italic !== currentFormatting.italic) document.execCommand('italic', false);
    if (formatting.underline !== currentFormatting.underline) document.execCommand('underline', false);
    if (formatting.alignment !== currentFormatting.alignment) {
      const alignCmd = formatting.alignment === 'center' ? 'justifyCenter' : formatting.alignment === 'right' ? 'justifyRight' : 'justifyLeft';
      document.execCommand(alignCmd, false);
    }
    setCurrentNote(prev => prev ? { ...prev, formatting } : null);
  };

  const onExecuteTool = (name: string, args: any) => {
    if (!currentNote) return "Note not active";
    
    switch (name) {
      case 'updateNoteContent':
        const content = args.mode === 'append' ? (editorRef.current?.innerHTML + args.newContent) : args.newContent;
        if (editorRef.current) editorRef.current.innerHTML = content;
        setCurrentNote({ ...currentNote, content });
        addToHistory(content, true);
        return "Note updated successfully.";
      case 'applyFormatting':
        const newFormatting = { ...currentNote.formatting, ...args };
        handleUpdateFormatting(newFormatting);
        return "Formatting applied.";
      case 'setNoteTitle':
        setCurrentNote({ ...currentNote, title: args.title });
        return `Title changed to ${args.title}.`;
      case 'generateImageForNote':
        onGenerateImage(args.prompt);
        return "Image generation triggered.";
      default:
        return "Unknown command.";
    }
  };

  const handleDownload = () => {
    if (!currentNote) return;
    const plainText = getPlainText(editorRef.current?.innerHTML || '');
    const title = currentNote.title || 'Untitled_Note';
    const content = `TITLE: ${title}\nDATE: ${currentNote.date}\n\n${plainText}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.txt`;
    link.click();
    URL.revokeObjectURL(url);
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
    setHistory(['']);
    setHistoryIndex(0);
    setView('editor');
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
    setCurrentNote(null);
  };

  const handleDeleteNote = (id: string) => {
    if (confirm("ARE YOU SURE YOU WANT TO PERMANENTLY DELETE THIS NOTE?")) {
      setNotes(prev => prev.filter(note => note.id !== id));
    }
  };

  const handleLoud = async () => {
    if (!currentNote) return;
    const text = getPlainText(editorRef.current?.innerHTML || '');
    if (!text) return;
    setIsLouding(true);
    try { await geminiService.speak(text); } catch (e) { console.error(e); } finally { setIsLouding(false); }
  };

  const startRecording = async (lang: Language) => {
    setDictateLang(lang);
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
          setIsProcessingSTT(true);
          try {
            const transcription = await geminiService.transcribe(base64Audio, mediaRecorder.mimeType, lang.native);
            if (transcription && transcription.trim()) {
              const currentHtml = editorRef.current?.innerHTML || '';
              const newHtml = currentHtml + transcription;
              if (editorRef.current) editorRef.current.innerHTML = newHtml;
              setCurrentNote(prev => prev ? { ...prev, content: newHtml } : null);
              addToHistory(newHtml, true);
            }
          } catch (e) { console.error(e); } finally { setIsProcessingSTT(false); }
        };
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsTranscribing(true);
    } catch (err) { alert("Microphone access denied."); }
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
      addToHistory(translated, true);
    } catch (error) { console.error(error); } finally { setIsTranslating(false); }
  };

  const handleSummarize = async () => {
    if (!currentNote) return;
    const text = getPlainText(editorRef.current?.innerHTML || '');
    if (!text) return;
    setIsSummarizing(true);
    try {
      const summary = await geminiService.summarize(text);
      setSummaryContent(summary);
    } catch (error) { console.error(error); } finally { setIsSummarizing(false); }
  };

  const onGenerateImage = async (prompt: string) => {
    if (!currentNote) return;
    setIsGeneratingImage(true);
    try {
      const imageUrl = await geminiService.generateImage(prompt);
      const updatedNote = { ...currentNote, images: [...currentNote.images, imageUrl] };
      setCurrentNote(updatedNote);
    } catch (e) { 
      console.error(e); 
      alert("AI Art Engine Busy. Try again in a moment."); 
    } finally { 
      setIsGeneratingImage(false); 
    }
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
            setCurrentNote({ ...currentNote, images: [...currentNote.images, re.target?.result as string] });
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevContent = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      if (editorRef.current) editorRef.current.innerHTML = prevContent;
      setCurrentNote(prev => prev ? { ...prev, content: prevContent } : null);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextContent = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      if (editorRef.current) editorRef.current.innerHTML = nextContent;
      setCurrentNote(prev => prev ? { ...prev, content: nextContent } : null);
    }
  };

  const handleShare = async () => {
    if (!currentNote) return;
    const text = getPlainText(editorRef.current?.innerHTML || '');
    try {
      await navigator.share({
        title: currentNote.title || 'foyeajX Note',
        text: text,
      });
    } catch (err) {
      console.error("Share failed", err);
    }
  };

  return (
    <div className={`h-screen w-full flex overflow-hidden font-['Inter'] antialiased transition-colors duration-300 ${isDarkMode ? 'bg-[#0f111a]' : 'bg-[#F9FAFF]'}`}>
      <style>{`
        .rich-editor:empty:before { content: attr(data-placeholder); color: ${isDarkMode ? '#374151' : '#e5e7eb'}; }
        .rich-editor { outline: none; }
      `}</style>
      
      {(isProcessingSTT || isTranslating || isLouding || isGeneratingImage || isSummarizing) && (
        <div className="fixed top-0 left-0 right-0 z-[10000] flex justify-center pt-4">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700 text-indigo-300' : 'bg-white border-indigo-50 text-[#4856a9]'} px-6 py-2.5 rounded-full shadow-xl border flex items-center gap-3 animate-in slide-in-from-top-4`}>
            <Loader2 className="animate-spin" size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Neural Link Working...</span>
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
          <div className={`flex flex-col h-full ${isDarkMode ? 'bg-[#0f111a]' : 'bg-white'} relative`}>
            <div className={`px-6 py-8 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setView('home')} className="flex items-center gap-1">
                  <ChevronLeft size={32} className="text-[#4856a9]" strokeWidth={3} />
                  <span className={`text-2xl font-black ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} uppercase`}>Editor</span>
                </button>
                <div className="flex items-center gap-3">
                  <button onClick={handleSaveNote} className="bg-[#4856a9] text-white font-black px-8 py-3 rounded-2xl shadow-xl hover:bg-[#3b4791] active:scale-95 transition-all">SAVE</button>
                </div>
              </div>
              <input type="text" value={currentNote.title} onChange={(e) => setCurrentNote({...currentNote, title: e.target.value})} placeholder="NOTE TITLE..." className={`w-full text-xl font-bold uppercase bg-transparent focus:outline-none ${isDarkMode ? 'text-gray-200 placeholder:text-gray-800' : 'text-gray-900 placeholder:text-gray-200'}`} />
            </div>

            <div className="px-6 py-2 relative overflow-visible">
              <div className={`${isDarkMode ? 'bg-indigo-950/80 border-indigo-900' : 'bg-[#4856a9]'} rounded-2xl p-4 flex items-center justify-between shadow-xl transition-all overflow-x-auto no-scrollbar`}>
                <div className="flex items-center gap-4">
                  <ToolbarIcon onClick={handleLoud} active={isLouding} tooltipTitle="Vocalizer"><Volume2 size={20} /></ToolbarIcon>
                  <ToolbarIcon onClick={handleDictateToggle} active={isTranscribing} className={isTranscribing ? "bg-red-500 animate-pulse" : ""} tooltipTitle="Dictate"><AudioLines size={20} /></ToolbarIcon>
                  <ToolbarIcon onClick={() => { setShowTranslateDropdown(!showTranslateDropdown); setShowStyling(false); setShowDictateDropdown(false); }} active={showTranslateDropdown} tooltipTitle="Translate"><Languages size={20} /></ToolbarIcon>
                  <ToolbarIcon onClick={handleSummarize} tooltipTitle="Summary"><User size={20} /></ToolbarIcon>
                  <ToolbarIcon onClick={handleGallery} tooltipTitle="Add Img"><ImageIcon size={20} /></ToolbarIcon>
                  <ToolbarIcon onClick={() => setShowAIArtModal(true)} tooltipTitle="AI Art"><ImagePlus size={20} /></ToolbarIcon>
                  
                  <div className="w-px h-10 bg-white/20 mx-1"></div>
                  
                  <ToolbarIcon onClick={handleUndo} active={historyIndex > 0} tooltipTitle="Undo"><RotateCcw size={18} /></ToolbarIcon>
                  <ToolbarIcon onClick={handleRedo} active={historyIndex < history.length - 1} tooltipTitle="Redo"><RotateCw size={18} /></ToolbarIcon>
                  
                  <ToolbarIcon onClick={() => { setShowStyling(!showStyling); setShowTranslateDropdown(false); setShowDictateDropdown(false); }} active={showStyling} tooltipTitle="Styling"><TypeIcon size={20} /></ToolbarIcon>
                </div>
                
                <div className="flex items-center gap-4 pl-4 border-l border-white/20">
                  <ToolbarIcon onClick={handleDownload} tooltipTitle="Save File"><Download size={20} /></ToolbarIcon>
                  <ToolbarIcon onClick={handleShare} tooltipTitle="Share"><Share2 size={20} /></ToolbarIcon>
                  <ToolbarIcon onClick={() => { if(confirm("CLEAR ALL CONTENT?")){ if(editorRef.current) editorRef.current.innerHTML = ''; setCurrentNote({...currentNote, content: ''}); addToHistory('', true); } }} tooltipTitle="Erase"><Eraser size={20} /></ToolbarIcon>
                </div>
              </div>

              {showTranslateDropdown && <div className="absolute top-[80px] left-6 z-[100]"><LanguageDropdown position="bottom" onClose={() => setShowTranslateDropdown(false)} onSelect={handleTranslate} activeLangCode={selectedLang.code} /></div>}
              {showDictateDropdown && <div className="absolute top-[80px] left-6 z-[100]"><LanguageDropdown title="Voice Input" position="bottom" onClose={() => setShowDictateDropdown(false)} onSelect={(lang) => { startRecording(lang); setShowDictateDropdown(false); }} activeLangCode={dictateLang.code} /></div>}
              {showStyling && <div className="absolute top-[80px] left-6 z-[100]"><StylingDropdown formatting={currentNote.formatting} onChange={handleUpdateFormatting} onClose={() => setShowStyling(false)} /></div>}
            </div>

            <main className="flex-1 px-8 py-6 flex flex-col overflow-y-auto">
              {currentNote.images.length > 0 && (
                <div className="flex gap-4 mb-6 overflow-x-auto no-scrollbar pb-2">
                  {currentNote.images.map((img, idx) => (
                    <div key={idx} className="relative group flex-shrink-0">
                      <img src={img} className="h-32 w-auto rounded-xl shadow-md border border-gray-100" alt="" />
                      <button onClick={() => { const newImages = currentNote.images.filter((_, i) => i !== idx); setCurrentNote({...currentNote, images: newImages}); }} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                    </div>
                  ))}
                </div>
              )}
              <div 
                ref={editorRef} 
                contentEditable 
                data-placeholder="BEGIN TYPING YOUR VISION..." 
                className={`flex-1 rich-editor text-lg leading-relaxed outline-none ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`} 
                onInput={(e) => { 
                  const h = e.currentTarget.innerHTML; 
                  // Optimization: only update the note state if the content actually changed significantly
                  // to avoid unnecessary re-renders during rapid typing
                  setCurrentNote(prev => prev ? { ...prev, content: h } : null); 
                  addToHistory(h); 
                }} 
                dangerouslySetInnerHTML={{ __html: currentNote.content }} 
              />
            </main>

            <button onClick={() => setShowAIChat(true)} className="absolute bottom-8 right-8 w-20 h-20 bg-[#4856a9] text-white rounded-full shadow-2xl flex flex-col items-center justify-center active:scale-95 transition-all z-50">
               <span className="text-[8px] font-black tracking-widest uppercase">foyeajX</span>
               <span className="text-3xl font-black">Ai</span>
            </button>
          </div>
        ) : (
          <div className={`flex flex-col h-full ${isDarkMode ? 'bg-[#0f111a]' : 'bg-[#F9FAFF]'}`}>
            <header className="px-6 pt-10 pb-6 flex items-center justify-between">
              <Logo variant={isDarkMode ? 'white' : 'default'} />
              <button onClick={() => setTheme(isDarkMode ? 'light' : 'dark')} className={`w-12 h-12 rounded-full border flex items-center justify-center shadow-lg active:scale-95 transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 text-indigo-300' : 'bg-white border-gray-100 text-[#4856a9]'}`}>
                {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
              </button>
            </header>

            <div className="px-6 py-4">
              <div className="relative group">
                <div className={`absolute inset-0 blur-xl opacity-20 ${isDarkMode ? 'bg-indigo-500' : 'bg-[#4856a9]'}`}></div>
                <div className={`relative flex items-center border rounded-full h-16 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                  <Search className="ml-6 text-gray-400" size={20} />
                  <input type="text" placeholder="SEARCH NOTES" className="flex-1 bg-transparent px-4 font-bold text-sm outline-none placeholder:text-gray-300" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>
            </div>

            <main className="flex-1 overflow-y-auto px-6 pb-32">
              <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
                {notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase())).map(note => (
                  <NoteCard 
                    key={note.id} 
                    note={note} 
                    onClick={() => { setCurrentNote(note); setView('editor'); setHistory([note.content]); setHistoryIndex(0); }}
                    onTogglePin={(e) => { e.stopPropagation(); setNotes(prev => prev.map(n => n.id === note.id ? { ...n, isPinned: !n.isPinned } : n)); }}
                    onToggleStar={(e) => { e.stopPropagation(); setNotes(prev => prev.map(n => n.id === note.id ? { ...n, isStarred: !n.isStarred } : n)); }}
                    onDelete={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                    isDark={isDarkMode}
                  />
                ))}
                {notes.length === 0 && <div className="py-20 text-center opacity-30 font-black uppercase tracking-widest">No notes in the link.</div>}
              </div>
            </main>

            <div className={`fixed bottom-0 left-0 right-0 border-t flex flex-col items-center ${isDarkMode ? 'bg-[#0f111a] border-gray-800' : 'bg-white border-gray-50'}`}>
              <div className="w-full flex items-center justify-around px-4 pt-4 pb-12">
                <NavItem icon={<Home size={28} />} active={view === 'home'} onClick={() => setView('home')} tooltipTitle="Home" isDark={isDarkMode} />
                <NavItem icon={<Star size={28} />} active={view === 'starred'} onClick={() => setView('starred')} tooltipTitle="Starred" isDark={isDarkMode} />
                <div className="relative">
                  <button onClick={handleCreateNote} className="w-16 h-16 bg-[#4856a9] text-white rounded-3xl shadow-2xl -mt-14 flex items-center justify-center border-[6px] border-[#F9FAFF] active:scale-90 transition-all relative">
                    <Plus size={36} strokeWidth={4} />
                  </button>
                  <span className={`absolute top-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest mt-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>New</span>
                </div>
                <NavItem icon={<Bot size={28} />} active={view === 'ai'} onClick={() => setShowAIChat(true)} tooltipTitle="AI Insight" isDark={isDarkMode} />
                <NavItem icon={<Settings size={28} />} active={view === 'settings'} onClick={() => setView('settings')} tooltipTitle="Settings" isDark={isDarkMode} />
              </div>
              <div className="w-full py-2 flex items-center justify-center gap-2 border-t border-gray-100/10">
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">{isSyncing ? 'Synchronizing assets...' : 'Cloud Encrypted Sync'}</span>
                <Cloud size={10} className="text-indigo-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      {showAIChat && (
        <div className="fixed inset-0 z-[6000] bg-black/40 backdrop-blur-md flex items-center justify-end">
          <div className={`w-full max-w-md h-full sm:h-[90vh] sm:rounded-[48px] sm:mr-10 shadow-2xl overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <AIChat onClose={() => setShowAIChat(false)} noteContext={getPlainText(currentNote?.content || '')} noteId={currentNote?.id} onExecuteTool={onExecuteTool} isDark={isDarkMode} />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
