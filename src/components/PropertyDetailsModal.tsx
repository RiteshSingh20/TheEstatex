import React from 'react';
import { X } from 'lucide-react';
import KeyAvailableIcon from './KeyAvailableIcon';

interface PropertyDetailsModalProps {
  property: any;
  onClose: () => void;
}

const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({ property, onClose }) => {
  if (!property) return null;
  const isKeyAvailable =
    property.keyAvailable === true ||
    property.keyAvailable === "Yes" ||
    property.keyAvailable === "yes" ||
    property.keyAvailable === "true";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center">
            {property.society}
            <KeyAvailableIcon isKeyAvailable={isKeyAvailable} size="md" />
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Type</label>
              <p>{property.type}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Station</label>
              <p>{property.station}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Sublocation</label>
              <p>{property.sublocation}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">District</label>
              <p>{property.district}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Floor No</label>
              <p>{property.floorNo}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Flat No</label>
              <p>{property.flatNo}</p>
            </div>
            {(property.keyAvailable !== undefined &&
              property.keyAvailable !== null &&
              property.keyAvailable !== "") && (
              <div>
                <label className="text-sm font-semibold text-gray-600">Key Available</label>
                <p className="flex items-center">
                  {isKeyAvailable ? "Yes" : "No"}
                  <KeyAvailableIcon isKeyAvailable={isKeyAvailable} size="sm" />
                </p>
              </div>
            )}
            {property.expectedPrice && (
              <div>
                <label className="text-sm font-semibold text-gray-600">Expected Price</label>
                <p>₹{property.expectedPrice?.toLocaleString('en-IN')}</p>
              </div>
            )}
            {property.rent && (
              <div>
                <label className="text-sm font-semibold text-gray-600">Expected Rent</label>
                <p>₹{property.rent?.toLocaleString('en-IN')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsModal;
