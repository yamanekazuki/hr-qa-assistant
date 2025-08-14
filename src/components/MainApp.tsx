import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import QuestionInput from './QuestionInput';
import AnswerDisplay from './AnswerDisplay';
import AnswerGranularitySelector from './AnswerGranularitySelector';
import SuggestedFollowUpQuestions from './SuggestedFollowUpQuestions';
import UserInsightDisplay from './UserInsightDisplay';
import FaqItem from './FaqItem';

const MainApp: React.FC = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const [answerGranularity, setAnswerGranularity] = useState<'detailed' | 'concise'>('detailed');

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

          {/* 回答の詳細度選択 */}
          <AnswerGranularitySelector
            granularity={answerGranularity}
            onGranularityChange={setAnswerGranularity}
          />

          {/* 質問入力 */}
          <QuestionInput />

          {/* 回答表示 */}
          <AnswerDisplay />

          {/* フォローアップ質問 */}
          <SuggestedFollowUpQuestions />

          {/* ユーザーインサイト */}
          <UserInsightDisplay />

          {/* FAQ */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">よくある質問</h3>
            <div className="space-y-4">
              <FaqItem
                question="人事評価の方法について教えてください"
                answer="人事評価は以下の要素を考慮して行います：1) 業績評価、2) 能力評価、3) 態度評価。各要素を数値化し、総合的な評価を行います。"
              />
              <FaqItem
                question="採用面接のポイントは？"
                answer="採用面接では以下の点を重視します：1) 志望動機の明確性、2) 会社への理解度、3) スキルと経験の適合性、4) コミュニケーション能力。"
              />
              <FaqItem
                question="労働時間の管理方法は？"
                answer="労働時間管理は以下の方法で行います：1) タイムカードによる記録、2) 勤怠管理システムの活用、3) 残業時間の適切な管理、4) 健康管理との連携。"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainApp;
