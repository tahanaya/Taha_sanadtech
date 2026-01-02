import React, { useEffect, useRef } from 'react';
import { User } from 'lucide-react';

interface Props {
  users: string[];
  onLoadMore: () => void;
  loading: boolean;
}

export const LargeUserList: React.FC<Props> = ({ users, onLoadMore, loading }) => {
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [onLoadMore, loading]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {users.map((user, i) => (
          <div 
            key={`${user}-${i}`} 
            className="flex items-center p-3 border border-gray-200 rounded hover:border-blue-400 transition-colors bg-white"
          >
            <User className="text-blue-500 w-4 h-4 mr-3" />
            <span className="text-sm text-gray-700 truncate">{user}</span>
          </div>
        ))}
      </div>
      
      {/* Simple Loading Indicator */}
      <div ref={loaderRef} className="h-16 flex items-center justify-center">
        {loading && <span className="text-gray-400 text-sm">Loading...</span>}
      </div>
    </div>
  );
};