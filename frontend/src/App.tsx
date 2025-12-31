import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { UserList } from './components/UserList';
import './index.css';

const API_URL = 'http://localhost:3000';

function App() {
  const [users, setUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalLines, setTotalLines] = useState(0);

  const fetchUsers = useCallback(async (skip: number, limit: number) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/users`, {
        params: { skip, limit }
      });

      const newUsers = response.data.users;
      const meta = response.data.meta;

      setUsers(prev => {
        // Prevent duplicates if strict mode causes double fetch, though using skip logic is safer.
        // Simple append for now.
        // Ideally we should merge based on index if we had it, but simple append works for infinite scroll down.
        // Actually, to be safe, let's just append.
        return [...prev, ...newUsers];
      });

      setTotalLines(meta.totalLines);
      if (skip + newUsers.length >= meta.totalLines) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchUsers(0, 50);
  }, []);

  const loadMore = useCallback((start: number, end: number) => {
    const limit = end - start;
    fetchUsers(start, limit);
  }, [fetchUsers]);

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100 font-sans">
      <header className="p-4 bg-gray-900 border-b border-gray-800 shadow-md z-10">
        <h1 className="text-xl font-bold tracking-tight text-blue-400">
          SanadTech <span className="text-white">User Directory</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Build v0.1 • Loaded {users.length.toLocaleString()} / {totalLines.toLocaleString()} records
        </p>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <UserList
          users={users}
          hasMore={hasMore}
          loadMore={loadMore}
          loading={loading}
        />
      </main>
    </div>
  );
}

export default App;
