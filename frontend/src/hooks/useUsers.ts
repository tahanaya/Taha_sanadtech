import { useState, useCallback } from 'react';
import { fetchUsers, UserMeta } from '../services/api';

export const useUsers = () => {
  const [users, setUsers] = useState<string[]>([]);
  
  // Initialize with default values to prevent "undefined" errors
  const [meta, setMeta] = useState<UserMeta>({ 
    totalLines: 0, 
    skip: 0, 
    limit: 50 
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load more users (append to existing list)
  const loadMore = useCallback(async () => {
    // 🛑 STOP CONDITION:
    // If loading, OR if the NEXT jump (skip + limit) is beyond the total lines.
    if (loading || (meta.totalLines > 0 && meta.skip + meta.limit >= meta.totalLines)) {
      return;
    }

    setLoading(true);
    try {
      // 🟢 CORRECT LOGIC:
      // Use the LAST position from the backend (meta.skip) + the Page Size (meta.limit)
      // This ensures that even if you have only 50 users on screen, 
      // it knows you are at line 9,000,000.
      const nextSkip = users.length > 0 ? meta.skip + meta.limit : 0;

      const result = await fetchUsers(nextSkip);
      
      setUsers(prev => [...prev, ...result.users]);
      setMeta(result.meta);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [loading, users.length, meta]); 

  // Jump to specific index (replace list completely)
  const jumpTo = useCallback(async (skip: number) => {
    setLoading(true);
    setUsers([]); // Clear current list
    try {
      const result = await fetchUsers(skip);
      setUsers(result.users);
      setMeta(result.meta);
    } catch (err) {
      setError('Failed to jump to letter');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Return exactly what App.tsx expects
  return { 
    users, 
    totalLines: meta.totalLines, 
    loading, 
    error, 
    loadMore, 
    jumpTo 
  };
};