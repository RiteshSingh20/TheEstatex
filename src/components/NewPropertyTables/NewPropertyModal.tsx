import React, { useState } from "react";
import { CostSheet } from "../CompareModal";

interface NewPropertyModalProps {
  Section: any;
  Field: any;
  selectedSheet: CostSheet;
}

export function NewPropertyModal({
  Section,
  Field,
  selectedSheet,
}: NewPropertyModalProps) {
  // Group typologies by RERA number for tab functionality
  const typologies = (selectedSheet as any).typologies;
  const groupedByRera = typologies ? typologies.reduce((acc: any, typology: any) => {
    const reraNumber = typology.mahaReraNumber || 'No RERA';
    if (!acc[reraNumber]) acc[reraNumber] = [];
    acc[reraNumber].push(typology);
    return acc;
  }, {}) : {};
  
  const reraNumbers = Object.keys(groupedByRera);
  const [activeTab, setActiveTab] = useState('');
  
  // Set initial active tab when reraNumbers change
  React.useEffect(() => {
    if (reraNumbers.length > 0 && !activeTab) {
      setActiveTab(reraNumbers[0]);
    }
  }, [reraNumbers, activeTab]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Section 1: Basic Details */}
      <Section title="Basic Details">
        <Field label="Update date" value={selectedSheet.dateUpdateCostSheet} />
        <Field label="Location" value={selectedSheet.station} />
        <Field label="Developer Name" value={selectedSheet.developerName} />
        <Field label="Project Name" value={selectedSheet.projectName} />
        <Field label="Sub-Location" value={selectedSheet.subLocation} />
        <Field label="Landmark" value={selectedSheet.landmark} />
        <Field label="Pin Code" value={selectedSheet.pinCode} />
        <Field label="District" value={selectedSheet.district} />
        <Field label="State" value={selectedSheet.state} />
        <Field label="Land Parcel" value={selectedSheet.landParcel} />
        <Field label="Total Towers" value={selectedSheet.towers} />
        <Field label="Total Storey" value={selectedSheet.storey} />
      </Section>

      {/* Section 2: Pricing Details */}
      <Section title="Pricing Details">
        <>
          {typologies && Array.isArray(typologies) && typologies.length > 0 ? (
            // New format: Show typologies with tabs by RERA number
            <div className="col-span-2">
              {/* Tabs */}
              <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-8">
                  {reraNumbers.map((reraNumber) => (
                    <button
                      key={reraNumber}
                      onClick={() => setActiveTab(reraNumber)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === reraNumber
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {reraNumber.length > 15 ? `${reraNumber.substring(0, 15)}...` : reraNumber}
                    </button>
                  ))}
                </nav>
              </div>
              
              {/* Active Tab Content */}
              <div className="overflow-hidden rounded-lg border border-neutral-200">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                        Typology
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                        Area (Sq.ft)
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                        PSF Rate
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                        AV Rate
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                        Possession Charges
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                        Total Package
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {groupedByRera[activeTab]?.filter((typology: any) => typology.availability === "Available").map((typology: any, index: number) => (
                      <tr key={index} className="hover:bg-neutral-50">
                        <td className="px-3 py-2 text-sm font-medium text-neutral-900">
                          {typology.typology || "-"}
                        </td>
                        <td className="px-3 py-2 text-sm text-neutral-800">
                          <div className="text-xs text-gray-500">Saleable: {typology.saleableArea || "-"}</div>
                          <div className="text-xs text-gray-500">RERA: {typology.reraCarpet || "-"}</div>
                        </td>
                        <td className="px-3 py-2 text-sm text-neutral-800">
                          {typology.psfRate ? `₹${parseFloat(typology.psfRate).toLocaleString('en-IN')}` : "-"}
                        </td>
                        <td className="px-3 py-2 text-sm text-neutral-800">
                          {typology.avRate ? `₹${parseFloat(typology.avRate).toLocaleString('en-IN')}` : "-"}
                        </td>
                        <td className="px-3 py-2 text-sm text-neutral-800">
                          {typology.possessionCharges ? `₹${parseFloat(typology.possessionCharges).toLocaleString('en-IN')}` : "-"}
                        </td>
                        <td className="px-3 py-2 text-sm text-neutral-800">
                          {typology.totalPackage ? `₹${parseFloat(typology.totalPackage).toLocaleString('en-IN')}` : "-"}
                        </td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              // Old format: Show individual fields
              <>
                <Field label="Wing/Building No." value={selectedSheet.wingBuildingNo} />
                <Field label="BHK Type" value={selectedSheet.flatType} />
                <Field label="Saleable Area" value={selectedSheet.saleableArea} />
                <Field
                  label="RERA Carpet / Usable Carpet"
                  value={selectedSheet.reraCarpet}
                />
                <Field label="Per Sq. ft. Rate" value={selectedSheet.psfRate} />
                <Field label="Agreement Value Rate" value={selectedSheet.avRate} />
                <Field label="Floor Rise Rate" value={selectedSheet.floorRise} />
                <Field
                  label="Registration Fee/ Charge"
                  value={selectedSheet.registration}
                />
              </>
            )}
        </>
      </Section>

      {/* Section 3: Other charges & Payment Plans */}
      <Section title="Other charges & Payment Plans">
        {/* Payment Schemes Grid Layout */}
        <div className="col-span-2 mb-6">
          <h5 className="font-medium mb-3 text-neutral-700 flex items-center">
            <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Payment Scheme Details
          </h5>
          {(selectedSheet as any).paymentSchemes && Array.isArray((selectedSheet as any).paymentSchemes) && (selectedSheet as any).paymentSchemes.length > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-neutral-500 uppercase border-b pb-2">
                <div className="col-span-3">Scheme Name</div>
                <div className="col-span-4">Description</div>
                <div className="col-span-5">Timeline</div>
              </div>
              {(selectedSheet as any).paymentSchemes.map((scheme: any, index: number) => (
                <div key={index} className="grid grid-cols-12 gap-4 py-3 border-b border-neutral-100 hover:bg-neutral-50">
                  <div className="col-span-3 text-sm font-medium text-neutral-900">
                    {scheme.schemeName || "-"}
                  </div>
                  <div className="col-span-4 text-sm text-neutral-800">
                    {scheme.description || "-"}
                  </div>
                  <div className="col-span-5 text-sm text-neutral-800">
                    {scheme.fromDate && scheme.toDate ? (
                      <span>{scheme.fromDate} <span className="text-neutral-500">to</span> {scheme.toDate}</span>
                    ) : (
                      <span>{scheme.fromDate || scheme.toDate || "-"}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-neutral-500 italic">
              No payment schemes available
            </div>
          )}
        </div>

        {/* Ladder Sections with Tabs */}
        <div className="col-span-2">
          {(selectedSheet as any).ladderSections && Array.isArray((selectedSheet as any).ladderSections) && (selectedSheet as any).ladderSections.length > 0 ? (
            (() => {
              const ladderSections = (selectedSheet as any).ladderSections;
              const [activeLadderTab, setActiveLadderTab] = useState(0);
              
              return (
                <div>
                  <h5 className="font-medium mb-3 text-neutral-700 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Ladder Details
                  </h5>
                  
                  {/* Ladder Tabs */}
                  {ladderSections.length > 1 && (
                    <div className="border-b border-gray-200 mb-4">
                      <nav className="-mb-px flex space-x-8">
                        {ladderSections.map((section: any, index: number) => (
                          <button
                            key={index}
                            onClick={() => setActiveLadderTab(index)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                              activeLadderTab === index
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            Ladder {index + 1}
                          </button>
                        ))}
                      </nav>
                    </div>
                  )}
                  
                  {/* Active Ladder Content */}
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4">
                      <div className="flex items-center text-sm">
                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium text-blue-800">Period:</span>
                        <span className="ml-2 text-blue-700 font-medium">
                          {(() => {
                            const startDate = ladderSections[activeLadderTab]?.startDate;
                            const endDate = ladderSections[activeLadderTab]?.endDate;
                            const formatDate = (dateStr: string) => {
                              if (!dateStr) return "N/A";
                              const date = new Date(dateStr);
                              const day = date.getDate();
                              const month = date.toLocaleDateString('en-US', { month: 'short' });
                              const year = date.getFullYear().toString().slice(-2);
                              return `${day} ${month} ${year}`;
                            };
                            return `${formatDate(startDate)} to ${formatDate(endDate)}`;
                          })()} 
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-12 gap-4 text-xs font-medium text-neutral-500 uppercase border-b pb-2">
                      <div className="col-span-2">Units</div>
                      <div className="col-span-2">Ladder</div>
                      <div className="col-span-8">Additional Incentive</div>
                    </div>
                    
                    {ladderSections[activeLadderTab]?.rows && Array.isArray(ladderSections[activeLadderTab].rows) ? (
                      ladderSections[activeLadderTab].rows.map((row: any, rowIndex: number) => (
                        <div key={rowIndex} className="grid grid-cols-12 gap-4 py-3 border-b border-neutral-100 hover:bg-neutral-50">
                          <div className="col-span-2 text-sm font-medium text-neutral-900">
                            {row.units || "-"}
                          </div>
                          <div className="col-span-2 text-sm text-neutral-800">
                            {row.ladder || "-"}
                          </div>
                          <div className="col-span-8 text-sm text-neutral-800">
                            {row.additionalIncentive || "-"}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-neutral-500 italic py-4">
                        No ladder data available for this section
                      </div>
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            <div>
              <h5 className="font-medium mb-3 text-neutral-700 flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Ladder Details
              </h5>
              <div className="text-sm text-neutral-500 italic">
                No incentive ladder available
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Section 4: Amenities */}
      <Section title="Amenities">
        <div className="col-span-2">
          <h5 className="font-medium mb-2">Apartment Amenities</h5>
          <Field
            label=""
            value={
              Array.isArray(selectedSheet.apartmentAmenities)
                ? selectedSheet.apartmentAmenities
                    .sort((a, b) => a.localeCompare(b))
                    .join(", ")
                : "-"
            }
          />
        </div>

        <div className="col-span-2">
          <h5 className="font-medium mb-2">Project Amenities</h5>
          <Field
            label=""
            value={
              Array.isArray(selectedSheet.projectAmenities)
                ? selectedSheet.projectAmenities
                    .sort((a, b) => a.localeCompare(b))
                    .join(", ")
                : "-"
            }
          />
        </div>

        <div className="col-span-2">
          <h5 className="font-medium mb-2">Location Highlights</h5>
          <Field
            label=""
            value={
              Array.isArray(selectedSheet.locationHighlights)
                ? selectedSheet.locationHighlights
                    .sort((a, b) => a.localeCompare(b))
                    .join(", ")
                : "-"
            }
          />
        </div>
      </Section>

      {/* Section 5: Others */}
      <Section title="Others">
        <Field label="Project Type" value={selectedSheet.type} />
        <Field
          label="Maha RERA Number"
          value={
            selectedSheet.mahaReraLink ? (
              <a
                href={selectedSheet.mahaReraLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {selectedSheet.mahaReraNumber}
              </a>
            ) : (
              selectedSheet.mahaReraNumber
            )
          }
        />
        <Field
          label="Developer Possession"
          value={`${selectedSheet.possessionMonth || "-"} ${
            selectedSheet.possessionYear || ""
          }`}
        />
        <Field
          label="Rera Possession"
          value={selectedSheet.reraPossession || "-"}
        />
        <Field label="Is Cosmo?" value={selectedSheet.isCosmo} />
        <Field label="Availability" value={selectedSheet.availibility} />
        <Field label="Image URL" value={selectedSheet.imageUrl} />
        <Field label="Video URL" value={selectedSheet.videoUrl} />
        <Field label="Site Head Name" value={selectedSheet.siteHeadName} />
        <Field label="Site Head Number" value={selectedSheet.siteHeadNumber} />
        {/* Sourcing Managers */}
        <div className="col-span-2">
          <h5 className="font-medium mb-3">Sourcing Managers</h5>
          {selectedSheet.sourcingManagers &&
          Array.isArray(selectedSheet.sourcingManagers) &&
          selectedSheet.sourcingManagers.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-neutral-200">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Contact
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {selectedSheet.sourcingManagers.map(
                    (manager: any, index: number) => (
                      <tr key={index} className="hover:bg-neutral-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-900">
                          {manager.name || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-900">
                          {manager.contact || "-"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            // Fallback to legacy single manager format
            <div className="overflow-hidden rounded-lg border border-neutral-200">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Contact
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr className="hover:bg-neutral-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-900">
                      {selectedSheet.smName || "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-900">
                      {selectedSheet.smContact || "-"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
