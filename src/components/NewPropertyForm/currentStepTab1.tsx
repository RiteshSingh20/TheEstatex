import React from "react";
import { FormDataType } from "../../pages/CostSheetFormProps";
import { StampDutyRate } from "../CompareModal";
import { calculatePricingTotal } from "../../lib/propertyFormLogic";
import { calculateBaseAmountWithFixedComponent } from "../../lib/fixedComponentLogic";

// Enhanced calculation function with EXACT SAME LOGIC as HTML file
const calculateTotalPackageEnhanced = (
  config: {
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
  },
  tabData: any,
  formData: FormDataType,
  parseIndianCurrency: (value: string) => string,
  formatIndianCurrency: (value: string | number) => string
): string => {
  const saleableArea = parseFloat(config.saleableArea) || 0;
  const psfRate = parseFloat(parseIndianCurrency(config.psfRate || "")) || 0;
  const avRate = parseFloat(parseIndianCurrency(config.avRate || "")) || 0;
  const fixedComponent = parseFloat(parseIndianCurrency(config.fixedComponent || "")) || 0;
  const possessionCharges = parseFloat(parseIndianCurrency(config.possessionCharges || "")) || 0;
  const legalCharges = parseFloat(parseIndianCurrency(formData.registration || "")) || 0;

  if (saleableArea && avRate) {
    const includesFixedComponent = tabData?.psfIncludesFixedComponent || false;
    const projectStatus = tabData?.projectStatus || "";
    const typology = config.typology || "";
    
    // 1. Base Amount calculation - EXACT SAME AS HTML
    let baseAmount;
    if (includesFixedComponent) {
      // When checkbox is checked: baseAmount = (area * rate) - fixedComponent
      baseAmount = (saleableArea * avRate) - fixedComponent;
    } else {
      // When checkbox is unchecked: baseAmount = area * rate
      baseAmount = saleableArea * avRate;
    }
    
    // 2. Stamp Duty (7% of base amount) - EXACT SAME AS HTML
    const stampDuty = baseAmount * 0.07;
    
    // 3. GST calculation based on project status - EXACT SAME AS HTML
    let gst = 0;
    if (projectStatus !== 'OC Received') {
      const gstRate = baseAmount > 4500000 ? 0.05 : 0.01;
      gst = baseAmount * gstRate;
    }
    
    // 4. Registration Fee calculation - EXACT SAME AS HTML
    const isJodi = typology.toLowerCase().includes('jodi');
    let registrationFee = 0;
    if (baseAmount > 0) {
      if (baseAmount < 3000000) {
        registrationFee = Math.max(100, baseAmount * 0.01);
        if (isJodi) registrationFee *= 2;
      } else {
        registrationFee = isJodi ? 60000 : 30000;
      }
    }
    
    // 8. Per Sq Ft Difference - EXACT SAME AS HTML
    const perSqFtDifference = saleableArea * (psfRate - avRate);
    
    // Final Total Calculation - EXACT SAME AS HTML
    // Fixed Component is always added back to the total regardless of checkbox state
    const total = baseAmount + gst + stampDuty + registrationFee + possessionCharges + fixedComponent + perSqFtDifference + legalCharges;
    
    return formatIndianCurrency(Math.round(total));
  }
  return "";
};

