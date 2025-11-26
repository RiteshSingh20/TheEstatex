import React, { useState, useEffect, useRef } from 'react';
import { toTitleCase } from '../../pages/CostSheetFormProps';

interface LocationDropdownProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
}

const LocationDropdown: React.FC<LocationDropdownProps> = ({
  value,
  onChange,
  suggestions,
  onSearch,
  placeholder = "Type to search...",
  className = "",
  isLoading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(toTitleCase(newValue));
    
    if (newValue.length >= 1) {
      onSearch(newValue);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    const titleCaseSuggestion = toTitleCase(suggestion);
    setInputValue(titleCaseSuggestion);
    onChange(titleCaseSuggestion);
    setIsOpen(false);
  };

  const handleFocus = () => {
    if (inputValue.length >= 1) {
      onSearch(inputValue);
      setIsOpen(true);
    }
  };

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={`w-full border border-neutral-300 rounded px-2 py-1 text-sm ${className}`}
        required
      />
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
          ) : filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {toTitleCase(suggestion)}
              </div>
            ))
          ) : inputValue.length >= 1 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No suggestions found</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default LocationDropdown;