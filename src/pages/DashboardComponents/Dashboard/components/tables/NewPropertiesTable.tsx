import React from "react";
import { CostSheet } from "../../../../../components/CompareComponents/Compare";
import { FilterState } from "../../utils/propertyConstants";

interface NewPropertiesTableProps {
  filteredNewProperties: CostSheet[];
  appliedFilters: FilterState;
  selectedCostSheets: CostSheet[];
  toggleCostSheetSelection: (costSheet: CostSheet) => void;
  handleProjectClick: (sheet: CostSheet) => void;
  setSelectedProjectData: React.Dispatch<
    React.SetStateAction<CostSheet | null>
  >;
  openMediaModal: (
    title: string,
    files: string[],
    type?: "image" | "video" | "pdf"
  ) => void;
  getMediaSections: (
    mediaFiles: any
  ) => { name: string; files: any; type: string }[];
  handleImageClick: (sheet: CostSheet) => void;
  handleVideoClick: (sheet: CostSheet) => void;
  handleBrochureClick: (sheet: CostSheet) => void;
  currentPage: number;
  itemsPerPage: number;
  setProcessedCount: (count: number) => void;
}

const NewPropertiesTable: React.FC<NewPropertiesTableProps> = ({
  filteredNewProperties,
  appliedFilters,
  selectedCostSheets,
  toggleCostSheetSelection,
  handleProjectClick,
  setSelectedProjectData,
  openMediaModal,
  getMediaSections,
  handleImageClick,
  handleVideoClick,
  handleBrochureClick,
  currentPage,
  itemsPerPage,
  setProcessedCount,
}) => {
  // Process data for display (deduplicate by project) but keep original data for Compare
  const processedData = Object.values(
    filteredNewProperties.reduce((acc, sheet) => {
      const projectName = sheet.projectName;
      const selectedTypology = appliedFilters.bhkType;

      // Find the lowest total package for display
      let lowestPackage = Infinity;

      if (selectedTypology) {
        // If typology is selected, find lowest for that typology
        // Check typologies array
        if (sheet.typologies && Array.isArray(sheet.typologies)) {
          sheet.typologies.forEach((typology) => {
            if (
              typology.typology === selectedTypology &&
              typology.availability !== "Sold Out"
            ) {
              const pkgValue = typology.totalPackage;
              const pkg =
                typeof pkgValue === "string"
                  ? Number(pkgValue.replace(/[^0-9]/g, ""))
                  : pkgValue || 0;
              if (pkg > 0 && pkg < lowestPackage) {
                lowestPackage = pkg;
              }
            }
          });
        }

        // Check subTabData
        if (sheet.subTabData) {
          Object.values(sheet.subTabData).forEach((tabData: any) => {
            if (
              tabData.pricingConfigs &&
              Array.isArray(tabData.pricingConfigs)
            ) {
              tabData.pricingConfigs.forEach((config: any) => {
                if (
                  config.typology === selectedTypology &&
                  config.availability !== "Sold Out"
                ) {
                  const pkgValue = config.totalPackage;
                  const pkg =
                    typeof pkgValue === "string"
                      ? Number(pkgValue.replace(/[^0-9]/g, ""))
                      : pkgValue || 0;
                  if (pkg > 0 && pkg < lowestPackage) {
                    lowestPackage = pkg;
                  }
                }
              });
            }
          });
        }
      } else {
        // If no typology selected, find overall lowest package
        // Check typologies array
        if (sheet.typologies && Array.isArray(sheet.typologies)) {
          sheet.typologies.forEach((typology) => {
            if (typology.availability !== "Sold Out") {
              const pkgValue = typology.totalPackage;
              const pkg =
                typeof pkgValue === "string"
                  ? Number(pkgValue.replace(/[^0-9]/g, ""))
                  : pkgValue || 0;
              if (pkg > 0 && pkg < lowestPackage) {
                lowestPackage = pkg;
              }
            }
          });
        }

        // Check subTabData
        if (sheet.subTabData) {
          Object.values(sheet.subTabData).forEach((tabData: any) => {
            if (
              tabData.pricingConfigs &&
              Array.isArray(tabData.pricingConfigs)
            ) {
              tabData.pricingConfigs.forEach((config: any) => {
                if (config.availability !== "Sold Out") {
                  const pkgValue = config.totalPackage;
                  const pkg =
                    typeof pkgValue === "string"
                      ? Number(pkgValue.replace(/[^0-9]/g, ""))
                      : pkgValue || 0;
                  if (pkg > 0 && pkg < lowestPackage) {
                    lowestPackage = pkg;
                  }
                }
              });
            }
          });
        }
      }

      // Only add if we found a valid package (deduplicate for display)
      if (lowestPackage !== Infinity) {
        if (
          !acc[projectName] ||
          lowestPackage < (acc[projectName]._lowestPackage || Infinity)
        ) {
          acc[projectName] = {
            ...sheet,
            _lowestPackage: lowestPackage,
          };
        }
      }

      return acc;
    }, {} as Record<string, any>)
  ).sort((a, b) => {
    // Sort by the lowest package we calculated in ascending order
    return (a._lowestPackage || 0) - (b._lowestPackage || 0);
  });

  // Store processed count for parent component
  React.useEffect(() => {
    setProcessedCount(processedData.length);
  }, [processedData.length, setProcessedCount]);
  return (
    <div className="overflow-x-auto">
      <table
        className="min-w-full divide-y divide-neutral-200 table-fixed select-none"
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        <thead className="bg-blue-100 border-b-2 border-blue-200">
          <tr>
            <th className="w-16 px-3 py-3 text-center text-xs font-semibold text-blue-900 uppercase tracking-wide">
              Sr. No.
            </th>
            <th className="w-10 px-1 py-3 text-center text-xs font-semibold text-blue-900 uppercase tracking-wide">
              Select
            </th>
            <th className="w-48 px-3 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wide">
              Building / Society name
            </th>
            <th className="w-40 px-3 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wide">
              {appliedFilters.station ? "Road / Location" : "Location"}
            </th>
            <th className="w-32 px-3 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wide">
              Area (Sq.ft)
            </th>
            <th className="w-32 px-3 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wide">
              Total Package
            </th>
            <th className="w-28 px-3 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wide">
              Possession Date
            </th>
            <th className="w-20 px-3 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wide">
              Brochure
            </th>
            <th className="w-20 px-3 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wide">
              Image
            </th>
            <th className="w-20 px-3 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wide">
              Video
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {processedData
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((sheet, idx) => {
              // Handle both data structures for display
              const totalPackage =
                sheet.totalPackage || sheet.typologies?.[0]?.totalPackage;
              const subLocation = sheet.subLocation || sheet.road;
              const possession =
                sheet.possession || sheet.typologies?.[0]?.developerPossession;

              return (
                <tr
                  key={sheet.id}
                  className={`${
                    (sheet as any)._isNegotiatedMatch
                      ? "bg-yellow-50 hover:bg-yellow-50"
                      : "hover:bg-neutral-50"
                  }`}
                >
                  <td
                    className="px-3 py-3 text-center text-xs text-neutral-600"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(currentPage - 1) * itemsPerPage + idx + 1}
                  </td>
                  <td
                    className="px-1 py-3 text-center cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCostSheetSelection(sheet);
                    }}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                      checked={selectedCostSheets.some(
                        (cs) => cs.projectName === sheet.projectName
                      )}
                      onChange={() => toggleCostSheetSelection(sheet)}
                    />
                  </td>
                  <td
                    className="px-3 py-3 text-xs text-primary cursor-pointer hover:underline truncate"
                    onClick={() => handleProjectClick(sheet)}
                    title={sheet.projectName}
                  >
                    {sheet.projectName}
                  </td>
                  <td
                    className="px-3 py-3 text-xs text-neutral-900 truncate"
                    onClick={(e) => e.stopPropagation()}
                    title={appliedFilters.station ? subLocation : `${subLocation} in ${(sheet.station || sheet.location)}`}
                  >
                    {appliedFilters.station ? subLocation : (
                      <div>
                        <div>{subLocation}</div>
                        <div className="text-gray-500">in {sheet.station || sheet.location}</div>
                      </div>
                    )}
                  </td>
                  <td
                    className="px-3 py-3 text-xs text-neutral-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(() => {
                      // Find the same configuration that gave us the lowest package
                      const selectedTypology = appliedFilters.bhkType;
                      let matchingSaleableArea = "";
                      let matchingReraCarpet = "";
                      const lowestPackage = sheet._lowestPackage;

                      if (selectedTypology) {
                        // Find the exact config that matches the selected typology and lowest package
                        // Check typologies array
                        if (sheet.typologies && Array.isArray(sheet.typologies)) {
                          const matchingConfig = sheet.typologies.find(
                            (typology) => {
                              if (typology.typology !== selectedTypology || typology.availability === "Sold Out") return false;
                              const pkgValue = typology.totalPackage;
                              const pkg = typeof pkgValue === "string" ? Number(pkgValue.replace(/[^0-9]/g, "")) : pkgValue || 0;
                              return pkg === lowestPackage;
                            }
                          );
                          if (matchingConfig) {
                            matchingSaleableArea = matchingConfig.saleableArea || "";
                            matchingReraCarpet = matchingConfig.reraCarpet || "";
                          }
                        }

                        // Check subTabData if not found
                        if (!matchingSaleableArea && sheet.subTabData) {
                          Object.values(sheet.subTabData).forEach((tabData: any) => {
                            if (tabData.pricingConfigs && Array.isArray(tabData.pricingConfigs)) {
                              const matchingConfig = tabData.pricingConfigs.find(
                                (config: any) => {
                                  if (config.typology !== selectedTypology || config.availability === "Sold Out") return false;
                                  const pkgValue = config.totalPackage;
                                  const pkg = typeof pkgValue === "string" ? Number(pkgValue.replace(/[^0-9]/g, "")) : pkgValue || 0;
                                  return pkg === lowestPackage;
                                }
                              );
                              if (matchingConfig) {
                                matchingSaleableArea = matchingConfig.saleableArea || "";
                                matchingReraCarpet = matchingConfig.reraCarpet || "";
                              }
                            }
                          });
                        }
                      } else {
                        // No typology selected, find the config that gave us the lowest package
                        // Check typologies array
                        if (sheet.typologies && Array.isArray(sheet.typologies)) {
                          const matchingConfig = sheet.typologies.find(
                            (typology) => {
                              if (typology.availability === "Sold Out") return false;
                              const pkgValue = typology.totalPackage;
                              const pkg = typeof pkgValue === "string" ? Number(pkgValue.replace(/[^0-9]/g, "")) : pkgValue || 0;
                              return pkg === lowestPackage;
                            }
                          );
                          if (matchingConfig) {
                            matchingSaleableArea = matchingConfig.saleableArea || "";
                            matchingReraCarpet = matchingConfig.reraCarpet || "";
                          }
                        }

                        // Check subTabData if not found
                        if (!matchingSaleableArea && sheet.subTabData) {
                          Object.values(sheet.subTabData).forEach((tabData: any) => {
                            if (tabData.pricingConfigs && Array.isArray(tabData.pricingConfigs)) {
                              const matchingConfig = tabData.pricingConfigs.find(
                                (config: any) => {
                                  if (config.availability === "Sold Out") return false;
                                  const pkgValue = config.totalPackage;
                                  const pkg = typeof pkgValue === "string" ? Number(pkgValue.replace(/[^0-9]/g, "")) : pkgValue || 0;
                                  return pkg === lowestPackage;
                                }
                              );
                              if (matchingConfig) {
                                matchingSaleableArea = matchingConfig.saleableArea || "";
                                matchingReraCarpet = matchingConfig.reraCarpet || "";
                              }
                            }
                          });
                        }
                      }

                      if (matchingSaleableArea || matchingReraCarpet) {
                        return (
                          <div className="text-xs">
                            {matchingSaleableArea && (
                              <div className="text-gray-700">Saleable: {matchingSaleableArea}</div>
                            )}
                            {matchingReraCarpet && (
                              <div className="text-gray-700">RERA: {matchingReraCarpet}</div>
                            )}
                          </div>
                        );
                      }
                      return "-";
                    })()}
                  </td>
                  <td
                    className="px-3 py-3 text-xs font-semibold text-neutral-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {sheet._lowestPackage
                      ? `₹${Number(sheet._lowestPackage).toLocaleString(
                          "en-IN"
                        )}`
                      : "N/A"}
                  </td>
                  <td
                    className="px-3 py-3 text-xs text-neutral-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(() => {
                      if (
                        possession === "Ready to Move" ||
                        possession?.toLowerCase() === "ready to move"
                      ) {
                        return "Ready to Move";
                      }
                      if (possession && possession.includes("-")) {
                        try {
                          const date = new Date(possession);
                          if (!isNaN(date.getTime())) {
                            return date.toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            });
                          }
                        } catch {}
                      }
                      return possession || "Ready to Move";
                    })()}
                  </td>
                  <td
                    className="px-3 py-3 text-xs text-neutral-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {getMediaSections(sheet.mediaFiles, sheet).filter(
                      (section) => section.type === "pdf"
                    ).length > 0 ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBrochureClick(sheet);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer bg-transparent border-none p-0"
                      >
                        Available
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500">-</span>
                    )}
                  </td>
                  <td
                    className="px-3 py-3 text-xs text-neutral-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {getMediaSections(sheet.mediaFiles, sheet).filter(
                      (section) => section.type === "image"
                    ).length > 0 ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageClick(sheet);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer bg-transparent border-none p-0"
                      >
                        Available
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500">-</span>
                    )}
                  </td>
                  <td
                    className="px-3 py-3 text-xs text-neutral-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {getMediaSections(sheet.mediaFiles, sheet).filter(
                      (section) => section.type === "video"
                    ).length > 0 ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVideoClick(sheet);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer bg-transparent border-none p-0"
                      >
                        Available
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default NewPropertiesTable;
