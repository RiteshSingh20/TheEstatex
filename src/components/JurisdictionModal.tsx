import React from 'react';
import { StampDutyRate } from '../pages/Compare';

interface JurisdictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  district: string;
  availableRates: StampDutyRate[];
}

const JurisdictionModal: React.FC<JurisdictionModalProps> = ({
  isOpen,
  onClose,
  district,
  availableRates
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-red-600">
            ⚠️ Jurisdiction Data Missing
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-700 mb-2">
            We couldn't find jurisdiction data required to calculate the Stamp Duty for the selected district: <strong>{district}</strong>.
          </p>
          <p className="text-gray-600 text-sm">
            Please verify the district selection or contact your administrator to update the jurisdiction details.
          </p>
        </div>

        {availableRates.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Available Jurisdictions:</h3>
            <div className="max-h-32 overflow-y-auto border border-gray-200 rounded p-2">
              {availableRates.map((rate) => (
                <div key={rate.id} className="text-sm py-1">
                  <span className="font-medium">{rate.jurisdiction}</span>
                  <span className="text-gray-500 ml-2">({rate.rate}%)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default JurisdictionModal;