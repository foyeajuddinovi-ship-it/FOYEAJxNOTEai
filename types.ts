
export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  images: string[];
  isPinned: boolean;
  isStarred: boolean;
  language: string;
  formatting: FormattingState;
}

export interface FormattingState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize: number;
  alignment: 'left' | 'center' | 'right';
}

export interface Language {
  code: string;
  name: string;
  native: string;
  icon: string;
}

export type View = 'home' | 'starred' | 'editor' | 'ai' | 'settings';
