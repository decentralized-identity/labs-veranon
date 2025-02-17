import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import { Routes, Route, Navigate } from 'react-router-dom';
import ChatRoom from './ChatRoom';
import AccountSettings from './AccountSettings';
import { useEffect, useState } from 'react';
import { BACKEND_URL } from '@/constants/urls';
import { SERVICE_PROVIDER_ID } from '@/constants/ids';

export default function Dashboard() {
  const { isAuthenticated, checkVerification, token, isVerified } = useAuth();
  const [hasCheckedVerification, setHasCheckedVerification] = useState(false);
  
  useEffect(() => {
    const verifyAccount = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/protected`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        const userId = data.user.userId;
        
        if (!isVerified && !hasCheckedVerification) {
          await checkVerification(
            SERVICE_PROVIDER_ID.toString(), 
            userId.toString()
          );
          setHasCheckedVerification(true);
        }
      } catch (error) {
        console.error('Error verifying account:', error);
      }
    };

    if (isAuthenticated && token && !hasCheckedVerification) {
      verifyAccount();
    }
  }, [isAuthenticated, token, isVerified, hasCheckedVerification]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Header />
      <main className="w-full pt-6">
        <Routes>
          <Route path="/dashboard/chat" element={<ChatRoom />} />
          <Route path="/dashboard/settings" element={<AccountSettings />} />
          <Route
            path="/dashboard"
            element={<Navigate to={isVerified ? "/dashboard/chat" : "/dashboard/settings"} replace />}
          />
        </Routes>
      </main>
    </div>
  );
} 