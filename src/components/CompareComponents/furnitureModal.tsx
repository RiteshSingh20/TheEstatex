import { X } from "lucide-react";
import { CostSheet } from "./Compare";

export function furnitureModal(
  setShowFurnitureModal,
  costSheets: CostSheet[],
  selectedColumnIndex: number,
  getFieldValue: (
    sheet: CostSheet,
    field: string
  ) =>
    | string
    | number
    | boolean
    | string[]
    | {
        typology: string;
        saleableArea: number;
        avRate: number;
        psfRate: number;
        fixedComponent?: string;
        floorBandConfiguration: Array<{
          fromFloor: string;
          toFloor: string;
          rates: { [bhkType: string]: string };
        }>;
      }[]
    | { parkingCharges: string; possessionCharges?: string }
    | {
        typology: string;
        saleableArea: string;
        avRate: string;
        psfRate: string;
        fixedComponent?: string;
        possessionCharges: string;
        reraCarpet: string;
        totalPackage: string;
        availability: string;
        negotiationScope: string;
      }[]
    | { fixedRateStartsFrom: string; rate: string; startsFrom: string }
    | {
        fromFloor: string;
        toFloor: string;
        rates: { [bhkType: string]: string };
      }[]
    | { [bhkType: string]: string }
    | { name: string; contact: string }[]
    | undefined,
  formatCurrency: (value?: number) => string,
  safeNumber: (val: unknown, fallback?: undefined) => number | undefined,
  setCostSheets,
  recalculateCostSheet: (sheet: CostSheet) => CostSheet
) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Edit Furniture Charges
          </h3>
          <button
            onClick={() => setShowFurnitureModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {(() => {
            const sheet = costSheets[selectedColumnIndex];
            const psfRate = getFieldValue(sheet, "psfRate") || 0;
            const avRate = getFieldValue(sheet, "avRate") || 0;
            const saleableArea = getFieldValue(sheet, "saleableArea") || 0;
            const showDifferenceFields = psfRate !== avRate;

            return (
              <>
                {showDifferenceFields && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difference between AV & PSF (Disabled)
                      </label>
                      <input
                        type="text"
                        value={formatCurrency(
                          (psfRate - avRate) * saleableArea
                        )}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Floor Rise (Disabled)
                      </label>
                      <input
                        type="text"
                        value={formatCurrency(sheet?.floorRisePerFloor || 0)}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </>
                )}

                {/* Show parking charges if AV < PSF and parking is mandatory/included */}
                {(() => {
                  const sheet = costSheets[selectedColumnIndex];
                  let parkingCost = 0;
                  if (
                    sheet.subTabData &&
                    typeof sheet.subTabData === "object"
                  ) {
                    for (const key in sheet.subTabData) {
                      const tabData = sheet.subTabData[key];
                      if (
                        tabData &&
                        typeof tabData === "object" &&
                        "parkingCharges" in tabData
                      ) {
                        parkingCost = parseInt(tabData.parkingCharges) || 0;
                        if (parkingCost) break;
                      }
                    }
                  }
                  if (!parkingCost) {
                    parkingCost = safeNumber(sheet.parkingCharge) || 0;
                  }

                  // Check if parking is mandatory or included
                  let isParkingMandatoryOrIncluded =
                    sheet.includeParkingInAgreement || false;
                  if (
                    sheet.subTabData &&
                    typeof sheet.subTabData === "object"
                  ) {
                    const currentTypology =
                      sheet.typologies?.[0]?.typology || sheet.flatType || "";
                    for (const k in sheet.subTabData) {
                      const tabData = sheet.subTabData[k];
                      if (
                        tabData?.psfIncludesParking === true ||
                        tabData?.psfIncludesParking === "true"
                      ) {
                        isParkingMandatoryOrIncluded = true;
                        break;
                      }
                      if (
                        tabData?.mandatoryParkingTypologies &&
                        Array.isArray(tabData.mandatoryParkingTypologies)
                      ) {
                        if (
                          tabData.mandatoryParkingTypologies.includes(
                            currentTypology
                          )
                        ) {
                          isParkingMandatoryOrIncluded = true;
                          break;
                        }
                      }
                    }
                  }

                  const psfRate = getFieldValue(sheet, "psfRate") || 0;
                  const avRate = getFieldValue(sheet, "avRate") || 0;

                  // Show parking field only if AV < PSF and parking is mandatory/included
                  if (
                    avRate < psfRate &&
                    isParkingMandatoryOrIncluded &&
                    parkingCost > 0
                  ) {
                    return (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Parking Charges (Disabled)
                        </label>
                        <input
                          type="text"
                          value={formatCurrency(parkingCost)}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                      </div>
                    );
                  }
                  return null;
                })()}
              </>
            );
          })()}

          {(() => {
            const sheet = costSheets[selectedColumnIndex];
            const fixedComponentValue = getFieldValue(sheet, "fixedComponent") || 0;
            
            // Only show fixed component field if it has a value
            if (fixedComponentValue) {
              return (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fixed Component (Un-editable)
                  </label>
                  <input
                    type="text"
                    value={formatCurrency(fixedComponentValue)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
              );
            }
            return null;
          })()}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Fixed Component (Editable)
            </label>
            <input
              type="number"
              value={(() => {
                const sheet = costSheets[selectedColumnIndex];
                const additionalValue = safeNumber(
                  sheet?.additionalFixedComponent
                );
                return additionalValue || "";
              })()}
              onChange={(e) => {
                const value = e.target.value;
                const newValue =
                  value === "" ? undefined : parseFloat(value) || 0;
                setCostSheets((prev) => {
                  const updated = [...prev];
                  const item = updated[selectedColumnIndex];

                  // Update the additionalFixedComponent
                  const updatedItem = {
                    ...item,
                    additionalFixedComponent: newValue,
                  };

                  updated[selectedColumnIndex] =
                    recalculateCostSheet(updatedItem);
                  return updated;
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter additional fixed component amount"
            />
          </div>

          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-700">
                Total Furniture Charges:
              </span>
              <span className="font-semibold text-blue-600">
                {(() => {
                  const sheet = costSheets[selectedColumnIndex];
                  const psfRate = getFieldValue(sheet, "psfRate") || 0;
                  const avRate = getFieldValue(sheet, "avRate") || 0;
                  const saleableArea =
                    getFieldValue(sheet, "saleableArea") || 0;

                  // Calculate difference
                  const difference = (psfRate - avRate) * saleableArea;

                  // Get floor rise (only if AV < PSF)
                  let floorRise = 0;
                  if (avRate < psfRate) {
                    floorRise = sheet?.floorRisePerFloor || 0;
                  }

                  // Get parking charges (only if AV < PSF and parking is mandatory/included)
                  let parkingCharges = 0;
                  if (avRate < psfRate) {
                    let parkingCost = 0;
                    if (
                      sheet.subTabData &&
                      typeof sheet.subTabData === "object"
                    ) {
                      for (const key in sheet.subTabData) {
                        const tabData = sheet.subTabData[key];
                        if (
                          tabData &&
                          typeof tabData === "object" &&
                          "parkingCharges" in tabData
                        ) {
                          parkingCost = parseInt(tabData.parkingCharges) || 0;
                          if (parkingCost) break;
                        }
                      }
                    }
                    if (!parkingCost) {
                      parkingCost = safeNumber(sheet.parkingCharge) || 0;
                    }

                    // Check if parking is mandatory or included
                    let isParkingMandatoryOrIncluded =
                      sheet.includeParkingInAgreement || false;
                    if (
                      sheet.subTabData &&
                      typeof sheet.subTabData === "object"
                    ) {
                      const currentTypology =
                        sheet.typologies?.[0]?.typology || sheet.flatType || "";
                      for (const k in sheet.subTabData) {
                        const tabData = sheet.subTabData[k];
                        if (
                          tabData?.psfIncludesParking === true ||
                          tabData?.psfIncludesParking === "true"
                        ) {
                          isParkingMandatoryOrIncluded = true;
                          break;
                        }
                        if (
                          tabData?.mandatoryParkingTypologies &&
                          Array.isArray(tabData.mandatoryParkingTypologies)
                        ) {
                          if (
                            tabData.mandatoryParkingTypologies.includes(
                              currentTypology
                            )
                          ) {
                            isParkingMandatoryOrIncluded = true;
                            break;
                          }
                        }
                      }
                    }

                    if (isParkingMandatoryOrIncluded) {
                      parkingCharges = parkingCost;
                    }
                  }

                  // Get fixed component
                  const fixedComponent = getFieldValue(sheet, "fixedComponent") || 0;

                  // Get additional fixed component
                  const additionalFixedComponent =
                    safeNumber(sheet?.additionalFixedComponent) || 0;

                  // Calculate total furniture charges
                  const totalFurnitureCharges =
                    difference +
                    floorRise +
                    parkingCharges +
                    fixedComponent +
                    additionalFixedComponent;

                  return formatCurrency(totalFurnitureCharges);
                })()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setShowFurnitureModal(false)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => setShowFurnitureModal(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
