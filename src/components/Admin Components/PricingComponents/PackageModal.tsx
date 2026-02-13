import React, { useState, useEffect } from "react";
import Button from "../../ui/Button";

interface Station {
  id: string;
  name: string;
  district: string;
  state: string;
  source: "costsheet" | "custom" | "resale-rental" | "new-property";
}

interface StationPricing {
  actual: number;
  offer: number;
}

interface PackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStations: Station[];
  stationPricing: { [key: string]: StationPricing };
  existingPackages: { [key: string]: any };
  onSave: (packageData: { name: string; actual: number; offer: number; stations: string[] }) => void;
}

const PackageModal: React.FC<PackageModalProps> = ({
  isOpen,
  onClose,
  selectedStations,
  stationPricing,
  existingPackages,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    offer: "",
  });
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: "", offer: totalOfferPrice.toString() });
    }
  }, [isOpen]);

  const totalActualPrice = selectedStations.reduce((total, station) => {
    const stationKey =
      station.source === "custom" ? `custom_${station.name}` : station.name;
    const pricing = stationPricing[stationKey] || { actual: 0, offer: 0 };
    return total + pricing.actual;
  }, 0);

  const totalOfferPrice = selectedStations.reduce((total, station) => {
    const stationKey =
      station.source === "custom" ? `custom_${station.name}` : station.name;
    const pricing = stationPricing[stationKey] || { actual: 0, offer: 0 };
    return total + pricing.offer;
  }, 0);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({ ...formData, name });

    const packageExists = Object.values(existingPackages || {}).some(
      (pkg: any) => pkg.name?.toLowerCase() === name.toLowerCase()
    );

    if (packageExists && name.trim()) {
      setNameError("This package name already exist.");
    } else {
      setNameError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (nameError) {
      return;
    }

    onSave({
      name: formData.name,
      actual: totalActualPrice,
      offer: Number(formData.offer) || 0,
      stations: selectedStations.map((s) => s.id),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Create Package</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Package Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                nameError
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Enter package name"
              required
            />
            {nameError && (
              <p className="text-red-500 text-sm mt-1">{nameError}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Total Actual Price (₹)
              </label>
              <input
                type="number"
                value={totalActualPrice}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Offer Price (₹)
              </label>
              <input
                type="number"
                value={formData.offer}
                onChange={(e) =>
                  setFormData({ ...formData, offer: e.target.value })
                }
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter offer price"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Select Stations ({selectedStations.length} selected)
            </label>
            <div className="max-h-32 overflow-y-auto bg-gray-50 rounded-md p-3 space-y-1 border border-gray-200">
              {selectedStations.map((station) => (
                <div key={station.id} className="text-sm text-gray-700">
                  {station.name} - {station.district}, {station.state}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!!nameError}
              className={`flex-1 text-white ${
                nameError
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              Create Package
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PackageModal;
