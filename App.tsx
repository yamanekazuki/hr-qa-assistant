

import React, { useReducer, useCallback, useMemo } from 'react';
import { GoogleGenAI, Type, type GenerateContentResponse } from "@google/genai";
import QuestionInput from './components/QuestionInput';
import AnswerDisplay from './components/AnswerDisplay';
import FaqItem from './components/FaqItem';
import AnswerGranularitySelector, { type Granularity } from './components/AnswerGranularitySelector';
import SuggestedFollowUpQuestions from './components/SuggestedFollowUpQuestions';
import UserInsightDisplay from './components/UserInsightDisplay';
import { KNOWLEDGE_BASE } from './constants';

// --- CONSTANTS ---

const AI_MODEL = 'gemini-2.5-flash';
const NOT_FOUND_MESSAGE = "提供された情報の中には、該当する回答が見つかりませんでした。";
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });


// --- STATE MANAGEMENT ---

type AppState = {
  currentQuery: string;
  questionActuallySearched: string | null;
  displayedAnswer: string | null;
  userInsightText: string[] | null;
  suggestedFollowUpQuestions: string[];
  isLoading: boolean;
  isLoadingInsight: boolean;
  isLoadingSuggestedQuestions: boolean;
  selectedGranularity: Granularity;
};

type AppAction =
  | { type: 'START_SEARCH'; payload: { query: string } }
  | { type: 'SET_GRANULARITY'; payload: Granularity }
  | { type: 'SET_CURRENT_QUERY'; payload: string }
  | { type: 'SEARCH_SUCCESS'; payload: string }
  | { type: 'SEARCH_ERROR'; payload: string }
  | { type: 'INSIGHT_FETCH_START' }
  | { type: 'INSIGHT_FETCH_SUCCESS'; payload: string[] | null }
  | { type: 'SUGGESTIONS_FETCH_START' }
  | { type: 'SUGGESTIONS_FETCH_SUCCESS'; payload: string[] };

const initialState: AppState = {
  currentQuery: '',
  questionActuallySearched: null,
  displayedAnswer: null,
  userInsightText: null,
  suggestedFollowUpQuestions: [],
  isLoading: false,
  isLoadingInsight: false,
  isLoadingSuggestedQuestions: false,
  selectedGranularity: 'contextual',
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'START_SEARCH':
      return {
        ...state,
        isLoading: true,
        currentQuery: action.payload.query,
        questionActuallySearched: action.payload.query,
        displayedAnswer: null,
        userInsightText: null,
        suggestedFollowUpQuestions: [],
      };
    case 'SET_GRANULARITY':
      return { ...state, selectedGranularity: action.payload };
    case 'SET_CURRENT_QUERY':
      return { ...state, currentQuery: action.payload };
    case 'SEARCH_SUCCESS':
      return { ...state, isLoading: false, displayedAnswer: action.payload };
    case 'SEARCH_ERROR':
      return { ...state, isLoading: false, displayedAnswer: action.payload, isLoadingInsight: false, isLoadingSuggestedQuestions: false };
    case 'INSIGHT_FETCH_START':
      return { ...state, isLoadingInsight: true };
    case 'INSIGHT_FETCH_SUCCESS':
      return { ...state, isLoadingInsight: false, userInsightText: action.payload };
    case 'SUGGESTIONS_FETCH_START':
      return { ...state, isLoadingSuggestedQuestions: true };
    case 'SUGGESTIONS_FETCH_SUCCESS':
      return { ...state, isLoadingSuggestedQuestions: false, suggestedFollowUpQuestions: action.payload };
    default:
      return state;
  }
};


// --- PROMPT & TEXT HELPERS ---

const SYSTEM_INSTRUCTION_BASE = `あなたは、HR（人事）および採用に関する質問に答える専門のアシスタントです。
あなたの回答は、提供された以下のナレッジベースの情報に厳密に基づいていなければなりません。
ナレッジベース内の情報のみを使用し、外部の知識や一般的な情報は参照しないでください。
ユーザーの質問の意図を深く理解し、ナレッジベース内の関連情報を複数箇所からでも探し出し、それらを適切に組み合わせて、包括的で質の高い回答を生成してください。
もしナレッジベースに該当する情報が見つからない場合、または提供された情報だけでは要求された詳細レベルでの回答が不可能な場合は、他のいかなるマークダウン、書式、追加テキストも一切含めず、次の文字列「${NOT_FOUND_MESSAGE}」だけを返答してください。この文字列以外は何も出力してはいけません。`;

