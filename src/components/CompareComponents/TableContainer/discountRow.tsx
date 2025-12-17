import { CostSheet } from "../Compare";

export function discountRow(
  costSheets: CostSheet[],
  setCostSheets,
  recalculateCostSheet: (sheet: CostSheet) => CostSheet
) {
  return (
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
  );
}
