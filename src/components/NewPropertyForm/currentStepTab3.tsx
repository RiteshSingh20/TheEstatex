// src/components/NewPropertyForm/currentStepTab3.tsx
import { User } from "firebase/auth";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { PlusIcon } from "lucide-react";
import React from "react";
import toast from "react-hot-toast";
import { costSheetFields } from "../../pages/costSheetFields";
import { FormDataType, toTitleCase } from "../../pages/CostSheetFormProps";
import { State, City } from "../../types";
import { db } from "../../utils/firebase";
import Input from "../ui/Input";
import { generateMarketingMessage } from "../../lib/propertyFormLogic";

export function currentStepTab3(
  activeCategory: { label: string; fields: string[] },
  formData: FormDataType,
  stationSearchTerm: string,
  setStationSearchTerm: React.Dispatch<React.SetStateAction<string>>,
  setSelectedStationIndex: React.Dispatch<React.SetStateAction<number>>,
  setShowStationDropdown: React.Dispatch<React.SetStateAction<boolean>>,
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>,
  stationOptions: { value: string; label: string }[],
  selectedStationIndex: number,
  showStationDropdown: boolean,
  states: State[],
  selectedStateCode: string,
  handleStateChange: (e: React.ChangeEvent<HTMLSelectElement>) => Promise<void>,
  cities: City[],
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void,
  customAmenities: Record<string, string[]>,
  expandedAmenities: Record<string, boolean>,
  setExpandedAmenities: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >,
  addingAmenityFor: string | null,
  customAmenityInput: Record<string, string>,
  setCustomAmenityInput: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  user: User | null,
  setCustomAmenities: React.Dispatch<
    React.SetStateAction<Record<string, string[]>>
  >,
  setAddingAmenityFor: React.Dispatch<React.SetStateAction<string | null>>,
  setCurrentAmenityField: React.Dispatch<React.SetStateAction<string>>,
  setShowAmenityModal: React.Dispatch<React.SetStateAction<boolean>>,
  calculateTotalPackage: () => string,
  numberFields: string[],
  subTabData: any
): React.ReactNode {
  // Extract unique typologies with their saleable areas from subTabData
  const getGroupedTypologies = () => {
    const grouped: Record<string, string[]> = {};
    
    Object.values(subTabData || {}).forEach((tabData: any) => {
      tabData?.pricingConfigs?.forEach((config: any) => {
        if (config.typology && config.saleableArea) {
          if (!grouped[config.typology]) {
            grouped[config.typology] = [];
          }
          if (!grouped[config.typology].includes(config.saleableArea)) {
            grouped[config.typology].push(config.saleableArea);
          }
        }
      });
    });
    
    return grouped;
  };
  
  const groupedTypologies = getGroupedTypologies();

  // Enhanced marketing message generation function - EXACT SAME LOGIC AS HTML
  const generateEnhancedMarketingMessage = () => {
    try {
      // Collect highlights from form data (if available)
      const highlights: string[] = [];
      // Add logic to collect highlights from form fields if needed
      
      // Collect amenities from form data (if available)
      const projectAmenities: string[] = [];
      const apartmentAmenities: string[] = [];
      // Add logic to collect amenities from form fields if needed
      
      // Collect payment schemes (this would come from step 4 data)
      const paymentSchemes: Array<{ schemeName: string; description: string }> = [];
      // This would be passed from parent component or accessed from global state
      
      // Use the shared marketing message generation function with EXACT SAME LOGIC AS HTML
      const message = generateMarketingMessage({
        formData,
        subTabData,
        paymentSchemes,
        highlights,
        projectAmenities,
        apartmentAmenities
      });
      
      // Set the generated message
      setFormData(prev => ({
        ...prev,
        projectMessage: message
      }));
      
      toast.success('Marketing message generated successfully!');
      
    } catch (error) {
      console.error('Error generating marketing message:', error);
      toast.error('Error generating message. Please check your form data.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Balcony & Terrace Selection Section */}
      {Object.keys(groupedTypologies).length > 0 && (
        <div className="bg-neutral-50 p-4 rounded-lg border">
          <div className="flex items-center mb-4">
            <span className="text-blue-600 mr-2">▶</span>
            <h3 className="text-lg font-medium text-neutral-800">
              Saleable Areas Selection
            </h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Balcony Section */}
            <div>
              <h4 className="text-md font-medium text-neutral-700 mb-3">
                Select Saleable Areas having Balcony
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(groupedTypologies).map(([typology, areas]) => (
                  <div key={`balcony-${typology}`} className="bg-white p-3 rounded border">
                    <div className="font-medium text-sm mb-2 text-center">{typology}</div>
                    <div className="flex flex-wrap gap-1">
                      {areas.map((area) => {
                        const key = `${typology}-${area}`;
                        return (
                          <label key={key} className="flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded cursor-pointer hover:bg-gray-100">
                            <input
                              type="checkbox"
                              checked={formData.balconyAreas?.includes(key) || false}
                              onChange={(e) => {
                                const current = formData.balconyAreas || [];
                                const updated = e.target.checked
                                  ? [...current, key]
                                  : current.filter(k => k !== key);
                                setFormData(prev => ({ ...prev, balconyAreas: updated }));
                              }}
                              className="rounded"
                            />
                            <span>{area}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Terrace Section */}
            <div>
              <h4 className="text-md font-medium text-neutral-700 mb-3">
                Select Saleable Areas having Terrace
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(groupedTypologies).map(([typology, areas]) => (
                  <div key={`terrace-${typology}`} className="bg-white p-3 rounded border">
                    <div className="font-medium text-sm mb-2 text-center">{typology}</div>
                    <div className="flex flex-wrap gap-1">
                      {areas.map((area) => {
                        const key = `${typology}-${area}`;
                        return (
                          <label key={key} className="flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded cursor-pointer hover:bg-gray-100">
                            <input
                              type="checkbox"
                              checked={formData.terraceAreas?.includes(key) || false}
                              onChange={(e) => {
                                const current = formData.terraceAreas || [];
                                const updated = e.target.checked
                                  ? [...current, key]
                                  : current.filter(k => k !== key);
                                setFormData(prev => ({ ...prev, terraceAreas: updated }));
                              }}
                              className="rounded"
                            />
                            <span>{area}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Marketing Message Section */}
      <div className="bg-neutral-50 p-4 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-blue-600 mr-2">▶</span>
            <h3 className="text-lg font-medium text-neutral-800">
              Marketing Message
            </h3>
          </div>
          <button
            type="button"
            onClick={generateEnhancedMarketingMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
            Generate Marketing Message
          </button>
        </div>
        
        <textarea
          value={String(formData.projectMessage || "")}
          onChange={(e) => setFormData(prev => ({ ...prev, projectMessage: e.target.value }))}
          rows={8}
          className="w-full border border-neutral-300 rounded px-3 py-2 text-sm resize-vertical"
          placeholder="Marketing message will be generated automatically when you click the button above..."
        />
      </div>
      
      {/* Existing Amenities Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {activeCategory.fields.map((fieldId) => {
        const field = costSheetFields.find((f) => f.id === fieldId)!;
        const value = formData[field.id] ?? "";

        if (field.id === "station") {
          return (
            <div key={field.id} className="relative station-dropdown">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                {field.label}
              </label>
              <input
                type="text"
                className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Search or enter station name..."
                value={formData.station || stationSearchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  setStationSearchTerm(value);
                  setSelectedStationIndex(-1);
                  setShowStationDropdown(true);

                  // If user is editing a selected station, clear the form data to allow search
                  if (formData.station && value !== formData.station) {
                    setFormData((prev) => ({
                      ...prev,
                      station: "",
                    }));
                  }
                }}
                onFocus={() => {
                  setShowStationDropdown(true);
                  setSelectedStationIndex(-1);
                }}
                onKeyDown={(e) => {
                  const searchValue = formData.station || stationSearchTerm;
                  const filteredOptions = stationOptions.filter((option) =>
                    option.label
                      .toLowerCase()
                      .includes(searchValue.toLowerCase())
                  );

                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    const newIndex =
                      selectedStationIndex < filteredOptions.length - 1
                        ? selectedStationIndex + 1
                        : selectedStationIndex;
                    setSelectedStationIndex(newIndex);
                    if (!showStationDropdown) setShowStationDropdown(true);

                    // Auto-scroll to keep selected item visible
                    setTimeout(() => {
                      const dropdown = document.querySelector(
                        ".station-dropdown .absolute"
                      );
                      const selectedItem = dropdown?.children[
                        newIndex
                      ] as HTMLElement;
                      if (selectedItem && dropdown) {
                        selectedItem.scrollIntoView({
                          block: "nearest",
                          behavior: "smooth",
                        });
                      }
                    }, 0);
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    const newIndex =
                      selectedStationIndex > 0 ? selectedStationIndex - 1 : -1;
                    setSelectedStationIndex(newIndex);
                    if (!showStationDropdown) setShowStationDropdown(true);

                    // Auto-scroll to keep selected item visible
                    setTimeout(() => {
                      const dropdown = document.querySelector(
                        ".station-dropdown .absolute"
                      );
                      const selectedItem = dropdown?.children[
                        newIndex >= 0 ? newIndex : 0
                      ] as HTMLElement;
                      if (selectedItem && dropdown) {
                        selectedItem.scrollIntoView({
                          block: "nearest",
                          behavior: "smooth",
                        });
                      }
                    }, 0);
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    if (
                      selectedStationIndex >= 0 &&
                      filteredOptions[selectedStationIndex]
                    ) {
                      setFormData((prev) => ({
                        ...prev,
                        station: filteredOptions[selectedStationIndex].value,
                      }));
                      setStationSearchTerm("");
                      setShowStationDropdown(false);
                      setSelectedStationIndex(-1);
                    } else if (searchValue.trim()) {
                      // Allow manual entry of new station
                      setFormData((prev) => ({
                        ...prev,
                        station: searchValue.trim(),
                      }));
                      setStationSearchTerm("");
                      setShowStationDropdown(false);
                    }
                  } else if (e.key === "Escape") {
                    setShowStationDropdown(false);
                    setSelectedStationIndex(-1);
                  }
                }}
              />
              {showStationDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {stationOptions
                    .filter((option) => {
                      const searchValue = formData.station || stationSearchTerm;
                      return option.label
                        .toLowerCase()
                        .includes(searchValue.toLowerCase());
                    })
                    .map((option, index) => (
                      <div
                        key={option.value}
                        className={`px-3 py-2 cursor-pointer ${
                          index === selectedStationIndex
                            ? "bg-primary text-white"
                            : "hover:bg-neutral-100"
                        }`}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            station: option.value,
                          }));
                          setStationSearchTerm("");
                          setShowStationDropdown(false);
                          setSelectedStationIndex(-1);
                        }}
                      >
                        {option.label}
                      </div>
                    ))}
                  {stationOptions.filter((option) => {
                    const searchValue = formData.station || stationSearchTerm;
                    return option.label
                      .toLowerCase()
                      .includes(searchValue.toLowerCase());
                  }).length === 0 && (
                    <div className="px-3 py-2 text-neutral-500">
                      No stations found. You can type to add a new station.
                    </div>
                  )}
                  {formData.station && (
                    <div
                      className="px-3 py-2 hover:bg-neutral-100 cursor-pointer border-t border-neutral-200 text-red-600"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          station: "",
                        }));
                        setStationSearchTerm("");
                        setShowStationDropdown(false);
                        setSelectedStationIndex(-1);
                      }}
                    >
                      Clear selection
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }

        // ... rest of the existing fields handling code remains the same
        // (station, pinCode, state, dropdown, multi-select, etc.)

        return (
          <Input
            key={field.id}
            id={field.id}
            label={field.label}
            value={
              typeof value === "string" ||
              typeof value === "number" ||
              Array.isArray(value)
                ? value
                : value === undefined || value === null
                ? ""
                : String(value)
            }
            type="text"
            onChange={(e) => {
              const raw = e.target.value;
              if (numberFields.includes(field.id)) {
                // Allow decimal for landParcel, only digits for others
                const filtered =
                  field.id === "landParcel"
                    ? raw.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1")
                    : raw.replace(/[^0-9]/g, "");
                setFormData((prev) => ({
                  ...prev,
                  [field.id]: filtered,
                }));
              } else {
                // Apply title case formatting for text fields
                const processedValue = toTitleCase(raw);
                setFormData((prev) => ({
                  ...prev,
                  [field.id]: processedValue,
                }));
              }
            }}
            onKeyDown={(e) => {
              // Optional: prevent arrow up/down, +, -, e keys
              if (
                numberFields.includes(field.id) &&
                ["e", "E", "+", "-", "ArrowUp", "ArrowDown"].includes(e.key)
              ) {
                e.preventDefault();
              }
            }}
            className={
              numberFields.includes(field.id)
                ? "appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                : ""
            }
          />
        );
      })}
      </div>
    </div>
  );
}