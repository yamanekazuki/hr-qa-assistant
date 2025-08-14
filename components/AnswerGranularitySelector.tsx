import React from 'react';

// Defines the possible levels of detail for an answer.
export type Granularity = 'concise' | 'contextual' | 'detailed';

interface AnswerGranularitySelectorProps {
  selectedGranularity: Granularity;
  onGranularityChange: (granularity: Granularity) => void;
  disabled?: boolean; // Optional prop to disable the selector.
}

// Configuration for the granularity options.
const GRANULARITY_OPTIONS: { value: Granularity; label: string; description: string }[] = [
  { value: 'concise', label: '簡潔に', description: '要点のみを知りたい場合に選択してください。' },
  { value: 'contextual', label: '文脈を含めて', description: '背景や関連情報もあわせて理解したい場合に選択してください。' },
  { value: 'detailed', label: '詳細に', description: '可能な限り多くの情報を網羅的に知りたい場合に選択してください。' },
];

const AnswerGranularitySelector: React.FC<AnswerGranularitySelectorProps> = ({
  selectedGranularity,
  onGranularityChange,
  disabled = false, // Default to not disabled.
}) => {
  return (
    <div className="mt-6 pt-4 border-t border-slate-200">
      <fieldset disabled={disabled} aria-labelledby="granularity-legend">
        <legend id="granularity-legend" className="text-base font-medium text-slate-700 mb-3">回答の詳しさ:</legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {GRANULARITY_OPTIONS.map((option) => (
            <label
              key={option.value}
              htmlFor={`granularity-${option.value}`}
              className={`
                flex flex-col p-4 border rounded-lg cursor-pointer transition-all duration-150 ease-in-out
                ${selectedGranularity === option.value
                  ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500 shadow-md' // Style for selected option
                  : 'bg-white border-slate-300 hover:border-slate-400 hover:shadow-sm' // Style for unselected options
                }
                ${disabled ? 'opacity-60 cursor-not-allowed' : ''} // Style for disabled state
              `}
            >
              <input
                type="radio"
                id={`granularity-${option.value}`}
                name="granularity" // Ensures only one radio button in the group can be selected.
                value={option.value}
                checked={selectedGranularity === option.value}
                onChange={() => onGranularityChange(option.value)}
                className="sr-only" // Hide the default radio button; the label is styled instead.
                disabled={disabled}
                aria-describedby={`granularity-desc-${option.value}`}
              />
              <span className="font-semibold text-sm text-slate-800">{option.label}</span>
              <span id={`granularity-desc-${option.value}`} className="text-xs text-slate-500 mt-1">{option.description}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
};

export default AnswerGranularitySelector;
