import React from "react";
import {
  getCurrentTypology,
  getTypologyCarpetAreas,
  getLowestTotalPackageCarpetArea,
} from "./carpetAreaUtils";

interface Props {
  label: string;
  suffix?: string;
  costSheets: any[];
  getFieldValue: Function;
  handleCarpetAreaChange: (index: number, value: number) => void;
  formatArea: (area: number) => string;
  filtersApplied: boolean;
  filterPropertyType?: string;
}

export function ReraCarpetRow({
  label,
  suffix,
  costSheets,
  getFieldValue,
  handleCarpetAreaChange,
  formatArea,
  filtersApplied,
  filterPropertyType,
}: Props) {
  // Auto-select first available carpet area when filters are applied
  React.useEffect(() => {
    if (filterPropertyType) {
      costSheets.forEach((sheet, index) => {
        if (sheet.projectName && !getFieldValue(sheet, "reraCarpet")) {
          const targetTypology = filterPropertyType || getCurrentTypology(sheet);
          const availableAreas = getTypologyCarpetAreas(sheet, targetTypology, true);
          
          if (availableAreas.length > 0) {
            handleCarpetAreaChange(index, availableAreas[0]);
          }
        }
      });
    }
  }, [filterPropertyType, costSheets]);


  return (
    <tr className="bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100 transition-colors">
      <td className="sticky left-0 z-10 bg-blue-50 border-l-4 border-blue-500 p-3 font-semibold text-gray-700 border-r">
        <div className="flex items-center">
          <span>{label}</span>
          {suffix && (
            <span className="ml-2 text-xs text-gray-500">{suffix}</span>
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
              <div className="h-10" />
            </td>
          );
        }

        const targetTypology = filterPropertyType || getCurrentTypology(sheet);
        const availableAreas = getTypologyCarpetAreas(
          sheet,
          targetTypology,
          !!filterPropertyType
        );
        const currentArea = getFieldValue(sheet, "reraCarpet");
        
        // Auto-select first matching area if current area doesn't match the typology
        if (filterPropertyType && currentArea && !availableAreas.includes(currentArea) && availableAreas.length > 0) {
          handleCarpetAreaChange(index, availableAreas[0]);
        }
        
        // Only include current area if it matches the typology or no typology filter is applied
        const allAreas = currentArea && !availableAreas.includes(currentArea) && !filterPropertyType
          ? [...availableAreas, currentArea].sort((a, b) => a - b)
          : availableAreas;



        return (
          <td
            key={sheet.id}
            className="px-2 py-1 text-sm text-right border-r border-gray-200"
          >
            <select
              value={currentArea || ""}
              onChange={(e) => {
                const value = Number(e.target.value);
                handleCarpetAreaChange(index, value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  (e.target as HTMLSelectElement).blur();
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Carpet Area</option>
              {allAreas.map((area) => (
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
