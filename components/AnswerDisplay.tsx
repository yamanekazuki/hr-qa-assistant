

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
    <article className="mt-8 bg-white p-6 rounded-lg shadow-lg border border-slate-200 text-slate-900"> {/* Default dark text color */}
      <h3 className="text-xl font-semibold text-slate-800 mb-1">AIによる回答:</h3>
      <p className="text-sm text-slate-500 mb-4 italic">元の質問: 「{questionSearched}」</p>
      {/* 
        Tailwind's `prose` classes provide good defaults for markdown.
        Ensure text color is explicitly dark for key elements within prose if needed,
        or rely on the parent `text-slate-900` for base text.
      */}
      <div className="prose prose-slate max-w-none 
                      prose-h1:text-2xl prose-h1:font-bold prose-h1:text-slate-900
                      prose-h2:text-xl prose-h2:font-semibold prose-h2:text-slate-900 prose-h2:mb-3 prose-h2:mt-5 
                      prose-h3:text-lg prose-h3:font-semibold prose-h3:text-slate-800 prose-h3:mb-2 prose-h3:mt-4 
                      prose-p:text-gray-800 prose-p:leading-relaxed 
                      prose-ul:text-gray-800 prose-ul:list-disc prose-ul:pl-5 
                      prose-ol:text-gray-800 prose-ol:list-decimal prose-ol:pl-5 
                      prose-strong:text-slate-900 
                      prose-a:text-blue-600 hover:prose-a:text-blue-700
                      prose-blockquote:border-l-blue-500 prose-blockquote:text-slate-700
                      prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:p-1 prose-code:rounded-sm">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
      </div>
    </article>
  );
};

export default AnswerDisplay;