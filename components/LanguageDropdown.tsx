
import React from 'react';
import { LANGUAGES } from '../constants';
import { Language } from '../types';
import { X, Check } from 'lucide-react';

interface LanguageDropdownProps {
  onSelect: (lang: Language) => void;
  onClose: () => void;
  position: 'top' | 'bottom';
  activeLangCode?: string;
  title?: string;
  subtitle?: string;
}

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ 
  onSelect, 
  onClose, 
  activeLangCode, 
  title = "AI Translation",
  subtitle = "Select Target"
}) => {
  return (
    <div className="absolute z-[100] bg-white border border-gray-100 rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.2)] w-[320px] left-0 mt-4 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4856a9] leading-none mb-1">{title}</span>
          <span className="text-[12px] font-bold text-gray-400 uppercase tracking-tight">{subtitle}</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X size={16} className="text-gray-400" strokeWidth={3} />
        </button>
      </div>
      
      <div className="p-4 grid grid-cols-3 gap-2 max-h-[360px] overflow-y-auto no-scrollbar bg-white">
        {LANGUAGES.map((lang) => {
          const isActive = lang.code === activeLangCode;
          return (
            <button
              key={lang.code}
              onClick={() => {
                onSelect(lang);
                onClose();
              }}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all group active:scale-90 border relative ${
                isActive 
                  ? 'bg-indigo-50 border-indigo-200' 
                  : 'hover:bg-indigo-50/80 border-transparent hover:border-indigo-100'
              }`}
            >
              {isActive && (
                <div className="absolute top-1 right-1 bg-[#4856a9] text-white rounded-full p-0.5 shadow-sm">
                  <Check size={8} strokeWidth={4} />
                </div>
              )}
              <div className={`text-3xl mb-2 transition-transform group-hover:scale-125 duration-300 ${isActive ? 'scale-110' : ''}`}>
                {lang.icon}
              </div>
              <span className={`text-[10px] font-black leading-none text-center uppercase tracking-tighter transition-colors ${
                isActive ? 'text-[#4856a9]' : 'text-gray-500 group-hover:text-[#4856a9]'
              }`}>
                {lang.code.toUpperCase()}
              </span>
              <span className={`text-[8px] font-bold transition-colors uppercase mt-1 truncate w-full text-center ${
                isActive ? 'text-indigo-400' : 'text-gray-300 group-hover:text-indigo-300'
              }`}>
                {lang.name.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
      
      <div className="p-4 bg-indigo-50/30 flex justify-center text-center">
        <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest leading-relaxed">
          {title.includes('Speak') ? "Choose your spoken language" : "Automatically translate your note"}
        </p>
      </div>
    </div>
  );
};
