import { CostSheet } from "./Compare";

export function inLineFilters(
  filterPropertyType: string,
  setFilterPropertyType,
  allCostSheets: CostSheet[],
  filterLocation: string,
  setFilterLocation,
  setFilteredSheets,
  setFiltersApplied,
  setCostSheets,
  filtersApplied: boolean
) {
  return (
    <div className="flex items-center gap-3">
      <select
        value={filterPropertyType}
        onChange={(e) => setFilterPropertyType(e.target.value)}
        className="bg-white border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">All Types</option>
        {Array.from(
          new Set(
            allCostSheets
              .filter(
                (sheet) =>
                  sheet.isApproved === true ||
                  sheet.approvalStatus === "approved"
              )
              .flatMap((sheet) => {
                const types = [];
                if (sheet.typologies) {
                  sheet.typologies.forEach((t) => {
                    if (t.typology && t.availability !== "Sold Out")
                      types.push(t.typology);
                  });
                }
                if (sheet.flatType && sheet.availability !== "Sold Out")
                  types.push(sheet.flatType);
                return types;
              })
              .filter(Boolean)
          )
        )
          .sort()
          .map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
      </select>

      <select
        value={filterLocation}
        onChange={(e) => setFilterLocation(e.target.value)}
        className="bg-white border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">All Locations</option>
        {(() => {
          // Get locations from approved cost sheets
          const sheetLocations = allCostSheets
            .filter(
              (sheet) =>
                sheet.isApproved === true || sheet.approvalStatus === "approved"
            )
            .flatMap((sheet) => {
              const locations = [];
              if (sheet.station) locations.push(sheet.station);
              if (sheet.location) locations.push(sheet.location);
              return locations;
            })
            .filter(Boolean);

          // Combine with static station names (East/West variants)
          const staticStations = [
            "Airoli East",
            "Airoli West",
            "Andheri East",
            "Andheri West",
            "Badlapur East",
            "Badlapur West",
            "Belapur East",
            "Belapur West",
            "Bhandup East",
            "Bhandup West",
            "Borivali East",
            "Borivali West",
            "Chembur East",
            "Chembur West",
            "Dahisar East",
            "Dahisar West",
            "Dombivli East",
            "Dombivli West",
            "Ghatkopar East",
            "Ghatkopar West",
            "Goregaon East",
            "Goregaon West",
            "Jogeshwari East",
            "Jogeshwari West",
            "Juhu East",
            "Juhu West",
            "Kalyan East",
            "Kalyan West",
            "Kandivali East",
            "Kandivali West",
            "Kharghar East",
            "Kharghar West",
            "Kurla East",
            "Kurla West",
            "Malad East",
            "Malad West",
            "Mira Road East",
            "Mira Road West",
            "Mulund East",
            "Mulund West",
            "Nalasopara East",
            "Nalasopara West",
            "Nerul East",
            "Nerul West",
            "Panvel East",
            "Panvel West",
            "Powai East",
            "Powai West",
            "Santacruz East",
            "Santacruz West",
            "Thane East",
            "Thane West",
            "Ulwe East",
            "Ulwe West",
            "Vasai East",
            "Vasai West",
            "Vashi East",
            "Vashi West",
            "Virar East",
            "Virar West",
          ];

          // Combine and deduplicate all locations
          const allLocations = Array.from(
            new Set([...sheetLocations, ...staticStations])
          );

          return allLocations.sort().map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ));
        })()}
      </select>

      <button
        onClick={() => {
          // Use the same filter logic as Dashboard
          const filtered = allCostSheets.filter((sheet) => {
            const isApproved =
              sheet.isApproved === true || sheet.approvalStatus === "approved";
            if (!isApproved) return false;

            // Location filter - check station and location fields
            if (filterLocation) {
              const locations = [sheet.station, sheet.location].filter(Boolean);
              const hasMatchingLocation = locations.some(
                (loc) =>
                  loc.toLowerCase().trim() ===
                  filterLocation.toLowerCase().trim()
              );

              if (!hasMatchingLocation) {
                return false;
              }
            }

            // Check if sheet has any available typologies matching the BHK filter
            let hasMatchingTypology = false;

            // Check typologies array
            if (sheet.typologies && Array.isArray(sheet.typologies)) {
              hasMatchingTypology = sheet.typologies.some((typology) => {
                if (typology.availability === "Sold Out") return false;

                // BHK filter
                if (filterPropertyType) {
                  return (
                    typology.typology?.toLowerCase() ===
                    filterPropertyType.toLowerCase()
                  );
                }
                return true;
              });
            }

            // Fallback to old structure
            if (!hasMatchingTypology) {
              const flatType =
                sheet.flatType || sheet.typologies?.[0]?.typology;
              const availability =
                sheet.availability || sheet.typologies?.[0]?.availability;

              if (availability === "Sold Out") return false;

              if (filterPropertyType) {
                hasMatchingTypology =
                  flatType?.toLowerCase() === filterPropertyType.toLowerCase();
              } else {
                hasMatchingTypology = true;
              }
            }

            if (!hasMatchingTypology) return false;

            return true;
          });

          // Set filtered sheets and mark filters as applied
          setFilteredSheets(filtered);
          setFiltersApplied(true);

          // Clear the table - show 5 empty columns
          const emptySheets = Array.from({ length: 5 }, (_, index) => ({
            id: `empty-${index}`,
          }));
          setCostSheets(emptySheets);
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm transition-colors"
      >
        Apply
      </button>

      {filtersApplied && (
        <button
          onClick={() => {
            // Clear filters and reset table
            setFilterPropertyType("");
            setFilterLocation("");
            setFiltersApplied(false);
            setFilteredSheets([]);

            // Reset to original state with empty columns
            const emptySheets = Array.from({ length: 5 }, (_, index) => ({
              id: `empty-${index}`,
            }));
            setCostSheets(emptySheets);
          }}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-1 rounded text-sm transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
