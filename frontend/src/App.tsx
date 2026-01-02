import { useAlphabet } from './hooks/useAlphabet';
import { useUsers } from './hooks/useUsers';
import AlphabetSidebar from './components/AlphabetSidebar';
import { LargeUserList } from './components/LargeUserList';
import './App.css';

function App() {
  const { alphabet } = useAlphabet();
  const { users, totalLines, loading, loadMore, jumpTo, error } = useUsers();

  return (
    <div className="flex h-screen w-full bg-white font-sans text-gray-800">
      {/* Sidebar for navigation */}
      <AlphabetSidebar 
        alphabet={alphabet} 
        onLetterClick={jumpTo} 
        currentSkip={users.length} 
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full">
        {/* Simple Header */}
        <header className="h-14 border-b border-gray-300 flex items-center justify-between px-6 bg-gray-50">
          <div>
            <h1 className="text-lg font-bold">User displaying By Taha</h1>
            <p className="text-xs text-gray-500">
              {users.length.toLocaleString()} / {totalLines.toLocaleString()} loaded
            </p>
          </div>
          
          {error && <span className="text-red-600 text-sm font-medium">{error}</span>}
        </header>

        {/* The List */}
        <LargeUserList 
          users={users} 
          onLoadMore={loadMore} 
          loading={loading} 
        />
      </main>
    </div>
  );
}

export default App;