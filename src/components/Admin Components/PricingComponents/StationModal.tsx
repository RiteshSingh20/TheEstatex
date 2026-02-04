import React, { useState, useEffect } from "react";
import Button from "../../ui/Button";
import { fetchStates, fetchCities } from "../../../utils/api";
import { State, City } from "../../../types";

interface Station {
  id: string;
  name: string;
  district: string;
  state: string;
  source: "costsheet" | "custom" | "resale-rental" | "new-property";
}

interface StationModalProps {
  isOpen: boolean;
  onClose: () => void;
  station?: Station | null;
  stationPricing?: { actual: number; offer: number } | null;
  onSave: (stationData: { name: string; actual: number; offer: number; district?: string; state?: string; isCustom?: boolean }) => void;
}

const StationModal: React.FC<StationModalProps> = ({
  isOpen,
  onClose,
  station,
  stationPricing,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    actual: "",
    offer: "",
    district: "",
    state: "",
  });
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedStateCode, setSelectedStateCode] = useState("");

  const resetForm = () => {
    setFormData({ name: "", actual: "", offer: "", district: "", state: "" });
    setSelectedStateCode("");
    setCities([]);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    } else {
      // Reset form when modal closes
      resetForm();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const loadStates = async () => {
      try {
        const statesData = await fetchStates();
        setStates(statesData);
      } catch (error) {
        console.error("Failed to load states:", error);
      }
    };
    loadStates();
  }, []);

  useEffect(() => {
    if (station) {
      setFormData({
        name: station.name,
        actual: stationPricing?.actual ? stationPricing.actual.toString() : "",
        offer: stationPricing?.offer ? stationPricing.offer.toString() : "",
        district: station.district || "",
        state: station.state || "",
      });
      
      // Find state code for existing station
      if (station.state) {
        const stateObj = states.find(s => s.name === station.state);
        if (stateObj) {
          setSelectedStateCode(stateObj.iso2);
          loadCities(stateObj.iso2);
        }
      }
    } else {
      setFormData({ name: "", actual: "", offer: "", district: "", state: "" });
      setSelectedStateCode("");
      setCities([]);
    }
  }, [station, stationPricing, states]);

  const loadCities = async (stateCode: string) => {
    try {
      const citiesData = await fetchCities(stateCode);
      setCities(citiesData);
    } catch (error) {
      console.error("Failed to load cities:", error);
    }
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateCode = e.target.value;
    setSelectedStateCode(stateCode);
    
    const selectedState = states.find(s => s.iso2 === stateCode);
    setFormData({ ...formData, state: selectedState?.name || "", district: "" });
    
    if (stateCode) {
      loadCities(stateCode);
    } else {
      setCities([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      actual: Number(formData.actual) || 0,
      offer: Number(formData.offer) || 0,
      isCustom: !station // Mark as custom if it's a new station
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">
          {station ? "Edit Station" : "Add New Station"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Station Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={station && station.source !== "custom"}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Actual Price (₹)</label>
              <input
                type="number"
                value={formData.actual}
                onChange={(e) => setFormData({ ...formData, actual: e.target.value })}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="Enter actual price"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Offer Price (₹)</label>
              <input
                type="number"
                value={formData.offer}
                onChange={(e) => setFormData({ ...formData, offer: e.target.value })}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="Enter offer price"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <select
              value={selectedStateCode}
              onChange={handleStateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={station && station.source !== "custom"}
              required
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state.iso2} value={state.iso2}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">District</label>
            <select
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={!selectedStateCode || (station && station.source !== "custom")}
              required
            >
              <option value="">Select District</option>
              {cities.map((city) => (
                <option key={city.id} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
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
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
            >
              {station ? "Update" : "Add"} Station
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StationModal;