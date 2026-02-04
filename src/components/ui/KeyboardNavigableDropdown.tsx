import React, { useState, useEffect, useRef, useId } from "react";
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation";

// Global state to track active dropdown
let activeDropdownId: string | null = null;
const dropdownInstances = new Set<() => void>();

const notifyDropdownChange = (newActiveId: string | null) => {
  activeDropdownId = newActiveId;
  dropdownInstances.forEach((callback) => callback());
};

interface DropdownOption {
  value: string;
  label: string;
}

interface KeyboardNavigableDropdownProps {
  options: DropdownOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  label?: string;
  searchable?: boolean;
  className?: string;
  disabled?: boolean;
  multiSelect?: boolean;
  showSelectedBadges?: boolean;
  clearAllText?: string;
}

export const KeyboardNavigableDropdown: React.FC<
  KeyboardNavigableDropdownProps
> = ({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  label,
  searchable = false,
  className = "",
  disabled = false,
  multiSelect = false,
  showSelectedBadges = false,
  clearAllText = "Clear selection",
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownId = useId();
  const [, forceUpdate] = useState({});
  const isOpen = activeDropdownId === dropdownId;
  const [searchTerm, setSearchTerm] = useState("");

  // Register this dropdown instance
  useEffect(() => {
    const updateCallback = () => forceUpdate({});
    dropdownInstances.add(updateCallback);
    return () => {
      dropdownInstances.delete(updateCallback);
    };
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
  const availableOptions = multiSelect
    ? options.filter((opt) => !selectedValues.includes(opt.value))
    : options;

  const filteredOptions = searchable
    ? availableOptions.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : availableOptions;

  const { focusedIndex } = useKeyboardNavigation({
    items: filteredOptions,
    isOpen,
    onSelect: (option) => {
      if (multiSelect) {
        const newValues = [...selectedValues, option.value];
        onChange(newValues);
      } else {
        onChange(option.value);
        notifyDropdownChange(null);
      }
      setSearchTerm("");
    },
    onClose: () => {
      notifyDropdownChange(null);
      setSearchTerm("");
    },
  });

  const selectedOption = !multiSelect
    ? options.find((opt) => opt.value === value)
    : null;
  const displayText = multiSelect
    ? selectedValues.length > 0
      ? `${selectedValues.length} selected`
      : placeholder
    : selectedOption
    ? selectedOption.label
    : placeholder;

  // Auto-scroll focused item into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && dropdownRef.current) {
      const optionElements =
        dropdownRef.current.querySelectorAll(".dropdown-option");
      const focusedElement = optionElements[focusedIndex] as HTMLElement;
      if (focusedElement) {
        const container = dropdownRef.current;
        const containerTop = container.scrollTop;
        const containerBottom = containerTop + container.clientHeight;
        const elementTop = focusedElement.offsetTop;
        const elementBottom = elementTop + focusedElement.offsetHeight;

        if (elementTop < containerTop) {
          container.scrollTop = elementTop;
        } else if (elementBottom > containerBottom) {
          container.scrollTop = elementBottom - container.clientHeight;
        }
      }
    }
  }, [focusedIndex, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        notifyDropdownChange(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleRemoveItem = (valueToRemove: string) => {
    if (multiSelect) {
      const newValues = selectedValues.filter((v) => v !== valueToRemove);
      onChange(newValues);
    }
  };

  const handleClearAll = () => {
    onChange(multiSelect ? [] : "");
    notifyDropdownChange(null);
    setSearchTerm("");
  };

  return (
    <div className={`keyboard-dropdown ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-neutral-700 mb-1">
          {label}
        </label>
      )}

      {/* Selected badges for multi-select */}
      {multiSelect && showSelectedBadges && selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedValues.map((val) => {
            const option = options.find((opt) => opt.value === val);
            return (
              <span
                key={val}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-white"
              >
                {option?.label || val}
                <button
                  type="button"
                  className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary-dark"
                  onClick={() => handleRemoveItem(val)}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}

      <div className="dropdown-container relative">
        {searchable && isOpen ? (
          <input
            ref={inputRef}
            type="text"
            className={`w-full rounded-md border border-neutral-300 focus:border-primary focus:ring-primary px-2 py-1 text-sm focus:outline-none focus:ring-1 ${
              disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
            }`}
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={disabled}
          />
        ) : (
          <button
            type="button"
            className={`w-full rounded-md border border-neutral-300 focus:border-primary focus:ring-primary px-2 py-1 text-sm text-left focus:outline-none focus:ring-1 ${
              disabled
                ? "bg-gray-100 cursor-not-allowed"
                : "bg-white cursor-pointer"
            }`}
            onClick={() =>
              !disabled && notifyDropdownChange(isOpen ? null : dropdownId)
            }
            disabled={disabled}
          >
            <span
              className={
                selectedValues.length > 0 || selectedOption
                  ? "text-gray-900"
                  : "text-gray-500"
              }
            >
              {displayText}
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>
          </button>
        )}

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-md shadow-lg">
            <div ref={dropdownRef} className="max-h-60 overflow-y-auto">
              {filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  className={`dropdown-option px-3 py-2 cursor-pointer ${
                    index === focusedIndex
                      ? "bg-primary text-white"
                      : selectedValues.includes(option.value)
                      ? "bg-blue-50 text-blue-900"
                      : "hover:bg-neutral-100"
                  }`}
                  onClick={() => {
                    if (multiSelect) {
                      const newValues = [...selectedValues, option.value];
                      onChange(newValues);
                    } else {
                      onChange(option.value);
                      notifyDropdownChange(null);
                    }
                    setSearchTerm("");
                  }}
                >
                  {option.label}
                </div>
              ))}

              {filteredOptions.length === 0 && (
                <div className="px-3 py-2 text-neutral-500">
                  {multiSelect && selectedValues.length === options.length
                    ? "All options selected"
                    : "No options found"}
                </div>
              )}
            </div>

            {selectedValues.length > 0 && (
              <div
                className="px-3 py-2 hover:bg-neutral-100 cursor-pointer border-t border-neutral-200 text-red-600"
                onClick={handleClearAll}
              >
                {multiSelect ? `Clear all selections` : clearAllText}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
