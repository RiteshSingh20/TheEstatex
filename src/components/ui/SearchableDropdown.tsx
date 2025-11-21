// components/ui/SearchableDropdown.tsx
import Select from "react-select";

type Option = {
  label: string;
  value: string;
};

type SearchableDropdownProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  error?: string;
  placeholder?: string;
  isLoading?: boolean; // <- NEW
  disabled?: boolean; // <- NEW
};

const SearchableDropdown = ({
  label,
  value,
  onChange,
  options,
  error,
  placeholder = "Select...",
}: SearchableDropdownProps) => {
  const selectedOption = options.find((opt) => opt.value === value) || null;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
        </label>
      )}

      <Select
        options={options}
        value={selectedOption}
        onChange={(option) => onChange(option?.value || "")}
        placeholder={placeholder}
        isSearchable
        classNamePrefix="searchable-select"
        menuPlacement="auto"
        menuPortalTarget={document.body}
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }), // High z-index
        }}
      />

      {error && <p className="text-sm text-error mt-1">{error}</p>}
    </div>
  );
};

export default SearchableDropdown;
