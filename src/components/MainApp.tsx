import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import QuestionInput from '../../components/QuestionInput';
import AnswerDisplay from '../../components/AnswerDisplay';
import AnswerGranularitySelector, { Granularity } from '../../components/AnswerGranularitySelector';
import SuggestedFollowUpQuestions from '../../components/SuggestedFollowUpQuestions';
import UserInsightDisplay from '../../components/UserInsightDisplay';
import FaqItem from '../../components/FaqItem';
import { KNOWLEDGE_BASE } from '../../constants';
import { QAItem } from '../../types';

const MainApp: React.FC = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const [selectedGranularity, setSelectedGranularity] = useState<Granularity>('contextual');
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [questionSearched, setQuestionSearched] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [userInsights, setUserInsights] = useState<string[]>([]);

  const handleQuestionSubmit = async (submittedQuestion: string) => {
    setIsLoading(true);
    setQuestionSearched(submittedQuestion);
    setAnswer(null);
    setSuggestedQuestions([]);
    setUserInsights([]);

    try {
      // 実際のAI API呼び出しをここに実装
      // 現在はダミーレスポンス
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAnswer = `「${submittedQuestion}」について、以下のように回答いたします：

## 概要
この質問に対する包括的な回答を提供いたします。

## 詳細な説明
選択された詳細度（${selectedGranularity}）に基づいて、適切なレベルの情報をお届けします。

### ポイント1
重要なポイントについて説明します。

### ポイント2
実践的なアドバイスを提供します。

## まとめ
この回答がお役に立てれば幸いです。`;

      setAnswer(mockAnswer);
      
      // フォローアップ質問の生成
      setSuggestedQuestions([
        '関連する質問1について詳しく教えてください',
        '実践的なアドバイスをいただけますか？',
        '他に考慮すべき点はありますか？'
      ]);

      // ユーザーインサイトの生成
      setUserInsights([
        'この質問から、採用プロセスの改善に関心があることが分かります',
        'より効果的な採用戦略について知りたいようですね'
      ]);

    } catch (error) {
      console.error('AI回答の取得に失敗しました:', error);
      setAnswer('申し訳ございません。回答の取得に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaqSelect = (selectedQuestion: string) => {
    setQuestion(selectedQuestion);
    handleQuestionSubmit(selectedQuestion);
  };

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
              <h1 className="text-2xl font-bold text-gray-900">HR Q&A アシスタント</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                ようこそ、{currentUser?.displayName || currentUser?.email}さん
              </span>
              {isAdmin && (
                <button
                  onClick={() => window.location.href = '/admin'}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  管理画面
                </button>
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
            selectedGranularity={selectedGranularity}
            onGranularityChange={setSelectedGranularity}
            disabled={isLoading}
          />

          {/* 質問入力 */}
          <QuestionInput
            onSubmit={handleQuestionSubmit}
            isLoading={isLoading}
            initialQuestion={question}
          />

          {/* 回答表示 */}
          <AnswerDisplay
            answer={answer}
            questionSearched={questionSearched}
          />

          {/* フォローアップ質問 */}
          <SuggestedFollowUpQuestions
            questions={suggestedQuestions}
            onQuestionSelect={handleQuestionSubmit}
            isLoading={isLoading}
          />

          {/* ユーザーインサイト */}
          <UserInsightDisplay
            insightText={userInsights}
            isLoading={isLoading}
          />

          {/* FAQ */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">よくある質問 (FAQ)</h3>
            <p className="text-sm text-gray-600 mb-4">
              クリックすると、選択された回答粒度でAIに質問します。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {KNOWLEDGE_BASE.map((qaItem: QAItem) => (
                <FaqItem
                  key={qaItem.id}
                  qaItem={qaItem}
                  onQuestionSelect={handleFaqSelect}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainApp;
