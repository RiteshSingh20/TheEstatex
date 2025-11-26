import React from "react";
import { FormDataType, toTitleCase } from "../../pages/CostSheetFormProps";
import { State, City } from "../../types";
import { StampDutyRate } from "../CompareModal";
import LocationDropdown from "../ui/LocationDropdown";
import { useLocationData } from "../../hooks/useLocationData";

export function currentStepEditTab0(
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
          <div className="grid grid-cols-8 gap-2 text-sm font-medium text-neutral-700">
            <div>State *</div>
            <div>District *</div>
            <div>Pin Code *</div>
            <div>Land Parcel *</div>
            <div>Towers *</div>
            <div>Storey *</div>
            <div>Flats per Floor *</div>
            <div>Cosmo Project *</div>
          </div>
        </div>

        {/* Data Row */}
        <div className="bg-white border-x border-b rounded-b p-2">
          <div className="grid grid-cols-8 gap-2">
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
              <input
                type="text"
                value={String(formData.flatsPerFloor || "")}
                onChange={(e) => {
                  const filtered = e.target.value.replace(/[^0-9]/g, "");
                  setFormData((prev) => ({
                    ...prev,
                    flatsPerFloor: filtered,
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
  );
}
