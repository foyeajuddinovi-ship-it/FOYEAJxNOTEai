
import React, { useState } from 'react';
import { X, ImagePlus, Sparkles, FileText, Send, Loader2, Wand2, Palette } from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface AIArtModalProps {
  onClose: () => void;
  onGenerate: (prompt: string) => Promise<void>;
  noteContent: string;
  isDark?: boolean;
}

const STYLE_TEMPLATES = [
  { label: 'Cyberpunk', suffix: ', cyberpunk style, neon lights, highly detailed, futuristic' },
  { label: 'Watercolor', suffix: ', soft watercolor painting, artistic brushstrokes, dreamy' },
  { label: '3D Render', suffix: ', Octane render, 3D character style, cinematic lighting, cute' },
  { label: 'Minimalist', suffix: ', minimalist flat vector art, clean lines, simple colors' },
  { label: 'Oil Painting', suffix: ', classic oil painting on canvas, heavy texture, masterpiece' }
];

export const AIArtModal: React.FC<AIArtModalProps> = ({ onClose, onGenerate, noteContent, isDark }) => {
  const [manualPrompt, setManualPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const handleGenerateManual = async () => {
    if (!manualPrompt.trim() || isGenerating) return;
    const finalPrompt = selectedStyle 
      ? `${manualPrompt} ${STYLE_TEMPLATES.find(t => t.label === selectedStyle)?.suffix}` 
      : manualPrompt;
    
    setIsGenerating(true);
    await onGenerate(finalPrompt);
    setIsGenerating(false);
    onClose();
  };

  const handleSmartAnalyze = async () => {
    if (!noteContent.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const suggestedPrompt = await geminiService.analyzeNoteForImagePrompt(noteContent);
      setManualPrompt(suggestedPrompt);
    } catch (error) {
      console.error(error);
      setManualPrompt(noteContent.substring(0, 100)); // Fallback
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateFromNode = async () => {
    if (!noteContent.trim() || isGenerating) return;
    setIsGenerating(true);
    await onGenerate(noteContent);
    setIsGenerating(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[7000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className={`w-full max-w-[480px] rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden animate-in zoom-in-95 duration-300 border ${
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
      }`}>
        {/* Header */}
        <div className={`p-8 border-b flex items-center justify-between transition-colors ${
          isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-indigo-50/30 border-gray-50'
        }`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#4856a9] to-[#6373d1] rounded-2xl flex items-center justify-center text-white shadow-lg">
              <ImagePlus size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className={`text-[10px] font-black uppercase tracking-[0.25em] leading-none mb-1 ${isDark ? 'text-indigo-300' : 'text-[#4856a9]'}`}>AI Masterpiece</h3>
              <p className={`text-[14px] font-bold uppercase tracking-tight ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>Generate Visual Insight</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-3 rounded-2xl transition-all active:scale-90 ${
            isDark ? 'bg-gray-800 text-gray-500 hover:text-red-400' : 'bg-white border border-gray-100 text-gray-400 hover:text-red-500'
          }`}>
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
          {/* Manual Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>Custom Vision</span>
              <button 
                onClick={handleSmartAnalyze}
                disabled={isAnalyzing || !noteContent.trim()}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all active:scale-95 text-[9px] font-black uppercase tracking-widest ${
                  isDark ? 'bg-indigo-900/30 text-indigo-300 hover:bg-indigo-900/50' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                }`}
              >
                {isAnalyzing ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                AI Suggester
              </button>
            </div>
            <div className="relative group">
              <textarea
                value={manualPrompt}
                onChange={(e) => setManualPrompt(e.target.value)}
                placeholder="Describe the image you imagine..."
                className={`w-full rounded-2xl px-6 py-5 text-sm font-semibold focus:outline-none focus:ring-4 transition-all h-32 resize-none ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-indigo-400/10 placeholder:text-gray-700' 
                    : 'bg-gray-50 border border-gray-100 text-gray-900 focus:ring-[#4856a9]/5 placeholder:text-gray-300'
                }`}
              />
              <button 
                onClick={handleGenerateManual}
                disabled={!manualPrompt.trim() || isGenerating}
                className="absolute bottom-4 right-4 p-4 bg-[#4856a9] text-white rounded-xl shadow-xl shadow-indigo-100/10 disabled:opacity-50 transition-all active:scale-90 hover:bg-[#3b4791]"
              >
                {isGenerating ? <Loader2 size={22} className="animate-spin" /> : <Send size={22} />}
              </button>
            </div>
          </div>

          {/* Style Templates */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Palette size={14} className={isDark ? 'text-indigo-400' : 'text-[#4856a9]'} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>Visual Templates</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {STYLE_TEMPLATES.map((style) => (
                <button
                  key={style.label}
                  onClick={() => setSelectedStyle(selectedStyle === style.label ? null : style.label)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                    selectedStyle === style.label
                      ? 'bg-[#4856a9] text-white border-transparent shadow-md'
                      : isDark
                        ? 'bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-600'
                        : 'bg-white border-gray-100 text-gray-400 hover:bg-indigo-50 hover:text-[#4856a9] hover:border-indigo-100'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center py-2">
            <div className={`flex-grow border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}></div>
            <span className={`flex-shrink mx-4 text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-gray-700' : 'text-gray-200'}`}>OR</span>
            <div className={`flex-grow border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}></div>
          </div>

          {/* From Node Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>Intelligent Sync</span>
              <FileText size={14} className={isDark ? 'text-indigo-400' : 'text-[#4856a9]'} />
            </div>
            <button 
              onClick={handleGenerateFromNode}
              disabled={!noteContent.trim() || isGenerating}
              className={`w-full py-6 px-8 rounded-3xl border flex items-center justify-between group transition-all active:scale-[0.98] disabled:opacity-50 ${
                isDark 
                  ? 'bg-gray-800/40 border-gray-700 hover:bg-gray-800 hover:border-indigo-900/50' 
                  : 'bg-[#f4f6ff] border-indigo-100 hover:bg-white hover:border-[#4856a9]'
              }`}
            >
              <div className="flex flex-col items-start text-left">
                <span className={`text-[11px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-indigo-300' : 'text-[#4856a9]'}`}>Sync with Note</span>
                <p className={`text-[10px] font-bold uppercase tracking-tight line-clamp-1 w-48 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  {noteContent || 'Empty note content...'}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-sm group-hover:shadow-md transition-all ${
                isDark ? 'bg-gray-800 border-gray-700 text-indigo-300' : 'bg-white border-indigo-50 text-[#4856a9]'
              }`}>
                {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <FileText size={24} strokeWidth={2.5} />}
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 text-center border-t transition-colors ${
          isDark ? 'bg-gray-800/30 border-gray-800' : 'bg-indigo-50/30 border-gray-50'
        }`}>
          <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-gray-600' : 'text-indigo-300'}`}>
            Analyze. Visualize. Create with foyeajX
          </p>
        </div>
      </div>
    </div>
  );
};
