import Select from "react-select";

type Option = {
  label: string;
  value: string;
};

type MultiSelectDropdownProps = {
  label: string;
  value: string[];
  onChange: (values: string[]) => void;
  options: Option[];
  error?: string;
  placeholder?: string;
};

const MultiSelectDropdown = ({
  label,
  value,
  onChange,
  options,
  error,
  placeholder = "Select...",
}: MultiSelectDropdownProps) => {
  const selected = options.filter((opt) => value.includes(opt.value));

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
        </label>
      )}

      <Select
        isMulti
        closeMenuOnSelect={false} // 👈 prevents dropdown from closing
        options={options}
        value={selected}
        onChange={(opts) => {
          const selectedValues = Array.isArray(opts)
            ? opts.map((o) => o.value)
            : [];
          onChange(selectedValues);
        }}
        placeholder={placeholder}
        classNamePrefix="react-select"
      />

      {error && <p className="text-sm text-error mt-1">{error}</p>}
    </div>
  );
};

export default MultiSelectDropdown;
