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

export function currentStepEditTab3(
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
  setCustomAmenityInput: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >,
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
                  <div
                    key={`balcony-${typology}`}
                    className="bg-white p-3 rounded border"
                  >
                    <div className="font-medium text-sm mb-2 text-center">
                      {typology}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {areas.map((area) => {
                        const key = `${typology}-${area}`;
                        return (
                          <label
                            key={key}
                            className="flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded cursor-pointer hover:bg-gray-100"
                          >
                            <input
                              type="checkbox"
                              checked={
                                formData.balconyAreas?.includes(key) || false
                              }
                              onChange={(e) => {
                                const current = formData.balconyAreas || [];
                                const updated = e.target.checked
                                  ? [...current, key]
                                  : current.filter((k) => k !== key);
                                setFormData((prev) => ({
                                  ...prev,
                                  balconyAreas: updated,
                                }));
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
                  <div
                    key={`terrace-${typology}`}
                    className="bg-white p-3 rounded border"
                  >
                    <div className="font-medium text-sm mb-2 text-center">
                      {typology}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {areas.map((area) => {
                        const key = `${typology}-${area}`;
                        return (
                          <label
                            key={key}
                            className="flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded cursor-pointer hover:bg-gray-100"
                          >
                            <input
                              type="checkbox"
                              checked={
                                formData.terraceAreas?.includes(key) || false
                              }
                              onChange={(e) => {
                                const current = formData.terraceAreas || [];
                                const updated = e.target.checked
                                  ? [...current, key]
                                  : current.filter((k) => k !== key);
                                setFormData((prev) => ({
                                  ...prev,
                                  terraceAreas: updated,
                                }));
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
                        selectedStationIndex > 0
                          ? selectedStationIndex - 1
                          : -1;
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
                        const searchValue =
                          formData.station || stationSearchTerm;
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

          if (field.id === "pinCode") {
            return (
              <Input
                key={field.id}
                id={field.id}
                label={field.label}
                maxLength={6}
                value={String(formData["pinCode"] || "")}
                className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");

                  setFormData((prev) => ({
                    ...prev,
                    pinCode: val,
                    // Clear state/district when pin is cleared or incomplete
                    ...(val.length < 6 && {
                      state: "",
                      district: "",
                    }),
                  }));

                  // Fetch only if 6 digits
                  // if (val.length === 6) fetchLocationFromPin(val);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                    e.preventDefault();
                  }
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            );
          }

          if (field.id === "state") {
            return (
              <div key="state-district" className="col-span-1">
                <label className="block text-sm font-medium mb-1">
                  State & District
                </label>
                <div className="flex gap-1">
                  <select
                    id="state"
                    value={
                      formData.state
                        ? states.find((s) => s.name === formData.state)?.iso2 ||
                          formData.state
                        : selectedStateCode
                    }
                    onChange={handleStateChange}
                    className="w-1/2 border border-neutral-300 rounded px-2 py-2 text-sm"
                  >
                    <option value="">State</option>
                    {/* Show stored state value immediately if not in API data */}
                    {formData.state &&
                      !states.find((s) => s.name === formData.state) && (
                        <option value={formData.state}>{formData.state}</option>
                      )}
                    {states.map((state) => (
                      <option key={state.iso2} value={state.iso2}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                  <select
                    id="district"
                    value={String(formData.district || "")}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        district: e.target.value,
                      }))
                    }
                    disabled={!selectedStateCode && !formData.district}
                    className="w-1/2 border border-neutral-300 rounded px-2 py-2 text-sm disabled:bg-gray-100"
                  >
                    <option value="">District</option>
                    {/* Show stored district value immediately if not in API data */}
                    {formData.district &&
                      !cities.find((c) => c.name === formData.district) && (
                        <option value={formData.district}>
                          {formData.district}
                        </option>
                      )}
                    {cities.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          }

          if (field.id === "district") {
            return null; // Skip district as it's handled with state
          }

          if (field.type === "dropdown") {
            // Hide possessionYear if Ready to move is selected
            if (
              field.id === "possessionYear" &&
              formData.possessionMonth === "Ready to move"
            ) {
              return null;
            }
            return (
              <div key={field.id}>
                <label className="block text-sm font-medium mb-1">
                  {field.label}
                </label>
                <select
                  id={field.id}
                  value={
                    typeof value === "string" || typeof value === "number"
                      ? value
                      : ""
                  }
                  onChange={(e) => {
                    if (
                      field.id === "possessionMonth" &&
                      e.target.value === "Ready to move"
                    ) {
                      setFormData((prev) => ({
                        ...prev,
                        [field.id]: e.target.value,
                        possessionYear: "",
                        reraPossession: "",
                      }));
                    } else {
                      handleInputChange(e);
                    }
                  }}
                  className="w-full border border-neutral-300 rounded px-3 py-2"
                >
                  <option value="">Select</option>
                  {field.options!.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          if (field.type === "multi-select") {
            const selected = (formData[field.id] as string[]) || [];
            const customOpts = customAmenities?.[field.id] || [];
            const showCustom = expandedAmenities[field.id];

            return (
              <div key={field.id} className="col-span-2">
                <label className="block text-sm font-bold mb-1">
                  {field.label}
                </label>

                <div className="border rounded bg-white p-2">
                  {/* Amenity selection grid with Show More inside last default item */}
                  <div
                    className={`grid gap-2 max-h-[200px] overflow-y-auto p-2 ${
                      field.id === "locationHighlights"
                        ? "grid-cols-2 md:grid-cols-4"
                        : "grid-cols-5"
                    }`}
                  >
                    {[
                      ...(field.options || []),
                      ...(showCustom ? customOpts : []),
                    ]
                      .sort((a, b) => a.localeCompare(b))
                      .map((opt, idx) => {
                        const isCustom = customOpts.includes(opt);
                        const isChecked = selected.includes(opt);

                        return (
                          <div
                            key={opt}
                            className="flex flex-col text-sm space-y-1"
                          >
                            <label className="flex items-start space-x-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const next = e.target.checked
                                    ? [...selected, opt]
                                    : selected.filter((v) => v !== opt);

                                  setFormData((prev) => ({
                                    ...prev,
                                    [field.id]: next,
                                  }));
                                }}
                              />
                              <div className="flex-1">
                                <span className="break-words">{opt}</span>
                                {field.id === "locationHighlights" &&
                                  selected.includes(opt) && (
                                    <input
                                      type="text"
                                      placeholder="e.g.km/min"
                                      value={
                                        formData?.locationHighlightTimes?.[
                                          opt
                                        ] || ""
                                      }
                                      onChange={(e) =>
                                        setFormData((prev) => ({
                                          ...prev,
                                          locationHighlightTimes: {
                                            ...(prev.locationHighlightTimes ||
                                              {}),
                                            [opt]: e.target.value,
                                          },
                                        }))
                                      }
                                      onKeyDown={(e) => {
                                        if (
                                          e.key === "ArrowUp" ||
                                          e.key === "ArrowDown"
                                        ) {
                                          e.preventDefault();
                                        }
                                      }}
                                      className="ml-2 border px-2 py-1 rounded w-[80px] text-xs appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                    />
                                  )}
                              </div>
                            </label>
                          </div>
                        );
                      })}
                  </div>

                  {/* Show More/Less button */}
                  {customOpts.length > 0 && !showCustom && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedAmenities((prev) => ({
                          ...prev,
                          [field.id]: true,
                        }))
                      }
                      className="text-blue-600 text-sm mt-2"
                    >
                      + Show More
                    </button>
                  )}
                  {customOpts.length > 0 && showCustom && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedAmenities((prev) => ({
                          ...prev,
                          [field.id]: false,
                        }))
                      }
                      className="text-blue-600 text-sm mt-2"
                    >
                      - Show Less
                    </button>
                  )}

                  {/* Add Custom Amenity Button */}
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Button clicked for field:', field.id);
                        setCurrentAmenityField(field.id);
                        setShowAmenityModal(true);
                      }}
                      className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                      title={`Add Custom ${field.label.split(" ")[0]}`}
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          if (field.type === "multi-input") {
            const items = (formData[field.id] as string[]) || [];
            return (
              <div key={field.id}>
                <label className="block text-sm font-medium mb-1">
                  {field.label}
                </label>
                {items.map((item, i) => (
                  <Input
                    key={i}
                    id={`${field.id}-${i}`}
                    label={undefined}
                    value={item}
                    onChange={(e) => {
                      const next = [...items];
                      next[i] = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        [field.id]: next,
                      }));
                    }}
                  />
                ))}
                <button
                  type="button"
                  className="text-blue-600 text-sm mt-1"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      [field.id]: [...items, ""],
                    }))
                  }
                >
                  + Add Scheme
                </button>
              </div>
            );
          }

          if (field.id === "dateUpdateCostSheet") {
            const today = new Date().toISOString().split("T")[0];
            return (
              <div key={field.id}>
                <label className="block text-sm font-medium mb-1">
                  {field.label}
                </label>
                <input
                  type="date"
                  id={field.id}
                  value={today}
                  disabled
                  className="w-full border border-neutral-300 rounded px-3 py-2 bg-neutral-100 text-neutral-700"
                />
              </div>
            );
          }

          if (field.type === "date" && field.id !== "dateUpdateCostSheet") {
            // Hide reraPossession if Ready to move is selected
            if (
              field.id === "reraPossession" &&
              formData.possessionMonth === "Ready to move"
            ) {
              return null;
            }
            return (
              <div key={field.id}>
                <label className="block text-sm font-medium mb-1">
                  {field.label}
                </label>
                <input
                  type="date"
                  id={field.id}
                  value={(() => {
                    const value = formData[field.id];
                    if (!value) return "";

                    // If it's in 'Dec-2029' format, convert to YYYY-MM-DD
                    const monthYearMatch =
                      String(value).match(/^(\w{3})-(\d{4})$/);
                    if (monthYearMatch) {
                      const [, monthStr, year] = monthYearMatch;
                      const monthNames = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ];
                      const monthIndex = monthNames.indexOf(monthStr);
                      if (monthIndex !== -1) {
                        return `${year}-${String(monthIndex + 1).padStart(
                          2,
                          "0"
                        )}-01`;
                      }
                    }

                    // If already in YYYY-MM-DD format, return as is
                    if (String(value).match(/^\d{4}-\d{2}-\d{2}$/)) {
                      return String(value);
                    }

                    return "";
                  })()}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      [field.id]: e.target.value,
                    }));
                  }}
                  className="w-full border border-neutral-300 rounded px-3 py-2"
                />
              </div>
            );
          }

          if (field.id === "totalPackage") {
            return (
              <Input
                key={field.id}
                id={field.id}
                label={field.label}
                value={calculateTotalPackage()}
                type="text"
                disabled
              />
            );
          }

          // Handle possession year - hide if Ready to move is selected
          if (
            field.id === "possessionYear" &&
            formData.possessionMonth === "Ready to move"
          ) {
            return null;
          }

          // Special handling for RERA fields - show them together
          if (field.id === "mahaReraNumber") {
            const hasReraNumber =
              formData.mahaReraNumber &&
              String(formData.mahaReraNumber).trim() !== "";
            return (
              <React.Fragment key="rera-fields">
                <Input
                  id="mahaReraNumber"
                  label="Maha RERA Number"
                  value={String(formData.mahaReraNumber || "")}
                  type="text"
                  onChange={(e) => {
                    const processedValue = toTitleCase(e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      mahaReraNumber: processedValue,
                    }));
                  }}
                />
                {hasReraNumber && (
                  <Input
                    id="mahaReraLink"
                    label="Maha RERA Link"
                    value={String(formData.mahaReraLink || "")}
                    type="url"
                    placeholder="https://example.com/rera-link"
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        mahaReraLink: e.target.value,
                      }));
                    }}
                  />
                )}
              </React.Fragment>
            );
          }

          // Skip mahaReraLink as it's handled above
          if (field.id === "mahaReraLink") {
            return null;
          }

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
