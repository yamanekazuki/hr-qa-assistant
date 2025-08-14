import React, { useState, useEffect } from 'react';

interface QuestionInputProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
  initialQuestion?: string; // Optional initial question to populate the input
}

const QuestionInput: React.FC<QuestionInputProps> = ({ onSubmit, isLoading, initialQuestion = '' }) => {
  const [question, setQuestion] = useState<string>(initialQuestion);

  // Effect to update the internal question state if the initialQuestion prop changes.
  // This allows the parent component to set the input field's value (e.g., when an FAQ is clicked).
  useEffect(() => {
    setQuestion(initialQuestion);
  }, [initialQuestion]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      onSubmit(question.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-stretch">
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="例: WebデザイナーとUI/UXデザイナーの違いは？"
        className="flex-grow p-4 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
        disabled={isLoading}
        aria-label="質問入力フィールド"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-150 ease-in-out shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            処理中...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 hidden sm:inline">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            質問する
          </>
        )}
      </button>
    </form>
  );
};

export default QuestionInput;
