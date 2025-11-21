import { useState, useRef } from "react";

type TagInputProps = {
  label: string;
  value: string[];
  onChange: (updated: string[]) => void;
  placeholder?: string;
};

const TagInput = ({
  label,
  value,
  onChange,
  placeholder = "Add amenity...",
}: TagInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      (e.key === "Enter" || e.key === "," || e.key === "Tab") &&
      inputValue.trim()
    ) {
      e.preventDefault();
      const normalized = inputValue.trim();

      const isDuplicate = value.some(
        (existing) => existing.toLowerCase() === normalized.toLowerCase()
      );
      if (!isDuplicate && /^[a-zA-Z0-9\s]+$/.test(normalized)) {
        onChange([...value, normalized]);
      }

      setInputValue("");
    }
  };

  const removeTag = (index: number) => {
    const newTags = [...value];
    newTags.splice(index, 1);
    onChange(newTags);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1">
        {label.split("(")[0]}
        {label.includes("(") && (
          <span className="text-primary/70 font-normal">
            ({label.split("(")[1]})
          </span>
        )}
      </label>

      <div className="flex flex-wrap gap-2 p-2 border border-neutral-300 rounded-md min-h-[46px] focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
        {value.map((tag, idx) => (
          <span
            key={idx}
            className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm flex items-center gap-1"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="text-primary hover:text-red-500 text-xs"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          className="flex-grow min-w-[120px] focus:outline-none"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
};

export default TagInput;
