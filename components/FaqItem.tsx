import React from 'react';
import { QAItem } from '../types'; // Type definition for the FAQ item structure.

interface FaqItemProps {
  qaItem: QAItem; // The FAQ item data.
  onQuestionSelect: (question: string) => void; // Callback when the FAQ is selected.
}

const FaqItem: React.FC<FaqItemProps> = ({ qaItem, onQuestionSelect }) => {
  return (
    <div
      onClick={() => onQuestionSelect(qaItem.question)}
      className="bg-white p-4 mb-3 rounded-lg shadow hover:shadow-xl transition-all duration-200 cursor-pointer border border-slate-200 hover:border-blue-400"
      role="button" // Accessibility: Indicate that this div is interactive.
      tabIndex={0} // Accessibility: Make it focusable.
      onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') onQuestionSelect(qaItem.question); }} // Accessibility: Allow selection with Enter/Space.
      aria-label={`FAQ: ${qaItem.question}`}
    >
      <h4 className="font-medium text-blue-600 hover:text-blue-700 mb-1">{qaItem.question}</h4>
      <p className="text-xs text-slate-500">{qaItem.category} {qaItem.subCategory && `> ${qaItem.subCategory}`}</p>
    </div>
  );
};

export default FaqItem;
