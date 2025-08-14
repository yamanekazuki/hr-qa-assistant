import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const MainApp: React.FC = () => {
  const { currentUser, logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">HR Q&A Assistant</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                ようこそ、{currentUser?.displayName || currentUser?.email}さん
              </span>
              {isAdmin && (
                <a
                  href="/admin"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  管理画面
                </a>
              )}
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
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              人事関連の質問にお答えします
            </h2>
            <p className="text-gray-600">
              人事評価、採用、労務管理など、人事に関する質問をAIが詳しくお答えします。
            </p>
          </div>

          {/* 質問入力フォーム */}
          <div className="mb-6">
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
              質問を入力してください
            </label>
            <div className="flex space-x-4">
              <input
                type="text"
                id="question"
                placeholder="例: 人事評価の方法について教えてください"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200">
                質問する
              </button>
            </div>
          </div>

          {/* 回答表示エリア */}
          <div className="bg-gray-50 rounded-lg p-4 min-h-[200px]">
            <p className="text-gray-500 text-center">
              ログインが完了しました！ここにAIの回答が表示されます。
            </p>
          </div>

          {/* FAQ */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">よくある質問 (FAQ)</h3>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                <h4 className="font-medium text-gray-900 mb-2">
                  人事評価の方法について教えてください
                </h4>
                <p className="text-sm text-gray-600">
                  人事評価は以下の要素を考慮して行います：1) 業績評価、2) 能力評価、3) 態度評価。
                </p>
              </div>
              <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                <h4 className="font-medium text-gray-900 mb-2">
                  採用面接のポイントは？
                </h4>
                <p className="text-sm text-gray-600">
                  採用面接では以下の点を重視します：1) 志望動機の明確性、2) 会社への理解度、3) スキルと経験の適合性。
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainApp;
