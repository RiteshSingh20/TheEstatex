import { CostSheet } from "../Compare";

export function selectPropertyRow(
  costSheets: CostSheet[],
  searchTerms: string[],
  setSearchTerms,
  showDropdowns: boolean[],
  setShowDropdowns,
  filtersApplied: boolean,
  filteredSheets: CostSheet[],
  allCostSheets: CostSheet[],
  location,
  selectedProjectNames: (string | undefined)[],
  handleAddProject: (index: number, newId: string) => void,
  selectedIndices: number[],
  setSelectedIndices: (indices: number[]) => void
) {

  return (
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
          <div className="relative">
            <input
              type="text"
              value={sheet.projectName || searchTerms[index] || ""}
              onChange={(e) => {
                const newSearchTerms = [...searchTerms];
                newSearchTerms[index] = e.target.value;
                setSearchTerms(newSearchTerms);

                const newShowDropdowns = [...showDropdowns];
                newShowDropdowns[index] = e.target.value.length > 0;
                setShowDropdowns(newShowDropdowns);
                
                const newSelectedIndices = [...selectedIndices];
                newSelectedIndices[index] = -1;
                setSelectedIndices(newSelectedIndices);
              }}
              onFocus={() => {
                const newShowDropdowns = [...showDropdowns];
                newShowDropdowns[index] = true;
                setShowDropdowns(newShowDropdowns);
              }}
              onKeyDown={(e) => {
                if (!showDropdowns[index]) return;
                
                const filteredOptions = (() => {
                  const sheetsToUse = filtersApplied ? filteredSheets : allCostSheets.filter((sheet) => {
                    if (!(sheet.isApproved === true || sheet.approvalStatus === "approved")) return false;
                    const urlParams = new URLSearchParams(location.search);
                    const bhkFilter = urlParams.get("bhkType");
                    const stationFilter = urlParams.get("station");
                    const subLocationFilter = urlParams.get("subLocation");
                    const possessionFilter = urlParams.get("possession");
                    
                    if (bhkFilter) {
                      const flatType = sheet.flatType || sheet.typologies?.[0]?.typology || sheet.type;
                      if (!flatType) return false;
                      const normalizedFlatType = flatType.toLowerCase().trim();
                      const normalizedFilter = bhkFilter.toLowerCase().trim();
                      if (normalizedFlatType !== normalizedFilter && !normalizedFlatType.includes(normalizedFilter) && !normalizedFilter.includes(normalizedFlatType)) {
                        return false;
                      }
                    }
                    
                    if (stationFilter) {
                      const stationToCheck = sheet.station || sheet.location || sheet.city;
                      if (!stationToCheck || stationToCheck.toLowerCase().trim() !== stationFilter.toLowerCase().trim()) return false;
                    }
                    
                    if (subLocationFilter && subLocationFilter !== "null" && subLocationFilter !== "[]") {
                      try {
                        const subLocations = JSON.parse(subLocationFilter);
                        if (Array.isArray(subLocations) && subLocations.length > 0) {
                          const sheetSubLocation = sheet.subLocation || sheet.road || sheet.area;
                          if (!sheetSubLocation || !subLocations.some((loc) => loc.toLowerCase().trim() === sheetSubLocation.toLowerCase().trim())) {
                            return false;
                          }
                        }
                      } catch {}
                    }
                    
                    if (possessionFilter) {
                      const possession = sheet.possession || sheet.reraPossession || sheet.typologies?.[0]?.developerPossession;
                      if (possessionFilter === "Ready to Move") {
                        if (!possession || possession.toLowerCase().trim() !== "ready to move") return false;
                      } else {
                        if (!possession || !possession.includes(possessionFilter)) return false;
                      }
                    }
                    
                    const availability = sheet.availability || sheet.typologies?.[0]?.availability || sheet.availibility;
                    if (availability && availability.toLowerCase().includes("sold out")) return false;
                    
                    return true;
                  });
                  
                  const availableProjectOptions = Array.from(new Set(sheetsToUse.map((sheet) => sheet.projectName).filter(Boolean))).filter((projectName) => !selectedProjectNames.includes(projectName));
                  return availableProjectOptions.filter((projectName) => projectName.toLowerCase().includes((searchTerms[index] || "").toLowerCase())).sort();
                })();
                
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  const newSelectedIndices = [...selectedIndices];
                  newSelectedIndices[index] = Math.min(selectedIndices[index] + 1, filteredOptions.length - 1);
                  setSelectedIndices(newSelectedIndices);
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  const newSelectedIndices = [...selectedIndices];
                  newSelectedIndices[index] = Math.max(selectedIndices[index] - 1, -1);
                  setSelectedIndices(newSelectedIndices);
                } else if (e.key === 'Enter' && selectedIndices[index] >= 0) {
                  e.preventDefault();
                  const selectedProject = filteredOptions[selectedIndices[index]];
                  const projectSheet = (filtersApplied ? filteredSheets : allCostSheets).find((s) => s.projectName === selectedProject);
                  if (projectSheet) {
                    handleAddProject(index, projectSheet.id);
                    const newSearchTerms = [...searchTerms];
                    newSearchTerms[index] = "";
                    setSearchTerms(newSearchTerms);
                    const newShowDropdowns = [...showDropdowns];
                    newShowDropdowns[index] = false;
                    setShowDropdowns(newShowDropdowns);
                  }
                }
              }}
              placeholder="Search Project"
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-center font-medium shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {showDropdowns[index] && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {(() => {
                  // Use filtered sheets if filters are applied, otherwise use all sheets
                  const sheetsToUse = filtersApplied
                    ? filteredSheets
                    : allCostSheets.filter((sheet) => {
                        // Only show approved properties
                        if (
                          !(
                            sheet.isApproved === true ||
                            sheet.approvalStatus === "approved"
                          )
                        )
                          return false;

                        // Get filters from URL parameters for initial load
                        const urlParams = new URLSearchParams(location.search);
                        const bhkFilter = urlParams.get("bhkType");
                        const stationFilter = urlParams.get("station");
                        const subLocationFilter = urlParams.get("subLocation");
                        const possessionFilter = urlParams.get("possession");

                        // BHK filter - check both flatType and typology with flexible matching
                        if (bhkFilter) {
                          const flatType =
                            sheet.flatType ||
                            sheet.typologies?.[0]?.typology ||
                            sheet.type;
                          if (!flatType) return false;

                          const normalizedFlatType = flatType
                            .toLowerCase()
                            .trim();
                          const normalizedFilter = bhkFilter
                            .toLowerCase()
                            .trim();

                          // Exact match or contains match for jodi types
                          if (
                            normalizedFlatType !== normalizedFilter &&
                            !normalizedFlatType.includes(normalizedFilter) &&
                            !normalizedFilter.includes(normalizedFlatType)
                          ) {
                            return false;
                          }
                        }

                        // Station filter - check multiple location fields
                        if (stationFilter) {
                          const stationToCheck =
                            sheet.station || sheet.location || sheet.city;
                          if (
                            !stationToCheck ||
                            stationToCheck.toLowerCase().trim() !==
                              stationFilter.toLowerCase().trim()
                          )
                            return false;
                        }

                        // Sub Location filter
                        if (
                          subLocationFilter &&
                          subLocationFilter !== "null" &&
                          subLocationFilter !== "[]"
                        ) {
                          try {
                            const subLocations = JSON.parse(subLocationFilter);
                            if (
                              Array.isArray(subLocations) &&
                              subLocations.length > 0
                            ) {
                              const sheetSubLocation =
                                sheet.subLocation || sheet.road || sheet.area;
                              if (
                                !sheetSubLocation ||
                                !subLocations.some(
                                  (loc) =>
                                    loc.toLowerCase().trim() ===
                                    sheetSubLocation.toLowerCase().trim()
                                )
                              ) {
                                return false;
                              }
                            }
                          } catch {
                            // If parsing fails, skip this filter
                          }
                        }

                        // Possession filter
                        if (possessionFilter) {
                          const possession =
                            sheet.possession ||
                            sheet.reraPossession ||
                            sheet.typologies?.[0]?.developerPossession;
                          if (possessionFilter === "Ready to Move") {
                            if (
                              !possession ||
                              possession.toLowerCase().trim() !==
                                "ready to move"
                            )
                              return false;
                          } else {
                            if (
                              !possession ||
                              !possession.includes(possessionFilter)
                            )
                              return false;
                          }
                        }

                        // Check availability - exclude sold out properties
                        const availability =
                          sheet.availability ||
                          sheet.typologies?.[0]?.availability ||
                          sheet.availibility;
                        if (
                          availability &&
                          availability.toLowerCase().includes("sold out")
                        )
                          return false;

                        return true;
                      });

                  // Get unique project names from sheets, excluding already selected ones
                  const availableProjectOptions = Array.from(
                    new Set(
                      sheetsToUse
                        .map((sheet) => sheet.projectName)
                        .filter(Boolean)
                    )
                  ).filter(
                    (projectName) => !selectedProjectNames.includes(projectName)
                  );

                  // Filter by search term and sort alphabetically
                  const filteredOptions = availableProjectOptions.filter(
                    (projectName) =>
                      projectName
                        .toLowerCase()
                        .includes((searchTerms[index] || "").toLowerCase())
                  ).sort();

                  return filteredOptions.length > 0 ? (
                    filteredOptions.map((projectName, optionIndex) => {
                      // Find the first matching sheet for this project
                      const projectSheet = sheetsToUse.find(
                        (s) => s.projectName === projectName
                      );
                      return projectSheet ? (
                        <div
                          key={projectSheet.id}
                          onClick={() => {
                            handleAddProject(index, projectSheet.id);
                            const newSearchTerms = [...searchTerms];
                            newSearchTerms[index] = "";
                            setSearchTerms(newSearchTerms);
                            const newShowDropdowns = [...showDropdowns];
                            newShowDropdowns[index] = false;
                            setShowDropdowns(newShowDropdowns);
                          }}
                          className={`px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-left ${
                            selectedIndices[index] === optionIndex ? 'bg-blue-100' : ''
                          }`}
                        >
                          {projectName}
                        </div>
                      ) : null;
                    })
                  ) : (
                    <div className="px-4 py-2 text-gray-500 text-sm">
                      No projects found
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </td>
      ))}
    </tr>
  );
}
