import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import AdminPanel from './components/AdminPanel';
import MainApp from './components/MainApp';

// 認証が必要なルートのラッパー
const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { currentUser, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// メインアプリケーション
const AppContent: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();

  return (
    <Router>
      <Routes>
        {/* トップページ = ログインページ */}
        <Route 
          path="/" 
          element={
            currentUser ? <Navigate to="/app" replace /> : <LoginPage />
          } 
        />
        
        {/* 管理画面（管理者のみ） */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        
        {/* メインアプリ（ログイン済みユーザーのみ） */}
        <Route 
          path="/app" 
          element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          } 
        />
        
        {/* その他のルートはメインアプリにリダイレクト */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

// メインのAppコンポーネント
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
