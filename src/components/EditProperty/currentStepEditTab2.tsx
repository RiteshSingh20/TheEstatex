import React from "react";
import { FormDataType } from "../../pages/CostSheetFormProps";

export function currentStepEditTab2(
  formData: FormDataType,
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void,
  setFloorRiseConfig: React.Dispatch<
    React.SetStateAction<{
      startsFrom: string;
      rate: string;
      fixedRateStartsFrom: string;
      typologyRates: Record<string, string>;
    }>
  >,
  setFloorBandConfig: React.Dispatch<
    React.SetStateAction<
      { fromFloor: string; toFloor: string; rates: Record<string, string> }[]
    >
  >,
  formatIndianCurrency: (value: string | number) => string,
  parseIndianCurrency: (value: string) => string,
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>,
  floorRiseConfig: {
    startsFrom: string;
    rate: string;
    fixedRateStartsFrom: string;
    typologyRates: Record<string, string>;
  },
  subTabData: {
    0: {
      wingBuildingNo: string;
      projectStatus: string;
      type: string;
      developerPossession: string;
      reraPossession: string;
      mahaReraNumber: string;
      mahaReraLink: string;
      psfIncludesParking?: boolean;
      psfIncludesFixedComponent?: boolean;
      pricingConfigs: {
        typology: string;
        saleableArea: string;
        reraCarpet: string;
        psfRate: string;
        avRate: string;
        fixedComponent: string;
        possessionCharges: string;
        totalPackage: string;
        negotiationScope: string;
        availability: string;
        unitPlan: null;
      }[];
    };
  },
  floorBandConfig: {
    fromFloor: string;
    toFloor: string;
    rates: Record<string, string>;
  }[]
): React.ReactNode {
  return (
    <div className="space-y-6">
      {/* Payment Configuration Section */}
      <div className="bg-neutral-50 p-4 rounded-lg border">
        <div className="flex items-center mb-4">
          <span className="text-blue-600 mr-2">▶</span>
          <h3 className="text-lg font-medium text-neutral-800">
            Payment Configuration
          </h3>
        </div>

        {/* Header Row */}
        <div className="bg-neutral-100 p-2 rounded-t border">
          <div className="grid grid-cols-2 gap-4 text-sm font-medium text-neutral-700">
            <div>Floor Rise / Floor Band</div>
            <div>Legal Charges</div>
          </div>
        </div>

        {/* Data Row */}
        <div className="bg-white border-x border-b rounded-b p-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <select
                id="floorRise"
                value={String(formData.floorRise || "")}
                onChange={(e) => {
                  handleInputChange(e);
                  // Reset floor rise config when selection changes
                  setFloorRiseConfig({
                    startsFrom: "",
                    rate: "",
                    fixedRateStartsFrom: "",
                    typologyRates: {},
                  });
                  setFloorBandConfig([
                    {
                      fromFloor: "",
                      toFloor: "",
                      rates: {},
                    },
                  ]);
                }}
                className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
              >
                <option value="">Select</option>
                <option value="Floor Rise">Floor Rise</option>
                <option value="FR - Fixed Rate">FR - Fixed Rate</option>
                <option value="Floor Band">Floor Band</option>
              </select>
            </div>
            <div>
              <input
                type="text"
                id="registration"
                value={formatIndianCurrency(formData.registration || "")}
                onChange={(e) => {
                  const numericValue = parseIndianCurrency(e.target.value);
                  setFormData((prev) => ({
                    ...prev,
                    registration: numericValue,
                  }));
                }}
                className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Floor Rise Configuration */}
        {formData.floorRise === "Floor Rise" && (
          <div className="mt-4 bg-blue-50 p-4 rounded border">
            <h4 className="text-md font-medium text-neutral-800 mb-3 pb-2 border-b border-neutral-300">
              Floor Rise Configuration
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Floor Rise Starts From
                </label>
                <input
                  type="number"
                  value={floorRiseConfig.startsFrom}
                  onChange={(e) =>
                    setFloorRiseConfig((prev) => ({
                      ...prev,
                      startsFrom: e.target.value,
                    }))
                  }
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="Floor number"
                  className="w-full border border-neutral-300 rounded px-2 py-1 text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Floor Rise Rate
                </label>
                <input
                  type="text"
                  value={formatIndianCurrency(floorRiseConfig.rate)}
                  onChange={(e) =>
                    setFloorRiseConfig((prev) => ({
                      ...prev,
                      rate: parseIndianCurrency(e.target.value),
                    }))
                  }
                  className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* FR - Fixed Rate Configuration */}
        {formData.floorRise === "FR - Fixed Rate" && (
          <div className="mt-4 bg-green-50 p-4 rounded border">
            <h4 className="text-md font-medium text-neutral-800 mb-3 pb-2 border-b border-neutral-300">
              FR-Fixed Rate Configuration
            </h4>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Fixed Rate Floor Rise Starts from
              </label>
              <input
                type="number"
                value={floorRiseConfig.fixedRateStartsFrom}
                onChange={(e) =>
                  setFloorRiseConfig((prev) => ({
                    ...prev,
                    fixedRateStartsFrom: e.target.value,
                  }))
                }
                onWheel={(e) => e.currentTarget.blur()}
                placeholder="Floor number"
                className="w-full border border-neutral-300 rounded px-2 py-1 text-sm max-w-xs [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
            </div>

            {/* Typology Table */}
            <div className="bg-white rounded border">
              <div className="bg-neutral-100 p-2 rounded-t border-b">
                <div className="grid grid-cols-2 gap-4 text-sm font-medium text-neutral-700">
                  <div>Typology</div>
                  <div>Fixed Floor Rise Rate</div>
                </div>
              </div>
              <div className="p-2">
                {(() => {
                  // Get unique typologies from all sub-tabs
                  const uniqueTypologies = new Set<string>();
                  Object.values(subTabData).forEach((tabData) => {
                    tabData?.pricingConfigs?.forEach((config) => {
                      if (config.typology) {
                        uniqueTypologies.add(config.typology);
                      }
                    });
                  });

                  const typologies = Array.from(uniqueTypologies);

                  if (typologies.length === 0) {
                    return (
                      <div className="text-sm text-neutral-500 text-center py-4">
                        No typologies found. Please add typologies in the
                        Pricing & Buildings tab first.
                      </div>
                    );
                  }

                  // Sort typologies in the specified order
                  const typologyOrder = [
                    "1 RK",
                    "1 BHK",
                    "1.5 BHK",
                    "2 BHK",
                    "2.5 BHK",
                    "3 BHK",
                    "3.5 BHK",
                    "4 BHK",
                    "4.5 BHK",
                    "5 BHK",
                    "Penthouse",
                    "Row House",
                    "Bungalow",
                    "Villa",
                  ];
                  const sortedTypologies = typologies.sort((a, b) => {
                    const indexA = typologyOrder.indexOf(a);
                    const indexB = typologyOrder.indexOf(b);
                    if (indexA === -1 && indexB === -1)
                      return a.localeCompare(b);
                    if (indexA === -1) return 1;
                    if (indexB === -1) return -1;
                    return indexA - indexB;
                  });

                  return sortedTypologies.map((typology) => (
                    <div key={typology} className="grid grid-cols-2 gap-4 mb-2">
                      <div className="flex items-center text-sm">
                        {typology}
                      </div>
                      <div>
                        <input
                          type="text"
                          value={formatIndianCurrency(
                            floorRiseConfig.typologyRates[typology] || ""
                          )}
                          onChange={(e) =>
                            setFloorRiseConfig((prev) => ({
                              ...prev,
                              typologyRates: {
                                ...prev.typologyRates,
                                [typology]: parseIndianCurrency(e.target.value),
                              },
                            }))
                          }
                          className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Floor Band Configuration */}
        {formData.floorRise === "Floor Band" && (
          <div className="mt-4 bg-yellow-50 p-4 rounded border">
            <h4 className="text-md font-medium text-neutral-800 mb-3 pb-2 border-b border-neutral-300">
              Floor Band Configuration
            </h4>

            {(() => {
              // Get unique typologies from all sub-tabs
              const uniqueTypologies = new Set<string>();
              Object.values(subTabData).forEach((tabData) => {
                tabData?.pricingConfigs?.forEach((config) => {
                  if (config.typology) {
                    uniqueTypologies.add(config.typology);
                  }
                });
              });
              // Sort typologies in the specified order
              const typologyOrder = [
                "1 RK",
                "1 BHK",
                "1.5 BHK",
                "2 BHK",
                "2.5 BHK",
                "3 BHK",
                "3.5 BHK",
                "4 BHK",
                "4.5 BHK",
                "5 BHK",
                "Penthouse",
                "Row House",
                "Bungalow",
                "Villa",
              ];
              const typologies = Array.from(uniqueTypologies).sort((a, b) => {
                const indexA = typologyOrder.indexOf(a);
                const indexB = typologyOrder.indexOf(b);
                if (indexA === -1 && indexB === -1) return a.localeCompare(b);
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
              });

              if (typologies.length === 0) {
                return (
                  <div className="text-sm text-neutral-500 text-center py-4">
                    No typologies found. Please add typologies in the Pricing &
                    Buildings tab first.
                  </div>
                );
              }

              return (
                <div className="bg-white rounded border">
                  {/* Header Row */}
                  <div className="bg-neutral-100 p-2 rounded-t border-b">
                    <div
                      className={`grid gap-4 text-sm font-medium text-neutral-700 text-center`}
                      style={{
                        gridTemplateColumns: `1fr auto 1fr ${typologies
                          .map(() => "1fr")
                          .join(" ")}`,
                      }}
                    >
                      <div>From Floor</div>
                      <div></div>
                      <div>To Floor</div>
                      {typologies.map((typology) => (
                        <div key={typology}>Rate for ({typology})</div>
                      ))}
                    </div>
                  </div>

                  {/* Data Rows */}
                  <div className="bg-white border-x border-b rounded-b">
                    {floorBandConfig.map((band, index) => (
                      <div
                        key={index}
                        className={`p-2 ${
                          index > 0 ? "border-t border-neutral-200" : ""
                        }`}
                      >
                        <div
                          className={`grid gap-4 items-center`}
                          style={{
                            gridTemplateColumns: `1fr auto 1fr ${typologies
                              .map(() => "1fr")
                              .join(" ")}`,
                          }}
                        >
                          <div>
                            {(() => {
                              const currentFromFloor =
                                parseInt(band.fromFloor) || 0;
                              const prevToFloor =
                                index > 0
                                  ? parseInt(
                                      floorBandConfig[index - 1].toFloor
                                    ) || 0
                                  : 0;
                              const isInvalid =
                                band.fromFloor &&
                                index > 0 &&
                                currentFromFloor <= prevToFloor;

                              return (
                                <input
                                  type="number"
                                  value={band.fromFloor}
                                  onChange={(e) => {
                                    const newConfig = [...floorBandConfig];
                                    newConfig[index].fromFloor = e.target.value;
                                    setFloorBandConfig(newConfig);
                                  }}
                                  onWheel={(e) => e.currentTarget.blur()}
                                  placeholder="e.g., 1"
                                  title={
                                    isInvalid
                                      ? "Must be greater than previous To Floor"
                                      : ""
                                  }
                                  className={`w-full border rounded px-2 py-1 text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] ${
                                    isInvalid
                                      ? "border-red-500 bg-red-50 text-red-700"
                                      : "border-neutral-300"
                                  }`}
                                />
                              );
                            })()}
                          </div>
                          <div className="text-sm text-neutral-500">to</div>
                          <div>
                            {(() => {
                              const currentToFloor =
                                parseInt(band.toFloor) || 0;
                              const currentFromFloor =
                                parseInt(band.fromFloor) || 0;
                              const prevToFloor =
                                index > 0
                                  ? parseInt(
                                      floorBandConfig[index - 1].toFloor
                                    ) || 0
                                  : 0;
                              const isInvalid =
                                band.toFloor &&
                                (currentToFloor <= currentFromFloor ||
                                  (index > 0 &&
                                    currentToFloor <= prevToFloor + 1));
                              const errorMsg =
                                currentToFloor <= currentFromFloor
                                  ? "Must be greater than From Floor"
                                  : "Must be > previous To Floor + 2";

                              return (
                                <input
                                  type="number"
                                  value={band.toFloor}
                                  onChange={(e) => {
                                    const newConfig = [...floorBandConfig];
                                    newConfig[index].toFloor = e.target.value;
                                    setFloorBandConfig(newConfig);
                                  }}
                                  onWheel={(e) => e.currentTarget.blur()}
                                  placeholder="e.g., 5"
                                  title={isInvalid ? errorMsg : ""}
                                  className={`w-full border rounded px-2 py-1 text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] ${
                                    isInvalid
                                      ? "border-red-500 bg-red-50 text-red-700"
                                      : "border-neutral-300"
                                  }`}
                                />
                              );
                            })()}
                          </div>
                          {typologies.map((typology) => (
                            <div key={typology}>
                              <input
                                type="text"
                                value={formatIndianCurrency(
                                  band.rates[typology] || ""
                                )}
                                onChange={(e) => {
                                  const newConfig = [...floorBandConfig];
                                  newConfig[index].rates[typology] =
                                    parseIndianCurrency(e.target.value);
                                  setFloorBandConfig(newConfig);
                                }}
                                placeholder="Total Amount from base Band"
                                className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add/Remove buttons */}
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setFloorBandConfig([
                          ...floorBandConfig,
                          {
                            fromFloor: "",
                            toFloor: "",
                            rates: {},
                          },
                        ]);
                      }}
                      className="w-8 h-8 bg-green-500 text-white rounded flex items-center justify-center hover:bg-green-600 font-bold"
                    >
                      +
                    </button>
                    {floorBandConfig.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newConfig = floorBandConfig.slice(0, -1);
                          setFloorBandConfig(newConfig);
                        }}
                        className="w-8 h-8 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600 font-bold"
                      >
                        -
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Investment & Additional Information Section */}
      <div className="bg-neutral-50 p-4 rounded-lg border">
        <div className="flex items-center mb-4">
          <span className="text-blue-600 mr-2">▶</span>
          <h3 className="text-lg font-medium text-neutral-800">
            Investment & Additional Information
          </h3>
        </div>

        {/* Header Row */}
        <div className="bg-neutral-100 p-2 rounded-t border">
          <div className="text-sm font-medium text-neutral-700">
            Description
          </div>
        </div>

        {/* Data Row */}
        <div className="bg-white border-x border-b rounded-b p-2">
          <textarea
            id="description"
            value={String(formData.description || "")}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                description: e.target.value,
              }));
            }}
            rows={4}
            className="w-full border border-neutral-300 rounded px-2 py-1 text-sm resize-vertical"
            placeholder="Enter project description..."
          />
        </div>
      </div>
    </div>
  );
}
