import React from "react";
import { toTitleCase } from "../../pages/CostSheetFormProps";

export function currentStepEditTab5(
  siteHeads: { name: string; contact: string }[],
  setSiteHeads: React.Dispatch<
    React.SetStateAction<{ name: string; contact: string }[]>
  >,
  sourcingManagers: { name: string; contact: string }[],
  setSourcingManagers: React.Dispatch<
    React.SetStateAction<{ name: string; contact: string }[]>
  >
): React.ReactNode {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
      <div className="grid grid-cols-2 gap-4">
        {/* Site Head Section */}
        <div className="border relative">
          <div className="flex items-center p-2">
            <span className="text-blue-600 mr-1">▶</span>
            <h3 className="font-medium">Site Head</h3>
          </div>
          <div className="bg-neutral-100 p-1 border-t">
            <div className="grid grid-cols-2 gap-2 text-sm font-medium">
              <div>Name</div>
              <div>Phone</div>
            </div>
          </div>
          <div className="bg-white pb-8">
            {siteHeads.map((head, index) => (
              <div key={index} className={`p-1 ${index > 0 ? "border-t" : ""}`}>
                <div className="grid grid-cols-2 gap-2 items-center">
                  <input
                    type="text"
                    value={head.name}
                    onChange={(e) => {
                      const newHeads = [...siteHeads];
                      newHeads[index].name = toTitleCase(e.target.value);
                      setSiteHeads(newHeads);
                    }}
                    className="border px-1 py-1 text-sm"
                  />
                  <input
                    type="text"
                    value={head.contact}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/[^0-9]/g, "")
                        .slice(0, 10);
                      const newHeads = [...siteHeads];
                      newHeads[index].contact = value;
                      setSiteHeads(newHeads);
                    }}
                    className="border px-1 py-1 text-sm"
                    maxLength={10}
                  />
                </div>
              </div>
            ))}
            {/* Add/Remove buttons positioned at bottom right */}
            <div className="absolute bottom-2 right-2 flex gap-1">
              <button
                type="button"
                onClick={() =>
                  setSiteHeads((prev) => [...prev, { name: "", contact: "" }])
                }
                className="w-5 h-5 bg-green-500 text-white text-xs font-bold rounded"
              >
                +
              </button>
              {siteHeads.length > 1 && (
                <button
                  type="button"
                  onClick={() => setSiteHeads((prev) => prev.slice(0, -1))}
                  className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded"
                >
                  -
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sourcing Managers Section */}
        <div className="relative border">
          <div className="flex items-center p-2">
            <span className="text-blue-600 mr-1">▶</span>
            <h3 className="font-medium">Sourcing Managers</h3>
          </div>

          <div className="bg-neutral-100 p-1 border-t">
            <div className="grid grid-cols-2 gap-2 text-sm font-medium">
              <div>Name</div>
              <div>Phone</div>
            </div>
          </div>

          <div className="bg-white pb-10">
            {sourcingManagers.map((manager, index) => (
              <div key={index} className={`p-1 ${index > 0 ? "border-t" : ""}`}>
                <div className="grid grid-cols-2 gap-2 items-center">
                  <input
                    type="text"
                    value={manager.name}
                    onChange={(e) => {
                      const newManagers = [...sourcingManagers];
                      newManagers[index].name = toTitleCase(e.target.value);
                      setSourcingManagers(newManagers);
                    }}
                    className="border px-1 py-1 text-sm"
                  />
                  <input
                    type="text"
                    value={manager.contact}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/[^0-9]/g, "")
                        .slice(0, 10);
                      const newManagers = [...sourcingManagers];
                      newManagers[index].contact = value;
                      setSourcingManagers(newManagers);
                    }}
                    className="border px-1 py-1 text-sm"
                    maxLength={10}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Fixed buttons at bottom right */}
          <div className="absolute bottom-2 right-2 flex gap-1">
            <button
              type="button"
              onClick={() =>
                setSourcingManagers((prev) => [
                  ...prev,
                  { name: "", contact: "" },
                ])
              }
              className="w-6 h-6 bg-green-500 text-white text-sm font-bold rounded"
            >
              +
            </button>

            {sourcingManagers.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setSourcingManagers((prev) => prev.slice(0, prev.length - 1))
                }
                className="w-6 h-6 bg-red-500 text-white text-sm font-bold rounded"
              >
                −
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