export function currentStepTab1(
  subTabs: { id: number; name: string }[],
  setActiveSubTab: React.Dispatch<React.SetStateAction<number>>,
  activeSubTab: number,
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
      numberOfParkingIncluded?: string;
      parkingCharges?: string;
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
  setSubTabData: React.Dispatch<
    React.SetStateAction<{
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
        numberOfParkingIncluded?: string;
        parkingCharges?: string;
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
    }>
  >,
  setSubTabs: React.Dispatch<
    React.SetStateAction<{ id: number; name: string }[]>
  >,
  formatIndianCurrency: (value: string | number) => string,
  parseIndianCurrency: (value: string) => string,
  stampRates: StampDutyRate[],
  formData: FormDataType
): React.ReactNode {
  
  // Enhanced total package calculation function - EXACT SAME LOGIC AS HTML
  const calculateTotalPackage = (
    config: {
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
    },
    tabId: number,
    includesFixedComponentOverride?: boolean
  ): string => {
    return calculateTotalPackageEnhanced(
      config,
      typeof includesFixedComponentOverride === 'boolean'
        ? { ...subTabData[tabId], psfIncludesFixedComponent: includesFixedComponentOverride }
        : subTabData[tabId],
      formData,
      parseIndianCurrency,
      formatIndianCurrency
    );
  };

  // Function to handle changes that require recalculation
  const handlePricingChange = (
    field: keyof typeof subTabData[0]['pricingConfigs'][0],
    value: string,
    tabId: number,
    configIndex: number
  ) => {
    setSubTabData((prev) => {
      const newConfigs = [...(prev[tabId]?.pricingConfigs || [])];
      newConfigs[configIndex] = {
        ...newConfigs[configIndex],
        [field]: value,
      };

      // Recalculate total package when relevant fields change (include typology) - Enhanced with HTML logic
      if (['saleableArea', 'psfRate', 'avRate', 'fixedComponent', 'possessionCharges', 'typology'].includes(field)) {
        const updatedConfig = newConfigs[configIndex];
        newConfigs[configIndex].totalPackage = calculateTotalPackageEnhanced(
          updatedConfig,
          prev[tabId],
          formData,
          parseIndianCurrency,
          formatIndianCurrency
        );
      }

      return {
        ...prev,
        [tabId]: {
          ...prev[tabId],
          pricingConfigs: newConfigs,
        },
      };
    });
  };

  // Function to handle checkbox changes that affect all pricing configs
  const handleCheckboxChange = (field: 'psfIncludesParking' | 'psfIncludesFixedComponent', value: boolean, tabId: number) => {
    setSubTabData((prev) => {
      const updatedData = {
        ...prev,
        [tabId]: {
          ...prev[tabId],
          [field]: value,
        },
      };

      // Recalculate all total packages when checkbox changes - Enhanced with HTML logic
      const newConfigs = updatedData[tabId]?.pricingConfigs.map(config => ({
        ...config,
        // pass the new checkbox value so calculation uses the updated state immediately
        totalPackage: calculateTotalPackageEnhanced(
          config,
          { ...updatedData[tabId], [field]: value },
          formData,
          parseIndianCurrency,
          formatIndianCurrency
        )
      })) || [];

      return {
        ...updatedData,
        [tabId]: {
          ...updatedData[tabId],
          pricingConfigs: newConfigs,
        },
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs for Pricing & Buildings */}
      <div className="border-b border-neutral-200">
        <nav className="flex space-x-8">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeSubTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Sub-tab Content */}
      {subTabs.map(
        (tab) =>
          activeSubTab === tab.id && (
            <div
              key={tab.id}
              className="border-2 border-gray-300 rounded-lg p-6 space-y-6"
            >
              {/* Wing / Building Details Section */}
              <div className="bg-neutral-50 p-4 rounded-lg border">
                <div className="flex items-center mb-4">
                  <span className="text-blue-600 mr-2">▶</span>
                  <h3 className="text-lg font-medium text-neutral-800">
                    Wing / Building Details
                  </h3>
                </div>

                {/* Header Row */}
                <div className="bg-neutral-100 p-2 rounded-t border">
                  <div className="grid grid-cols-7 gap-4 text-sm font-medium text-neutral-700">
                    <div>Bldg No./Phase</div>
                    <div>Project Type</div>
                    <div>Project Status</div>
                    <div>Developer Possession</div>
                    <div>RERA Number</div>
                    <div>RERA Possession</div>
                    <div>RERA URL</div>
                  </div>
                </div>

                {/* Data Row */}
                <div className="bg-white border-x border-b rounded-b p-2">
                  <div className="grid grid-cols-7 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="e.g., Bldg 1, Phase 4"
                        value={subTabData[tab.id]?.wingBuildingNo || ""}
                        onChange={(e) =>
                          setSubTabData((prev) => ({
                            ...prev,
                            [tab.id]: {
                              ...prev[tab.id],
                              wingBuildingNo: e.target.value,
                            },
                          }))
                        }
                        className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <select
                        value={subTabData[tab.id]?.type || ""}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setSubTabData((prev) => ({
                            ...prev,
                            [tab.id]: {
                              ...prev[tab.id],
                              type: newValue,
                              ...(newValue === "Pre-launch" && {
                                projectStatus: "",
                                reraPossession: "",
                                mahaReraNumber: "",
                                mahaReraLink: "",
                              }),
                            },
                          }));

                          // Recalculate totals when project type changes - Enhanced with HTML logic
                          if (subTabData[tab.id]?.pricingConfigs) {
                            const newConfigs = subTabData[tab.id].pricingConfigs.map(config => ({
                              ...config,
                              totalPackage: calculateTotalPackageEnhanced(
                                config,
                                { ...subTabData[tab.id], type: newValue },
                                formData,
                                parseIndianCurrency,
                                formatIndianCurrency
                              )
                            }));
                            setSubTabData(prev => ({
                              ...prev,
                              [tab.id]: {
                                ...prev[tab.id],
                                pricingConfigs: newConfigs,
                              },
                            }));
                          }
                        }}
                        className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="">Select</option>
                        <option value="New">New</option>
                        <option value="Pre-launch">Pre-launch</option>
                        <option value="Redevelopment">Redevelopment</option>
                        <option value="SRA">SRA</option>
                      </select>
                    </div>
                    <div>
                      <select
                        value={subTabData[tab.id]?.projectStatus || ""}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setSubTabData((prev) => ({
                            ...prev,
                            [tab.id]: {
                              ...prev[tab.id],
                              projectStatus: newValue,
                              ...((newValue === "Ready to Move" ||
                                newValue === "OC Received") && {
                                developerPossession: "",
                                reraPossession: "",
                              }),
                            },
                          }));

                          // Recalculate totals when project status changes (affects GST) - Enhanced with HTML logic
                          if (subTabData[tab.id]?.pricingConfigs) {
                            const newConfigs = subTabData[tab.id].pricingConfigs.map(config => ({
                              ...config,
                              totalPackage: calculateTotalPackageEnhanced(
                                config,
                                { ...subTabData[tab.id], projectStatus: newValue },
                                formData,
                                parseIndianCurrency,
                                formatIndianCurrency
                              )
                            }));
                            setSubTabData(prev => ({
                              ...prev,
                              [tab.id]: {
                                ...prev[tab.id],
                                pricingConfigs: newConfigs,
                              },
                            }));
                          }
                        }}
                        disabled={subTabData[tab.id]?.type === "Pre-launch"}
                        className="w-full border border-neutral-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">Select</option>
                        <option value="Under Construction">
                          Under Construction
                        </option>
                        <option value="Ready to Move">Ready to Move</option>
                        <option value="OC Received">OC Received</option>
                      </select>
                    </div>
                    <div>
                      <input
                        type="date"
                        value={subTabData[tab.id]?.developerPossession || ""}
                        onChange={(e) =>
                          setSubTabData((prev) => ({
                            ...prev,
                            [tab.id]: {
                              ...prev[tab.id],
                              developerPossession: e.target.value,
                            },
                          }))
                        }
                        disabled={
                          subTabData[tab.id]?.projectStatus ===
                            "Ready to Move" ||
                          subTabData[tab.id]?.projectStatus === "OC Received"
                        }
                        className="w-full border border-neutral-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={subTabData[tab.id]?.mahaReraNumber || ""}
                        onChange={(e) => {
                          setSubTabData((prev) => ({
                            ...prev,
                            [tab.id]: {
                              ...prev[tab.id],
                              mahaReraNumber: e.target.value,
                            },
                          }));
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value.trim()) {
                            setSubTabs((prev) =>
                              prev.map((t) =>
                                t.id === tab.id
                                  ? {
                                      ...t,
                                      name: value.trim(),
                                    }
                                  : t
                              )
                            );
                          } else {
                            const tabIndex = subTabs.findIndex(
                              (t) => t.id === tab.id
                            );
                            setSubTabs((prev) =>
                              prev.map((t) =>
                                t.id === tab.id
                                  ? {
                                      ...t,
                                      name: `RERA-${tabIndex + 1}`,
                                    }
                                  : t
                              )
                            );
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Tab") {
                            const value = e.currentTarget.value;
                            if (value.trim()) {
                              setSubTabs((prev) =>
                                prev.map((t) =>
                                  t.id === tab.id
                                    ? {
                                        ...t,
                                        name: value.trim(),
                                      }
                                    : t
                                )
                              );
                            } else {
                              const tabIndex = subTabs.findIndex(
                                (t) => t.id === tab.id
                              );
                              setSubTabs((prev) =>
                                prev.map((t) =>
                                  t.id === tab.id
                                    ? {
                                        ...t,
                                        name: `RERA-${tabIndex + 1}`,
                                      }
                                    : t
                                )
                              );
                            }
                          }
                        }}
                        disabled={subTabData[tab.id]?.type === "Pre-launch"}
                        className="w-full border border-neutral-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <input
                        type="date"
                        value={subTabData[tab.id]?.reraPossession || ""}
                        onChange={(e) =>
                          setSubTabData((prev) => ({
                            ...prev,
                            [tab.id]: {
                              ...prev[tab.id],
                              reraPossession: e.target.value,
                            },
                          }))
                        }
                        disabled={
                          subTabData[tab.id]?.projectStatus ===
                            "Ready to Move" ||
                          subTabData[tab.id]?.projectStatus === "OC Received" ||
                          subTabData[tab.id]?.type === "Pre-launch"
                        }
                        className="w-full border border-neutral-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <input
                        type="url"
                        value={subTabData[tab.id]?.mahaReraLink || ""}
                        onChange={(e) =>
                          setSubTabData((prev) => ({
                            ...prev,
                            [tab.id]: {
                              ...prev[tab.id],
                              mahaReraLink: e.target.value,
                            },
                          }))
                        }
                        disabled={subTabData[tab.id]?.type === "Pre-launch"}
                        className="w-full border border-neutral-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Configuration Section */}
              <div className="bg-neutral-50 p-4 rounded-lg border">
                <div className="flex items-center mb-4">
                  <span className="text-blue-600 mr-2">▶</span>
                  <h3 className="text-lg font-medium text-neutral-800">
                    Pricing Configuration
                  </h3>
                </div>

                {/* Header Row */}
                <div className="bg-neutral-100 p-2 rounded-t border">
                  <div
                    className="grid gap-4 text-sm font-medium text-neutral-700 text-center"
                    style={{
                      gridTemplateColumns:
                        "1.5fr 1fr 1fr 1fr 1fr 1fr 1fr 1.5fr 1fr 1.2fr 1fr",
                    }}
                  >
                    <div>Typology</div>
                    <div>Saleable Area</div>
                    <div>RERA Carpet</div>
                    <div>Per Sq. ft. Rate</div>
                    <div>Agreement Value Rate</div>
                    <div>Fixed Component</div>
                    <div>Possession Charges</div>
                    <div>Total Package</div>
                    <div>Negotiation Scope</div>
                    <div>Availability</div>
                    <div>
                      Unit
                      <br />
                      Plan
                    </div>
                  </div>
                </div>

                {/* Data Rows */}
                <div className="bg-white border-x border-b rounded-b">
                  {(subTabData[tab.id]?.pricingConfigs || []).map(
                    (config, index) => (
                      <div
                        key={index}
                        className={`p-2 ${
                          index > 0 ? "border-t border-neutral-200" : ""
                        }`}
                      >
                        <div
                          className="grid gap-4"
                          style={{
                            gridTemplateColumns:
                              "1.5fr 1fr 1fr 1fr 1fr 1fr 1fr 1.5fr 1fr 1.2fr 1fr",
                          }}
                        >
                          <div>
                            <select
                              value={config.typology}
                              onChange={(e) => {
                                handlePricingChange('typology', e.target.value, tab.id, index);
                              }}
                              className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                            >
                              <option value="">Select</option>
                              <option value="1 RK">1 RK</option>
                              <option value="1 BHK">1 BHK</option>
                              <option value="1.5 BHK">1.5 BHK</option>
                              <option value="2 BHK">2 BHK</option>
                              <option value="2.5 BHK">2.5 BHK</option>
                              <option value="3 BHK">3 BHK</option>
                              <option value="3.5 BHK">3.5 BHK</option>
                              <option value="4 BHK">4 BHK</option>
                              <option value="4.5 BHK">4.5 BHK</option>
                              <option value="5 BHK">5 BHK</option>
                              <option value="1 + 1 Jodi">1 + 1 Jodi</option>
                              <option value="1 + 2 Jodi">1 + 2 Jodi</option>
                              <option value="2 + 2 Jodi">2 + 2 Jodi</option>
                              <option value="2 + 3 Jodi">2 + 3 Jodi</option>
                              <option value="3 + 3 Jodi">3 + 3 Jodi</option>
                              <option value="Penthouse / Duplex">Penthouse / Duplex</option>
                              <option value="Row House">Row House</option>
                              <option value="Bungalow">Bungalow</option>
                              <option value="Villa">Villa</option>
                            </select>
                          </div>
                          <div>
                            <input
                              type="number"
                              value={config.saleableArea}
                              onChange={(e) => {
                                handlePricingChange('saleableArea', e.target.value, tab.id, index);
                              }}
                              onWheel={(e) => e.currentTarget.blur()}
                              className="w-full border border-neutral-300 rounded px-2 py-1 text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              value={config.reraCarpet}
                              onChange={(e) => {
                                handlePricingChange('reraCarpet', e.target.value, tab.id, index);
                              }}
                              onWheel={(e) => e.currentTarget.blur()}
                              className="w-full border border-neutral-300 rounded px-2 py-1 text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={formatIndianCurrency(config.psfRate)}
                              onChange={(e) => {
                                const numericValue = parseIndianCurrency(
                                  e.target.value
                                );
                                handlePricingChange('psfRate', numericValue, tab.id, index);
                              }}
                              className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={formatIndianCurrency(config.avRate)}
                              onChange={(e) => {
                                const numericValue = parseIndianCurrency(
                                  e.target.value
                                );
                                handlePricingChange('avRate', numericValue, tab.id, index);
                              }}
                              className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={formatIndianCurrency(
                                config.fixedComponent
                              )}
                              onChange={(e) => {
                                const numericValue = parseIndianCurrency(
                                  e.target.value
                                );
                                handlePricingChange('fixedComponent', numericValue, tab.id, index);
                                
                                // Toggle Fixed Component checkbox visibility
                                setTimeout(() => {
                                  const checkboxLabel = document.getElementById(`fixedComponentCheckboxLabel_${tab.id}`);
                                  if (checkboxLabel) {
                                    const hasValue = (subTabData[tab.id]?.pricingConfigs || []).some(config => {
                                      const cleanValue = parseIndianCurrency(config.fixedComponent || '').replace(/[^\d.]/g, '').trim();
                                      return cleanValue && cleanValue !== '' && parseFloat(cleanValue) > 0;
                                    });
                                    checkboxLabel.style.display = hasValue ? 'flex' : 'none';
                                  }
                                }, 0);
                              }}
                              className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={formatIndianCurrency(
                                config.possessionCharges
                              )}
                              onChange={(e) => {
                                const numericValue = parseIndianCurrency(
                                  e.target.value
                                );
                                handlePricingChange('possessionCharges', numericValue, tab.id, index);
                              }}
                              className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={config.totalPackage}
                              readOnly
                              className="w-full border border-neutral-300 rounded px-2 py-1 text-sm bg-neutral-100"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={formatIndianCurrency(
                                config.negotiationScope
                              )}
                              onChange={(e) => {
                                const numericValue = parseIndianCurrency(
                                  e.target.value
                                );
                                handlePricingChange('negotiationScope', numericValue, tab.id, index);
                              }}
                              className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <select
                              value={config.availability}
                              onChange={(e) => {
                                handlePricingChange('availability', e.target.value, tab.id, index);
                              }}
                              className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                            >
                              <option value="">Select</option>
                              <option value="Available">Available</option>
                              <option value="Sold Out">Sold Out</option>
                            </select>
                          </div>
                          <div className="flex justify-center items-center">
                            {config.unitPlan ? (
                              <div className="relative group">
                                {config.unitPlan.type?.startsWith("image/") ? (
                                  <img
                                    src={URL.createObjectURL(config.unitPlan)}
                                    alt="Unit plan"
                                    className="w-12 h-12 object-cover rounded border"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-red-100 rounded border flex items-center justify-center">
                                    <svg
                                      width="20"
                                      height="20"
                                      viewBox="0 0 24 24"
                                      fill="#dc2626"
                                    >
                                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                                    </svg>
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSubTabData((prev) => {
                                      const newConfigs = [
                                        ...(prev[tab.id]?.pricingConfigs || []),
                                      ];
                                      newConfigs[index] = {
                                        ...newConfigs[index],
                                        unitPlan: null,
                                      };
                                      return {
                                        ...prev,
                                        [tab.id]: {
                                          ...prev[tab.id],
                                          pricingConfigs: newConfigs,
                                        },
                                      };
                                    });
                                  }}
                                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                  title="Remove file"
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  const input = document.createElement("input");
                                  input.type = "file";
                                  input.accept = "image/*,.pdf";
                                  input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement)
                                      .files?.[0];
                                    setSubTabData((prev) => {
                                      const newConfigs = [
                                        ...(prev[tab.id]?.pricingConfigs || []),
                                      ];
                                      newConfigs[index] = {
                                        ...newConfigs[index],
                                        unitPlan: file || null,
                                      };
                                      return {
                                        ...prev,
                                        [tab.id]: {
                                          ...prev[tab.id],
                                          pricingConfigs: newConfigs,
                                        },
                                      };
                                    });
                                  };
                                  input.click();
                                }}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                title="Upload unit plan"
                              >
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  style={{
                                    transform: "rotate(45deg)",
                                  }}
                                >
                                  <path d="M16.5,6V17.5A4,4 0 0,1 12.5,21.5A4,4 0 0,1 8.5,17.5V5A2.5,2.5 0 0,1 11,2.5A2.5,2.5 0 0,1 13.5,5V15.5A1,1 0 0,1 12.5,16.5A1,1 0 0,1 11.5,15.5V6H10V15.5A2.5,2.5 0 0,0 12.5,18A2.5,2.5 0 0,0 15,15.5V5A4,4 0 0,0 11,1A4,4 0 0,0 7,5V17.5A5.5,5.5 0 0,0 12.5,23A5.5,5.5 0 0,0 18,17.5V6H16.5Z" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Checkboxes for Per Sq. Ft. Rate inclusions */}
                <div className="mt-4 p-3 bg-blue-50 rounded border space-y-3">
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={subTabData[tab.id]?.psfIncludesParking || false}
                        onChange={(e) => handleCheckboxChange('psfIncludesParking', e.target.checked, tab.id)}
                        className="rounded"
                      />
                      <span>Per Sq. Ft. Rate includes <strong>'Parking'</strong></span>
                    </label>
                    <label 
                      id={`fixedComponentCheckboxLabel_${tab.id}`}
                      className="flex items-center gap-2 text-sm"
                      style={{ 
                        display: (subTabData[tab.id]?.pricingConfigs || []).some(config => {
                          const cleanValue = parseIndianCurrency(config.fixedComponent || '').replace(/[^\d.]/g, '').trim();
                          return cleanValue && cleanValue !== '' && parseFloat(cleanValue) > 0;
                        }) ? 'flex' : 'none'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={subTabData[tab.id]?.psfIncludesFixedComponent || false}
                        onChange={(e) => handleCheckboxChange('psfIncludesFixedComponent', e.target.checked, tab.id)}
                        className="rounded"
                      />
                      <span>Per Sq. Ft. Rate includes <strong>'Fixed Component'</strong></span>
                    </label>
                  </div>
                  
                  {/* Parking field - conditional based on checkbox */}
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-neutral-700 min-w-fit">
                      {subTabData[tab.id]?.psfIncludesParking ? "Number of Parking Included:" : "Parking Charges:"}
                    </label>
                    {subTabData[tab.id]?.psfIncludesParking ? (
                      <input
                        type="number"
                        value={subTabData[tab.id]?.numberOfParkingIncluded || ""}
                        onChange={(e) =>
                          setSubTabData((prev) => ({
                            ...prev,
                            [tab.id]: {
                              ...prev[tab.id],
                              numberOfParkingIncluded: e.target.value,
                            },
                          }))
                        }
                        onWheel={(e) => e.currentTarget.blur()}
                        placeholder="e.g., 1"
                        className="w-32 border border-neutral-300 rounded px-2 py-1 text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      />
                    ) : (
                      <input
                        type="text"
                        value={formatIndianCurrency(subTabData[tab.id]?.parkingCharges || "")}
                        onChange={(e) => {
                          const numericValue = parseIndianCurrency(e.target.value);
                          setSubTabData((prev) => ({
                            ...prev,
                            [tab.id]: {
                              ...prev[tab.id],
                              parkingCharges: numericValue,
                            },
                          }));
                        }}
                        className="w-32 border border-neutral-300 rounded px-2 py-1 text-sm"
                      />
                    )}
                  </div>
                </div>

                {/* Add/Remove buttons at bottom right */}
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSubTabData((prev) => {
                        const currentConfigs =
                          prev[tab.id]?.pricingConfigs || [];
                        return {
                          ...prev,
                          [tab.id]: {
                            ...prev[tab.id],
                            pricingConfigs: [
                              ...currentConfigs,
                              {
                                typology: "",
                                saleableArea: "",
                                reraCarpet: "",
                                psfRate: "",
                                avRate: "",
                                fixedComponent: "",
                                possessionCharges: "",
                                totalPackage: "",
                                negotiationScope: "",
                                availability: "",
                                unitPlan: null,
                              },
                            ],
                          },
                        };
                      });
                    }}
                    className="w-8 h-8 bg-green-500 text-white rounded flex items-center justify-center hover:bg-green-600 font-bold"
                  >
                    +
                  </button>
                  {(subTabData[tab.id]?.pricingConfigs?.length || 0) > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSubTabData((prev) => {
                          const currentConfigs =
                            prev[tab.id]?.pricingConfigs || [];
                          return {
                            ...prev,
                            [tab.id]: {
                              ...prev[tab.id],
                              pricingConfigs: currentConfigs.slice(0, -1),
                            },
                          };
                        });
                      }}
                      className="w-8 h-8 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600 font-bold"
                    >
                      -
                    </button>
                  )}
                </div>
              </div>

              {/* Remove section button - only show if more than 1 sub-tab */}
              {subTabs.length > 1 && (
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      const currentIndex = subTabs.findIndex(
                        (t) => t.id === tab.id
                      );
                      const newTabs = subTabs.filter((t) => t.id !== tab.id);
                      setSubTabs(newTabs);
                      setSubTabData((prev) => {
                        const newData = { ...prev };
                        delete newData[tab.id];
                        return newData;
                      });
                      // Navigate to previous index or first tab
                      if (activeSubTab === tab.id) {
                        const targetIndex =
                          currentIndex > 0 ? currentIndex - 1 : 0;
                        setActiveSubTab(
                          newTabs[targetIndex]?.id || newTabs[0]?.id
                        );
                      }
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Remove section
                  </button>
                </div>
              )}
            </div>
          )
      )}

      {/* Add new section button - outside of sub-tab border */}
      <div className="flex justify-center mt-4">
        <button
          type="button"
          onClick={() => {
            const newIndex = subTabs.length + 1;
            const newTab = {
              id: Date.now(),
              name: `RERA-${newIndex}`,
            };
            setSubTabs((prev) => [...prev, newTab]);
            setSubTabData((prev) => ({
              ...prev,
              [newTab.id]: {
                wingBuildingNo: "",
                projectStatus: "",
                type: "",
                developerPossession: "",
                reraPossession: "",
                mahaReraNumber: "",
                mahaReraLink: "",
                psfIncludesParking: false,
                psfIncludesFixedComponent: false,
                numberOfParkingIncluded: "",
                parkingCharges: "",
                pricingConfigs: [
                  {
                    typology: "",
                    saleableArea: "",
                    reraCarpet: "",
                    psfRate: "",
                    avRate: "",
                    fixedComponent: "",
                    possessionCharges: "",
                    totalPackage: "",
                    negotiationScope: "",
                    availability: "",
                    unitPlan: null,
                  },
                ],
              },
            }));
            setActiveSubTab(newTab.id);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add new section
        </button>
      </div>
    </div>
  );
}