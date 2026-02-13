import React from "react";

interface PropertyNameWithKeyProps {
  name: string | number;
  keyAvailable?: string | boolean;
  className?: string;
}

const PropertyNameWithKey: React.FC<PropertyNameWithKeyProps> = ({
  name,
  keyAvailable,
  className = "",
}) => {
  const isKeyAvailable =
    keyAvailable === true ||
    keyAvailable === "Yes" ||
    keyAvailable === "yes" ||
    keyAvailable === "true" ||
    keyAvailable === "True";

  return (
    <span className={`inline-flex items-center gap-1 ${className}`.trim()}>
      <span>{name}</span>
      {isKeyAvailable && (
        <span className="text-base leading-none" title="Key Available">
          🗝️
        </span>
      )}
    </span>
  );
};

export default PropertyNameWithKey;
