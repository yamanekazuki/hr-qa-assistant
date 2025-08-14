
import React from 'react';

interface SuggestedFollowUpQuestionsProps {
  questions: string[];
  onQuestionSelect: (question: string) => void;
  isLoading: boolean;
}

const SuggestedFollowUpQuestions: React.FC<SuggestedFollowUpQuestionsProps> = ({ questions, onQuestionSelect, isLoading }) => {
  if (isLoading) {
    return (
      <div className="mt-8 p-6 bg-sky-50 border border-sky-200 rounded-lg shadow-md animate-pulse" role="status">
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-sky-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-sky-700 font-semibold">関連する質問の候補をAIが準備しています...</p>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 p-6 bg-sky-50 border border-sky-200 rounded-lg shadow-md">
      <h4 className="text-lg font-semibold text-sky-800 mb-3">関連する質問の候補:</h4>
      <div className="flex flex-col space-y-2">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onQuestionSelect(question)}
            className="text-left px-4 py-2 bg-white border border-sky-300 text-sky-700 rounded-md hover:bg-sky-100 hover:border-sky-400 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label={`次の質問の候補: ${question}`}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedFollowUpQuestions;
