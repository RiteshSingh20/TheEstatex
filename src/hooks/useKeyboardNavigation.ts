import { useState, useEffect, useCallback } from 'react';

interface UseKeyboardNavigationProps {
  items: any[];
  isOpen: boolean;
  onSelect: (item: any) => void;
  onClose: () => void;
  getItemValue?: (item: any) => string;
}

export const useKeyboardNavigation = ({
  items,
  isOpen,
  onSelect,
  onClose,
  getItemValue = (item) => item
}: UseKeyboardNavigationProps) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Reset focused index when dropdown opens/closes or items change
  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen, items]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen || items.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < items.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : items.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < items.length) {
          onSelect(items[focusedIndex]);
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
      
      case 'Tab':
        onClose();
        break;
    }
  }, [isOpen, items, focusedIndex, onSelect, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  return {
    focusedIndex,
    setFocusedIndex
  };
};