
import React from 'react';
import { Note } from '../types';
import { Pin, Star, Trash2 } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
  onTogglePin: (e: React.MouseEvent) => void;
  onToggleStar: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  isDark?: boolean;
}

const stripHtml = (html: string) => {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

export const NoteCard: React.FC<NoteCardProps> = ({ note, onClick, onTogglePin, onToggleStar, onDelete, isDark }) => {
  const plainContent = stripHtml(note.content);

  return (
    <div 
      onClick={onClick}
      className={`rounded-[24px] p-6 shadow-sm border cursor-pointer hover:shadow-md transition-all relative group flex flex-col ${
        isDark ? 'bg-gray-800 border-gray-700 hover:border-indigo-900' : 'bg-white border-[#eef0f7] hover:shadow-md'
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <h3 className={`font-black uppercase text-sm tracking-widest leading-none truncate pr-4 ${isDark ? 'text-gray-100' : 'text-[#1a1a1a]'}`}>
          {note.title || 'UNTITLED NOTE'}
        </h3>
        <div className="flex gap-2.5">
          <button 
            onClick={(e) => { e.stopPropagation(); onTogglePin(e); }} 
            className={`p-1.5 rounded-lg transition-all ${note.isPinned ? (isDark ? 'text-indigo-400 bg-indigo-900/20' : 'text-[#4856a9] bg-indigo-50') : (isDark ? 'text-gray-600 hover:text-indigo-300' : 'text-gray-300 hover:text-indigo-500')} hover:scale-110`}
          >
            <Pin size={18} strokeWidth={3} fill={note.isPinned ? 'currentColor' : 'none'} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleStar(e); }} 
            className={`p-1.5 rounded-lg transition-all ${note.isStarred ? 'text-amber-400 bg-amber-50/10' : (isDark ? 'text-gray-600 hover:text-amber-300' : 'text-gray-300 hover:text-amber-500')} hover:scale-110`}
          >
            <Star size={18} strokeWidth={3} fill={note.isStarred ? 'currentColor' : 'none'} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(e); }} 
            className="p-1.5 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50/10 transition-all hover:scale-110"
          >
            <Trash2 size={18} strokeWidth={3} />
          </button>
        </div>
      </div>
      
      <div className={`text-[10px] font-black uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        {note.date || 'NEW NOTE'}
      </div>
      
      <p className={`text-[13px] font-medium leading-relaxed mb-6 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
        {plainContent || 'No content yet...'}
      </p>
      
      <div className="flex items-end justify-between mt-auto">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest border ${
            isDark ? 'text-gray-400 bg-gray-700 border-gray-600' : 'text-gray-400 bg-gray-50 border-gray-100'
          }`}>
            {note.language.toUpperCase()}
          </span>
        </div>
        
        <div className="flex gap-2">
          {note.images.length > 0 ? (
            <>
              {note.images.slice(0, 2).map((img, idx) => (
                <div key={idx} className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border shadow-sm ${
                  isDark ? 'bg-gray-900 border-gray-700' : 'bg-indigo-50 border-indigo-100'
                }`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
              {note.images.length === 1 && (
                 <div className={`w-16 h-16 rounded-lg border ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-indigo-50/50 border-indigo-50/50'}`}></div>
              )}
            </>
          ) : (
            <>
              <div className={`w-16 h-16 rounded-lg ${isDark ? 'bg-gray-900/50' : 'bg-indigo-50/50'}`}></div>
              <div className={`w-16 h-16 rounded-lg ${isDark ? 'bg-gray-900/50' : 'bg-indigo-50/50'}`}></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
