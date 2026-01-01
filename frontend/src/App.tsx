import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { UserList, type UserListHandle } from './components/UserList';
import { AlphabetSidebar } from './components/AlphabetSidebar';
import './index.css';

const API_URL = 'http://localhost:3000';

function App() {
  // Store users as a sparse map: index -> username
  const [users, setUsers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [totalLines, setTotalLines] = useState(0); // Initialize with 0, will update on first fetch
  const userListRef = useRef<UserListHandle>(null);
  const loadingRef = useRef(false); // Ref for immediate check in callbacks

  const fetchUsers = useCallback(async (skip: number, limit: number) => {
    if (loadingRef.current) return;

    try {
      loadingRef.current = true;
      setLoading(true);

      const response = await axios.get(`${API_URL}/users`, {
        params: { skip, limit }
      });

      const newUsersList = response.data.users as string[];
      const meta = response.data.meta;

      setTotalLines(meta.totalLines);

      setUsers(prev => {
        const next = { ...prev };
        newUsersList.forEach((user, i) => {
          next[skip + i] = user;
        });
        return next;
      });

    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchUsers(0, 50);
  }, []);

  const loadMore = useCallback((start: number, end: number) => {
    // Ensure we don't fetch beyond totalLines if we know it
    if (totalLines > 0 && start >= totalLines) return;

    const limit = end - start;
    fetchUsers(start, limit);
  }, [fetchUsers, totalLines]);

  const handleJump = useCallback((index: number) => {
    userListRef.current?.scrollToItem(index);
    // onItemsRendered in UserList will trigger the fetch if data is missing
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100 font-sans">
      <header className="p-4 bg-gray-900 border-b border-gray-800 shadow-md z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-blue-400">
            SanadTech <span className="text-white">User Directory</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Build v1.0 • Total Records: {totalLines.toLocaleString()}
          </p>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <AlphabetSidebar onJump={handleJump} />
        <main className="flex-1 overflow-hidden relative">
          <UserList
            ref={userListRef}
            users={users}
            totalLines={totalLines}
            loadMore={loadMore}
            loading={loading}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
