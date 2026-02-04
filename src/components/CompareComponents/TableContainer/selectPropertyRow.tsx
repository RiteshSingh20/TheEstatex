import React from "react";
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
  handleRemoveProject: (index: number) => void,
  selectedIndices: number[],
  setSelectedIndices: (indices: number[]) => void,
  filterPropertyType?: string,
  filterLocation?: string
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
          <div 
            className="relative"
            ref={(el) => {
              if (el) {
                const handleClickOutside = (event: MouseEvent) => {
                  if (!el.contains(event.target as Node)) {
                    const newShowDropdowns = [...showDropdowns];
                    newShowDropdowns[index] = false;
                    setShowDropdowns(newShowDropdowns);
                  }
                };
                
                const handleEscKey = (event: KeyboardEvent) => {
                  if (event.key === 'Escape') {
                    const newShowDropdowns = [...showDropdowns];
                    newShowDropdowns[index] = false;
                    setShowDropdowns(newShowDropdowns);
                  }
                };

                if (showDropdowns[index]) {
                  document.addEventListener('mousedown', handleClickOutside);
                  document.addEventListener('keydown', handleEscKey);
                  return () => {
                    document.removeEventListener('mousedown', handleClickOutside);
                    document.removeEventListener('keydown', handleEscKey);
                  };
                }
              }
            }}
          >
            <input
              type="text"
              value={searchTerms[index] || sheet.projectName || ""}
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
                  let sheetsToUse = filtersApplied && filteredSheets.length > 0
                    ? filteredSheets
                    : allCostSheets.filter((sheet) => {
                        return (
                          sheet.isApproved === true ||
                          sheet.approvalStatus === "approved"
                        );
                      });
                  
                  // Apply current filters if they exist but filteredSheets is empty
                  if (filtersApplied && (filterPropertyType || filterLocation)) {
                    sheetsToUse = sheetsToUse.filter((sheet) => {
                      if (filterLocation) {
                        const locations = [sheet.station, sheet.location].filter(Boolean);
                        const hasMatchingLocation = locations.some(
                          (loc) => loc.toLowerCase().trim() === filterLocation.toLowerCase().trim()
                        );
                        if (!hasMatchingLocation) return false;
                      }
                      
                      if (filterPropertyType) {
                        let hasMatchingTypology = false;
                        if (sheet.typologies && Array.isArray(sheet.typologies)) {
                          hasMatchingTypology = sheet.typologies.some((typology) => {
                            if (typology.availability === "Sold Out") return false;
                            return typology.typology?.toLowerCase() === filterPropertyType.toLowerCase();
                          });
                        }
                        if (!hasMatchingTypology) {
                          const flatType = sheet.flatType || sheet.typologies?.[0]?.typology;
                          const availability = sheet.availability || sheet.typologies?.[0]?.availability;
                          if (availability === "Sold Out") return false;
                          hasMatchingTypology = flatType?.toLowerCase() === filterPropertyType.toLowerCase();
                        }
                        if (!hasMatchingTypology) return false;
                      }
                      
                      return true;
                    });
                  }

                  const availableProjectOptions = Array.from(
                    new Set(
                      sheetsToUse
                        .map((sheet) => sheet.projectName)
                        .filter(Boolean)
                    )
                  ).filter(
                    (projectName) => !selectedProjectNames.includes(projectName)
                  );
                  return availableProjectOptions
                    .filter((projectName) =>
                      projectName
                        .toLowerCase()
                        .includes((searchTerms[index] || "").toLowerCase())
                    )
                    .sort((a, b) => {
                      const aStartsWithNumber = /^\d/.test(a);
                      const bStartsWithNumber = /^\d/.test(b);
                      if (aStartsWithNumber && bStartsWithNumber) {
                        return parseInt(a) - parseInt(b);
                      }
                      if (aStartsWithNumber && !bStartsWithNumber) return -1;
                      if (!aStartsWithNumber && bStartsWithNumber) return 1;
                      return a.toLowerCase().localeCompare(b.toLowerCase());
                    });
                })();

                const allOptions = sheet.projectName ? ["Select Project", ...filteredOptions] : filteredOptions;
                
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  const newSelectedIndices = [...selectedIndices];
                  newSelectedIndices[index] = Math.min(
                    selectedIndices[index] + 1,
                    allOptions.length - 1
                  );
                  setSelectedIndices(newSelectedIndices);
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  const newSelectedIndices = [...selectedIndices];
                  newSelectedIndices[index] = Math.max(
                    selectedIndices[index] - 1,
                    -1
                  );
                  setSelectedIndices(newSelectedIndices);
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  const newShowDropdowns = [...showDropdowns];
                  newShowDropdowns[index] = false;
                  setShowDropdowns(newShowDropdowns);
                } else if (e.key === "Enter" && selectedIndices[index] >= 0) {
                  e.preventDefault();
                  const allOptions = sheet.projectName ? ["Select Project", ...filteredOptions] : filteredOptions;
                  const selectedOption = allOptions[selectedIndices[index]];
                  
                  if (selectedOption === "Select Project") {
                    handleRemoveProject(index);
                  } else {
                    const sheetsToSearch = filtersApplied ? filteredSheets : allCostSheets;
                    const projectSheet = sheetsToSearch.find(
                      (s) => s.projectName === selectedOption && (
                        s.isApproved === true || s.approvalStatus === "approved"
                      )
                    );
                    if (projectSheet) {
                      handleAddProject(index, projectSheet.id);
                    }
                  }
                  
                  const newSearchTerms = [...searchTerms];
                  newSearchTerms[index] = "";
                  setSearchTerms(newSearchTerms);
                  const newShowDropdowns = [...showDropdowns];
                  newShowDropdowns[index] = false;
                  setShowDropdowns(newShowDropdowns);
                }
              }}
              placeholder="Search Project"
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-center font-medium shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute z-[60] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto" style={{display: showDropdowns[index] ? 'block' : 'none'}}>
                {(() => {
                  // Use filtered sheets if filters are applied, otherwise use all sheets
                  let sheetsToUse = filtersApplied && filteredSheets.length > 0
                    ? filteredSheets
                    : allCostSheets.filter((sheet) => {
                        return (
                          sheet.isApproved === true ||
                          sheet.approvalStatus === "approved"
                        );
                      });
                  
                  // Apply current filters if they exist but filteredSheets is empty
                  if (filtersApplied && (filterPropertyType || filterLocation)) {
                    sheetsToUse = sheetsToUse.filter((sheet) => {
                      if (filterLocation) {
                        const locations = [sheet.station, sheet.location].filter(Boolean);
                        const hasMatchingLocation = locations.some(
                          (loc) => loc.toLowerCase().trim() === filterLocation.toLowerCase().trim()
                        );
                        if (!hasMatchingLocation) return false;
                      }
                      
                      if (filterPropertyType) {
                        let hasMatchingTypology = false;
                        if (sheet.typologies && Array.isArray(sheet.typologies)) {
                          hasMatchingTypology = sheet.typologies.some((typology) => {
                            if (typology.availability === "Sold Out") return false;
                            return typology.typology?.toLowerCase() === filterPropertyType.toLowerCase();
                          });
                        }
                        if (!hasMatchingTypology) {
                          const flatType = sheet.flatType || sheet.typologies?.[0]?.typology;
                          const availability = sheet.availability || sheet.typologies?.[0]?.availability;
                          if (availability === "Sold Out") return false;
                          hasMatchingTypology = flatType?.toLowerCase() === filterPropertyType.toLowerCase();
                        }
                        if (!hasMatchingTypology) return false;
                      }
                      
                      return true;
                    });
                  }

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

                  // Filter by search term and sort with numeric first, then alphabetical
                  const filteredOptions = availableProjectOptions
                    .filter((projectName) =>
                      projectName
                        .toLowerCase()
                        .includes((searchTerms[index] || "").toLowerCase())
                    )
                    .sort((a, b) => {
                      const aStartsWithNumber = /^\d/.test(a);
                      const bStartsWithNumber = /^\d/.test(b);
                      if (aStartsWithNumber && bStartsWithNumber) {
                        return parseInt(a) - parseInt(b);
                      }
                      if (aStartsWithNumber && !bStartsWithNumber) return -1;
                      if (!aStartsWithNumber && bStartsWithNumber) return 1;
                      return a.toLowerCase().localeCompare(b.toLowerCase());
                    });

                  const allOptions = sheet.projectName ? ["Select Project", ...filteredOptions] : filteredOptions;

                  return allOptions.length > 0 ? (
                    allOptions.map((optionName, optionIndex) => {
                      if (optionName === "Select Project") {
                        return (
                          <div
                            key="select-project"
                            onClick={() => {
                              handleRemoveProject(index);
                              const newSearchTerms = [...searchTerms];
                              newSearchTerms[index] = "";
                              setSearchTerms(newSearchTerms);
                              const newShowDropdowns = [...showDropdowns];
                              newShowDropdowns[index] = false;
                              setShowDropdowns(newShowDropdowns);
                            }}
                            className={`px-4 py-2 hover:bg-red-50 cursor-pointer text-sm text-left border-b border-gray-200 text-red-600 font-medium ${
                              selectedIndices[index] === optionIndex
                                ? "bg-red-100"
                                : ""
                            }`}
                          >
                            Select Project
                          </div>
                        );
                      }
                      
                      const projectSheet = sheetsToUse.find(
                        (s) => s.projectName === optionName && (
                          s.isApproved === true || s.approvalStatus === "approved"
                        )
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
                            selectedIndices[index] === optionIndex
                              ? "bg-blue-100"
                              : ""
                          }`}
                        >
                          {optionName}
                        </div>
                      ) : null;
                    })
                  ) : (
                    <div className="px-4 py-2 text-gray-500 text-sm">
                      {allCostSheets.length === 0 ? "Loading projects..." : "No projects found"}
                    </div>
                  );
                })()}
              </div>
          </div>
        </td>
      ))}
    </tr>
  );
}
