
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Home, Star, Plus, Bot, Settings, Search, Sun, Moon,
  Languages, User, ImagePlus, ImageIcon, 
  RotateCcw, RotateCw, ChevronLeft, Share2, Download, 
  Type as TypeIcon, X, Volume2, AudioLines, Loader2, Eraser, Cloud, Sparkles
} from 'lucide-react';
import { Note, View, Language, FormattingState } from './types.ts';
import { LANGUAGES, DEFAULT_FORMATTING } from './constants.ts';
import { NoteCard } from './components/NoteCard.tsx';
import { LanguageDropdown } from './components/LanguageDropdown.tsx';
import { StylingDropdown } from './components/StylingDropdown.tsx';
import { AIChat } from './components/AIChat.tsx';
import { AIArtModal } from './components/AIArtModal.tsx';
import { geminiService } from './services/geminiService.ts';

type ThemeType = 'light' | 'dark';

const Logo: React.FC<{ variant?: 'default' | 'white' }> = ({ variant = 'default' }) => {
  const textColor = variant === 'white' ? 'text-white' : 'text-gray-900';
  return (
    <div className="flex items-center gap-3 select-none">
      <div className="w-10 h-10 bg-[#4856a9] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200/50">
        <X size={20} className="text-white" strokeWidth={4} />
      </div>
      <div className="flex flex-col">
        <span className={`font-black leading-none tracking-tighter text-lg ${textColor}`}>FOYEAJ</span>
        <span className="font-bold uppercase tracking-[0.25em] text-[9px] text-indigo-400 -mt-0.5">Note x AI</span>
      </div>
    </div>
  );
};

