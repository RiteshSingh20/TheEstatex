import React from "react";
import { PropertyCategory } from "../../../../types";

interface PropertyCategorySelectorProps {
  propertyCategory: PropertyCategory;
  setPropertyCategory: (category: PropertyCategory) => void;
}

const PropertyCategorySelector: React.FC<PropertyCategorySelectorProps> = ({
  propertyCategory,
  setPropertyCategory,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-2">
        Property Category
      </label>
      <div
        className="flex border border-neutral-300 rounded-md overflow-hidden w-full max-w-xs"
        data-property-category
      >
        <button
          className={`flex-1 py-2 ${
            propertyCategory === "Resale"
              ? "bg-primary text-white"
              : "bg-white text-neutral-700"
          }`}
          onClick={() => setPropertyCategory("Resale")}
          data-property-category
        >
          Resale
        </button>
        <button
          className={`flex-1 py-2 ${
            propertyCategory === "Rental"
              ? "bg-primary text-white"
              : "bg-white text-neutral-700"
          }`}
          onClick={() => setPropertyCategory("Rental")}
          data-property-category
        >
          Rental
        </button>
        <button
          className={`flex-1 py-2 ${
            propertyCategory === "New"
              ? "bg-primary text-white"
              : "bg-white text-neutral-700"
          }`}
          onClick={() => setPropertyCategory("New")}
          data-property-category
        >
          New
        </button>
      </div>
    </div>
  );
};

export default PropertyCategorySelector;