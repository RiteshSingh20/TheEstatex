import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import Button from "../components/ui/Button";
import { getStampDutyRates, getCostSheets } from "../utils/firestoreListings";

export interface CostSheet {
  id: string;

  // Basic Details
  dateUpdateCostSheet?: string;
  station?: string;
  stationSide?: string;
  developerName?: string;
  projectName?: string;
  subLocation?: string;
  landmark?: string;
  district?: string;
  pinCode?: string;
  state?: string;
  landParcel?: string;
  towers?: string;
  storey?: string;

  // Pricing Details
  wingBuildingNo?: string;
  flatType?: string;
  saleableArea?: number;
  reraCarpet?: number;
  psfRate?: number;
  avRate?: number;
  floorRise?: number;
  registration?: number;

  // Other charges & Payment Plans
  fixedComponent?: number;
  possessionCharges?: number;
  parkingCharge?: number;
  totalPackage?: number;
  paymentScheme?: string[];

  // Amenities
  apartmentAmenities?: string[];
  projectAmenities?: string[];
  locationHighlights?: string[];

  // Others
  type?: string;
  mahaReraNumber?: string;
  mahaReraLink?: string;
  possessionMonth?: string;
  possessionYear?: string;
  reraPossession?: string;
  isCosmo?: string;
  availibility?: string;
  imageUrl?: string;
  videoUrl?: string;
  siteHeadName?: string;
  siteHeadNumber?: string;
  smName?: string;
  smContact?: string;
  sourcingManagers?: Array<{name: string; contact: string}>;
  siteHeads?: Array<{name: string; contact: string}>;
  isApproved?: boolean;
  isRejected?: boolean;
  approvalStatus?: string;
  nextApprovalLevel?: string;

  // Legacy fields (keep for backward compatibility)
  discount?: number;
  sbua?: number;
  flatCost?: number;
  floorRisePerFloor?: number;
  floor?: number;
  agreementValue?: number;
  stampDuty?: number;
  gst?: number;
  furnitureCharges?: number;
  possession?: string;
  brochureUrl?: string;
  video?: string;
  images?: string[];
  withParking?: boolean;
  includeParkingInAgreement?: boolean;
  stampDutyRate?: number;
  amenities?: string[]; // Legacy - prefer apartmentAmenities
  highlights?: string[]; // Legacy - prefer locationHighlights
  isCosmo2?: string; // Legacy - prefer isCosmo
}

export interface StampDutyRate {
  id: string;
  location: string;
  jurisdiction: string;
  rate: number;
}

