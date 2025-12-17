import { X } from "lucide-react";

export function negotiationModal(
  setShowNegotiationModal,
  selectedNegotiationValue: string
) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-64 mx-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Negotiation Scope
          </h3>
          <button
            onClick={() => setShowNegotiationModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="text-center py-2">
          <div className="text-lg font-bold text-blue-600">
            ₹{selectedNegotiationValue}
          </div>
        </div>

        <div className="flex justify-center mt-3">
          <button
            onClick={() => setShowNegotiationModal(false)}
            className="px-4 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
