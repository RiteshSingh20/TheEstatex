import React, { useEffect, useState } from "react";
import { FormDataType } from "../../pages/CostSheetFormProps";
import { StampDutyRate } from "../CompareModal";
import { TYPOLOGIES } from "../../constants/typologies";

import { calculatePricingTotal } from "../../lib/propertyFormLogic";
import { calculateBaseAmountWithFixedComponent } from "../../lib/fixedComponentLogic";
import { interceptFormSubmission, fixTotalPackageInData } from "../../utils/totalPackageCalculator";
import { wrapFormSubmission } from "../../utils/formSubmissionHook";

// Import and use the universal calculator
import { calculateUniversalTotalPackage } from "../../utils/totalPackageCalculator";

// Enhanced calculation function - now uses universal calculator
const calculateTotalPackageEnhanced = (
  config: any,
  tabData: any,
  formData: FormDataType,
  parseIndianCurrency: (value: string) => string,
  formatIndianCurrency: (value: string | number) => string
): number => {
  return calculateUniversalTotalPackage(config, tabData, formData, parseIndianCurrency, formatIndianCurrency);
};

interface CurrentStepEditTab1Props {
  subTabs: { id: number; name: string }[];
  setActiveSubTab: React.Dispatch<React.SetStateAction<number>>;
  activeSubTab: number;
  subTabData: {
    0: {
      wingBuildingNo: string;
      projectStatus: string;
      type: string;
      developerPossession: string;
      reraPossession: string;
      mahaReraNumber: string;
      mahaReraLink: string;
      flatsPerFloor: string;
      psfIncludesParking?: boolean;
      psfIncludesFixedComponent?: boolean;
      numberOfParkingIncluded?: string;
      parkingCharges?: string;
      mandatoryParkingTypologies?: string[];
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
        unitPlan: File | null;
        unitPlanUrl?: string;
      }[];
    };
  };
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
        flatsPerFloor: string;
        psfIncludesParking?: boolean;
        psfIncludesFixedComponent?: boolean;
        numberOfParkingIncluded?: string;
        parkingCharges?: string;
        mandatoryParkingTypologies?: string[];
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
            unitPlan: File | null;
            unitPlanUrl?: string;
          }[];
      };
    }>
  >;
  setSubTabs: React.Dispatch<
    React.SetStateAction<{ id: number; name: string }[]>
  >;
  formatIndianCurrency: (value: string | number) => string;
  parseIndianCurrency: (value: string) => string;
  stampRates: StampDutyRate[];
  formData: FormDataType;
  isAdmin?: boolean;
}

// Initialize universal totalPackage interceptor and form submission wrapper
interceptFormSubmission();
wrapFormSubmission();

