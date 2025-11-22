import React, { useState, useEffect } from 'react';
import { generateMarketingMessage } from '../lib/propertyFormLogic';
import { FormDataType } from '../pages/CostSheetFormProps';

interface MarketingMessageProps {
  formData: FormDataType;
  subTabData: Record<string, any>;
  paymentSchemes?: Array<{ schemeName: string; description: string }>;
  highlights?: string[];
  projectAmenities?: string[];
  apartmentAmenities?: string[];
}

const MarketingMessage: React.FC<MarketingMessageProps> = ({
  formData,
  subTabData,
  paymentSchemes = [],
  highlights = [],
  projectAmenities = [],
  apartmentAmenities = []
}) => {
  const [message, setMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Generate marketing message with EXACT SAME LOGIC as HTML file
  const handleGenerateMessage = () => {
    setIsGenerating(true);
    
    // Simulate processing time like in HTML
    setTimeout(() => {
      try {
        const generatedMessage = generateMarketingMessage({
          formData,
          subTabData,
          paymentSchemes,
          highlights,
          projectAmenities,
          apartmentAmenities
        });
        
        setMessage(generatedMessage);
        setIsGenerating(false);
      } catch (error) {
        console.error('Error generating marketing message:', error);
        setMessage('Error generating marketing message. Please try again.');
        setIsGenerating(false);
      }
    }, 1000);
  };

  // Auto-generate message when data changes (like in HTML)
  useEffect(() => {
    if (formData.projectName && Object.keys(subTabData).length > 0) {
      handleGenerateMessage();
    }
  }, [formData, subTabData, paymentSchemes, highlights, projectAmenities, apartmentAmenities]);

  return (
    <div className="space-y-4">
      {/* Message Section */}
      <div className="bg-neutral-50 p-4 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-blue-600 mr-2">▶</span>
            <h3 className="text-lg font-medium text-neutral-800">
              Project Message
            </h3>
          </div>
          <button
            type="button"
            onClick={handleGenerateMessage}
            disabled={isGenerating}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <span>✨</span>
                Generate Marketing Message
              </>
            )}
          </button>
        </div>

        <div className="bg-white border rounded p-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={15}
            className="w-full border border-neutral-300 rounded px-2 py-1 text-sm resize-vertical"
            placeholder="Enter project message or click 'Generate Marketing Message' to auto-create..."
          />
        </div>

        {/* View in Modal Button */}
        {message && (
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
            >
              <span>📧</span>
              View Marketing Message
            </button>
          </div>
        )}
      </div>

      {/* Modal for viewing marketing message */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                Marketing Message
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded border border-gray-200 font-mono text-sm whitespace-pre-wrap">
              {message}
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingMessage;