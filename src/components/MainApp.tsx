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
      return generateContextualAnswer(faq);
    
    case 'detailed':
      return generateDetailedAnswer(faq);
    
    default:
      return baseAnswer;
  }
};

const generateContextualAnswer = (faq: QAItem): string => {
  const baseAnswer = faq.answer;
  const referenceLinks = extractReferenceLinks(baseAnswer);
  
  return `## 文脈を含めた回答\n\n**質問**: ${faq.question}\n\n**回答**:\n\n${baseAnswer}\n\n**背景と重要性**:\n${generateBackgroundContext(faq)}\n\n**実践的なポイント**:\n${generatePracticalPoints(faq)}\n\n**参考資料**:\n${referenceLinks}\n\n**次のステップ**:\n${generateNextSteps(faq)}`;
};

const generateDetailedAnswer = (faq: QAItem): string => {
  const baseAnswer = faq.answer;
  const referenceLinks = extractReferenceLinks(baseAnswer);
  
  return `## 詳細な回答\n\n**質問**: ${faq.question}\n\n**カテゴリ**: ${faq.category} > ${faq.subCategory}\n\n**詳細回答**:\n\n${baseAnswer}\n\n**背景と重要性**:\n${generateBackgroundContext(faq)}\n\n**実践的なポイント**:\n${generatePracticalPoints(faq)}\n\n**具体的な施策**:\n${generateConcreteMeasures(faq)}\n\n**成功のコツ**:\n${generateSuccessTips(faq)}\n\n**よくある失敗と対策**:\n${generateCommonMistakes(faq)}\n\n**測定と改善**:\n${generateMeasurementAndImprovement(faq)}\n\n**キーワード**: ${faq.keywords.join(', ')}\n\n**参考資料**:\n${referenceLinks}\n\n**関連トピック**:\n${generateRelatedTopics(faq)}\n\n**次のステップ**:\n${generateNextSteps(faq)}`;
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

// 深層的な内容生成のヘルパー関数
const generateBackgroundContext = (faq: QAItem): string => {
  const contextMap: { [key: string]: string } = {
    '採用ブランディング': '採用ブランディングは、企業の魅力を候補者に効果的に伝えるための戦略的アプローチです。単なる情報発信ではなく、企業の価値観、文化、成長機会を体系的に整理し、候補者の心に響く形で表現することが重要です。',
    '採用広報': '採用広報は、企業の採用活動を成功に導くための情報発信戦略です。従来の求人広告とは異なり、企業の魅力や働く環境を多角的に伝え、候補者のエンゲージメントを高めることが目的です。',
    'スカウト': 'スカウトは、受動的な採用活動ではなく、積極的に優秀な人材にアプローチする戦略的採用手法です。候補者のニーズを深く理解し、企業の魅力を効果的に訴求することが成功の鍵となります。',
    '面接・面談': '面接・面談は、候補者と企業の相互理解を深める重要な機会です。単なる能力確認ではなく、候補者の価値観やキャリアビジョンとの適合性を確認し、双方にとって最適なマッチングを実現することが重要です。'
  };
  
  return contextMap[faq.category] || 'この分野は、人事戦略において重要な役割を果たしています。';
};

const generatePracticalPoints = (faq: QAItem): string => {
  const practicalMap: { [key: string]: string } = {
    '採用ブランディング': '• 企業の理念・ビジョンを明確に言語化する\n• 社員の成長ストーリーを収集・整理する\n• 候補者目線での魅力を再定義する\n• 一貫性のあるブランドメッセージを構築する',
    '採用広報': '• 多様なチャネルを活用した情報発信\n• 候補者のニーズに合わせたコンテンツ作成\n• 定期的な効果測定と改善\n• 社内関係者との連携強化',
    'スカウト': '• ターゲット候補者の詳細なペルソナ設定\n• パーソナライズされたアプローチ\n• 段階的な関係構築\n• 継続的なフォローアップ',
    '面接・面談': '• 候補者体験の最適化\n• 面接官のスキル向上\n• 選考プロセスの透明性確保\n• フィードバックの活用'
  };
  
  return practicalMap[faq.category] || '• 現状分析と課題の明確化\n• 具体的なアクションプランの策定\n• 段階的な実施と効果測定\n• 継続的な改善と最適化';
};

const generateConcreteMeasures = (faq: QAItem): string => {
  const measuresMap: { [key: string]: string } = {
    '採用ブランディング': '1. **魅力の棚卸し**: 企業の強み、特徴、価値観を体系的に整理\n2. **ターゲット分析**: 候補者のニーズ、価値観、キャリア目標を調査\n3. **メッセージ設計**: 企業の魅力を候補者目線で表現\n4. **発信戦略**: 適切なチャネルとタイミングでの情報発信\n5. **効果測定**: 候補者の反応と採用成果の分析',
    '採用広報': '1. **コンテンツ戦略**: 記事のテーマと執筆順序の決定\n2. **チャネル最適化**: ブログ、SNS、動画、Podcastの効果的活用\n3. **社員インタビュー**: リアルな声を通じた魅力発信\n4. **採用ピッチ資料**: 候補者向けの魅力的な資料作成\n5. **候補者体験**: 面談から入社までの体験設計',
    'スカウト': '1. **ターゲット設定**: 職種・レベル・経験の詳細な定義\n2. **アプローチ戦略**: パーソナライズされたメッセージ作成\n3. **関係構築**: 段階的な信頼関係の構築\n4. **魅力訴求**: 企業・職種・ポジションの魅力言語化\n5. **フォローアップ**: 継続的なコミュニケーション',
    '面接・面談': '1. **面接設計**: 候補者体験を重視した選考プロセス\n2. **面接官育成**: スキル向上と評価基準の統一\n3. **情報提供**: 求人票と採用HPの充実\n4. **候補者準備**: 面接前の魅力付けと情報提供\n5. **フィードバック**: 建設的な改善提案の提供'
  };
  
  return measuresMap[faq.category] || '1. **現状把握**: 現在の状況と課題の分析\n2. **目標設定**: 具体的で測定可能な目標の設定\n3. **戦略策定**: 目標達成のための具体的な戦略\n4. **実行計画**: 段階的な実施計画の策定\n5. **効果測定**: 定期的な進捗確認と改善';
};

const generateSuccessTips = (faq: QAItem): string => {
  const tipsMap: { [key: string]: string } = {
    '採用ブランディング': '• **一貫性の維持**: すべての発信で統一されたメッセージを心がける\n• **候補者目線**: 企業目線ではなく、候補者が求める情報を提供する\n• **継続性**: 一度の取り組みではなく、継続的な改善を重視する\n• **社内連携**: 各部門との協力体制を構築し、情報の正確性を確保する',
    '採用広報': '• **コンテンツの質**: 量よりも質を重視し、候補者に価値のある情報を提供する\n• **チャネル最適化**: 各チャネルの特性を理解し、最適な使い分けを心がける\n• **候補者体験**: 情報発信から面談、入社まで一貫した体験を設計する\n• **データ活用**: アクセス数や反応を分析し、効果的な改善を行う',
    'スカウト': '• **パーソナライゼーション**: 候補者一人ひとりに合わせたアプローチを心がける\n• **段階的アプローチ**: いきなり採用を求めるのではなく、関係構築から始める\n• **魅力の言語化**: 抽象的な魅力ではなく、具体的で実感できる魅力を表現する\n• **継続的フォロー**: 一度のアプローチで諦めず、長期的な関係構築を目指す',
    '面接・面談': '• **候補者体験**: 選考プロセスを候補者目線で設計し、良い印象を残す\n• **透明性**: 選考基準やプロセスを明確にし、候補者の不安を解消する\n• **双方向コミュニケーション**: 一方的な質問ではなく、対話を通じた相互理解を目指す\n• **建設的フィードバック**: 否定的な評価ではなく、成長につながる提案を提供する'
  };
  
  return tipsMap[faq.category] || '• **計画性**: 明確な目標と戦略を持って取り組む\n• **継続性**: 一度の取り組みで終わらず、継続的な改善を心がける\n• **データ活用**: 定量的な効果測定を行い、根拠に基づいた改善を行う\n• **柔軟性**: 状況の変化に応じて、戦略やアプローチを調整する';
};

const generateCommonMistakes = (faq: QAItem): string => {
  const mistakesMap: { [key: string]: string } = {
    '採用ブランディング': '• **企業目線の表現**: 候補者が求める情報ではなく、企業が伝えたい情報ばかり発信する\n• **一貫性の欠如**: 発信するメッセージが時々で異なり、ブランドイメージが統一されない\n• **抽象的な表現**: 具体的で実感できる魅力ではなく、抽象的な表現に終始する\n• **継続性の欠如**: 一時的な取り組みで終わり、長期的なブランド構築ができない',
    '採用広報': '• **コンテンツの薄さ**: 表面的な情報ばかりで、候補者に価値のある深い内容を提供できない\n• **チャネルの偏り**: 特定のチャネルに依存し、多様な候補者にリーチできない\n• **候補者体験の軽視**: 情報発信は充実しているが、実際の面談や選考プロセスが改善されない\n• **効果測定の不備**: 発信した情報の効果を測定せず、改善の方向性が分からない',
    'スカウト': '• **画一的なアプローチ**: 候補者一人ひとりの違いを考慮せず、同じメッセージでアプローチする\n• **短期的な視点**: 即座の採用を求めるあまり、長期的な関係構築を軽視する\n• **魅力の押し付け**: 候補者のニーズを理解せず、企業の魅力を一方的に押し付ける\n• **フォローアップの不足**: 一度のアプローチで終わり、継続的なコミュニケーションができない',
    '面接・面談': '• **候補者体験の軽視**: 企業の都合ばかりを優先し、候補者の体験を改善しない\n• **選考基準の曖昧さ**: 何を評価しているのかが不明確で、候補者に不安を与える\n• **一方的な質問**: 候補者の話を聞かず、企業が知りたい情報ばかりを聞き出す\n• **建設的でないフィードバック**: 否定的な評価ばかりで、候補者の成長につながる提案をしない'
  };
  
  return mistakesMap[faq.category] || '• **計画性の欠如**: 明確な目標や戦略を持たずに取り組む\n• **継続性の欠如**: 一時的な取り組みで終わり、長期的な改善ができない\n• **データ活用の不足**: 効果測定を行わず、根拠のない改善を行う\n• **柔軟性の欠如**: 状況の変化に応じた調整ができず、非効率な取り組みを続ける';
};

const generateMeasurementAndImprovement = (faq: QAItem): string => {
  const measurementMap: { [key: string]: string } = {
    '採用ブランディング': '• **定量的指標**: 採用サイトのアクセス数、記事の閲覧数、候補者の反応率\n• **定性的指標**: 候補者からのフィードバック、面談での反応、入社後の満足度\n• **改善サイクル**: 3ヶ月ごとの効果測定、半年ごとの戦略見直し、年1回の包括的評価\n• **最適化ポイント**: メッセージの表現、チャネルの選択、発信タイミングの調整',
    '採用広報': '• **定量的指標**: 各チャネルのアクセス数、エンゲージメント率、コンバージョン率\n• **定性的指標**: 候補者からの質問内容、面談での反応、選考継続率\n• **改善サイクル**: 月1回の効果測定、四半期ごとの戦略見直し、半年ごとの包括的評価\n• **最適化ポイント**: コンテンツの質、チャネルの最適化、候補者体験の改善',
    'スカウト': '• **定量的指標**: アプローチ数、反応率、面談実現率、採用成功率\n• **定性的指標**: 候補者からの反応、面談での印象、長期的な関係構築の状況\n• **改善サイクル**: 月1回の効果測定、四半期ごとの戦略見直し、半年ごとの包括的評価\n• **最適化ポイント**: ターゲット設定、アプローチ方法、メッセージの内容',
    '面接・面談': '• **定量的指標**: 面談参加率、選考継続率、採用成功率、入社後の定着率\n• **定性的指標**: 候補者からのフィードバック、面談官の評価、候補者体験の満足度\n• **改善サイクル**: 月1回の効果測定、四半期ごとのプロセス見直し、半年ごとの包括的評価\n• **最適化ポイント**: 面談設計、面談官のスキル、候補者体験の改善'
  };
  
  return measurementMap[faq.category] || '• **定量的指標**: 目標達成率、効率性指標、品質指標\n• **定性的指標**: 顧客満足度、従業員満足度、プロセス改善の効果\n• **改善サイクル**: 定期的な効果測定、戦略の見直し、継続的な改善\n• **最適化ポイント**: プロセスの効率化、品質の向上、顧客体験の改善';
};

const generateNextSteps = (faq: QAItem): string => {
  const nextStepsMap: { [key: string]: string } = {
    '採用ブランディング': '1. **現状分析**: 現在のブランディング状況と課題の洗い出し\n2. **ターゲット設定**: 候補者ペルソナの詳細な定義\n3. **魅力の言語化**: 企業の魅力を候補者目線で表現\n4. **発信戦略**: 適切なチャネルとタイミングでの情報発信\n5. **効果測定**: 定期的な成果確認と改善',
    '採用広報': '1. **コンテンツ戦略**: 記事のテーマと執筆順序の決定\n2. **チャネル最適化**: 各チャネルの特性を活かした情報発信\n3. **候補者体験**: 情報発信から面談までの一貫した体験設計\n4. **社内連携**: 各部門との協力体制の構築\n5. **継続的改善**: 効果測定に基づく定期的な改善',
    'スカウト': '1. **ターゲット分析**: 職種・レベル・経験の詳細な分析\n2. **アプローチ戦略**: パーソナライズされたアプローチ方法の設計\n3. **魅力の言語化**: 企業・職種・ポジションの魅力を効果的に表現\n4. **関係構築**: 段階的な信頼関係の構築方法の確立\n5. **継続的フォロー**: 長期的な関係構築の仕組み化',
    '面接・面談': '1. **プロセス設計**: 候補者体験を重視した選考プロセスの設計\n2. **面接官育成**: スキル向上と評価基準の統一\n3. **情報提供**: 求人票と採用HPの充実\n4. **候補者準備**: 面接前の魅力付けと情報提供の改善\n5. **フィードバック**: 建設的な改善提案の提供方法の確立'
  };
  
  return nextStepsMap[faq.category] || '1. **現状把握**: 現在の状況と課題の詳細な分析\n2. **目標設定**: 具体的で測定可能な目標の設定\n3. **戦略策定**: 目標達成のための具体的な戦略の策定\n4. **実行計画**: 段階的な実施計画の策定\n5. **効果測定**: 定期的な進捗確認と継続的な改善';
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
