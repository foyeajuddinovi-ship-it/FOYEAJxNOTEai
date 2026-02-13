
import React from 'react';
import { Note } from '../types';
import { Pin, Star, Trash2, Calendar } from 'lucide-react';

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
      className={`relative group rounded-3xl p-6 border transition-all duration-300 flex flex-col gap-4 overflow-hidden ${
        isDark 
          ? 'bg-gray-800/50 border-gray-700 hover:border-indigo-500/50' 
          : 'bg-white border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1 pr-12">
          <div className="flex items-center gap-2 text-indigo-400">
             <Calendar size={10} />
             <span className="label-caps opacity-60 text-[8px]">{note.date}</span>
          </div>
          <h3 className={`font-black uppercase text-sm tracking-tight line-clamp-1 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            {note.title || 'Draft Entry'}
          </h3>
        </div>
        
        {/* Floating Actions on Top Right */}
        <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onTogglePin} className={`p-2 rounded-xl transition-all ${note.isPinned ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
            <Pin size={14} fill={note.isPinned ? 'currentColor' : 'none'} />
          </button>
          <button onClick={onToggleStar} className={`p-2 rounded-xl transition-all ${note.isStarred ? 'bg-amber-400 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
            <Star size={14} fill={note.isStarred ? 'currentColor' : 'none'} />
          </button>
          <button onClick={onDelete} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      <p className={`text-[13px] font-medium leading-relaxed line-clamp-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {plainContent || 'Empty insight...'}
      </p>
      
      <div className="mt-auto flex items-center justify-between">
        <div className="flex -space-x-2">
          {note.images.slice(0, 3).map((img, i) => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden shadow-sm">
               <img src={img} className="w-full h-full object-cover" alt="" />
            </div>
          ))}
          {note.images.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-gray-700 flex items-center justify-center text-[10px] font-black text-indigo-500 border-2 border-white dark:border-gray-800">
              +{note.images.length - 3}
            </div>
          )}
        </div>
        <span className={`label-caps text-[8px] px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-indigo-50 text-indigo-500'}`}>
          {note.language.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
