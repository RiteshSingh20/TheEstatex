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
  const [isClickingOnSuggestion, setIsClickingOnSuggestion] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);

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
    setSelectedIndex(-1);
    
    if (newValue.length >= 1) {
      onSearch(newValue);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const scrollToSelectedItem = (index: number) => {
    const selectedElement = suggestionRefs.current[index];
    const container = dropdownRef.current?.querySelector('.overflow-y-auto');
    
    if (selectedElement && container) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = selectedElement.getBoundingClientRect();
      
      if (elementRect.bottom > containerRect.bottom) {
        // Scroll down
        container.scrollTop += elementRect.bottom - containerRect.bottom;
      } else if (elementRect.top < containerRect.top) {
        // Scroll up
        container.scrollTop -= containerRect.top - elementRect.top;
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    const filteredSuggestions = suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase())
    );

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => {
          const newIndex = prev < filteredSuggestions.length - 1 ? prev + 1 : 0;
          setTimeout(() => scrollToSelectedItem(newIndex), 0);
          return newIndex;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => {
          const newIndex = prev > 0 ? prev - 1 : filteredSuggestions.length - 1;
          setTimeout(() => scrollToSelectedItem(newIndex), 0);
          return newIndex;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
          handleSuggestionClick(filteredSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    const titleCaseSuggestion = toTitleCase(suggestion);
    setInputValue(titleCaseSuggestion);
    onChange(titleCaseSuggestion);
    setIsOpen(false);
    setIsClickingOnSuggestion(false);
  };

  const handleSuggestionMouseDown = () => {
    setIsClickingOnSuggestion(true);
  };

  const handleFocus = () => {
    if (inputValue.length >= 1) {
      onSearch(inputValue);
      setIsOpen(true);
    }
    setSelectedIndex(-1);
  };

  const handleBlur = () => {
    // Don't close if user is clicking on a suggestion
    if (!isClickingOnSuggestion) {
      setIsOpen(false);
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
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
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
                ref={(el) => (suggestionRefs.current[index] = el)}
                className={`px-3 py-2 text-sm cursor-pointer border-b border-gray-100 last:border-b-0 ${
                  index === selectedIndex ? 'bg-blue-100' : 'hover:bg-gray-100'
                }`}
                onMouseDown={handleSuggestionMouseDown}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
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