const ToolbarIcon: React.FC<{ 
  children: React.ReactNode; 
  onClick?: () => void; 
  active?: boolean; 
  label: string;
  isDanger?: boolean;
  className?: string;
}> = ({ children, onClick, active, label, isDanger, className }) => {
  return (
    <div className={`flex flex-col items-center group ${className}`}>
      <button 
        onClick={onClick} 
        className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-300 ${
          active 
            ? 'bg-white text-[#4856a9] shadow-md scale-105' 
            : `text-white/80 hover:bg-white/15 hover:text-white active:scale-95 ${isDanger ? 'hover:bg-red-500/20' : ''}`
        }`}
      >
        {children}
      </button>
      <span className={`label-caps mt-1.5 transition-all duration-300 ${active ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
        {label}
      </span>
    </div>
  );
};

const NavItem = ({ icon, active, onClick, label, isDark }: any) => {
  return (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center gap-1.5 px-4 py-2 rounded-2xl transition-all ${
        active 
          ? (isDark ? 'text-indigo-400' : 'text-[#4856a9]') 
          : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      <div className={`p-2 rounded-xl transition-all ${active ? (isDark ? 'bg-indigo-900/40' : 'bg-indigo-50') : ''}`}>
        {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 2 })}
      </div>
      <span className={`label-caps transition-opacity ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
    </button>
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
  const [activeAIProcess, setActiveAIProcess] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'translate' | 'dictate' | 'styling' | null>(null);
  const [showAIArtModal, setShowAIArtModal] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Language>(LANGUAGES[0]);
  const [dictateLang, setDictateLang] = useState<Language>(LANGUAGES[0]);
  const [showAIChat, setShowAIChat] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
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
        setHistoryIndex(newHistory.length - 1);
        return newHistory;
      });
    };
    if (historyTimeoutRef.current) window.clearTimeout(historyTimeoutRef.current);
    if (immediate) performUpdate();
    else historyTimeoutRef.current = window.setTimeout(performUpdate, 1000);
  }, [historyIndex]);

  const onExecuteTool = (name: string, args: any) => {
    if (!currentNote) return "Note not active";
    switch (name) {
      case 'updateNoteContent':
        const content = args.mode === 'append' ? (editorRef.current?.innerHTML + args.newContent) : args.newContent;
        if (editorRef.current) editorRef.current.innerHTML = content;
        setCurrentNote({ ...currentNote, content });
        addToHistory(content, true);
        return "Note updated.";
      case 'applyFormatting':
        const newFormatting = { ...currentNote.formatting, ...args };
        handleUpdateFormatting(newFormatting);
        return "Applied.";
      default: return "Command error.";
    }
  };

  const handleUpdateFormatting = (formatting: FormattingState) => {
    document.execCommand('styleWithCSS', false, 'true');
    setCurrentNote(prev => prev ? { ...prev, formatting } : null);
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
    setView('editor');
  };

  const handleLoud = async () => {
    if (!currentNote) return;
    setActiveAIProcess('Synthesizing Voice');
    try { await geminiService.speak(getPlainText(editorRef.current?.innerHTML || '')); } 
    catch (e) { console.error(e); } finally { setActiveAIProcess(null); }
  };

  const startRecording = async (lang: Language) => {
    setDictateLang(lang);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          setActiveAIProcess('Transcribing');
          try {
            const result = await geminiService.transcribe(base64Audio, mediaRecorder.mimeType, lang.native);
            if (result && editorRef.current) {
              const newHtml = editorRef.current.innerHTML + ' ' + result;
              editorRef.current.innerHTML = newHtml;
              setCurrentNote(prev => prev ? { ...prev, content: newHtml } : null);
              addToHistory(newHtml, true);
            }
          } finally { setActiveAIProcess(null); }
        };
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.start();
      setIsTranscribing(true);
    } catch (err) { alert("Mic denied."); }
  };

  const handleTranslate = async (lang: Language) => {
    if (!currentNote) return;
    setSelectedLang(lang);
    setActiveAIProcess('Translating');
    try {
      const translated = await geminiService.translate(getPlainText(editorRef.current?.innerHTML || ''), lang.name);
      if (editorRef.current) editorRef.current.innerHTML = translated;
      setCurrentNote(prev => prev ? { ...prev, content: translated, language: lang.code } : null);
      addToHistory(translated, true);
    } finally { setActiveAIProcess(null); }
  };

  // Fix: Added handleUndo to resolve reference error
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevContent = history[prevIndex];
      setHistoryIndex(prevIndex);
      if (editorRef.current) editorRef.current.innerHTML = prevContent;
      setCurrentNote(prev => prev ? { ...prev, content: prevContent } : null);
    }
  };

  // Fix: Added handleRedo to resolve reference error
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextContent = history[nextIndex];
      setHistoryIndex(nextIndex);
      if (editorRef.current) editorRef.current.innerHTML = nextContent;
      setCurrentNote(prev => prev ? { ...prev, content: nextContent } : null);
    }
  };

  // Fix: Added handleDownload to resolve reference error
  const handleDownload = () => {
    if (!currentNote) return;
    const content = editorRef.current?.innerHTML || currentNote.content;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentNote.title || 'note'}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`h-screen w-full flex overflow-hidden flex-col ${isDarkMode ? 'bg-[#0f111a] text-gray-100' : 'bg-[#F9FAFF] text-gray-900'} transition-colors duration-500`}>
      {/* AI Processing Overlay */}
      {activeAIProcess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] animate-fade-in">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-indigo-100 dark:border-gray-700 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4">
            <Loader2 className="animate-spin text-indigo-500" size={18} />
            <span className="label-caps text-indigo-600 dark:text-indigo-400">{activeAIProcess}...</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {view === 'editor' && currentNote ? (
          <div className="flex-1 flex flex-col h-full animate-fade-in">
            {/* Editor Header */}
            <header className="px-6 py-8 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <button onClick={() => { if(currentNote.content || currentNote.title) { handleSaveNote(); } setView('home'); }} className="flex items-center gap-2 group">
                  <ChevronLeft className="text-indigo-500 group-hover:-translate-x-1 transition-transform" strokeWidth={3} />
                  <span className="label-caps text-sm">Dashboard</span>
                </button>
                <div className="flex gap-3">
                  <button onClick={() => { handleSaveNote(); setView('home'); }} className="bg-[#4856a9] text-white label-caps px-8 py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95">Save Changes</button>
                </div>
              </div>
              <input 
                type="text" 
                value={currentNote.title} 
                onChange={(e) => setCurrentNote({...currentNote, title: e.target.value})} 
                placeholder="UNLEASH YOUR INSIGHT..." 
                className="bg-transparent text-2xl font-black uppercase tracking-tighter outline-none placeholder:text-gray-300 dark:placeholder:text-gray-800"
              />
            </header>

            {/* Structured Toolbar */}
            <div className="px-6 pb-6">
              <div className="bg-[#4856a9] rounded-3xl p-4 flex items-center gap-6 overflow-x-auto no-scrollbar shadow-xl shadow-indigo-200/20 glass-panel border border-white/10">
                <div className="flex items-center gap-4 border-r border-white/10 pr-4">
                   <ToolbarIcon onClick={handleLoud} label="Voice"><Volume2 size={20} /></ToolbarIcon>
                   <ToolbarIcon 
                     onClick={() => { if(isTranscribing) { mediaRecorderRef.current?.stop(); setIsTranscribing(false); } else setActiveDropdown('dictate'); }} 
                     active={isTranscribing} 
                     label="Dictate" 
                     className={isTranscribing ? 'animate-pulse text-red-400' : ''}
                   >
                     <AudioLines size={20} />
                   </ToolbarIcon>
                </div>
                
                <div className="flex items-center gap-4 border-r border-white/10 pr-4">
                  <ToolbarIcon onClick={() => setActiveDropdown(activeDropdown === 'translate' ? null : 'translate')} active={activeDropdown === 'translate'} label="Globe"><Languages size={20} /></ToolbarIcon>
                  <ToolbarIcon onClick={() => setShowAIArtModal(true)} label="Visuals"><ImagePlus size={20} /></ToolbarIcon>
                  <ToolbarIcon onClick={() => setActiveDropdown(activeDropdown === 'styling' ? null : 'styling')} active={activeDropdown === 'styling'} label="Design"><TypeIcon size={20} /></ToolbarIcon>
                </div>

                <div className="flex items-center gap-4">
                  <ToolbarIcon onClick={handleUndo} active={historyIndex > 0} label="Undo"><RotateCcw size={18} /></ToolbarIcon>
                  <ToolbarIcon onClick={handleRedo} active={historyIndex < history.length - 1} label="Redo"><RotateCw size={18} /></ToolbarIcon>
                  <ToolbarIcon onClick={() => { if(confirm("Clear content?")) { if(editorRef.current) editorRef.current.innerHTML = ''; setCurrentNote({...currentNote, content: ''}); addToHistory('', true); } }} isDanger label="Reset"><Eraser size={20} /></ToolbarIcon>
                </div>

                <div className="flex items-center gap-4 ml-auto pl-4 border-l border-white/10">
                   <ToolbarIcon onClick={handleDownload} label="Export"><Download size={20} /></ToolbarIcon>
                   <ToolbarIcon onClick={() => {}} label="Share"><Share2 size={20} /></ToolbarIcon>
                </div>
              </div>

              {/* Dropdown Container */}
              <div className="relative">
                {activeDropdown === 'translate' && <LanguageDropdown position="bottom" onClose={() => setActiveDropdown(null)} onSelect={handleTranslate} activeLangCode={selectedLang.code} />}
                {activeDropdown === 'dictate' && <LanguageDropdown title="Dictation" position="bottom" onClose={() => setActiveDropdown(null)} onSelect={(l) => { startRecording(l); setActiveDropdown(null); }} activeLangCode={dictateLang.code} />}
                {activeDropdown === 'styling' && <StylingDropdown formatting={currentNote.formatting} onChange={handleUpdateFormatting} onClose={() => setActiveDropdown(null)} />}
              </div>
            </div>

            {/* Body */}
            <main className="flex-1 overflow-y-auto px-8 py-4 flex flex-col gap-6 custom-scrollbar">
              {currentNote.images.length > 0 && (
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  {currentNote.images.map((img, idx) => (
                    <div key={idx} className="relative group flex-shrink-0 animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                      <img src={img} className="h-44 w-auto rounded-2xl shadow-lg border-2 border-white dark:border-gray-800" alt="" />
                      <button onClick={() => { const ni = currentNote.images.filter((_, i) => i !== idx); setCurrentNote({...currentNote, images: ni}); }} className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <X size={14} strokeWidth={4} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div 
                ref={editorRef} 
                contentEditable 
                data-placeholder="START YOUR CREATIVE JOURNEY..." 
                className="flex-1 rich-editor text-lg font-medium leading-relaxed tracking-tight"
                onInput={(e) => { const h = e.currentTarget.innerHTML; setCurrentNote(prev => prev ? {...prev, content: h} : null); addToHistory(h); }}
                dangerouslySetInnerHTML={{ __html: currentNote.content }}
              />
            </main>

            {/* AI Floating Button */}
            <button onClick={() => setShowAIChat(true)} className="fixed bottom-8 right-8 w-20 h-20 bg-[#4856a9] text-white rounded-[24px] shadow-2xl flex flex-col items-center justify-center active:scale-95 transition-all z-50 group border-4 border-white dark:border-gray-900">
               <span className="label-caps text-[8px] opacity-70 group-hover:opacity-100">Insight</span>
               <span className="text-3xl font-black">Ai</span>
               <div className="absolute -inset-1.5 border-2 border-indigo-400/20 rounded-[30px] animate-ping pointer-events-none"></div>
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col animate-fade-in">
            <header className="px-8 pt-10 pb-6 flex items-center justify-between">
              <Logo />
              <button onClick={() => setTheme(isDarkMode ? 'light' : 'dark')} className={`w-12 h-12 rounded-xl border flex items-center justify-center shadow-sm transition-all active:scale-90 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-indigo-400' : 'bg-white border-gray-100 text-indigo-600'}`}>
                {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
              </button>
            </header>

            <div className="px-8 py-2">
              <div className="relative flex items-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl h-16 shadow-sm group">
                <Search className="ml-5 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="SEARCH INSIGHTS..." 
                  className="flex-1 bg-transparent px-4 label-caps tracking-widest outline-none text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <main className="flex-1 overflow-y-auto px-8 pt-6 pb-32 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                {notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase())).map(note => (
                  <NoteCard 
                    key={note.id} 
                    note={note} 
                    onClick={() => { setCurrentNote(note); setView('editor'); setHistory([note.content]); setHistoryIndex(0); }}
                    onTogglePin={(e) => { e.stopPropagation(); setNotes(prev => prev.map(n => n.id === note.id ? { ...n, isPinned: !n.isPinned } : n)); }}
                    onToggleStar={(e) => { e.stopPropagation(); setNotes(prev => prev.map(n => n.id === note.id ? { ...n, isStarred: !n.isStarred } : n)); }}
                    onDelete={(e) => { e.stopPropagation(); if(confirm("Delete note?")) setNotes(prev => prev.filter(n => n.id !== note.id)); }}
                    isDark={isDarkMode}
                  />
                ))}
              </div>
              {notes.length === 0 && (
                <div className="h-64 flex flex-col items-center justify-center opacity-20 text-center">
                  <Sparkles size={48} className="mb-4" />
                  <span className="label-caps">Your digital legacy starts here</span>
                </div>
              )}
            </main>

            {/* Bottom Nav */}
            <nav className={`fixed bottom-0 left-0 right-0 border-t flex flex-col items-center z-50 ${isDarkMode ? 'bg-[#0f111a]/95 border-gray-800' : 'bg-white/95 border-gray-50'} backdrop-blur-xl`}>
              <div className="w-full flex items-center justify-around px-4 pt-4 pb-8 max-w-lg mx-auto">
                <NavItem icon={<Home />} active={view === 'home'} onClick={() => setView('home')} label="Home" isDark={isDarkMode} />
                <NavItem icon={<Star />} active={view === 'starred'} onClick={() => setView('starred')} label="Starred" isDark={isDarkMode} />
                
                <div className="relative -mt-10">
                  <button onClick={handleCreateNote} className="w-16 h-16 bg-[#4856a9] text-white rounded-2xl shadow-2xl flex items-center justify-center border-4 border-white dark:border-[#0f111a] hover:scale-105 transition-all group">
                    <Plus size={32} strokeWidth={4} className="group-hover:rotate-90 transition-transform" />
                  </button>
                </div>

                <NavItem icon={<Bot />} active={view === 'ai'} onClick={() => setShowAIChat(true)} label="Insight" isDark={isDarkMode} />
                <NavItem icon={<Settings />} active={view === 'settings'} onClick={() => setView('settings')} label="Settings" isDark={isDarkMode} />
              </div>
              <div className="w-full py-2 flex items-center justify-center gap-2 border-t border-gray-100/5">
                <span className="label-caps opacity-40 text-[7px]">{isSyncing ? 'Linking Assets...' : 'Encrypted Link Active'}</span>
                <Cloud size={10} className="text-indigo-400 opacity-40" />
              </div>
            </nav>
          </div>
        )}
      </div>

      {showAIChat && (
        <div className="fixed inset-0 z-[6000] bg-black/40 backdrop-blur-md flex items-center justify-end p-0 md:p-6 animate-fade-in">
          <div className={`w-full max-w-md h-full md:h-[90vh] md:rounded-[32px] shadow-2xl overflow-hidden ${isDarkMode ? 'bg-[#0a0c14]' : 'bg-white'}`}>
            <AIChat onClose={() => setShowAIChat(false)} noteContext={getPlainText(currentNote?.content || '')} noteId={currentNote?.id} onExecuteTool={onExecuteTool} isDark={isDarkMode} />
          </div>
        </div>
      )}

      {showAIArtModal && currentNote && (
        <AIArtModal onClose={() => setShowAIArtModal(false)} onGenerate={async (p) => { 
          setActiveAIProcess('Generating Art');
          try { 
            const url = await geminiService.generateImage(p); 
            setCurrentNote({...currentNote, images: [...currentNote.images, url]}); 
          } finally { setActiveAIProcess(null); }
        }} noteContent={getPlainText(currentNote.content)} isDark={isDarkMode} />
      )}
    </div>
  );

  function handleSaveNote() {
    if (!currentNote) return;
    const content = editorRef.current?.innerHTML || '';
    const updated = { ...currentNote, content };
    setNotes(prev => {
      const exists = prev.find(n => n.id === currentNote.id);
      if (exists) return prev.map(n => n.id === currentNote.id ? updated : n);
      return [updated, ...prev];
    });
  }
};

export default App;
