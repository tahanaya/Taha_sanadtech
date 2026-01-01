import React from 'react';
import { useAlphabet } from '../hooks/useAlphabet';

interface AlphabetSidebarProps {
    onJump: (index: number) => void;
}

export const AlphabetSidebar: React.FC<AlphabetSidebarProps> = ({ onJump }) => {
    const { alphabetMap, loading } = useAlphabet();


    if (loading) return null;

    const letters = Object.keys(alphabetMap).sort();

    return (
        <div className="w-12 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-4 overflow-y-auto h-full scrollbar-hide">
            {letters.map(letter => (
                <button
                    key={letter}
                    onClick={() => onJump(alphabetMap[letter])}
                    className="w-8 h-8 flex items-center justify-center text-xs font-bold text-gray-400 hover:text-white hover:bg-blue-600 rounded-full mb-1 transition-colors"
                    title={`Jump to ${letter}`}
                >
                    {letter}
                </button>
            ))}
        </div>
    );
};
