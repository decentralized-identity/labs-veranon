import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import { Routes, Route, Navigate } from 'react-router-dom';
import ChatRoom from './ChatRoom';
import AccountSettings from './AccountSettings';

export default function Dashboard() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Header />
      <main className="w-full pt-6">
        <Routes>
          <Route path="chat" element={<ChatRoom />} />
          <Route path="settings" element={<AccountSettings />} />
          <Route path="/" element={<Navigate to="chat" replace />} />
        </Routes>
      </main>
    </div>
  );
} 