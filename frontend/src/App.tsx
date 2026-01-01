import { useCallback, useRef } from 'react';
import { LargeUserList as UserList, type UserListHandle } from './components/LargeUserList';
import { AlphabetSidebar } from './components/AlphabetSidebar';
import { useUsers } from './hooks/useUsers';
import './index.css';



function App() {
  // Use the custom hook for user data management
  const { users, totalLines, loading, loadMore } = useUsers();
  const userListRef = useRef<UserListHandle>(null);

  const handleJump = useCallback((index: number) => {
    userListRef.current?.scrollToItem(index);
    // onItemsRendered in UserList will trigger the fetch if data is missing
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100 font-sans">
      <header className="p-4 bg-gray-900 border-b border-gray-800 shadow-md z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-blue-400">
            SanadTech <span className="text-white">10M User Directory</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Build v2.0 • Total Records: {totalLines.toLocaleString()}
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
