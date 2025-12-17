import React from "react";
import { FormDataType, toTitleCase } from "../../pages/CostSheetFormProps";
import { State, City } from "../../types";
import { StampDutyRate } from "../CompareModal";
import LocationDropdown from "../ui/LocationDropdown";
import { useLocationData } from "../../hooks/useLocationData";

export function currentStepTab0(
  formData: FormDataType,
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>,
  states: State[],
  selectedStateCode: string,
  handleStateChange: (e: React.ChangeEvent<HTMLSelectElement>) => Promise<void>,
  stampRates: StampDutyRate[],
  setShowJurisdictionModal: React.Dispatch<React.SetStateAction<boolean>>,
  cities: City[],
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void,
  locationData?: {
    locationSuggestions: string[];
    subLocationSuggestions: string[];
    roadSuggestions: string[];
    landmarkSuggestions: string[];
    isLoading: boolean;
    searchLocations: (term: string) => void;
    searchSubLocations: (term: string) => void;
    searchRoads: (term: string) => void;
    searchLandmarks: (term: string) => void;
  }
): React.ReactNode {
  const {
    locationSuggestions = [],
    subLocationSuggestions = [],
    roadSuggestions = [],
    landmarkSuggestions = [],
    isLoading = false,
    searchLocations = () => {},
    searchSubLocations = () => {},
    searchRoads = () => {},
    searchLandmarks = () => {},
  } = locationData || {};
  return (
    <>
    <div className="space-y-4">
      {/* Project Basic Information Section */}
      <div className="bg-neutral-50 p-4 rounded-lg border">
        <div className="flex items-center mb-4">
          <span className="text-blue-600 mr-2">▶</span>
          <h3 className="text-lg font-medium text-neutral-800">
            Project Basic Information
          </h3>
        </div>

        {/* Header Row */}
        <div className="bg-neutral-100 p-2 rounded-t border">
          <div className="grid grid-cols-7 gap-2 text-sm font-medium text-neutral-700">
            <div>Update Date *</div>
            <div>Project Name *</div>
            <div>Developer Name *</div>
            <div>Location *</div>
            <div>Sub-Location *</div>
            <div>Road *</div>
            <div>Landmark *</div>
          </div>
        </div>

        {/* Data Row */}
        <div className="bg-white border-x border-b rounded-b p-2">
          <div className="grid grid-cols-7 gap-2">
            <div>
              <input
                type="date"
                value={new Date().toISOString().split("T")[0]}
                disabled
                className="w-full border border-neutral-300 rounded px-2 py-1 text-sm bg-neutral-100"
              />
            </div>
            <div>
              <input
                type="text"
                value={String(formData.projectName || "")}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    projectName: toTitleCase(e.target.value),
                  }));
                }}
                className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                required
              />
            </div>
            <div>
              <input
                type="text"
                value={String(formData.developerName || "")}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    developerName: toTitleCase(e.target.value),
                  }));
                }}
                className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                required
              />
            </div>
            <div>
              {locationData ? (
                <LocationDropdown
                  value={String(formData.location || "")}
                  onChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      location: value,
                    }));
                  }}
                  suggestions={locationSuggestions}
                  onSearch={searchLocations}
                  placeholder="Type location..."
                  isLoading={isLoading}
                />
              ) : (
                <input
                  type="text"
                  value={String(formData.location || "")}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      location: toTitleCase(e.target.value),
                    }));
                  }}
                  className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                  required
                />
              )}
            </div>
            <div>
              {locationData ? (
                <LocationDropdown
                  value={String(formData.subLocation || "")}
                  onChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      subLocation: value,
                    }));
                  }}
                  suggestions={subLocationSuggestions}
                  onSearch={searchSubLocations}
                  placeholder="Type sub-location..."
                  isLoading={isLoading}
                />
              ) : (
                <input
                  type="text"
                  value={String(formData.subLocation || "")}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      subLocation: toTitleCase(e.target.value),
                    }));
                  }}
                  className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                  required
                />
              )}
            </div>
            <div>
              {locationData ? (
                <LocationDropdown
                  value={String(formData.road || "")}
                  onChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      road: value,
                    }));
                  }}
                  suggestions={roadSuggestions}
                  onSearch={searchRoads}
                  placeholder="Type road..."
                  isLoading={isLoading}
                />
              ) : (
                <input
                  type="text"
                  value={String(formData.road || "")}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      road: toTitleCase(e.target.value),
                    }));
                  }}
                  className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                  required
                />
              )}
            </div>
            <div>
              {locationData ? (
                <LocationDropdown
                  value={String(formData.landmark || "")}
                  onChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      landmark: value,
                    }));
                  }}
                  suggestions={landmarkSuggestions}
                  onSearch={searchLandmarks}
                  placeholder="Type landmark..."
                  isLoading={isLoading}
                />
              ) : (
                <input
                  type="text"
                  value={String(formData.landmark || "")}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      landmark: toTitleCase(e.target.value),
                    }));
                  }}
                  className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                  required
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Address Details Section */}
      <div className="bg-neutral-50 p-4 rounded-lg border">
        <div className="flex items-center mb-4">
          <span className="text-blue-600 mr-2">▶</span>
          <h3 className="text-lg font-medium text-neutral-800">
            Address Details
          </h3>
        </div>

        {/* Header Row */}
        <div className="bg-neutral-100 p-2 rounded-t border">
          <div className="grid grid-cols-7 gap-2 text-sm font-medium text-neutral-700">
            <div>State *</div>
            <div>District *</div>
            <div>Pin Code *</div>
            <div>Land Parcel *</div>
            <div>Towers *</div>
            <div>Storey *</div>
            <div>Cosmo Project *</div>
          </div>
        </div>

        {/* Data Row */}
        <div className="bg-white border-x border-b rounded-b p-2">
          <div className="grid grid-cols-7 gap-2">
            <div>
              <select
                value={
                  formData.state
                    ? states.find((s) => s.name === formData.state)?.iso2 ||
                      formData.state
                    : selectedStateCode
                }
                onChange={handleStateChange}
                className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                required
              >
                <option value="">State</option>
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
            </div>
            <div>
              <select
                value={String(formData.district || "")}
                onChange={(e) => {
                  const selectedDistrict = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    district: selectedDistrict,
                  }));
                  
                  // Modal will show automatically based on district selection
                }}
                disabled={!selectedStateCode && !formData.district}
                className="w-full border border-neutral-300 rounded px-2 py-1 text-sm disabled:bg-gray-100"
                required
              >
                <option value="">District</option>
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
            <div>
              <input
                type="text"
                value={String(formData.pinCode || "")}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setFormData((prev) => ({
                    ...prev,
                    pinCode: val,
                  }));
                }}
                maxLength={6}
                className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                required
              />
            </div>
            <div>
              <input
                type="text"
                value={String(formData.landParcel || "")}
                onChange={(e) => {
                  const filtered = e.target.value
                    .replace(/[^0-9.]/g, "")
                    .replace(/(\..*)\./g, "$1");
                  setFormData((prev) => ({
                    ...prev,
                    landParcel: filtered,
                  }));
                }}
                className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                required
              />
            </div>
            <div>
              <input
                type="text"
                value={String(formData.towers || "")}
                onChange={(e) => {
                  const filtered = e.target.value.replace(/[^0-9]/g, "");
                  setFormData((prev) => ({
                    ...prev,
                    towers: filtered,
                  }));
                }}
                className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                required
              />
            </div>
            <div>
              <input
                type="text"
                value={String(formData.storey || "")}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    storey: e.target.value,
                  }));
                }}
                className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                required
              />
            </div>
            <div>
              <select
                value={String(formData.isCosmo || "")}
                onChange={handleInputChange}
                id="isCosmo"
                className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                required
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Jurisdiction Modal */}
    {formData.district && stampRates.length > 0 && !stampRates.some(rate => rate.jurisdiction?.toLowerCase() === formData.district.toLowerCase()) && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 w-full max-w-md mx-4 animate-in fade-in zoom-in">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L4.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-red-600">
              Jurisdiction Data Missing
            </h3>
          </div>

          <p className="text-gray-700 mb-3">
            We couldn't find jurisdiction data required to calculate the Stamp
            Duty for the selected district:
            <span className="font-medium text-gray-900 ml-1">
              {formData.district}
            </span>
            .
          </p>

          <p className="text-gray-600 mb-6">
            Please verify the district selection or contact your administrator
            to update the jurisdiction details.
          </p>

          <div className="flex justify-end">
            <button
              onClick={() => setFormData(prev => ({ ...prev, district: '' }))}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
