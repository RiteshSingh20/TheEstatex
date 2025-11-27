import React from "react";

export function currentStepEditTab4(
  paymentSchemes: {
    schemeName: string;
    description: string;
    fromDate: string;
    toDate: string;
  }[],
  setPaymentSchemes: React.Dispatch<
    React.SetStateAction<
      {
        schemeName: string;
        description: string;
        fromDate: string;
        toDate: string;
      }[]
    >
  >,
  ladderSections: {
    id: number;
    startDate: string;
    endDate: string;
    rows: { units: string; ladder: string; additionalIncentive: string }[];
  }[],
  setLadderSections: React.Dispatch<
    React.SetStateAction<
      {
        id: number;
        startDate: string;
        endDate: string;
        rows: { units: string; ladder: string; additionalIncentive: string }[];
      }[]
    >
  >,
  taggingValid: string,
  setTaggingValid: React.Dispatch<React.SetStateAction<string>>
): React.ReactNode {
  
  // Enhanced scheme name change handler
  const handleSchemeNameChange = (value: string, index: number) => {
    const newSchemes = [...paymentSchemes];
    newSchemes[index].schemeName = value;
    
    // Auto-fill description for CLP scheme
    if (value === "CLP") {
      newSchemes[index].description = "Construction Linked Plan";
    } else {
      // Set appropriate placeholder based on selection
      switch(value) {
        case "Developer Subvention":
          newSchemes[index].description = "";
          break;
        case "Bank Subvention":
          newSchemes[index].description = "";
          break;
        case "Flexible Payment Plan":
          newSchemes[index].description = "";
          break;
        case "Down Payment":
          newSchemes[index].description = "";
          break;
        default:
          newSchemes[index].description = "";
      }
    }
    
    setPaymentSchemes(newSchemes);
  };

  return (
    <div className="space-y-4">
      {/* Tagging Valid For Section */}
      <div className="border border-gray-300 rounded-lg bg-white">
        <div className="px-2 py-1 text-sm font-medium text-gray-700">
          ▶ Tagging Period
        </div>
        <div className="mb-2">
          <div className="bg-white p-2 border">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Tagging Valid For</span>
              <input
                type="number"
                value={taggingValid}
                onChange={(e) => setTaggingValid(e.target.value)}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-32 border border-neutral-300 rounded px-2 py-1 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="Enter value"
                min="0"
              />
              <span className="text-sm text-gray-600">days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Schemes Section */}
      <div className="border border-gray-300 rounded-lg bg-white">
        <div className="px-2 py-1 text-sm font-medium text-gray-700">
          ▶ Payment Schemes
        </div>

        {/* Payment Scheme Details */}
        <div className="mb-2">
          <div className="bg-gray-50 px-2 py-1 text-sm font-medium border-b border-gray-200">
            Payment Scheme Details
          </div>

          {/* Header Row */}
          <div className="bg-neutral-100 p-2 rounded-t border">
            <div className="grid grid-cols-3 gap-2 text-sm font-medium text-neutral-700">
              <div>Scheme Name</div>
              <div>Description</div>
              <div>Timeline</div>
            </div>
          </div>

          {/* Data Rows */}
          <div className="bg-white">
            {paymentSchemes.map((scheme, index) => (
              <div
                key={index}
                className={`px-2 py-1 ${index > 0 ? "border-t" : ""}`}
              >
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <select
                      value={scheme.schemeName}
                      onChange={(e) => handleSchemeNameChange(e.target.value, index)}
                      className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="">Select Scheme</option>
                      <option value="CLP">CLP</option>
                      <option value="Developer Subvention">Developer Subvention</option>
                      <option value="Bank Subvention">Bank Subvention</option>
                      <option value="Flexible Payment Plan">Flexible Payment Plan</option>
                      <option value="Down Payment">Down Payment</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={scheme.description}
                      onChange={(e) => {
                        const newSchemes = [...paymentSchemes];
                        newSchemes[index].description = e.target.value;
                        setPaymentSchemes(newSchemes);
                      }}
                      readOnly={scheme.schemeName === "CLP"}
                      className={`w-full border border-neutral-300 rounded px-2 py-1 text-sm ${
                        scheme.schemeName === "CLP" ? "bg-neutral-100" : ""
                      }`}
                      placeholder={
                        scheme.schemeName === "Developer Subvention" ? "e.g.: 20:80 Scheme" :
                        scheme.schemeName === "Bank Subvention" ? "e.g.: 10:90 Scheme" :
                        scheme.schemeName === "Flexible Payment Plan" ? "e.g.: 25:25:25:25" :
                        scheme.schemeName === "Down Payment" ? "Describe" :
                        "e.g.: 20:80 Scheme"
                      }
                    />
                  </div>
                  <div>
                    <div className="flex gap-1 items-center">
                      <input
                        type="date"
                        value={scheme.fromDate}
                        onChange={(e) => {
                          const newSchemes = [...paymentSchemes];
                          newSchemes[index].fromDate = e.target.value;
                          setPaymentSchemes(newSchemes);
                        }}
                        className="flex-1 border border-neutral-300 rounded px-2 py-1 text-sm"
                        title="From Date"
                      />
                      <span className="text-xs text-gray-500">to</span>
                      <input
                        type="date"
                        value={scheme.toDate}
                        onChange={(e) => {
                          const newSchemes = [...paymentSchemes];
                          newSchemes[index].toDate = e.target.value;
                          setPaymentSchemes(newSchemes);
                        }}
                        className="flex-1 border border-neutral-300 rounded px-2 py-1 text-sm"
                        title="To Date"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add/Remove buttons */}
          <div className="flex justify-end gap-1 px-2 py-1 bg-gray-50 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setPaymentSchemes([
                  ...paymentSchemes,
                  {
                    schemeName: "",
                    description: "",
                    fromDate: "",
                    toDate: "",
                  },
                ]);
              }}
              className="w-6 h-6 bg-green-500 text-white rounded flex items-center justify-center hover:bg-green-600 text-xs font-bold"
              title="Add Payment Scheme"
            >
              +
            </button>
            {paymentSchemes.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  const newSchemes = paymentSchemes.slice(0, -1);
                  setPaymentSchemes(newSchemes);
                }}
                className="w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600 text-xs font-bold"
                title="Remove Payment Scheme"
              >
                -
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ladder Configuration Section */}
      <div className="border border-gray-300 rounded-lg bg-white">
        <div className="px-2 py-1 text-sm font-medium text-gray-700">
          ▶ Ladder Configuration
        </div>

        {/* Ladder Sections */}
        {ladderSections.map((section, sectionIndex) => (
          <div key={section.id} className="mb-2">
            <div className="bg-gray-50 px-2 py-1 text-sm font-medium border-b border-gray-200">
              Ladder Details - {sectionIndex + 1}
            </div>

            {/* Header Row */}
            <div className="bg-neutral-100 p-2 rounded-t border">
              <div className="grid grid-cols-5 gap-2 text-sm font-medium text-neutral-700">
                <div>Start Date</div>
                <div>End Date</div>
                <div>Units</div>
                <div>Ladder</div>
                <div>Additional Incentive</div>
              </div>
            </div>

            {/* Data Rows */}
            <div className="bg-white">
              {section.rows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className={`px-2 py-1 ${rowIndex > 0 ? "border-t" : ""}`}
                >
                  <div className="grid grid-cols-5 gap-2">
                    {rowIndex === 0 ? (
                      <>
                        <div>
                          <input
                            type="date"
                            value={section.startDate}
                            onChange={(e) => {
                              const newSections = [...ladderSections];
                              newSections[sectionIndex].startDate =
                                e.target.value;
                              setLadderSections(newSections);
                            }}
                            className="w-full border border-gray-300 px-1 py-1 text-xs"
                          />
                        </div>
                        <div>
                          <input
                            type="date"
                            value={section.endDate}
                            onChange={(e) => {
                              const newSections = [...ladderSections];
                              newSections[sectionIndex].endDate =
                                e.target.value;
                              setLadderSections(newSections);
                            }}
                            className="w-full border border-gray-300 px-1 py-1 text-xs"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div></div>
                        <div></div>
                      </>
                    )}
                    <div>
                      <input
                        type="text"
                        value={row.units}
                        onChange={(e) => {
                          const newSections = [...ladderSections];
                          newSections[sectionIndex].rows[rowIndex].units =
                            e.target.value;
                          setLadderSections(newSections);
                        }}
                        className="w-full border border-gray-300 px-1 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={row.ladder}
                        onChange={(e) => {
                          const newSections = [...ladderSections];
                          newSections[sectionIndex].rows[rowIndex].ladder =
                            e.target.value;
                          setLadderSections(newSections);
                        }}
                        className="w-full border border-gray-300 px-1 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={row.additionalIncentive}
                        onChange={(e) => {
                          const newSections = [...ladderSections];
                          newSections[sectionIndex].rows[
                            rowIndex
                          ].additionalIncentive = e.target.value;
                          setLadderSections(newSections);
                        }}
                        className="w-full border border-gray-300 px-1 py-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* All buttons in one row */}
            <div className="flex justify-between items-center px-2 py-1 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-center flex-1">
                {ladderSections.length > 1 && sectionIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newSections = ladderSections.filter(
                        (_, index) => index !== sectionIndex
                      );
                      setLadderSections(newSections);
                    }}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Remove Section
                  </button>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const newSections = [...ladderSections];
                    newSections[sectionIndex].rows.push({
                      units: "",
                      ladder: "",
                      additionalIncentive: "",
                    });
                    setLadderSections(newSections);
                  }}
                  className="w-6 h-6 bg-green-500 text-white rounded flex items-center justify-center hover:bg-green-600 text-sm font-bold"
                  title="Add Row"
                >
                  +
                </button>
                {section.rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newSections = [...ladderSections];
                      newSections[sectionIndex].rows.splice(-1, 1);
                      setLadderSections(newSections);
                    }}
                    className="w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600 text-sm font-bold"
                    title="Remove Row"
                  >
                    -
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add New Ladder Section Button */}
        <div className="flex justify-center py-2 bg-gray-50 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              const newId = Math.max(...ladderSections.map((s) => s.id)) + 1;
              setLadderSections([
                ...ladderSections,
                {
                  id: newId,
                  startDate: "",
                  endDate: "",
                  rows: [
                    {
                      units: "",
                      ladder: "",
                      additionalIncentive: "",
                    },
                  ],
                },
              ]);
            }}
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs flex items-center gap-1"
          >
            + Add New Ladder Section
          </button>
        </div>
      </div>
    </div>
  );
}