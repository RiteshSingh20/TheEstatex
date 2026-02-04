import React from "react";
import Button from "../../ui/Button";

interface AddStationSectionProps {
  showAddStationModal: boolean;
  setShowAddStationModal: (show: boolean) => void;
}

const AddStationSection: React.FC<AddStationSectionProps> = ({
  showAddStationModal,
  setShowAddStationModal,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-orange-600">🏠</span>
        <span className="font-medium">Rental & Resale</span>
        <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded text-sm font-medium">🏢 New Property</span>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-blue-600">➕</span>
          <span className="font-medium text-blue-800">Add New Station</span>
        </div>
        <Button
          onClick={() => setShowAddStationModal(true)}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        >
          Add New Station
        </Button>
      </div>
    </div>
  );
};

export default AddStationSection;