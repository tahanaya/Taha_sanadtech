import { useState, useCallback } from 'react';
import { fetchUsers, UserMeta } from '../services/api';

export const useUsers = () => {
  const [users, setUsers] = useState<string[]>([]);
  
  // default meta values
  const [meta, setMeta] = useState<UserMeta>({ 
    totalLines: 0, 
    skip: 0, 
    limit: 50 
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Append next page unless already loading or at the end
  const loadMore = useCallback(async () => {
    if (loading || (meta.totalLines > 0 && meta.skip + meta.limit >= meta.totalLines)) return;

    setLoading(true);
    try {
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

  // Replace the current list and fetch from `skip`
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