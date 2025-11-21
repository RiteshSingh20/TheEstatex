import React from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from '../utils/authContext';
import toast from 'react-hot-toast';

interface AmenityModalProps {
  isOpen: boolean;
  onClose: () => void;
  fieldId: string;
  fieldLabel: string;
  customAmenityInput: string;
  setCustomAmenityInput: (value: string) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  setExpandedAmenities: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setCustomAmenities: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
}

const AmenityModal: React.FC<AmenityModalProps> = ({
  isOpen,
  onClose,
  fieldId,
  fieldLabel,
  customAmenityInput,
  setCustomAmenityInput,
  setFormData,
  setExpandedAmenities,
  setCustomAmenities,
}) => {
  const { user } = useAuth();
  if (!isOpen) return null;

  const handleAdd = async () => {
    if (!customAmenityInput.trim()) return;
    
    const newAmenity = customAmenityInput.trim();
    try {
      const ref = doc(db, "users", user.id);
      await updateDoc(ref, {
        [`customAmenities.${fieldId}`]: arrayUnion(newAmenity),
      });
      
      setFormData((prev: any) => {
        const updated = {
          ...prev,
          [fieldId]: [
            ...((prev[fieldId] as string[]) || []),
            newAmenity,
          ],
        };
        
        setExpandedAmenities((ePrev) => ({
          ...ePrev,
          [fieldId]: true,
        }));
        
        return updated;
      });
      
      setCustomAmenities((prev) => ({
        ...prev,
        [fieldId]: [
          ...(prev[fieldId] || []),
          newAmenity,
        ],
      }));
      
      onClose();
      setCustomAmenityInput("");
      toast.success("Custom amenity added!");
    } catch (error) {
      toast.error(
        `Failed to add amenity ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4 shadow-xl">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Add Custom {fieldLabel}
        </h3>
        <input
          type="text"
          value={customAmenityInput}
          onChange={(e) => setCustomAmenityInput(e.target.value)}
          placeholder={`Enter custom ${fieldLabel.split(" ")[0].toLowerCase()}`}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAdd();
            } else if (e.key === 'Escape') {
              onClose();
            }
          }}
        />
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!customAmenityInput.trim()}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AmenityModal;