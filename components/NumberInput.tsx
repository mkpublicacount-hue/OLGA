import React from 'react';
import { formatNumber, parseNumber } from '../utils';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  className?: string;
  error?: boolean;
  readOnly?: boolean;
  onFillRequest?: () => void;
  hint?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({ 
  label, 
  value, 
  onChange, 
  className = "", 
  error = false,
  readOnly = false,
  onFillRequest,
  hint
}) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = parseNumber(e.target.value);
    onChange(rawValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' && onFillRequest && !readOnly) {
      e.preventDefault();
      onFillRequest();
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {hint && <span className="text-xs text-blue-600 font-medium">{hint}</span>}
      </div>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={value === 0 && !readOnly ? '' : formatNumber(value)}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          placeholder="0"
          className={`w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:outline-none transition-colors text-left dir-ltr text-gray-900 bg-white
            ${error 
              ? 'border-red-500 bg-red-50 text-red-700 focus:ring-red-200' 
              : readOnly 
                ? 'bg-gray-100 text-gray-600 border-gray-300 cursor-not-allowed'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
            }
          `}
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">
          تومان
        </span>
      </div>
    </div>
  );
};

export default NumberInput;