const Compare = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [costSheets, setCostSheets] = useState<CostSheet[]>([]);
  const [stampDutyRates, setStampDutyRates] = useState<StampDutyRate[]>([]);
  const [allCostSheets, setAllCostSheets] = useState<CostSheet[]>([]);
  const safeNumber = (val: unknown, fallback = undefined) => {
    if (typeof val === "number" && !isNaN(val)) return val;
    if (typeof val === "string") {
      const parsed = Number(val.trim());
      return isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
  };

  const recalculateCostSheet = useCallback(
    (sheet: CostSheet): CostSheet => {
      const saleableArea = safeNumber(sheet.saleableArea) || 0;
      const reraCarpet = safeNumber(sheet.reraCarpet) || 0;
      const avRate = safeNumber(sheet.avRate) || 0;
      const discount = sheet.discount || 0;
      const floorRise = safeNumber(sheet.floorRise) || 0;
      const floor = safeNumber(sheet.floor) ?? 1;

      // Calculate base costs
      const area = saleableArea || reraCarpet || 0;
      const rate = avRate - discount;
      const flatCost = area * rate;
      const floorRisePerFloor = saleableArea * floorRise;

      // Calculate parking cost based on rules
      let agreementValue = flatCost + floorRisePerFloor * (floor - 1);
      let parkingCost = 0;

      parkingCost = safeNumber(sheet.parkingCharge) || 0;

      // Include parking charges in agreement if "Include Parking in Agreement" is true
      if (sheet.includeParkingInAgreement) {
        agreementValue += parkingCost;
      }

      // Calculate GST based on agreement value
      const gstRate = agreementValue < 4500000 ? 0.01 : 0.05;
      const gst = Math.ceil(agreementValue * gstRate);

      // Find matching stamp duty rate
      const matchedRate =
        stampDutyRates.find(
          (r) =>
            (r.location || "").toLowerCase() ===
            (sheet.station || "").toLowerCase()
        ) ||
        stampDutyRates.find(
          (r) =>
            (r.jurisdiction || "").toLowerCase() ===
            (sheet.station || "").toLowerCase()
        ) ||
        stampDutyRates.find(
          (r) =>
            (r.location || "").toLowerCase() ===
            (sheet.district || "").toLowerCase()
        ) ||
        stampDutyRates.find(
          (r) =>
            (r.jurisdiction || "").toLowerCase() ===
            (sheet.district || "").toLowerCase()
        );

      const rateUsed = matchedRate?.rate ?? 6;
      const stampDuty =
        Math.ceil((agreementValue * rateUsed) / 100 / 100) * 100;

      // Calculate furniture charges
      const furnitureArea = saleableArea || reraCarpet || 0;
      const furnitureCharges =
        sheet.station?.trim() !== ""
          ? ((safeNumber(sheet.psfRate) || 0) - (safeNumber(sheet.avRate) || 0)) * furnitureArea
          : 0;

      // Calculate total package
      const totalPackage =
        agreementValue +
        stampDuty +
        (safeNumber(sheet.registration) || 0) +
        gst +
        (safeNumber(sheet.possessionCharges) || 0) +
        furnitureCharges +
        // Add parking cost separately when not included in agreement
        (sheet.withParking && !sheet.includeParkingInAgreement
          ? parkingCost
          : 0);

      const safeFlatCost = Number.isFinite(flatCost)
        ? Number(flatCost.toFixed(2))
        : 0;

      const safeFloorRisePerFloor = Number.isFinite(floorRisePerFloor)
        ? Number(floorRisePerFloor.toFixed(2))
        : 0;

      const safeAgreementValue = Number.isFinite(agreementValue)
        ? Number(agreementValue.toFixed(2))
        : 0;

      const safeFurnitureCharges = Number.isFinite(furnitureCharges)
        ? Number(furnitureCharges.toFixed(2))
        : 0;

      const safeGst = Number.isFinite(gst) ? Math.round(gst) : 0;

      const safeStampDuty = Number.isFinite(stampDuty)
        ? Math.round(stampDuty)
        : 0;

      const safeTotalPackage = Number.isFinite(totalPackage)
        ? Number(totalPackage.toFixed(2))
        : 0;

      return {
        ...sheet,
        flatCost: safeFlatCost,
        floorRisePerFloor: safeFloorRisePerFloor,
        agreementValue: safeAgreementValue,
        stampDuty: safeStampDuty,
        stampDutyRate: rateUsed,
        gst: safeGst,
        furnitureCharges: safeFurnitureCharges,
        totalPackage: safeTotalPackage,
      };
    },
    [stampDutyRates]
  );

  useEffect(() => {
    const fetchInitialData = async () => {
      const [rates, allSheets] = await Promise.all([
        getStampDutyRates(),
        getCostSheets(),
      ]);
      setStampDutyRates(rates);
      setAllCostSheets(allSheets);
    };
    fetchInitialData();
  }, []);

  const initialSelectedItemsRef = useRef<CostSheet[]>(
    location.state?.selectedItems || []
  );

  useEffect(() => {
    if (stampDutyRates.length && allCostSheets.length) {
      const updatedSheets = initialSelectedItemsRef.current.map((item) =>
        recalculateCostSheet(item)
      );
      // Ensure we always have 5 columns (empty ones will be filled with dropdowns)
      while (updatedSheets.length < 5) {
        updatedSheets.push({ id: `empty-${updatedSheets.length}` });
      }
      setCostSheets(updatedSheets);
    }
  }, [stampDutyRates, allCostSheets, recalculateCostSheet]);

  const handleClose = () => navigate("/dashboard");

  const formatCurrency = (value?: number) => {
    return `₹${(value || 0).toLocaleString("en-IN")}`;
  };

  const formatArea = (value?: number) => {
    return `${(value || 0).toLocaleString("en-IN")} sq.ft.`;
  };

  const formatBooleanDropdown = (
    value: boolean | undefined,
    index: number,
    key: "withParking" | "includeParkingInAgreement"
  ) => {
    return (
      <div className="relative inline-block w-full">
        <select
          className="bg-white border border-gray-300 rounded-lg px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
          value={value ? "yes" : "no"}
          onChange={(e) => {
            const newValue = e.target.value === "yes";
            setCostSheets((prev) => {
              const updated = [...prev];
              const item = updated[index];

              // Update the specific parking field
              const updatedItem = {
                ...item,
                [key]: newValue,
              };

              // Recalculate the entire cost sheet
              updated[index] = recalculateCostSheet(updatedItem);
              return updated;
            });
          }}
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    );
  };

  const handleCarpetAreaChange = (index: number, newArea: number) => {
    setCostSheets((prev) => {
      const updated = [...prev];
      const currentSheet = updated[index];

      // Find matching sheet from allCostSheets
      const matchingSheet = allCostSheets.find(
        (sheet) =>
          sheet.projectName === currentSheet.projectName &&
          sheet.flatType === currentSheet.flatType &&
          safeNumber(sheet.reraCarpet) === newArea
      );

      // If we find a full matching sheet, update multiple fields
      if (matchingSheet) {
        const updatedSheet = {
          ...currentSheet,
          ...matchingSheet, // overrides with updated saleableArea, psfRate, etc.
        };

        updated[index] = recalculateCostSheet(updatedSheet);
      }

      // Recalculate costs
      return updated;
    });
  };

  const handleAddProject = (index: number, newId: string) => {
    const newSheet = allCostSheets.find((s) => s.id === newId);
    if (newSheet) {
      const recalculated = recalculateCostSheet(newSheet);
      setCostSheets((prev) => {
        const updated = [...prev];
        updated[index] = recalculated;
        return updated;
      });
    }
  };

  // Get all unique project names from allCostSheets
  const allProjectOptions = Array.from(
    new Set(allCostSheets.map((sheet) => sheet.projectName).filter(Boolean))
  );

  // Get currently selected project names (excluding empty columns)
  const selectedProjectNames = costSheets
    .map((sheet) => sheet.projectName)
    .filter(Boolean);

  // Filter options to only show projects that aren't already selected
  const availableProjectOptions = allProjectOptions.filter(
    (project) => !selectedProjectNames.includes(project)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Modern Header */}
        <div className="bg-[#0a1f44] px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Property Comparison</h2>
          <button
            className="text-white hover:text-gray-300 transition-colors"
            onClick={handleClose}
            aria-label="Close compare page"
          >
            <X className="h-7 w-7" />
          </button>
        </div>

        {/* Table Container with Sticky Headers */}
        <div className="overflow-x-auto max-h-[75vh] relative">
          <table className="min-w-full border-collapse">
            <tbody className="divide-y divide-gray-200">
              {/* Discount Row */}
              <tr className="bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100 transition-colors">
                <td className="bg-blue-50 border-l-4 border-blue-500 p-3 font-semibold text-gray-700 border-r">
                  <div className="flex items-center">
                    <span>Discount/Negotiation</span>
                  </div>
                </td>
                {costSheets.map((sheet, index) => (
                  <td
                    key={index}
                    className="px-2 py-1 text-sm text-right border-r border-gray-200"
                  >
                    {sheet.projectName ? (
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={sheet.discount || ""}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value) || 0;
                          setCostSheets((prev) => {
                            const updated = [...prev];
                            const item = updated[index];
                            const newItem = { ...item, discount: newValue };
                            updated[index] = recalculateCostSheet(newItem);
                            return updated;
                          });
                        }}
                        className="w-24 text-center border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                        onKeyDown={(e) => {
                          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                            e.preventDefault();
                          }
                        }}
                        onWheel={(e) => {
                          // Prevent the scroll wheel from changing the number
                          e.preventDefault();
                        }}
                      />
                    ) : (
                      <div className="h-10"></div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Select Property Row */}
              <tr className="sticky top-0 z-30 bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100 transition-colors">
                <td className="sticky left-0 z-30 bg-blue-50 border-l-4 border-blue-500 p-3 font-semibold text-gray-700 border-r">
                  <div className="flex items-center">
                    <span>Select Property</span>
                  </div>
                </td>

                {costSheets.map((sheet, index) => (
                  <td
                    key={`select-${index}`}
                    className="px-2 py-1 text-sm text-right border-r border-gray-200"
                  >
                    <select
                      value={sheet.id}
                      onChange={(e) => handleAddProject(index, e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-center font-medium shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Project</option>
                      {sheet.projectName && (
                        <option value={sheet.id}>{sheet.projectName}</option>
                      )}
                      {availableProjectOptions.map((projectName) => {
                        // Find cost sheets with this project name that match the current flatType (if any)
                        const currentFlatType = costSheets.find(s => s.projectName)?.flatType;
                        const projectSheets = allCostSheets.filter(
                          (s) => s.projectName === projectName &&
                          (!currentFlatType || s.flatType === currentFlatType)
                        );
                        const projectSheet = projectSheets[0];
                        return projectSheet ? (
                          <option key={projectSheet.id} value={projectSheet.id}>
                            {projectName}
                          </option>
                        ) : null;
                      })}
                    </select>
                  </td>
                ))}
              </tr>

              {/* Data Rows */}
              {[
                { label: "Location", key: "subLocation", icon: "📍" },
                { label: "Storey", key: "storey", icon: "🏗️" },
                {
                  label: "Saleable Area",
                  key: "saleableArea",
                  formatter: formatArea,
                  icon: "📏",
                },
                {
                  label: "RERA Carpet Area",
                  key: "reraCarpet",
                  formatter: formatArea,
                  icon: "📐",
                },
                {
                  label: "PSF Rate",
                  key: "psfRate",
                  formatter: formatCurrency,
                  icon: "💰",
                },
                {
                  label: "Flat Cost",
                  key: "flatCost",
                  formatter: formatCurrency,
                  icon: "🏠",
                },
                {
                  label: "Floor Rise",
                  key: "floorRisePerFloor",
                  formatter: formatCurrency,
                  icon: "📈",
                },
                { label: "Floor", key: "floor", icon: "🪜" },
                {
                  label: "Agreement Value",
                  key: "agreementValue",
                  formatter: formatCurrency,
                  icon: "📑",
                },
                {
                  label: `Stamp Duty`,
                  key: "stampDuty",
                  formatter: formatCurrency,
                  icon: "🏷️",
                },
                {
                  label: "Registration",
                  key: "registration",
                  formatter: formatCurrency,
                  icon: "✍️",
                },
                {
                  label: `GST`,
                  key: "gst",
                  formatter: formatCurrency,
                  icon: "🧾",
                },
                {
                  label: "Possession Charges",
                  key: "possessionCharges",
                  formatter: formatCurrency,
                  icon: "🔑",
                },
                {
                  label: "Parking Charge",
                  key: "parkingCharge",
                  custom: true,
                  icon: "🚗",
                },
                {
                  label: "Furniture",
                  key: "furnitureCharges",
                  formatter: formatCurrency,
                  icon: "🛋️",
                },
                {
                  label: "Total Package",
                  key: "totalPackage",
                  formatter: formatCurrency,
                  bold: true,
                  icon: "📦",
                },
                { label: "Possession", key: "possession", icon: "📅" },
              ].map(({ label, key, formatter, bold, custom, suffix }) => {
                // Handle Floor row with custom logic
                if (key === "floor") {
                  return (
                    <tr
                      key={key}
                      className="bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100 transition-colors"
                    >
                      <td className="sticky left-0 z-10 bg-blue-50 border-l-4 border-blue-500 px-2 py-1 font-semibold text-gray-700 border-r">
                        <div className="flex items-center">
                          <span>{label}</span>
                          {suffix && (
                            <span className="ml-2 text-xs text-gray-500">
                              {suffix}
                            </span>
                          )}
                        </div>
                      </td>
                      {costSheets.map((sheet, index) => (
                        <td
                          key={`${index}-${key}`}
                          className="px-2 py-1 text-sm text-right border-r border-gray-200"
                        >
                          {sheet.projectName ? (
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              min={1}
                              value={
                                sheet.floor === undefined ||
                                sheet.floor === null
                                  ? ""
                                  : sheet.floor
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                setCostSheets((prev) => {
                                  const updated = [...prev];
                                  const currentSheet = updated[index];

                                  const newFloor =
                                    val.trim() === ""
                                      ? undefined
                                      : parseInt(val);
                                  const updatedSheet = {
                                    ...currentSheet,
                                    floor: isNaN(newFloor!)
                                      ? undefined
                                      : newFloor,
                                  };

                                  updated[index] =
                                    recalculateCostSheet(updatedSheet);
                                  return updated;
                                });
                              }}
                              className="w-16 text-center border border-gray-300 rounded-lg px-2 py-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          ) : (
                            <div className="h-10"></div>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                }

                // Handle Parking Charge row with custom logic
                if (key === "parkingCharge" && custom) {
                  return (
                    <tr
                      key={key}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="sticky left-0 z-10 bg-white p-3 font-semibold text-gray-700 border-r">
                        <div className="flex items-center">
                          <span>{label}</span>
                          {suffix && (
                            <span className="ml-2 text-xs text-gray-500">
                              {suffix}
                            </span>
                          )}
                        </div>
                      </td>
                      {costSheets.map((sheet, index) => (
                        <td
                          key={`${index}-${key}`}
                          className="px-2 py-1 text-sm text-right border-r border-gray-200"
                        >
                          {sheet.projectName ? (
                            sheet.includeParkingInAgreement &&
                            (sheet.parkingCharge ?? 0) > 0 ? (
                              "Parking Included"
                            ) : sheet.withParking ? (
                              formatCurrency(sheet.parkingCharge || 0)
                            ) : (
                              formatCurrency(0)
                            )
                          ) : (
                            <div className="h-6" />
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                }

                // Special handling for RERA row
                if (key === "reraCarpet") {
                  return (
                    <tr
                      key={key}
                      className="bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100 transition-colors"
                    >
                      <td className="sticky left-0 z-10 bg-blue-50 border-l-4 border-blue-500 p-3 font-semibold text-gray-700 border-r">
                        <div className="flex items-center">
                          <span>{label}</span>
                          {suffix && (
                            <span className="ml-2 text-xs text-gray-500">
                              {suffix}
                            </span>
                          )}
                        </div>
                      </td>
                      {costSheets.map((sheet, index) => {
                        if (!sheet.projectName) {
                          return (
                            <td
                              key={`empty-${index}`}
                              className="px-2 py-1 text-sm text-right border-r border-gray-200"
                            >
                              <div className="h-10"></div>
                            </td>
                          );
                        }

                        // Filter all cost-sheets to just this column's flatType (and same project, if desired)
                        const sameTypeSheets = allCostSheets.filter(
                          (s) =>
                            s.flatType === sheet.flatType &&
                            s.projectName === sheet.projectName
                        );

                        // pull out numeric carpet areas:
                        const carpetAreas = Array.from(
                          new Set(
                            sameTypeSheets
                              .map((s) => safeNumber(s.reraCarpet))
                              .filter((n) => n !== undefined && !isNaN(n))
                          )
                        ).sort((a, b) => a - b);

                        return (
                          <td
                            key={sheet.id}
                            className="px-2 py-1 text-sm text-right border-r border-gray-200"
                          >
                            <select
                              value={safeNumber(sheet.reraCarpet) || ""}
                              onChange={(e) =>
                                handleCarpetAreaChange(
                                  index,
                                  Number(e.target.value)
                                )
                              }
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-blue-500"
                            >
                              {carpetAreas.map((area) => (
                                <option key={area} value={area}>
                                  {formatArea(area)}
                                </option>
                              ))}
                            </select>
                          </td>
                        );
                      })}
                    </tr>
                  );
                }

                // Regular rows
                return (
                  <tr key={key} className="hover:bg-gray-50 transition-colors">
                    <td className="sticky left-0 z-10 bg-white px-2 py-1 text-sm font-semibold text-gray-700 border-r">
                      <div className="flex items-center space-x-1">
                        <span>{label}</span>
                        {suffix && (
                          <span className="text-xs text-gray-500">
                            {suffix}
                          </span>
                        )}
                      </div>
                    </td>
                    {costSheets.map((sheet, index) => (
                      <td
                        key={`${index}-${key}`}
                        className={`px-2 py-1 text-sm text-right border-r border-gray-200 ${
                          bold ? "font-bold text-blue-700" : ""
                        }`}
                      >
                        {sheet.projectName ? (
                          formatter &&
                          typeof sheet[key as keyof CostSheet] === "number" ? (
                            formatter(
                              sheet[key as keyof CostSheet] as
                                | number
                                | undefined
                            )
                          ) : sheet[key as keyof CostSheet] != null ? (
                            String(sheet[key as keyof CostSheet])
                          ) : (
                            "N/A"
                          )
                        ) : (
                          <div className="h-5" />
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}

              {/* With Parking */}
              <tr className="bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100">
                <td className="sticky left-0 z-10 bg-blue-50 border-l-4 border-blue-500 p-3 font-semibold text-gray-700 border-r">
                  <div className="flex items-center">
                    <span>With Parking</span>
                  </div>
                </td>
                {costSheets.map((sheet, index) => (
                  <td
                    key={index}
                    className="px-2 py-1 text-sm text-right border-r border-gray-200"
                  >
                    {sheet.projectName ? (
                      <div className="flex justify-center">
                        {formatBooleanDropdown(
                          sheet.withParking ?? false,
                          index,
                          "withParking"
                        )}
                      </div>
                    ) : (
                      <div className="h-10"></div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Include Parking in Agreement */}
              <tr className="bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100">
                <td className="sticky left-0 z-10 bg-blue-50 border-l-4 border-blue-500 p-3 font-semibold text-gray-700 border-r">
                  <div className="flex items-center">
                    <span>Include Parking in Agreement</span>
                  </div>
                </td>
                {costSheets.map((sheet, index) => (
                  <td
                    key={index}
                    className="px-2 py-1 text-sm text-right border-r border-gray-200"
                  >
                    {sheet.projectName ? (
                      <div className="flex justify-center">
                        {formatBooleanDropdown(
                          sheet.includeParkingInAgreement ?? false,
                          index,
                          "includeParkingInAgreement"
                        )}
                      </div>
                    ) : (
                      <div className="h-10"></div>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer with Summary */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              Comparing{" "}
              <strong>{costSheets.filter((s) => s.projectName).length}</strong>{" "}
              properties
            </p>
            <Button
              variant="outline"
              onClick={handleClose}
              className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-lg transition-colors"
            >
              Close Comparison
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compare;