export const CurrentStepEditTab1: React.FC<CurrentStepEditTab1Props> = ({
  subTabs,
  setActiveSubTab,
  activeSubTab,
  subTabData,
  setSubTabData,
  setSubTabs,
  formatIndianCurrency,
  parseIndianCurrency,
  stampRates,
  formData,
  isAdmin = true
}) => {
  const [isLoadingReraData, setIsLoadingReraData] = useState(false);
  const [fixedComponentVisibility, setFixedComponentVisibility] = useState<Record<number, boolean>>({});
  const objectUrlsRef = React.useRef<Record<string, string>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewImage(null);
    };
    if (previewImage) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [previewImage]);

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
  ): number => {
    return calculateTotalPackageEnhanced(
      config,
      typeof includesFixedComponentOverride === 'boolean'
        ? { ...subTabData[tabId], psfIncludesFixedComponent: includesFixedComponentOverride }
        : subTabData[tabId],
      formData,
      parseIndianCurrency,
      formatIndianCurrency,
      stampRates
    );
  };

  // Initialize tab names on component load
  useEffect(() => {
    Object.entries(subTabData).forEach(([tabId, tabData]) => {
      const wingBuildingNo = tabData?.wingBuildingNo?.trim();
      const reraNumber = tabData?.mahaReraNumber?.trim();
      
      let tabName;
      if (wingBuildingNo) {
        tabName = wingBuildingNo;
      } else if (reraNumber) {
        tabName = reraNumber;
      } else {
        tabName = "Pre-launch";
      }
      
      setSubTabs((prev) =>
        prev.map((t) =>
          t.id === parseInt(tabId) ? { ...t, name: tabName } : t
        )
      );
    });
  }, [subTabData]);

  // Extract tab name update logic to avoid duplication
  const updateTabName = (tabId: number, value: string) => {
    const wingBuildingNo = subTabData[tabId]?.wingBuildingNo?.trim();
    
    if (wingBuildingNo) {
      setSubTabs((prev) =>
        prev.map((t) =>
          t.id === tabId ? { ...t, name: wingBuildingNo } : t
        )
      );
    } else if (value.trim()) {
      setSubTabs((prev) =>
        prev.map((t) =>
          t.id === tabId ? { ...t, name: value.trim() } : t
        )
      );
    } else {
      const tabIndex = subTabs.findIndex((t) => t.id === tabId);
      setSubTabs((prev) =>
        prev.map((t) =>
          t.id === tabId ? { ...t, name: `RERA-${tabIndex + 1}` } : t
        )
      );
    }
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
        const calculatedTotal = calculateTotalPackageEnhanced(
          updatedConfig,
          prev[tabId],
          formData,
          parseIndianCurrency,
          formatIndianCurrency
        );
        // Ensure totalPackage is always stored as formatted currency
        newConfigs[configIndex].totalPackage = calculatedTotal;
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
          // Clear parking data when psfIncludesParking is ticked
          ...(field === 'psfIncludesParking' && value && {
            parkingCharges: null,
            mandatoryParkingTypologies: null,
            numberOfParkingIncluded: null,
          }),
          // Clear numberOfParkingIncluded when psfIncludesParking is unticked
          ...(field === 'psfIncludesParking' && !value && {
            numberOfParkingIncluded: null,
          }),
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



  // Utility function to ensure totalPackage is always formatted consistently
  const ensureTotalPackageFormatting = (data: typeof subTabData) => {
    const formattedData = { ...data };
    Object.entries(formattedData).forEach(([tabId, tabData]) => {
      if (tabData?.pricingConfigs) {
        tabData.pricingConfigs = tabData.pricingConfigs.map(config => ({
          ...config,
          totalPackage: calculateTotalPackageEnhanced(
            config,
            tabData,
            formData,
            parseIndianCurrency,
            formatIndianCurrency,
            stampRates
          )
        }));
      }
    });
    return formattedData;
  };

  // Sync totalPackage values with calculated values
  useEffect(() => {
    Object.entries(subTabData).forEach(([tabId, tabData]) => {
      if (tabData?.pricingConfigs) {
        const updatedConfigs = tabData.pricingConfigs.map(config => {
          const newTotal = calculateTotalPackageEnhanced(
            config,
            tabData,
            formData,
            parseIndianCurrency,
            formatIndianCurrency
          );
          return { ...config, totalPackage: newTotal };
        });
        
        // Check if any values changed to avoid infinite loop
        const hasChanges = updatedConfigs.some((config, index) => 
          config.totalPackage !== tabData.pricingConfigs[index]?.totalPackage
        );
        
        if (hasChanges) {
          setSubTabData(prev => ({
            ...prev,
            [tabId]: {
              ...prev[tabId],
              pricingConfigs: updatedConfigs,
            },
          }));
        }
      }
    });
  }, [formData.registration, ...Object.values(subTabData).map(tab => tab?.projectStatus)]); // Re-sync when registration or project status changes

  // Function to prepare data for submission with correct totalPackage formatting
  const prepareDataForSubmission = () => {
    const formattedSubTabData = ensureTotalPackageFormatting(subTabData);
    return formattedSubTabData;
  };

  // Expose functions for use by parent components
  React.useImperativeHandle(React.useRef(), () => ({
    ensureTotalPackageFormatting,
    prepareDataForSubmission
  }), [subTabData, formData]);

  // Make the function available globally for form submission
  React.useEffect(() => {
    (window as any).getCurrentStepTab1Data = prepareDataForSubmission;
    
    // Global function to fix totalPackage in any data structure
    (window as any).fixTotalPackageInFormData = (data: any) => {
      return fixTotalPackageInData(data, formData, parseIndianCurrency, formatIndianCurrency);
    };
    
    // Force fix typologies totalPackage to match subTabData
    (window as any).forceFixTypologiesTotalPackage = (data: any) => {
      if (data.subTabData && data.typologies) {
        data.typologies = data.typologies.map((typology: any) => {
          const matchingConfig = Object.values(data.subTabData).find((tabData: any) => 
            tabData?.pricingConfigs?.find((config: any) => 
              config.typology === typology.typology &&
              config.saleableArea === typology.saleableArea &&
              config.avRate === typology.avRate
            )
          );
          
          if (matchingConfig) {
            const config = (matchingConfig as any).pricingConfigs.find((config: any) => 
              config.typology === typology.typology &&
              config.saleableArea === typology.saleableArea &&
              config.avRate === typology.avRate
            );
            if (config?.totalPackage) {
              return { ...typology, totalPackage: config.totalPackage };
            }
          }
          return typology;
        });
      }
      return data;
    };
    
    return () => {
      delete (window as any).getCurrentStepTab1Data;
      delete (window as any).fixTotalPackageInFormData;
      delete (window as any).forceFixTypologiesTotalPackage;
    };
  }, [subTabData, formData]);

  // Cleanup object URLs on unmount and when configs change
  useEffect(() => {
    return () => {
      Object.values(objectUrlsRef.current).forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (error) {
          console.warn('Failed to revoke object URL:', error);
        }
      });
      objectUrlsRef.current = {};
    };
  }, []);

  // Clean up unused object URLs when configs change
  useEffect(() => {
    const currentKeys = new Set<string>();
    Object.entries(subTabData).forEach(([tabId, tabData]) => {
      tabData?.pricingConfigs?.forEach((_, index) => {
        currentKeys.add(`${tabId}-${index}`);
      });
    });

    Object.keys(objectUrlsRef.current).forEach(key => {
      if (!currentKeys.has(key)) {
        try {
          URL.revokeObjectURL(objectUrlsRef.current[key]);
        } catch (error) {
          console.warn('Failed to revoke unused object URL:', error);
        }
        delete objectUrlsRef.current[key];
      }
    });
  }, [subTabData]);

  // Initialize fixedComponentVisibility based on existing data
  useEffect(() => {
    const newVisibility: Record<number, boolean> = {};
    Object.entries(subTabData).forEach(([tabId, tabData]) => {
      const hasAnyFixedComponent = (tabData?.pricingConfigs || []).some(config => {
        const cleanValue = parseIndianCurrency(config.fixedComponent || '').replace(/[^\d.]/g, '').trim();
        return cleanValue && cleanValue !== '' && parseFloat(cleanValue) > 0;
      });
      newVisibility[parseInt(tabId)] = hasAnyFixedComponent;
    });
    setFixedComponentVisibility(newVisibility);
  }, [subTabData, parseIndianCurrency]);
  
  if (isLoadingReraData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading RERA data...</p>
          </div>
        </div>
      </div>
    );
  }

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
                  <div className="grid grid-cols-9 gap-4 text-sm font-medium text-neutral-700">
                    <div>Bldg No./Phase</div>
                    <div>Project Type</div>
                    <div>Project Status</div>
                    <div>Developer Possession</div>
                    <div>RERA Number</div>
                    <div>RERA Possession</div>
                    <div>RERA URL</div>
                    <div>SD Rate</div>
                    <div>Flats per Floor *</div>
                  </div>
                </div>

                {/* Data Row */}
                <div className="bg-white border-x border-b rounded-b p-2">
                  <div className="grid grid-cols-9 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="e.g., Bldg 1, Phase 4"
                        value={subTabData[tab.id]?.wingBuildingNo || ""}
                        onChange={(e) => {
                          setSubTabData((prev) => ({
                            ...prev,
                            [tab.id]: {
                              ...prev[tab.id],
                              wingBuildingNo: e.target.value,
                            },
                          }));
                        }}
                        onBlur={(e) => {
                          const wingBuildingNo = e.target.value.trim();
                          const reraNumber = subTabData[tab.id]?.mahaReraNumber?.trim();
                          
                          if (wingBuildingNo) {
                            setSubTabs((prev) =>
                              prev.map((t) =>
                                t.id === tab.id ? { ...t, name: wingBuildingNo } : t
                              )
                            );
                          } else if (reraNumber) {
                            setSubTabs((prev) =>
                              prev.map((t) =>
                                t.id === tab.id ? { ...t, name: reraNumber } : t
                              )
                            );
                          } else {
                            setSubTabs((prev) =>
                              prev.map((t) =>
                                t.id === tab.id ? { ...t, name: "Pre-launch" } : t
                              )
                            );
                          }
                        }}
                        disabled={!isAdmin}
                        className="w-full border border-neutral-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                        disabled={!isAdmin}
                        className="w-full border border-neutral-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                        disabled={!isAdmin || subTabData[tab.id]?.type === "Pre-launch"}
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
                          !isAdmin ||
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
                          const sanitizedValue = e.target.value.replace(/[<>"'&]/g, '').replace(/javascript:/gi, '').replace(/on\w+=/gi, '');
                          setSubTabData((prev) => ({
                            ...prev,
                            [tab.id]: {
                              ...prev[tab.id],
                              mahaReraNumber: sanitizedValue,
                            },
                          }));
                        }}
                        onBlur={(e) => {
                          const wingBuildingNo = subTabData[tab.id]?.wingBuildingNo?.trim();
                          const reraNumber = e.target.value.trim();
                          
                          if (wingBuildingNo) {
                            setSubTabs((prev) =>
                              prev.map((t) =>
                                t.id === tab.id ? { ...t, name: wingBuildingNo } : t
                              )
                            );
                          } else if (reraNumber) {
                            setSubTabs((prev) =>
                              prev.map((t) =>
                                t.id === tab.id ? { ...t, name: reraNumber } : t
                              )
                            );
                          } else {
                            setSubTabs((prev) =>
                              prev.map((t) =>
                                t.id === tab.id ? { ...t, name: "Pre-launch" } : t
                              )
                            );
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Tab") {
                            const wingBuildingNo = subTabData[tab.id]?.wingBuildingNo?.trim();
                            const reraNumber = e.currentTarget.value.trim();
                            
                            if (wingBuildingNo) {
                              setSubTabs((prev) =>
                                prev.map((t) =>
                                  t.id === tab.id ? { ...t, name: wingBuildingNo } : t
                                )
                              );
                            } else if (reraNumber) {
                              setSubTabs((prev) =>
                                prev.map((t) =>
                                  t.id === tab.id ? { ...t, name: reraNumber } : t
                                )
                              );
                            } else {
                              setSubTabs((prev) =>
                                prev.map((t) =>
                                  t.id === tab.id ? { ...t, name: "Pre-launch" } : t
                                )
                              );
                            }
                          }
                        }}
                        disabled={!isAdmin || subTabData[tab.id]?.type === "Pre-launch"}
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
                          !isAdmin ||
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
                        onChange={(e) => {
                          const sanitizedValue = e.target.value.replace(/[<>"'&]/g, '').replace(/javascript:/gi, '').replace(/on\w+=/gi, '');
                          setSubTabData((prev) => ({
                            ...prev,
                            [tab.id]: {
                              ...prev[tab.id],
                              mahaReraLink: sanitizedValue,
                            },
                          }));
                        }}
                        disabled={!isAdmin || subTabData[tab.id]?.type === "Pre-launch"}
                        className="w-full border border-neutral-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={subTabData[tab.id]?.sdRate || ""}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(/[^0-9.]/g, "");
                          setSubTabData((prev) => ({
                            ...prev,
                            [tab.id]: {
                              ...prev[tab.id],
                              sdRate: numericValue,
                            },
                          }));
                        }}
                        onBlur={(e) => {
                          if (e.target.value && !e.target.value.includes('%')) {
                            e.target.value = e.target.value + '%';
                          }
                        }}
                        onFocus={(e) => {
                          if (e.target.value.includes('%')) {
                            e.target.value = e.target.value.replace('%', '');
                          }
                        }}
                        placeholder="e.g., 6"
                        disabled={!isAdmin}
                        className="w-full border border-neutral-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={subTabData[tab.id]?.flatsPerFloor || ""}
                        onChange={(e) => {
                          const filtered = e.target.value.replace(/[^0-9]/g, "");
                          setSubTabData((prev) => ({
                            ...prev,
                            [tab.id]: {
                              ...prev[tab.id],
                              flatsPerFloor: filtered,
                            },
                          }));
                        }}
                        disabled={!isAdmin}
                        className="w-full border border-neutral-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        required
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
                    className="grid gap-1 text-xs font-medium text-neutral-700 text-center"
                    style={{
                      gridTemplateColumns: (subTabData[tab.id]?.pricingConfigs?.length || 0) > 1 
                        ? "1fr 0.5fr 0.5fr 0.8fr 0.8fr 0.8fr 0.8fr 1fr 0.8fr 0.8fr 0.3fr 0.3fr 0.6fr 0.3fr"
                        : "1fr 0.5fr 0.5fr 0.8fr 0.8fr 0.8fr 0.8fr 1fr 0.8fr 0.8fr 0.3fr 0.3fr 0.6fr"
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
                    <div>BA</div>
                    <div>TA</div>
                    <div>
                      Unit
                      <br />
                      Plan
                    </div>
                    {(subTabData[tab.id]?.pricingConfigs?.length || 0) > 1 && <div>Remove</div>}
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
                          className="grid gap-1"
                          style={{
                            gridTemplateColumns: (subTabData[tab.id]?.pricingConfigs?.length || 0) > 1 
                              ? "1fr 0.5fr 0.5fr 0.8fr 0.8fr 0.8fr 0.8fr 1fr 0.8fr 0.8fr 0.3fr 0.3fr 0.6fr 0.3fr"
                              : "1fr 0.5fr 0.5fr 0.8fr 0.8fr 0.8fr 0.8fr 1fr 0.8fr 0.8fr 0.3fr 0.3fr 0.6fr"
                          }}
                        >
                          <div>
                            <select
                              value={config.typology}
                              onChange={(e) => {
                                handlePricingChange('typology', e.target.value, tab.id, index);
                              }}
                              disabled={!isAdmin}
                              className="w-full border border-neutral-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                              <option value="">Select</option>
                              {TYPOLOGIES.map((typology) => (
                                <option key={typology} value={typology}>
                                  {typology}
                                </option>
                              ))}
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
                              disabled={!isAdmin}
                              className="w-full border border-neutral-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
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
                              disabled={!isAdmin}
                              className="w-full border border-neutral-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
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
                              disabled={!isAdmin}
                              maxLength={11}
                              className="w-full border border-neutral-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                              disabled={!isAdmin}
                              maxLength={11}
                              className="w-full border border-neutral-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                                
                                // Update checkbox visibility state with setTimeout to avoid render phase update
                                setTimeout(() => {
                                  // Check if any pricing config has a fixed component value
                                  const updatedConfigs = [...(subTabData[tab.id]?.pricingConfigs || [])];
                                  updatedConfigs[index] = { ...updatedConfigs[index], fixedComponent: numericValue };
                                  
                                  const hasAnyFixedComponent = updatedConfigs.some(config => {
                                    const cleanValue = parseIndianCurrency(config.fixedComponent || '').replace(/[^\d.]/g, '').trim();
                                    return cleanValue && cleanValue !== '' && parseFloat(cleanValue) > 0;
                                  });
                                  
                                  setFixedComponentVisibility(prev => ({
                                    ...prev,
                                    [tab.id]: hasAnyFixedComponent
                                  }));
                                }, 0);
                              }}
                              disabled={!isAdmin}
                              maxLength={11}
                              className="w-full border border-neutral-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                              disabled={!isAdmin}
                              maxLength={11}
                              className="w-full border border-neutral-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={formatIndianCurrency(calculateTotalPackage(config, tab.id))}
                              disabled
                              onWheel={(e) => e.currentTarget.blur()}
                              maxLength={15}
                              className="w-full border border-neutral-300 rounded px-2 py-1 text-sm bg-neutral-100 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
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
                              disabled={!isAdmin}
                              className="w-full border border-neutral-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <select
                              value={config.availability}
                              onChange={(e) => {
                                handlePricingChange('availability', e.target.value, tab.id, index);
                              }}
                              disabled={!isAdmin}
                              className="w-full border border-neutral-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                              <option value="">Select</option>
                              <option value="Available">Available</option>
                              <option value="Sold Out">Sold Out</option>
                            </select>
                          </div>
                          <div className="flex justify-center items-center">
                            <input
                              type="checkbox"
                              checked={config.hasBalcony || false}
                              onChange={(e) => {
                                handlePricingChange('hasBalcony', e.target.checked, tab.id, index);
                              }}
                              disabled={!isAdmin}
                              className="rounded disabled:cursor-not-allowed"
                            />
                          </div>
                          <div className="flex justify-center items-center">
                            <input
                              type="checkbox"
                              checked={config.hasTerrace || false}
                              onChange={(e) => {
                                handlePricingChange('hasTerrace', e.target.checked, tab.id, index);
                              }}
                              disabled={!isAdmin}
                              className="rounded disabled:cursor-not-allowed"
                            />
                          </div>
                          <div className="flex justify-center items-center">
                            {(config.unitPlan || config.unitPlanUrl) ? (
                              <div className="relative group">
                                {/* If it's a File object (new upload), show preview using managed object URL */}
                                {config.unitPlan && ((config.unitPlan as File).type && (config.unitPlan as File).type.startsWith("image/")) ? (
                                  <img
                                    src={(() => {
                                      const key = `${tab.id}-${index}`;
                                      if (objectUrlsRef.current[key]) {
                                        return objectUrlsRef.current[key];
                                      }
                                      try {
                                        const url = URL.createObjectURL(config.unitPlan as File);
                                        objectUrlsRef.current[key] = url;
                                        return url;
                                      } catch (error) {
                                        console.error('Failed to create object URL:', error);
                                        return '';
                                      }
                                    })()}
                                    alt="Unit plan"
                                    className="w-12 h-12 object-cover rounded border"
                                  />
                                ) : config.unitPlanUrl ? (
                                  <div className="relative">
                                    <img
                                      src={config.unitPlanUrl}
                                      alt="Unit plan"
                                      className="w-12 h-12 object-cover rounded border"
                                      onError={(e) => {
                                        // Fallback to document icon if image fails to load
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling.style.display = 'flex';
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setPreviewImage(config.unitPlanUrl!)}
                                      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center hover:bg-opacity-70"
                                    >
                                      <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                                        <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                                      </svg>
                                    </button>
                                  </div>
                                ) : (() => {
                                  // Try to find unitPlanUrl from formData.typologies matching this config
                                  const matchingTypology = formData.typologies?.find(t => 
                                    t.typology === config.typology && 
                                    t.saleableArea === config.saleableArea
                                  );
                                  return matchingTypology?.unitPlanUrl ? (
                                    <div className="relative">
                                      <img
                                        src={matchingTypology.unitPlanUrl}
                                        alt="Unit plan"
                                        className="w-12 h-12 object-cover rounded border"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                          e.currentTarget.nextElementSibling.style.display = 'flex';
                                        }}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => setPreviewImage(matchingTypology.unitPlanUrl!)}
                                      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center hover:bg-opacity-70"
                                      >
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                                          <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                                        </svg>
                                      </button>
                                    </div>
                                  ) : null;
                                })()}
                                {/* Fallback document icon */}
                                <div 
                                  className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center"
                                  style={{ 
                                    display: (config.unitPlanUrl || formData.typologies?.find(t => 
                                      t.typology === config.typology && t.saleableArea === config.saleableArea
                                    )?.unitPlanUrl) ? 'none' : 'flex' 
                                  }}
                                >
                                  <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="#6b7280"
                                  >
                                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                                  </svg>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!isAdmin) return;
                                    // Clean up object URL safely
                                    const urlKey = `${tab.id}-${index}`;
                                    if (objectUrlsRef.current[urlKey]) {
                                      try {
                                        URL.revokeObjectURL(objectUrlsRef.current[urlKey]);
                                      } catch (error) {
                                        console.warn('Failed to revoke object URL:', error);
                                      }
                                      delete objectUrlsRef.current[urlKey];
                                    }
                                    
                                    setSubTabData((prev) => {
                                      const newConfigs = [
                                        ...(prev[tab.id]?.pricingConfigs || []),
                                      ];
                                      newConfigs[index] = {
                                        ...newConfigs[index],
                                        unitPlan: null,
                                        unitPlanUrl: undefined,
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
                                  disabled={!isAdmin}
                                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                  title={isAdmin ? "Remove file" : "Admin access required"}
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  if (!isAdmin) return;
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
                                        unitPlanUrl: undefined,
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
                                disabled={!isAdmin}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                title={isAdmin ? "Upload unit plan" : "Admin access required"}
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
                          {(subTabData[tab.id]?.pricingConfigs?.length || 0) > 1 && (
                            <div className="flex justify-center items-center">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!isAdmin) return;
                                  setSubTabData((prev) => {
                                    const currentConfigs = prev[tab.id]?.pricingConfigs || [];
                                    const newConfigs = currentConfigs.filter((_, i) => i !== index);
                                    return {
                                      ...prev,
                                      [tab.id]: {
                                        ...prev[tab.id],
                                        pricingConfigs: newConfigs,
                                      },
                                    };
                                  });
                                }}
                                disabled={!isAdmin}
                                className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                title={isAdmin ? "Remove this row" : "Admin access required"}
                              >
                                ×
                              </button>
                            </div>
                          )}
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
                        disabled={!isAdmin}
                        className="rounded disabled:cursor-not-allowed"
                      />
                      <span>Per Sq. Ft. Rate includes <strong>'Parking'</strong></span>
                    </label>
                    {fixedComponentVisibility[tab.id] && (
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={subTabData[tab.id]?.psfIncludesFixedComponent || false}
                        onChange={(e) => handleCheckboxChange('psfIncludesFixedComponent', e.target.checked, tab.id)}
                        disabled={!isAdmin}
                        className="rounded disabled:cursor-not-allowed"
                      />
                      <span>Per Sq. Ft. Rate includes <strong>'Fixed Component'</strong></span>
                    </label>
                    )}
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
                        disabled={!isAdmin}
                        className="w-32 border border-neutral-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      />
                    ) : (
                      <>
                        <input
                          type="text"
                          value={formatIndianCurrency(subTabData[tab.id]?.parkingCharges || "")}
                          onChange={(e) => {
                            const numericValue = parseIndianCurrency(e.target.value);
                            setSubTabData((prev) => {
                              const updatedData = {
                                ...prev,
                                [tab.id]: {
                                  ...prev[tab.id],
                                  parkingCharges: numericValue,
                                },
                              };
                              
                              // Recalculate totals when parking charges change
                              const newConfigs = updatedData[tab.id]?.pricingConfigs.map(config => ({
                                ...config,
                                totalPackage: calculateTotalPackageEnhanced(
                                  config,
                                  updatedData[tab.id],
                                  formData,
                                  parseIndianCurrency,
                                  formatIndianCurrency
                                )
                              })) || [];
                              
                              return {
                                ...updatedData,
                                [tab.id]: {
                                  ...updatedData[tab.id],
                                  pricingConfigs: newConfigs,
                                },
                              };
                            });
                          }}
                          disabled={!isAdmin}
                          className="w-32 border border-neutral-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        {subTabData[tab.id]?.parkingCharges && parseIndianCurrency(subTabData[tab.id]?.parkingCharges || "") && (
                          <>
                            <div className="ml-4">
                              <label className="text-sm font-medium text-neutral-700 block mb-2">
                                Mandatory with:
                              </label>
                              <div className="flex flex-wrap gap-4">
                                {(() => {
                                  const uniqueTypologies = [...new Set((subTabData[tab.id]?.pricingConfigs || []).map(config => config.typology).filter(Boolean))];
                                  return uniqueTypologies.length === 0 ? (
                                    <div className="text-sm text-gray-500">Add typologies first</div>
                                  ) : (
                                    uniqueTypologies.map((typology, index) => (
                                      <label key={index} className="flex items-center gap-2 text-sm">
                                        <input
                                          type="checkbox"
                                          checked={(subTabData[tab.id]?.mandatoryParkingTypologies || []).includes(typology)}
                                          onChange={(e) => {
                                            const current = subTabData[tab.id]?.mandatoryParkingTypologies || [];
                                            const updated = e.target.checked
                                              ? [...current, typology]
                                              : current.filter(t => t !== typology);
                                            setSubTabData((prev) => {
                                              const updatedData = {
                                                ...prev,
                                                [tab.id]: {
                                                  ...prev[tab.id],
                                                  mandatoryParkingTypologies: updated,
                                                },
                                              };
                                              
                                              // Recalculate totals for all configs when mandatory parking changes
                                              const newConfigs = updatedData[tab.id]?.pricingConfigs.map(config => ({
                                                ...config,
                                                totalPackage: calculateTotalPackageEnhanced(
                                                  config,
                                                  updatedData[tab.id],
                                                  formData,
                                                  parseIndianCurrency,
                                                  formatIndianCurrency,
                                                  stampRates
                                                )
                                              })) || [];
                                              
                                              return {
                                                ...updatedData,
                                                [tab.id]: {
                                                  ...updatedData[tab.id],
                                                  pricingConfigs: newConfigs,
                                                },
                                              };
                                            });
                                          }}
                                          disabled={!isAdmin}
                                          className="rounded disabled:cursor-not-allowed"
                                        />
                                        <span>{typology}</span>
                                      </label>
                                    ))
                                  );
                                })()}
                              </div>
                            </div>
                        </>
                        )}
                      </>
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
                                hasBalcony: false,
                                hasTerrace: false,
                                unitPlan: null,
                              },
                            ],
                          },
                        };
                      });
                    }}
                    disabled={!isAdmin}
                    className="w-8 h-8 bg-green-500 text-white rounded flex items-center justify-center hover:bg-green-600 font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                      disabled={!isAdmin}
                      className="w-8 h-8 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600 font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                  )}
                </div>
              </div>

              {/* Remove section button - only show if more than 1 sub-tab */}
              {subTabs.length > 1 && (
                <div className="flex justify-center mt-4">
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
                    disabled={!isAdmin}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Remove Section
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
                flatsPerFloor: "",
                psfIncludesParking: false,
                psfIncludesFixedComponent: false,
                numberOfParkingIncluded: "",
                parkingCharges: "",
                mandatoryParkingTypologies: [],
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
                    hasBalcony: false,
                    hasTerrace: false,
                    unitPlan: null,
                  },
                ],
              },
            }));
            setActiveSubTab(newTab.id);
          }}
          disabled={!isAdmin}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Add New Section
        </button>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 flex items-center justify-center z-50" onClick={() => setPreviewImage(null)}>
          <div className="relative bg-white rounded-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <img src={previewImage} alt="Unit plan preview" className="rounded-lg" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 w-6 h-6 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Backward compatibility export
export const currentStepEditTab1 = CurrentStepEditTab1;
