import { getCurrentTypology, getTypologyCarpetAreas } from "./carpetAreaUtils";

interface Props {
  label: string;
  suffix?: string;
  costSheets: any[];
  getFieldValue: Function;
  handleCarpetAreaChange: (index: number, value: number) => void;
  formatArea: (area: number) => string;
}

export function ReraCarpetRow({
  label,
  suffix,
  costSheets,
  getFieldValue,
  handleCarpetAreaChange,
  formatArea,
}: Props) {
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

        const typology = getCurrentTypology(sheet);
        const carpetAreas = getTypologyCarpetAreas(sheet, typology);
        const currentCarpetArea = getFieldValue(sheet, "reraCarpet");

        return (
          <td
            key={sheet.id}
            className="px-2 py-1 text-sm text-right border-r border-gray-200"
          >
            <select
              value={currentCarpetArea || ""}
              onChange={(e) =>
                handleCarpetAreaChange(index, Number(e.target.value))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-blue-500"
            >
              <option value="">Select Carpet Area</option>

              {currentCarpetArea &&
                !carpetAreas.includes(currentCarpetArea) && (
                  <option value={currentCarpetArea}>
                    {formatArea(currentCarpetArea)} (Current)
                  </option>
                )}

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
