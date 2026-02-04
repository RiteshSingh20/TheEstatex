import React from "react";
import { X } from "lucide-react";

interface WhatsAppPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewText: string;
  onSend: () => void;
}

const WhatsAppPreviewModal: React.FC<WhatsAppPreviewModalProps> = ({
  isOpen,
  onClose,
  previewText,
  onSend,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">WhatsApp Message Preview</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-4 max-h-96 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm font-mono">
            {previewText}
          </pre>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSend();
              onClose();
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Send on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppPreviewModal;