type FieldProps = {
  label: string;
  value: unknown;
};

const Field = ({ label, value }: FieldProps) => {
  const displayValue =
    typeof value === "boolean" ? (value ? "Yes" : "No") : String(value ?? "-");

  return (
    <div className="text-sm">
      <div className="text-neutral-500 font-medium">{label}</div>
      <div className="text-neutral-800">{displayValue}</div>
    </div>
  );
};

export default Field;
