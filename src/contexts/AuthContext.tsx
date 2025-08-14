import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Googleログイン
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      console.log('Googleログイン開始...');
      const result = await signInWithPopup(auth, provider);
      console.log('Googleログイン成功:', result.user.email);
    } catch (error: any) {
      console.error('Googleログインエラー詳細:', error);
      
      // エラーの種類に応じて詳細なメッセージを表示
      let errorMessage = 'ログインに失敗しました。';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'ログインウィンドウが閉じられました。もう一度お試しください。';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'ポップアップがブロックされました。ブラウザの設定を確認してください。';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'このドメインからのログインが許可されていません。管理者に連絡してください。';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
      }
      
      alert(errorMessage);
    }
  };

  // ログアウト
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  // 管理者判定（あなただけが管理者）
  const isAdmin = currentUser?.email === 'yamane@potentialight.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    logout,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
