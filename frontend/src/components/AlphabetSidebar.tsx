import React from 'react';
import { AlphabetMap } from '../services/api';

interface AlphabetSidebarProps {
  alphabet: AlphabetMap;
  onLetterClick: (skip: number) => void;
  currentSkip: number;
}

const AlphabetSidebar: React.FC<AlphabetSidebarProps> = ({ 
  alphabet, 
  onLetterClick 
}) => {
  const letters = Object.keys(alphabet).sort();

  return (
    <aside className="w-12 bg-gray-100 border-r border-gray-300 flex flex-col items-center py-2 overflow-y-auto h-full">
      {letters.map((letter) => (
        <button
          key={letter}
          onClick={() => onLetterClick(alphabet[letter])}
          className="w-full py-1 text-xs font-bold text-gray-600 hover:text-blue-600 hover:bg-gray-200 transition-colors uppercase"
        >
          {letter}
        </button>
      ))}
    </aside>
  );
};

export default AlphabetSidebar;