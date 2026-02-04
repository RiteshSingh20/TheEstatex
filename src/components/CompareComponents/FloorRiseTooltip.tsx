import React, { useState } from "react";
import { CostSheet } from "./Compare";

interface FloorRiseTooltipProps {
  sheet: CostSheet;
  children: React.ReactNode;
  selectedTypology?: string;
}

export const FloorRiseTooltip: React.FC<FloorRiseTooltipProps> = ({
  sheet,
  children,
  selectedTypology,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const getTooltipContent = () => {
    const floorRiseType = sheet.floorRise || "";
    const floorRiseConfig = sheet.floorRiseConfig || {};

    if (floorRiseType === "Floor Rise") {
      return (
        <div className="text-sm">
          ₹ {floorRiseConfig.rate || 0}/- per floor,{" "}
          {floorRiseConfig.startsFrom || 1}<sup>{floorRiseConfig.startsFrom === "1" ? "st" : floorRiseConfig.startsFrom === "2" ? "nd" : floorRiseConfig.startsFrom === "3" ? "rd" : "th"}</sup> floor onwards.
        </div>
      );
    }

    if (floorRiseType === "FR - Fixed Rate" || floorRiseType === "Fixed Rate") {
      const typologyRates = floorRiseConfig.typologyRates || {};
      const currentTypology = selectedTypology || "1 BHK";
      const selectedTypologyRate =
        typologyRates[currentTypology] || typologyRates["1 BHK"] || 0;

      return (
        <div className="text-sm">
          ₹ {selectedTypologyRate}/- per floor,{" "}
          {floorRiseConfig.fixedRateStartsFrom || 1}<sup>{floorRiseConfig.fixedRateStartsFrom === "1" ? "st" : floorRiseConfig.fixedRateStartsFrom === "2" ? "nd" : floorRiseConfig.fixedRateStartsFrom === "3" ? "rd" : "th"}</sup> floor onwards.
        </div>
      );
    }

    if (floorRiseType === "Floor Band") {
      const floorBandConfig =
        sheet.floorBandConfig ||
        sheet.typologies?.[0]?.floorBandConfiguration ||
        [];

      return (
        <div className="text-sm">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 py-1 text-left">
                  Slab
                </th>
                <th className="border border-gray-300 px-2 py-1 text-center">
                  Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {floorBandConfig.length > 0 ? (
                floorBandConfig.map((band, index) => {
                  const currentTypology = selectedTypology || "1 BHK";
                  const rate =
                    band.rates?.[currentTypology] || band.rate || "NIL";

                  return (
                    <tr key={index}>
                      <td className="border border-gray-300 px-2 py-1">
                        {band.fromFloor}st to {band.toFloor}th
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {rate === "NIL" || !rate ? "NIL" : `₹${rate}`}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="border border-gray-300 px-2 py-1" colSpan={2}>
                    No floor band data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }

    return <div className="text-sm">No floor rise data available</div>;
  };

  return (
    <div className="relative">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-help"
      >
        {children}
      </div>

      {showTooltip && (
        <div
          className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3 max-w-xs"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 10,
            transform: "translateY(-100%)",
          }}
        >
          {getTooltipContent()}
        </div>
      )}
    </div>
  );
};
