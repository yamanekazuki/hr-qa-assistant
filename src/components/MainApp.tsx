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

// AI回答生成のヘルパー関数
const findMostRelevantFAQ = (question: string): QAItem | null => {
  const questionLower = question.toLowerCase();
  let bestMatch: QAItem | null = null;
  let bestScore = 0;

  KNOWLEDGE_BASE.forEach(faq => {
    let score = 0;
    
    // キーワードマッチング
    faq.keywords.forEach(keyword => {
      if (questionLower.includes(keyword.toLowerCase())) {
        score += 3;
      }
    });
    
    // 質問内容のマッチング
    if (questionLower.includes(faq.question.toLowerCase())) {
      score += 5;
    }
    
    // カテゴリマッチング
    if (questionLower.includes(faq.category.toLowerCase())) {
      score += 2;
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  });

  return bestScore > 2 ? bestMatch : null;
};

const generateAnswerByGranularity = (faq: QAItem, granularity: Granularity): string => {
  const baseAnswer = faq.answer;
  
  switch (granularity) {
    case 'concise':
      return `## 簡潔な回答\n\n${faq.question}\n\n**要点**: ${baseAnswer.split('\n')[0]}\n\n**キーポイント**:\n${faq.keywords.slice(0, 3).map(k => `- ${k}`).join('\n')}`;
    
    case 'contextual':
      return `## 文脈を含めた回答\n\n**質問**: ${faq.question}\n\n**回答**:\n\n${baseAnswer}\n\n**参考資料**:\n${extractReferenceLinks(baseAnswer)}`;
    
    case 'detailed':
      return `## 詳細な回答\n\n**質問**: ${faq.question}\n\n**カテゴリ**: ${faq.category} > ${faq.subCategory}\n\n**詳細回答**:\n\n${baseAnswer}\n\n**キーワード**: ${faq.keywords.join(', ')}\n\n**参考資料**:\n${extractReferenceLinks(baseAnswer)}\n\n**関連トピック**:\n${generateRelatedTopics(faq)}`;
    
    default:
      return baseAnswer;
  }
};

const extractReferenceLinks = (text: string): string => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links: string[] = [];
  let match;
  
  while ((match = linkRegex.exec(text)) !== null) {
    links.push(`- [${match[1]}](${match[2]})`);
  }
  
  return links.length > 0 ? links.join('\n') : '参考資料はありません';
};

const generateRelatedTopics = (faq: QAItem): string => {
  const relatedFAQs = KNOWLEDGE_BASE.filter(item => 
    item.category === faq.category && item.id !== faq.id
  ).slice(0, 3);
  
  return relatedFAQs.map(item => `- ${item.question}`).join('\n');
};

const generateFollowUpQuestions = (faq: QAItem, originalQuestion: string): string[] => {
  const relatedFAQs = KNOWLEDGE_BASE.filter(item => 
    item.category === faq.category && item.id !== faq.id
  ).slice(0, 3);
  
  return relatedFAQs.map(item => item.question);
};

const generateUserInsights = (faq: QAItem, question: string): string[] => {
  const insights = [
    `この質問から、${faq.category}分野に強い関心があることが分かります`,
    `${faq.subCategory}について、より深く知りたいようですね`,
    '実践的なアドバイスを求められているようですね'
  ];
  
  return insights;
};

const generateFallbackAnswer = (question: string, granularity: Granularity): string => {
  const baseAnswer = `「${question}」について、以下のように回答いたします：

## 概要
人事関連の質問について、包括的な情報を提供いたします。

## 詳細な説明
選択された詳細度（${granularity}）に基づいて、適切なレベルの情報をお届けします。

### 参考情報
当システムには以下の分野の豊富な知識ベースがあります：
- 採用ブランディング
- 採用広報
- スカウト
- 面接・面談
- エンジニア採用
- デザイナー採用

### より具体的な質問
より詳細な回答を得るために、以下のような具体的な質問をしていただけますでしょうか？
- 「採用広報の具体的な方法は？」
- 「スカウトメールの効果的な書き方は？」
- 「採用ブランディングの進め方は？」

## まとめ
人事関連の質問について、お気軽にお聞かせください。`;

  return baseAnswer;
};

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
      // 実際のAI回答生成ロジック
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 質問に最も関連するFAQを検索
      const relevantFAQ = findMostRelevantFAQ(submittedQuestion);
      
      if (relevantFAQ) {
        // 詳細度に応じた回答を生成
        const answer = generateAnswerByGranularity(relevantFAQ, selectedGranularity);
        setAnswer(answer);
        
        // 関連するフォローアップ質問を生成
        const followUpQuestions = generateFollowUpQuestions(relevantFAQ, submittedQuestion);
        setSuggestedQuestions(followUpQuestions);
        
        // ユーザーインサイトを生成
        const insights = generateUserInsights(relevantFAQ, submittedQuestion);
        setUserInsights(insights);
      } else {
        // 関連するFAQが見つからない場合の回答
        const fallbackAnswer = generateFallbackAnswer(submittedQuestion, selectedGranularity);
        setAnswer(fallbackAnswer);
        
        setSuggestedQuestions([
          '採用広報について詳しく教えてください',
          'スカウトメールの効果的な方法は？',
          '採用ブランディングの進め方は？'
        ]);
        
        setUserInsights([
          '人事関連の質問に積極的に関心を持たれているようですね',
          'より具体的なアドバイスが必要でしょうか？'
        ]);
      }

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