const MARKDOWN_FORMATTING_RULES = `それ以外の場合（情報が見つかり、回答可能な場合）は、{GRANULARITY_INSTRUCTION}
そして、回答はマークダウン形式を最大限に活用し、**ユーザーにとって非常に読みやすい、構造化された形式で提供してください。単なる文字の羅列は厳禁です。**

# 出力形式ルール
- 全体はマークダウン形式で記述すること。
- 主要なセクションのタイトルは、マークダウンのH2見出しを使用してください。(\`## 概要\`)
- サブセクションのタイトルは、マークダウンのH3見出しを使用してください。(\`### 詳細\`)
- 箇条書きは、ハイフン（\`-\`）と半角スペースで始めてください。
- 強調したいキーワードは太字（\`**重要な言葉**\`）で表現してください。
- 引用文は \`> \` で始めてください。
- 水平線は \`---\` で表現してください。

この指示に厳密に従い、提供されたナレッジベースの情報に基づいて、ユーザーが情報を容易に消化できるような、明確で整理された回答を作成してください。`;

function getSystemInstruction(granularity: Granularity, knowledgeContext: string): string {
    let granularityInstruction = '';
    switch (granularity) {
      case 'concise':
        granularityInstruction = '回答は簡潔に、主要なポイントのみを2～4文程度で述べてください。';
        break;
      case 'contextual':
        granularityInstruction = '回答は背景や文脈を十分に含め、現在の一般的な回答量の約3倍を目安に、5～7段落程度の豊富な情報量を提供してください。複数の視点や関連情報も適度に盛り込み、読者が深く理解できるよう努めてください。';
        break;
      case 'detailed':
        granularityInstruction = '回答は関連情報を徹底的に網羅し、複数の詳細なセクションや具体的な箇条書き、例を多用してください。「文脈を含めて」で提供される情報量のさらに2倍以上を目安とし、極めて包括的かつ詳細な情報を提供してください。専門的な分析や深い洞察、微妙なニュアンスも含むことが期待されます。長文になることを厭わず、質問に対して最大限の情報を提供してください。';
        break;
    }

    const formattingRules = MARKDOWN_FORMATTING_RULES.replace('{GRANULARITY_INSTRUCTION}', granularityInstruction);

    return `${SYSTEM_INSTRUCTION_BASE}\n\n${formattingRules}\n\n提供されたナレッジベース：\n${knowledgeContext}`;
}

function getInsightPrompt(query: string, answer: string): string {
  return `ユーザーの元の質問:\n${query}\n\n提供された主要な回答の冒頭(最大1000文字):\n${answer.substring(0, 1000)}...\n\n上記の質問と回答を踏まえ、ユーザーが次にどのような具体的な点に関心を持つか、何をさらに知りたがっているかを、以下の観点を含めて**3つ程度**推測し、それぞれ短い示唆として記述してください。
1. **時系列的な次の関心事**: この回答内容を理解した後、論理的に次にユーザーが考えそうなこと。
2. **関連する別の視点やトピック**: 回答された内容と並列的に検討できる、別の質問やテーマ。
3. **その他、AIが提案する有益な示唆**: 上記以外で、ユーザーがこの回答から発展させて考えうる、役立つであろう視点や問い。`;
}

function getSuggestionsPrompt(query: string, answer: string, knowledgeContext: string): string {
  return `ユーザーの元の質問:\n${query}\n\n提供された主要な回答:\n${answer.substring(0,1500)}...\n\n上記に基づいて、ユーザーが次に尋ねる可能性のある、HRおよび採用関連の派生的な質問を3～4個提案してください。これらの質問は、回答内容を深掘りしたり、関連する別のトピックに繋がるようなものであるべきです。提供されたナレッジベースも考慮に入れて、ナレッジベース内の情報で回答可能な質問を優先してください。\n\nナレッジベースのコンテキストの抜粋:\n${knowledgeContext.substring(0,2000)}...`;
}

