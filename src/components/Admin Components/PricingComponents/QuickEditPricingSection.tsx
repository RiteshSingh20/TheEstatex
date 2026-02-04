import React from "react";

interface QuickEditPricingSectionProps {
  stationSearchTerm: string;
  setStationSearchTerm: (term: string) => void;
}

const QuickEditPricingSection: React.FC<QuickEditPricingSectionProps> = ({
  stationSearchTerm,
  setStationSearchTerm,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-blue-600">🔍</span>
        <span className="font-medium text-blue-800">Quick Edit Pricing</span>
      </div>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <input
          type="text"
          placeholder="Search station to edit..."
          value={stationSearchTerm}
          onChange={(e) => setStationSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default QuickEditPricingSection;