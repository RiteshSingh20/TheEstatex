import { X } from "lucide-react";
import Button from "../../components/ui/Button";
import { openWhatsApp } from "../../utils/deviceDetection";
import { CostSheet } from "../../components/CompareComponents/Compare";

export function displayWhatsAppPreview(
  receiverName: string,
  setShowPreviewModal: React.Dispatch<React.SetStateAction<boolean>>,
  previewText: string,
  receiverWhatsApp: string,
  setSelectedQuickSendProperty: React.Dispatch<
    React.SetStateAction<CostSheet | null>
  >
): React.ReactNode {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col mx-4 select-none"
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Message Preview
            </h2>
            <p className="text-sm text-gray-500">
              To: {receiverName || "Customer"}
            </p>
          </div>
          <button onClick={() => setShowPreviewModal(false)}>
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        {/* Message Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
              {previewText}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => setShowPreviewModal(false)}
            className="flex-1"
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              openWhatsApp(receiverWhatsApp, previewText);
              setShowPreviewModal(false);
              setSelectedQuickSendProperty(null);
            }}
            className="flex-1"
          >
            Send to WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}
