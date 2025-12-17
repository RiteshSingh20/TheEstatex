import React from "react";
import { CostSheet } from "../../../components/CompareComponents/Compare";

export function newPropertiesTable(
  filteredNewProperties: CostSheet[],
  appliedFilters: {
    bhkType: string;
    station: string;
    minBudget: string;
    maxBudget: string;
    minCarpetArea: string;
    maxCarpetArea: string;
    subLocation: string[];
    possession: string;
    lookingForCosmo: boolean | undefined;
    BalconyorTerrace: string | undefined;
    parking: boolean | undefined;
    amenities: string[];
    petFriendly: boolean | undefined;
    furnishing: string | undefined;
    ocRed: string | undefined;
    schemes: string[];
  },
  selectedCostSheets: CostSheet[],
  toggleCostSheetSelection: (costSheet: CostSheet) => void,
  handleProjectClick: (sheet: CostSheet) => void,
  setSelectedProjectData: React.Dispatch<
    React.SetStateAction<CostSheet | null>
  >,
  openMediaModal: (
    title: string,
    files: string[],
    type?: "image" | "video" | "pdf"
  ) => void,
  getMediaSections: (
    mediaFiles: any
  ) => { name: string; files: any; type: string }[],
  handleImageClick: (sheet: CostSheet) => void,
  handleVideoClick: (sheet: CostSheet) => void
) {
  return (
    <div className="overflow-x-auto max-w-full max-h-screen overflow-y-auto sticky top-0 z-40 bg-white">
      <table
        className="min-w-full divide-y divide-neutral-200 table-auto select-none"
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        <thead className="bg-blue-100 border-b-2 border-blue-200 sticky top-0 z-50">
          <tr>
            <th className="px-4 py-4 text-center text-sm font-bold text-blue-900 uppercase tracking-wide">
              Sr. No.
            </th>
            <th className="px-4 py-4 text-center text-sm font-bold text-blue-900 uppercase tracking-wide">
              Select
            </th>
            <th className="px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wide">
              Building / Society name
            </th>
            <th className="px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wide">
              Road / Location
            </th>
            <th className="px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wide">
              Total Package
            </th>
            <th className="px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wide">
              Possession Date
            </th>
            <th className="px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wide">
              Brochure
            </th>
            <th className="px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wide">
              Image
            </th>
            <th className="px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wide">
              Video
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {Object.values(
            filteredNewProperties.reduce((acc, sheet) => {
              const projectName = sheet.projectName;
              const selectedTypology = appliedFilters.bhkType;

              // Find the lowest total package
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

              // Only add if we found a valid package
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
          )
            .sort((a, b) => {
              // Sort by the lowest package we calculated
              return (a._lowestPackage || 0) - (b._lowestPackage || 0);
            })
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
                  className={`hover:bg-neutral-50 ${
                    (sheet as any)._isNegotiatedMatch ? "bg-yellow-50" : ""
                  }`}
                >
                  <td
                    className="px-4 py-4 text-center text-sm text-neutral-500"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {idx + 1}
                  </td>
                  <td
                    className="px-4 py-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                      checked={selectedCostSheets.some(
                        (cs) => cs.id === sheet.id
                      )}
                      onChange={() => toggleCostSheetSelection(sheet)}
                    />
                  </td>
                  <td
                    className="px-4 py-4 whitespace-nowrap text-sm text-primary cursor-pointer hover:underline"
                    onClick={() => handleProjectClick(sheet)}
                  >
                    {sheet.projectName}
                  </td>
                  <td
                    className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {subLocation}
                  </td>
                  <td
                    className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-neutral-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {sheet._lowestPackage
                      ? `₹${Number(sheet._lowestPackage).toLocaleString(
                          "en-IN"
                        )}`
                      : "N/A"}
                  </td>
                  <td
                    className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900"
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
                    className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {sheet.mediaFiles?.brochure ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openMediaModal(
                            "Brochure",
                            [sheet.mediaFiles.brochure],
                            "pdf"
                          );
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
                    className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {getMediaSections(sheet.mediaFiles).filter(
                      (section) => section.type === "image"
                    ).length > 0 ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProjectData(sheet);
                          openMediaModal("Images", [], "image");
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
                    className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {getMediaSections(sheet.mediaFiles).filter(
                      (section) => section.type === "video"
                    ).length > 0 ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProjectData(sheet);
                          openMediaModal("Videos", [], "video");
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
}
