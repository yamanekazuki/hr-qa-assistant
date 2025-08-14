

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // Plugin for GitHub Flavored Markdown (tables, strikethrough, etc.)

interface AnswerDisplayProps {
  answer: string | null; // The AI's response, or null if loading.
  questionSearched: string | null; // The question that was asked.
}

const AnswerDisplay: React.FC<AnswerDisplayProps> = ({ answer, questionSearched }) => {
  // Don't render anything if no question has been searched yet.
  if (!questionSearched) {
    return null; 
  }

  // Display loading state if the answer is null (set by App.tsx during API call).
  if (answer === null) {
    return (
      <div className="mt-8 bg-sky-50 border border-sky-200 text-sky-700 p-6 rounded-lg shadow-sm animate-pulse" role="status" aria-live="polite">
        <p className="font-semibold">AIが回答を準備しています...</p>
        <p>「{questionSearched}」について考えています。少々お待ちください。</p>
      </div>
    );
  }
  
  // The logic in App.tsx standardizes empty or not-found responses into this specific message.
  const notFoundMessage = "提供された情報の中には、該当する回答が見つかりませんでした。";
  if (answer === notFoundMessage) {
     return (
      <div className="mt-8 bg-yellow-50 border border-yellow-200 text-yellow-700 p-6 rounded-lg shadow-sm" role="alert">
        <p className="font-semibold">回答に関する情報</p>
        <p>「{questionSearched}」について: {answer}</p>
      </div>
    );
  }

  // Display the AI's answer using ReactMarkdown for rich text rendering.
  return (
    <article className="mt-8 bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20 text-slate-900 overflow-hidden">
      {/* ヘッダーセクション */}
      <div className="mb-8 pb-6 border-b border-slate-200/60">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              AIによる回答
            </h2>
            <p className="text-sm text-slate-500 font-medium">AI-Powered Response</p>
          </div>
        </div>
        
        {/* 質問セクション */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">質問</h3>
              <p className="text-blue-900 leading-relaxed">「{questionSearched}」</p>
            </div>
          </div>
        </div>
      </div>

      {/* 回答セクション */}
      <div className="space-y-8">
        {/* 回答の詳細度表示 */}
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-full px-4 py-2 mb-6">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-emerald-700">詳細回答</span>
        </div>

        {/* マークダウンコンテンツ - 薄い緑背景 */}
        <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/60 border border-emerald-200/40 rounded-xl p-6">
          <div className="prose prose-slate max-w-none 
                        prose-h1:text-3xl prose-h1:font-bold prose-h1:text-slate-900 prose-h1:mb-6 prose-h1:mt-8 prose-h1:border-b prose-h1:border-slate-200 prose-h1:pb-2
                        prose-h2:text-2xl prose-h2:font-bold prose-h2:text-slate-800 prose-h2:mb-4 prose-h2:mt-8 prose-h2:bg-gradient-to-r prose-h2:from-slate-50 prose-h2:to-blue-50 prose-h2:px-4 prose-h2:py-2 prose-h2:rounded-lg prose-h2:border-l-4 prose-h2:border-blue-500
                        prose-h3:text-xl prose-h3:font-semibold prose-h3:text-slate-700 prose-h3:mb-3 prose-h3:mt-6 prose-h3:bg-slate-50 prose-h3:px-3 prose-h3:py-2 prose-h3:rounded-md prose-h3:border-l-2 prose-h3:border-slate-400
                        prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4
                        prose-ul:text-slate-700 prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
                        prose-ol:text-slate-700 prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
                        prose-strong:text-slate-900 prose-strong:font-bold
                        prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-a:font-medium
                        prose-blockquote:border-l-4 prose-blockquote:border-blue-400 prose-blockquote:text-slate-700 prose-blockquote:bg-blue-50 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:rounded-r-lg prose-blockquote:my-4
                        prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:font-mono prose-code:text-sm
                        prose-li:mb-2
                        prose-ul:space-y-2 prose-ol:space-y-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
          </div>
        </div>
      </div>
    </article>
  );
};

export default AnswerDisplay;