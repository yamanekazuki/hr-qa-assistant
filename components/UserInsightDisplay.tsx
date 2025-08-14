
import React from 'react';

interface UserInsightDisplayProps {
  insightText: string[] | null; // Changed from string | null to string[] | null
  isLoading: boolean;
}

const UserInsightDisplay: React.FC<UserInsightDisplayProps> = ({ insightText, isLoading }) => {
  if (isLoading) {
    return (
      <div className="mt-8 p-6 bg-teal-50 border border-teal-200 rounded-lg shadow-md animate-pulse" role="status" aria-live="polite">
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-teal-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-teal-700 font-semibold">AIがあなたの次の関心事を分析しています...</p>
        </div>
      </div>
    );
  }

  if (!insightText || insightText.length === 0) {
    return null; 
  }

  return (
    <div className="mt-8 p-6 bg-teal-50 border border-teal-300 text-teal-800 rounded-lg shadow-lg" role="complementary">
      <h4 className="text-lg font-semibold text-teal-900 mb-3 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 text-teal-700">
           <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
        AIからのヒント：次に気になることは...
      </h4>
      <ul className="list-none pl-0 space-y-2">
        {insightText.map((hint, index) => (
          <li key={index} className="text-sm leading-relaxed flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2 text-teal-600 flex-shrink-0 mt-0.5">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16Zm-.75-4.75a.75.75 0 001.5 0V8.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0L6.4 9.74a.75.75 0 101.1 1.02l1.95-2.1v3.59Z" clipRule="evenodd" />
            </svg>
            {hint}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserInsightDisplay;
