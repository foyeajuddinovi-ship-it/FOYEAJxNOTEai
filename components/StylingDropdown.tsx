
import React from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type, ChevronLeft, ChevronRight } from 'lucide-react';
import { FormattingState } from '../types';

interface StylingDropdownProps {
  formatting: FormattingState;
  onChange: (newFormatting: FormattingState) => void;
  onClose: () => void;
}

export const StylingDropdown: React.FC<StylingDropdownProps> = ({ formatting, onChange, onClose }) => {
  const toggleStyle = (key: keyof Pick<FormattingState, 'bold' | 'italic' | 'underline'>) => {
    // Selection-based formatting
    const command = key === 'bold' ? 'bold' : key === 'italic' ? 'italic' : 'underline';
    document.execCommand(command, false);
    onChange({ ...formatting, [key]: !formatting[key] });
  };

  const setAlignment = (alignment: FormattingState['alignment']) => {
    const alignCmd = alignment === 'center' ? 'justifyCenter' : 
                     alignment === 'right' ? 'justifyRight' : 'justifyLeft';
    document.execCommand(alignCmd, false);
    onChange({ ...formatting, alignment });
  };

  const changeFontSize = (delta: number) => {
    const newSize = Math.max(12, Math.min(48, formatting.fontSize + delta));
    
    // Applying to selection via execCommand is limited, so we use styleWithCSS
    document.execCommand('styleWithCSS', false, 'true');
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (!range.collapsed) {
        const span = document.createElement('span');
        span.style.fontSize = `${newSize}px`;
        range.surroundContents(span);
      }
    }
    
    onChange({ ...formatting, fontSize: newSize });
  };

  return (
    <div className="absolute z-[100] bg-white border border-gray-100 rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.2)] w-[280px] left-0 mt-4 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4856a9] leading-none mb-1">Text Design</span>
          <span className="text-[12px] font-bold text-gray-400 uppercase tracking-tight">Format Selection</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={16} className="text-gray-400 rotate-90" strokeWidth={3} />
        </button>
      </div>

      <div className="p-4 space-y-6 bg-white">
        {/* Basic Styles */}
        <div className="flex items-center justify-between gap-2">
          <button 
            onClick={() => toggleStyle('bold')}
            className={`flex-1 aspect-square flex items-center justify-center rounded-2xl transition-all border ${formatting.bold ? 'bg-indigo-50 border-indigo-200 text-[#4856a9]' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'}`}
          >
            <Bold size={18} strokeWidth={3} />
          </button>
          <button 
            onClick={() => toggleStyle('italic')}
            className={`flex-1 aspect-square flex items-center justify-center rounded-2xl transition-all border ${formatting.italic ? 'bg-indigo-50 border-indigo-200 text-[#4856a9]' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'}`}
          >
            <Italic size={18} strokeWidth={3} />
          </button>
          <button 
            onClick={() => toggleStyle('underline')}
            className={`flex-1 aspect-square flex items-center justify-center rounded-2xl transition-all border ${formatting.underline ? 'bg-indigo-50 border-indigo-200 text-[#4856a9]' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'}`}
          >
            <Underline size={18} strokeWidth={3} />
          </button>
        </div>

        {/* Font Size */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Font Size</span>
            <span className="text-[10px] font-black text-[#4856a9] uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full">{formatting.fontSize}PX</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => changeFontSize(-1)}
              className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all border border-transparent active:scale-90"
            >
              <ChevronLeft size={16} strokeWidth={3} />
            </button>
            <div className="flex-1 h-2 bg-gray-100 rounded-full relative overflow-hidden">
               <div 
                 className="absolute left-0 top-0 h-full bg-[#4856a9] transition-all" 
                 style={{ width: `${((formatting.fontSize - 12) / (48 - 12)) * 100}%` }}
               />
            </div>
            <button 
              onClick={() => changeFontSize(1)}
              className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all border border-transparent active:scale-90"
            >
              <ChevronRight size={16} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Alignment */}
        <div className="space-y-3">
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-1">Alignment</span>
          <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-[20px] border border-gray-100">
            <button 
              onClick={() => setAlignment('left')}
              className={`flex-1 h-9 rounded-xl flex items-center justify-center transition-all ${formatting.alignment === 'left' ? 'bg-white text-[#4856a9] shadow-sm' : 'text-gray-300 hover:text-gray-400'}`}
            >
              <AlignLeft size={16} strokeWidth={3} />
            </button>
            <button 
              onClick={() => setAlignment('center')}
              className={`flex-1 h-9 rounded-xl flex items-center justify-center transition-all ${formatting.alignment === 'center' ? 'bg-white text-[#4856a9] shadow-sm' : 'text-gray-300 hover:text-gray-400'}`}
            >
              <AlignCenter size={16} strokeWidth={3} />
            </button>
            <button 
              onClick={() => setAlignment('right')}
              className={`flex-1 h-9 rounded-xl flex items-center justify-center transition-all ${formatting.alignment === 'right' ? 'bg-white text-[#4856a9] shadow-sm' : 'text-gray-300 hover:text-gray-400'}`}
            >
              <AlignRight size={16} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 bg-indigo-50/30 flex justify-center text-center">
        <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest leading-relaxed">
          Select text and apply styles
        </p>
      </div>
    </div>
  );
};