function isEffectivelyEmpty(text: string | null | undefined): boolean {
  if (!text) return true;
  let stripped = text.replace(/<[^>]*>/g, '');
  stripped = stripped.replace(/[`*#_\-\[\]()!~<>|=+.\s\n\r\t]/g, '');
  return stripped.length === 0;
}

function removeUnwantedReferences(text: string): string {
  if (!text) return "";
  let processedText = text;
  processedText = processedText.replace(/\[参考資料\s*\d*\]\s*\([^)]+\)/gi, '');
  processedText = processedText.replace(/参考資料\s*\d*\s*:?/gi, '');
  processedText = processedText.replace(/[（(]\s*参考資料\s*\d*\s*[）)]/gi, '');
  processedText = processedText.replace(/\(\s*\)|\[\s*\]|（\s*）/g, '');
  processedText = processedText.replace(/\n\s*\n\s*\n/g, '\n\n');
  return processedText.trim();
}

function parseJsonFromResponse<T>(responseText: string): T | null {
    try {
        let jsonStr = responseText.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }
        return JSON.parse(jsonStr) as T;
    } catch (e) {
        console.warn("Failed to parse JSON from response:", e, responseText);
        return null;
    }
}


// --- MAIN COMPONENT ---

const App: React.FC = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const {
    currentQuery, questionActuallySearched, displayedAnswer, userInsightText,
    suggestedFollowUpQuestions, isLoading, isLoadingInsight,
    isLoadingSuggestedQuestions, selectedGranularity
  } = state;

  const knowledgeContext = useMemo(() => {
    return KNOWLEDGE_BASE.map(
      (item) => `Q: ${item.question}\nA: ${item.answer}`
    ).join('\n\n---\n\n');
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    dispatch({ type: 'START_SEARCH', payload: { query } });

    try {
      const systemInstruction = getSystemInstruction(selectedGranularity, knowledgeContext);
      const mainResponse = await ai.models.generateContent({
        model: AI_MODEL,
        contents: query,
        config: { systemInstruction },
      });

      const processedText = removeUnwantedReferences(mainResponse.text);

      if (processedText === NOT_FOUND_MESSAGE || isEffectivelyEmpty(processedText)) {
        dispatch({ type: 'SEARCH_SUCCESS', payload: NOT_FOUND_MESSAGE });
        return;
      }
      
      dispatch({ type: 'SEARCH_SUCCESS', payload: processedText });

      // --- Concurrently fetch insights and suggestions ---
      dispatch({ type: 'INSIGHT_FETCH_START' });
      dispatch({ type: 'SUGGESTIONS_FETCH_START' });

      const fetchInsights = async () => {
        try {
          const insightResponse = await ai.models.generateContent({
            model: AI_MODEL,
            contents: getInsightPrompt(query, processedText),
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                  description: "ユーザーが次に関心を持つ可能性のある、推測された具体的な視点や問い"
                }
              }
            },
          });
          const parsedInsights = parseJsonFromResponse<string[]>(insightResponse.text);
          if (Array.isArray(parsedInsights) && parsedInsights.every(i => typeof i === 'string')) {
            dispatch({ type: 'INSIGHT_FETCH_SUCCESS', payload: parsedInsights });
          } else {
            dispatch({ type: 'INSIGHT_FETCH_SUCCESS', payload: null });
          }
        } catch (error) {
          console.warn('Error fetching user insight:', error);
          dispatch({ type: 'INSIGHT_FETCH_SUCCESS', payload: null });
        }
      };
      
      const fetchSuggestions = async () => {
         try {
          const followupResponse = await ai.models.generateContent({
            model: AI_MODEL,
            contents: getSuggestionsPrompt(query, processedText, knowledgeContext),
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                  description: "回答内容を深掘りする、または関連する別のトピックに繋がるような、ユーザーが次に尋ねる可能性のある質問"
                }
              }
            },
          });
          const parsedQuestions = parseJsonFromResponse<string[]>(followupResponse.text);
          if (Array.isArray(parsedQuestions) && parsedQuestions.every(q => typeof q === 'string')) {
            dispatch({ type: 'SUGGESTIONS_FETCH_SUCCESS', payload: parsedQuestions.slice(0, 4) });
          } else {
            dispatch({ type: 'SUGGESTIONS_FETCH_SUCCESS', payload: [] });
          }
        } catch (error) {
          console.warn('Error fetching suggested questions:', error);
          dispatch({ type: 'SUGGESTIONS_FETCH_SUCCESS', payload: [] });
        }
      };

      // Fire and forget
      fetchInsights();
      fetchSuggestions();

    } catch (error) {
      console.error('Error calling Gemini API:', error);
      let userFriendlyErrorMessage = "申し訳ありませんが、回答を生成中にエラーが発生しました。";
      if (error instanceof Error && error.message?.toLowerCase().includes('api key not valid')) {
          userFriendlyErrorMessage = "APIキーの設定に問題があるようです。アプリケーションの管理者にお問い合わせください。";
      }
      dispatch({ type: 'SEARCH_ERROR', payload: userFriendlyErrorMessage });
    }
  }, [knowledgeContext, selectedGranularity]);

  const handleSubmitQuestion = useCallback((query: string) => {
    handleSearch(query);
  }, [handleSearch]);

  const handleFaqSelect = useCallback((question: string) => {
    handleSearch(question);
  }, [handleSearch]);
  
  const handleSuggestedQuestionSelect = useCallback((question: string) => {
    handleSearch(question);
  }, [handleSearch]);
  
  const handleGranularityChange = useCallback((granularity: Granularity) => {
    dispatch({ type: 'SET_GRANULARITY', payload: granularity });
  }, []);
  
  const handleQueryChange = useCallback((query: string) => {
    dispatch({ type: 'SET_CURRENT_QUERY', payload: query });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-slate-100 py-6 sm:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <header className="text-center mb-10 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800">HR Q&A アシスタント</h1>
          <p className="text-slate-600 mt-3 text-lg">採用や人事に関する質問にお答えします。AIが提供された情報を基に回答します。</p>
        </header>

        <section className="mb-10 sm:mb-12 p-6 bg-white rounded-xl shadow-2xl border border-slate-200">
          <h2 className="text-2xl font-semibold text-slate-700 mb-5 text-center sm:text-left">質問を入力してください</h2>
          <QuestionInput 
            onSubmit={handleSubmitQuestion} 
            isLoading={isLoading} 
            initialQuestion={currentQuery} 
          />
          <AnswerGranularitySelector
            selectedGranularity={selectedGranularity}
            onGranularityChange={handleGranularityChange}
            disabled={isLoading}
          />
        </section>
        
        {questionActuallySearched && (
          <>
            <AnswerDisplay 
              answer={displayedAnswer} 
              questionSearched={questionActuallySearched} 
            />
            <UserInsightDisplay 
              insightText={userInsightText}
              isLoading={isLoadingInsight}
            />
            <SuggestedFollowUpQuestions
              questions={suggestedFollowUpQuestions}
              onQuestionSelect={handleSuggestedQuestionSelect}
              isLoading={isLoadingSuggestedQuestions}
            />
          </>
        )}

        <section className="mt-12 sm:mt-16">
          <h2 className="text-3xl font-semibold text-slate-700 mb-6 text-center">よくある質問 (FAQ)</h2>
          <p className="text-center text-slate-500 mb-6">クリックすると、選択された回答粒度でAIに質問します。</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {KNOWLEDGE_BASE.slice(0, 6).map(qaItem => ( 
              <FaqItem key={qaItem.id} qaItem={qaItem} onQuestionSelect={handleFaqSelect} />
            ))}
          </div>
        </section>

        <footer className="text-center mt-16 py-8 text-slate-500 border-t border-slate-200">
          <p>&copy; {new Date().getFullYear()} HR Q&A Assistant. Powered by Gemini.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
