import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

interface User {
  uid: string;
  email: string;
  displayName: string;
  lastSignInTime: string;
}

interface QuestionHistory {
  id: string;
  question: string;
  answer: string;
  timestamp: string;
  userEmail: string;
}

const AdminPanel: React.FC = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [questionHistory, setQuestionHistory] = useState<QuestionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'questions' | 'analytics' | 'settings'>('dashboard');

  useEffect(() => {
    // 実際の実装では、Firestoreからデータを取得
    // 現在はダミーデータを表示
    setLoading(false);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 管理者以外はアクセス不可
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">アクセス拒否</h1>
          <p className="text-gray-600">このページにアクセスする権限がありません。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                管理画面
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                管理者: {currentUser?.email}
              </span>
              <a
                href="/app"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                アプリに戻る
              </a>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* タブナビゲーション */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ダッシュボード
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ユーザー管理
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'questions'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              質問履歴
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              分析
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              設定
            </button>
          </nav>
        </div>

        {/* タブコンテンツ */}
        <div className="bg-white shadow rounded-lg">
          {activeTab === 'dashboard' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">ダッシュボード</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="text-2xl font-bold">1</div>
                  <div className="text-sm opacity-90">総ユーザー数</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <div className="text-2xl font-bold">1</div>
                  <div className="text-sm opacity-90">今日の質問数</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <div className="text-2xl font-bold">1</div>
                  <div className="text-sm opacity-90">総質問数</div>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-sm opacity-90">システム稼働率</div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">最近のアクティビティ</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">yamane@potentialight.com がログインしました</span>
                    <span className="text-xs text-gray-400 ml-auto">数分前</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">ユーザー管理</h2>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                  ユーザーを追加
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ユーザー
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        最終ログイン
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        権限
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                              <span className="text-white font-medium">
                                {currentUser?.displayName?.[0] || currentUser?.email?.[0] || 'U'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {currentUser?.displayName || '名前なし'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {currentUser?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        現在オンライン
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          管理者
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-purple-600 hover:text-purple-900 mr-3">編集</button>
                        <button className="text-red-600 hover:text-red-900">削除</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">質問履歴</h2>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">ユーザー:</span> {currentUser?.email}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">質問:</span> 人事評価の方法について教えてください
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">回答:</span> 人事評価は以下の要素を考慮して行います...
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">2024年1月15日 14:30</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">利用統計</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">月別利用状況</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">1月</span>
                      <span className="text-sm font-medium">1 質問</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">人気の質問カテゴリ</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">人事評価</span>
                      <span className="text-sm font-medium">1 件</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">システム設定</h2>
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">一般設定</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        アプリケーション名
                      </label>
                      <input
                        type="text"
                        value="HR Q&A アシスタント"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        管理者メールアドレス
                      </label>
                      <input
                        type="email"
                        value="yamane@potentialight.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">セキュリティ設定</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="google-auth"
                        checked
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        readOnly
                      />
                      <label htmlFor="google-auth" className="ml-2 block text-sm text-gray-900">
                        Google認証を有効にする
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
