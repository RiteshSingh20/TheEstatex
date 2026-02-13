import React, { useState } from "react";
import { User } from "firebase/auth";
import { Edit } from "lucide-react";
import toast from "react-hot-toast";
import { CostSheet } from "../CompareModal";
import { State, City } from "../../types";
import { updateCostSheet } from "../../utils/firestoreListings";
import { sanitizeInput } from "../../utils/formSubmissionUtils";
import Button from "../ui/Button";
import { TYPOLOGIES } from "../../constants/typologies";
import { SecureImage } from "../SecureImage";
import { SecureVideo } from "../SecureVideo";

interface NewPropertyModalProps {
  Section: any;
  Field: any;
  selectedSheet: CostSheet;
  user: User | null;
  preloadedStateData?: { stateCode: string; cities: City[] } | null;
  setSelectedStateCode?: React.Dispatch<React.SetStateAction<string>>;
  setCities?: React.Dispatch<React.SetStateAction<City[]>>;
  setEditingProperty?: React.Dispatch<React.SetStateAction<CostSheet | null>>;
  setSelectedSheet?: React.Dispatch<React.SetStateAction<CostSheet | null>>;
  setCostSheets?: React.Dispatch<React.SetStateAction<unknown[]>>;
  onClose?: () => void;
  fromDashboard?: boolean;
  selectedTypology?: string;
}

export function NewPropertyModal({
  Section,
  Field,
  selectedSheet,
  user,
  preloadedStateData,
  setSelectedStateCode,
  setCities,
  setEditingProperty,
  setSelectedSheet,
  setCostSheets,
  onClose,
  fromDashboard = false,
  selectedTypology,
}: NewPropertyModalProps) {
  const [mediaModal, setMediaModal] = useState<{isOpen: boolean, title: string, files: string[], type: 'image' | 'video' | 'pdf'}>({isOpen: false, title: '', files: [], type: 'image'});
  const [fullViewer, setFullViewer] = useState<{isOpen: boolean, files: string[], currentIndex: number, type: 'image' | 'video' | 'pdf'}>({isOpen: false, files: [], currentIndex: 0, type: 'image'});

  const formatLandParcel = (parcel: any, unit: any) => {
    if (parcel === undefined || parcel === null || String(parcel).trim() === "") {
      return "-";
    }
    const normalizedUnit =
      unit === "sqft" ? "sq.ft" : unit === "sqm" ? "sq.m" : unit || "";
    return `${parcel}${normalizedUnit ? ` ${normalizedUnit}` : ""}`;
  };
  
  // Helper function to format storey data
  const formatStorey = (storey: string) => {
    if (!storey) return "-";
    const mapping = {
      'B': 'Basement',
      'P': 'Level Podium',
      'H': 'Habitable',
      'Comm': 'Commercial',
      'Stilt': 'Stilt',
      'G': 'Ground',
    };
    return storey.replace(/(\d*)(B|P|H|Comm|Stilt|G)\b/g, (match, num, abbr) => num + ' ' + (mapping[abbr as keyof typeof mapping] || abbr));
  };
  // Helper function to format possession dates by RERA number
  const formatPossessionDates = (dateField: string) => {
    const subTabData = (selectedSheet as any).subTabData;
    if (!subTabData) {
      return dateField === 'reraPossession' ? selectedSheet.reraPossession || "-" : "-";
    }
    
    // Use subTabData sequence (sorted by keys)
    const orderedDates: string[] = [];
    Object.keys(subTabData).sort().forEach(key => {
      const tabData = subTabData[key];
      const date = tabData[dateField];
      if (date) {
        try {
          const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          if (!orderedDates.includes(formattedDate)) {
            orderedDates.push(formattedDate);
          }
        } catch {}
      }
    });
    
    return orderedDates.length > 0 ? orderedDates.join(' | ') : (dateField === 'reraPossession' ? selectedSheet.reraPossession || "-" : "-");
  };

  // Helper function to format RERA numbers
  const formatReraNumbers = () => {
    const subTabData = (selectedSheet as any).subTabData;
    if (!subTabData) {
      return selectedSheet.mahaReraNumber || "-";
    }
    
    // Use subTabData sequence (sorted by keys)
    const orderedReraEntries: Array<[string, string]> = [];
    Object.keys(subTabData).sort().forEach(key => {
      const tabData = subTabData[key];
      const reraNumber = tabData.mahaReraNumber;
      const reraLink = tabData.mahaReraLink;
      if (reraNumber && !orderedReraEntries.some(([num]) => num === reraNumber)) {
        orderedReraEntries.push([reraNumber, reraLink]);
      }
    });
    
    if (orderedReraEntries.length === 0) return selectedSheet.mahaReraNumber || "-";
    
    return (
      <span>
        {orderedReraEntries.map(([reraNumber, reraLink], index) => (
          <span key={reraNumber}>
            {index > 0 && " | "}
            {reraLink ? (
              <a href={reraLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {reraNumber}
              </a>
            ) : (
              reraNumber
            )}
          </span>
        ))}
      </span>
    );
  };

  // Helper function to format project types
  const formatProjectTypes = () => {
    const typologies = (selectedSheet as any).typologies;
    if (!typologies || !Array.isArray(typologies)) {
      return selectedSheet.type || "-";
    }
    
    const uniqueTypes = [...new Set(typologies.map((t: any) => t.type).filter(Boolean))];
    return uniqueTypes.length > 0 ? uniqueTypes.join(' | ') : (selectedSheet.type || "-");
  };

  // Helper function to format availability
  const formatAvailability = () => {
    const typologies = (selectedSheet as any).typologies;
    if (!typologies || !Array.isArray(typologies)) {
      return selectedSheet.projectStatus || "-";
    }
    
    // Check if any typology has availability as "Available"
    const hasAvailable = typologies.some((t: any) => t.availability === 'Available');
    if (hasAvailable) {
      return "Available";
    }
    
    const uniqueAvailability = [...new Set(typologies.map((t: any) => t.availability).filter(Boolean))];
    return uniqueAvailability.length > 0 ? uniqueAvailability.join(' | ') : (selectedSheet.projectStatus || "-");
  };

  // Group typologies by wingBuildingNo for tab functionality
  const typologies = (selectedSheet as any).typologies;
  const subTabData = (selectedSheet as any).subTabData;
  
  const groupedByWing = typologies ? typologies.reduce((acc: any, typology: any) => {
    const wingNumber = typology.wingBuildingNo || typology.mahaReraNumber || 'No Wing';
    if (!acc[wingNumber]) acc[wingNumber] = [];
    acc[wingNumber].push(typology);
    return acc;
  }, {}) : {};
  
  // Use subTabData for tab ordering if available, otherwise fallback to typologies order
  const wingNumbers = subTabData 
    ? Object.keys(subTabData).sort().map(key => {
        const tabData = subTabData[key];
        return tabData.wingBuildingNo || tabData.mahaReraNumber || 'No Wing';
      })
    : Object.keys(groupedByWing);
  const [activeTab, setActiveTab] = useState('');
  
  // Set initial active tab when wingNumbers change
  React.useEffect(() => {
    if (wingNumbers.length > 0 && !activeTab) {
      if (fromDashboard && selectedTypology) {
        // Find the tab that contains the selected typology with lowest package
        let targetTab = wingNumbers[0];
        let lowestPackage = Infinity;
        
        wingNumbers.forEach(wingNumber => {
          const wingTypologies = groupedByWing[wingNumber] || [];
          wingTypologies.forEach((typology: any) => {
            if (typology.typology === selectedTypology && typology.availability !== "Sold Out") {
              const pkgValue = typology.totalPackage;
              const pkg = typeof pkgValue === "string" ? Number(pkgValue.replace(/[^0-9]/g, "")) : pkgValue || 0;
              if (pkg > 0 && pkg < lowestPackage) {
                lowestPackage = pkg;
                targetTab = wingNumber;
              }
            }
          });
        });
        
        setActiveTab(targetTab);
      } else {
        setActiveTab(wingNumbers[0]);
      }
    }
  }, [wingNumbers, activeTab, fromDashboard, selectedTypology]);

  const openMediaModal = (title: string, files: string[], type: 'image' | 'video' | 'pdf' = 'image') => {
    setMediaModal({isOpen: true, title, files, type});
  };

  const openFullViewer = (files: string[], index: number, type: 'image' | 'video' | 'pdf') => {
    setFullViewer({isOpen: true, files, currentIndex: index, type});
  };

  const navigateMedia = (direction: 'prev' | 'next') => {
    setFullViewer(prev => ({
      ...prev,
      currentIndex: direction === 'prev' 
        ? (prev.currentIndex - 1 + prev.files.length) % prev.files.length
        : (prev.currentIndex + 1) % prev.files.length
    }));
  };

  // Keyboard navigation for full viewer
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!fullViewer.isOpen) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateMedia('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateMedia('next');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setFullViewer({isOpen: false, files: [], currentIndex: 0, type: 'image'});
      }
    };

    if (fullViewer.isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [fullViewer.isOpen]);

  return (
    <>
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] flex flex-col relative">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Close button clicked');
            console.log('onClose function:', onClose);
            console.log('setSelectedSheet function:', setSelectedSheet);
            if (onClose) {
              console.log('Calling onClose()');
              onClose();
            } else if (setSelectedSheet) {
              console.log('Calling setSelectedSheet(null)');
              setSelectedSheet(null);
            } else {
              console.log('No close function available');
            }
          }}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-xl z-50 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Sticky Header */}
      <div className="sticky top-0 bg-white rounded-t-lg border-b border-gray-200 p-6 pr-10 z-10">
        <div className="mb-3">
          <h3 className="text-xl font-semibold pr-8">
            {sanitizeInput(selectedSheet.projectName || "")} by{" "}
            {sanitizeInput(selectedSheet.developerName || "")}
            {(() => {
              const getValidDate = (value: any) => {
                if (!value) return null;
                if (value?.seconds) return new Date(value.seconds * 1000);
                if (value instanceof Date) return value;
                const d = new Date(value);
                return isNaN(d.getTime()) ? null : d;
              };
              const createdDate = getValidDate(selectedSheet.createdAt);
              return createdDate ? (
                <span className="text-sm text-gray-500 font-normal ml-2">
                  ({createdDate.toLocaleDateString('en-GB')})
                </span>
              ) : null;
            })()} 
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Status:{" "}
            {selectedSheet.isApproved
              ? "Approved"
              : selectedSheet.isRejected
              ? "Rejected"
              : "Pending"}
            {user?.role === "admin" && (
              <span className="ml-2 text-xs bg-blue-100 px-2 py-1 rounded">
                Admin View
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap pr-8">
          {setEditingProperty && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // Use preloaded data if available
                if (preloadedStateData && setSelectedStateCode && setCities) {
                  setSelectedStateCode(preloadedStateData.stateCode);
                  setCities(preloadedStateData.cities);
                }
                setEditingProperty(selectedSheet);
                if (onClose) onClose();
                else setSelectedSheet?.(null);
              }}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
          {(user?.role === "admin" || user?.role === "manager") &&
            selectedSheet.isApproved && setCostSheets && (
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    await updateCostSheet(selectedSheet.id, {
                      isApproved: false,
                      approvalStatus: "pending",
                      unapprovedBy: user.id,
                      unapprovedAt: new Date().toISOString(),
                    });
                    setCostSheets((prev) =>
                      prev.map((sheet) =>
                        (sheet as any).id === selectedSheet.id
                          ? {
                              ...sheet,
                              isApproved: false,
                              approvalStatus: "pending",
                            }
                          : sheet
                      )
                    );
                    if (onClose) onClose();
                    else setSelectedSheet?.(null);
                    toast.success("Property unapproved!");
                  } catch (error) {
                    toast.error("Failed to unapprove property");
                  }
                }}
              >
                Unapprove
              </Button>
            )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Section 1: Basic Details */}
      <Section title="Basic Detail">
        <Field label="Update date" value={(() => {
          const getValidDate = (value: any) => {
            if (!value) return null;
            if (value?.seconds) return new Date(value.seconds * 1000);
            if (value instanceof Date) return value;
            const d = new Date(value);
            return isNaN(d.getTime()) ? null : d;
          };
          const updateDate = getValidDate(selectedSheet.dateUpdateCostSheet);
          return updateDate ? updateDate.toLocaleDateString('en-GB') : selectedSheet.dateUpdateCostSheet || "-";
        })()} />
        <Field label="Developer Name" value={selectedSheet.developerName} />
        <Field label="Project Name" value={selectedSheet.projectName} />
        <Field label="Sub-Location" value={selectedSheet.subLocation} />
        <Field label="Road" value={selectedSheet.road} />
        <Field label="Landmark" value={selectedSheet.landmark} />
        <Field label="Location" value={selectedSheet.location} />
        <Field label="District" value={`${selectedSheet.district || "-"}${selectedSheet.pinCode ? ` - ${selectedSheet.pinCode}` : ""}`} />
        <Field label="State" value={selectedSheet.state} />
        <Field
          label="Land Parcel"
          value={formatLandParcel(
            selectedSheet.landParcel,
            (selectedSheet as any).landParcelUnit
          )}
        />
        <Field label="Total Towers" value={selectedSheet.towers} />
        <Field label="Total Storey" value={formatStorey(selectedSheet.storey)} />
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
                  {wingNumbers.map((wingNumber) => (
                    <button
                      key={wingNumber}
                      onClick={() => setActiveTab(wingNumber)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === wingNumber
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {wingNumber.length > 15 ? `${wingNumber.substring(0, 15)}...` : wingNumber}
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
                      <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase w-32">
                        Area (Sq.ft)
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                        PSF Rate
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                        AV Rate
                      </th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                        Possession Charges
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                        Total Package
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                        Availability
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {groupedByWing[activeTab]?.map((typology: any, index: number) => {
                      // Check if this row should be highlighted (from dashboard with matching typology and lowest package)
                      const shouldHighlight = fromDashboard && selectedTypology && 
                        typology.typology === selectedTypology && 
                        typology.availability !== "Sold Out" && (() => {
                          // Find the lowest package for this typology across all tabs
                          let lowestPackage = Infinity;
                          wingNumbers.forEach(wingNumber => {
                            const wingTypologies = groupedByWing[wingNumber] || [];
                            wingTypologies.forEach((t: any) => {
                              if (t.typology === selectedTypology && t.availability !== "Sold Out") {
                                const pkgValue = t.totalPackage;
                                const pkg = typeof pkgValue === "string" ? Number(pkgValue.replace(/[^0-9]/g, "")) : pkgValue || 0;
                                if (pkg > 0 && pkg < lowestPackage) {
                                  lowestPackage = pkg;
                                }
                              }
                            });
                          });
                          
                          const currentPkg = typeof typology.totalPackage === "string" 
                            ? Number(typology.totalPackage.replace(/[^0-9]/g, "")) 
                            : typology.totalPackage || 0;
                          return currentPkg === lowestPackage;
                        })();
                      
                      return (
                        <tr key={index} className={shouldHighlight ? "bg-orange-50 border-l-4 border-l-orange-500" : "hover:bg-neutral-50"}>
                        <td className="px-3 py-2 text-sm font-medium text-neutral-900">
                          {typology.typology || "-"}
                        </td>
                        <td className="px-3 py-2 text-sm text-neutral-800 w-32">
                          <div className="text-xs text-gray-500 whitespace-nowrap">Saleable: {typology.saleableArea || "-"}</div>
                          <div className="text-xs text-gray-500 whitespace-nowrap">RERA: {typology.reraCarpet || "-"}</div>
                        </td>
                        <td className="px-3 py-2 text-sm text-neutral-800">
                          {typology.psfRate ? `₹${parseFloat(typology.psfRate).toLocaleString('en-IN')}` : "-"}
                        </td>
                        <td className="px-3 py-2 text-sm text-neutral-800">
                          {typology.avRate ? `₹${parseFloat(typology.avRate).toLocaleString('en-IN')}` : "-"}
                        </td>
                        <td className="px-2 py-2 text-sm text-neutral-800">
                          {typology.possessionCharges ? `₹${parseFloat(typology.possessionCharges).toLocaleString('en-IN')}` : "-"}
                        </td>
                        <td className="px-3 py-2 text-sm text-neutral-800">
                          {typology.totalPackage ? `₹${parseFloat(typology.totalPackage).toLocaleString('en-IN')}` : "-"}
                        </td>
                        <td className="px-3 py-2 text-sm text-neutral-800">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            typology.availability === 'Available' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {typology.availability || "-"}
                          </span>
                        </td>
                      </tr>
                      );
                    })}
                    </tbody>
                  </table>
                </div>
                
                {/* Flats per Floor field below the table */}
                <div className="mt-4 p-3 bg-blue-50 rounded border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-neutral-700">Flats per Floor:</span>
                      <span className="text-sm text-neutral-800">
                      {(() => {
                        // Check if new format (subTabData) exists
                        if ((selectedSheet as any).subTabData) {
                          const subTabData = (selectedSheet as any).subTabData;
                          // Find the flatsPerFloor for the current active tab
                          const activeTabData = Object.entries(subTabData).find(([_, tabData]: [string, any]) => {
                            const wingName = tabData.wingBuildingNo || tabData.mahaReraNumber || 'No Wing';
                            return wingName === activeTab;
                          });
                          
                          if (activeTabData && activeTabData[1]?.flatsPerFloor) {
                            return activeTabData[1].flatsPerFloor;
                          }
                        }
                        
                        // Fallback to old format
                        return selectedSheet.flatsPerFloor || "Not specified";
                      })()} 
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-neutral-700">Parking Charges:</span>
                      <span className="text-sm text-neutral-800">
                      {(() => {
                        if ((selectedSheet as any).subTabData) {
                          const subTabData = (selectedSheet as any).subTabData;
                          const activeTabData = Object.entries(subTabData).find(([_, tabData]: [string, any]) => {
                            const wingName = tabData.wingBuildingNo || tabData.mahaReraNumber || 'No Wing';
                            return wingName === activeTab;
                          });
                          
                          if (activeTabData && activeTabData[1]) {
                            const tabData = activeTabData[1];
                            
                            // Check if parking is included in PSF
                            if (tabData.psfIncludesParking && tabData.numberOfParkingIncluded && parseInt(tabData.numberOfParkingIncluded) > 0) {
                              return `${tabData.numberOfParkingIncluded} Parking included in the cost`;
                            }
                            
                            // Show parking charges if available
                            if (tabData.parkingCharges) {
                              const parkingAmount = `₹${parseFloat(tabData.parkingCharges).toLocaleString('en-IN')}`;
                              const mandatoryTypologies = tabData.mandatoryParkingTypologies;
                              
                              if (mandatoryTypologies && Array.isArray(mandatoryTypologies) && mandatoryTypologies.length > 0) {
                                const sortedTypologies = mandatoryTypologies.sort((a, b) => {
                                  const indexA = TYPOLOGIES.indexOf(a);
                                  const indexB = TYPOLOGIES.indexOf(b);
                                  return indexA - indexB;
                                });
                                return `${parkingAmount} included in ${sortedTypologies.join(' | ')}`;
                              }
                              return parkingAmount;
                            }
                          }
                        }
                        return "Not specified";
                      })()} 
                      </span>
                    </div>
                  </div>
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
            <div className="overflow-hidden rounded-lg border border-neutral-200">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                      Scheme Name
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                      Description
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                      Timeline
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {(selectedSheet as any).paymentSchemes.map((scheme: any, index: number) => (
                    <tr key={index} className="hover:bg-neutral-50">
                      <td className="px-3 py-2 text-sm font-medium text-neutral-900">
                        {scheme.schemeName || "-"}
                      </td>
                      <td className="px-3 py-2 text-sm text-neutral-800">
                        {scheme.description || "-"}
                      </td>
                      <td className="px-3 py-2 text-sm text-neutral-800">
                        {scheme.fromDate && scheme.toDate ? (
                          <span>{scheme.fromDate} <span className="text-neutral-500">to</span> {scheme.toDate}</span>
                        ) : (
                          <span>{scheme.fromDate || scheme.toDate || "-"}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              const [isLadderOpen, setIsLadderOpen] = useState(false);
              
              return (
                <div>
                  <h5 className="font-medium mb-3 text-neutral-700 flex items-center cursor-pointer" onClick={() => setIsLadderOpen(!isLadderOpen)}>
                    <svg className={`w-4 h-4 mr-2 text-blue-600 transition-transform ${isLadderOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Ladder Details
                  </h5>
                  
                  {isLadderOpen && (
                    <>
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
                    
                    <div className="overflow-hidden rounded-lg border border-neutral-200">
                      <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                              Units
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                              Ladder
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                              Additional Incentive
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-200">
                          {ladderSections[activeLadderTab]?.rows && Array.isArray(ladderSections[activeLadderTab].rows) ? (
                            ladderSections[activeLadderTab].rows.map((row: any, rowIndex: number) => (
                              <tr key={rowIndex} className="hover:bg-neutral-50">
                                <td className="px-3 py-2 text-sm font-medium text-neutral-900">
                                  {row.units || "-"}
                                </td>
                                <td className="px-3 py-2 text-sm text-neutral-800">
                                  {row.ladder || "-"}
                                </td>
                                <td className="px-3 py-2 text-sm text-neutral-800">
                                  {row.additionalIncentive || "-"}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="px-3 py-4 text-sm text-neutral-500 italic text-center">
                                No ladder data available for this section
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })()
          ) : (
            <div>
              <h5 className="font-medium mb-3 text-neutral-700 flex items-center cursor-pointer">
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
        <Field label="Project Type" value={formatProjectTypes()} />
        <Field
          label="Maha RERA Number"
          value={formatReraNumbers()}
        />
        <Field
          label="Developer Possession"
          value={formatPossessionDates('developerPossession')}
        />
        <Field
          label="Rera Possession"
          value={formatPossessionDates('reraPossession')}
        />
        <Field label="Is Cosmo?" value={selectedSheet.isCosmo} />
        <Field label="Availability" value={formatAvailability()} />
        
        {/* Media Files Section */}
        <div className="col-span-2">
          <h5 className="font-medium mb-3">Media Files</h5>
          <div className="grid grid-cols-2 gap-3">
            {/* Brochure */}
            {selectedSheet.mediaFiles?.brochure && (
              <div className="border border-gray-200 rounded-lg p-3 bg-white">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Brochure (1)</span>
                  <button onClick={() => openMediaModal('Brochure', [selectedSheet.mediaFiles.brochure], 'pdf')} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </button>
                </div>
              </div>
            )}
            
            {/* Elevation Images */}
            {selectedSheet.mediaFiles?.elevationImages?.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-3 bg-white">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Elevation Images ({selectedSheet.mediaFiles.elevationImages.length})</span>
                  <button onClick={() => openMediaModal('Elevation Images', selectedSheet.mediaFiles.elevationImages, 'image')} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </button>
                </div>
              </div>
            )}
            
            {/* Amenities Images */}
            {selectedSheet.mediaFiles?.amenitiesImages?.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-3 bg-white">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Amenities Images ({selectedSheet.mediaFiles.amenitiesImages.length})</span>
                  <button onClick={() => openMediaModal('Amenities Images', selectedSheet.mediaFiles.amenitiesImages, 'image')} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </button>
                </div>
              </div>
            )}
            
            {/* Floor Plan Images */}
            {selectedSheet.mediaFiles?.floorPlanImages?.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-3 bg-white">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Floor Plan Images ({selectedSheet.mediaFiles.floorPlanImages.length})</span>
                  <button onClick={() => openMediaModal('Floor Plan Images', selectedSheet.mediaFiles.floorPlanImages, 'image')} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </button>
                </div>
              </div>
            )}
            
            {/* Project Walkthrough */}
            {selectedSheet.mediaFiles?.projectWalkthrough?.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-3 bg-white">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Project Walkthrough ({selectedSheet.mediaFiles.projectWalkthrough.length})</span>
                  <button onClick={() => openMediaModal('Project Walkthrough', selectedSheet.mediaFiles.projectWalkthrough, 'video')} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    View
                  </button>
                </div>
              </div>
            )}
            
            {/* Typology Images */}
            <div className="border border-gray-200 rounded-lg p-3 bg-white col-span-2">
              <h6 className="text-sm font-medium text-gray-900 mb-3">Typology Images</h6>
              <div className="grid grid-cols-2 gap-2">
                {selectedSheet.mediaFiles?.typologyImages && Object.keys(selectedSheet.mediaFiles.typologyImages).length > 0 ? (
                  Object.entries(selectedSheet.mediaFiles.typologyImages).map(([typology, images]: [string, any]) => (
                    <div key={typology} className="flex justify-between items-center py-1.5 px-2 bg-gray-50 rounded">
                      <span className="text-xs font-medium text-gray-700">{typology} ({images?.length || 0})</span>
                      {images?.length > 0 ? (
                        <button onClick={() => openMediaModal(`${typology} Images`, images, 'image')} className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500">N/A</span>
                      )}
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-gray-500">Not Available</span>
                )}
              </div>
            </div>
            
            {/* Typology Videos */}
            <div className="border border-gray-200 rounded-lg p-3 bg-white col-span-2">
              <h6 className="text-sm font-medium text-gray-900 mb-3">Typology Videos</h6>
              <div className="grid grid-cols-2 gap-2">
                {selectedSheet.mediaFiles?.typologyVideos && Object.keys(selectedSheet.mediaFiles.typologyVideos).length > 0 ? (
                  Object.entries(selectedSheet.mediaFiles.typologyVideos).map(([typology, video]: [string, any]) => (
                    <div key={typology} className="flex justify-between items-center py-1.5 px-2 bg-gray-50 rounded">
                      <span className="text-xs font-medium text-gray-700">{typology}</span>
                      {video ? (
                        <button onClick={() => openMediaModal(`${typology} Video`, [video], 'video')} className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          View
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500">N/A</span>
                      )}
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-gray-500">Not Available</span>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Site Heads */}
        <div className="col-span-2">
          <h5 className="font-medium mb-3">Site Heads</h5>
          {selectedSheet.siteHeads &&
          Array.isArray(selectedSheet.siteHeads) &&
          selectedSheet.siteHeads.length > 0 ? (
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
                  {selectedSheet.siteHeads.map(
                    (siteHead: any, index: number) => (
                      <tr key={index} className="hover:bg-neutral-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-900">
                          {siteHead.name || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-900">
                          {siteHead.contact || "-"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-neutral-500 italic">
              No site heads available
            </div>
          )}
        </div>
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
      </div>
    </div>

    {/* Media Modal */}
    {mediaModal.isOpen && (
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60] p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[70vh] flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">{mediaModal.title}</h3>
            <button onClick={() => setMediaModal({isOpen: false, title: '', files: [], type: 'image'})} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {mediaModal.files.map((file, index) => (
                <div key={index} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => openFullViewer(mediaModal.files, index, mediaModal.type)}>
                  {mediaModal.type === 'pdf' ? (
                    <div className="aspect-square relative overflow-hidden bg-white">
                      <iframe src={`${file}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-full border-0 transform scale-[0.2] origin-top-left pointer-events-none" style={{width: '500%', height: '500%'}} />
                      <div className="absolute bottom-1 right-1 pointer-events-none">
                        <svg className="w-4 h-4 text-red-600 bg-white/90 rounded p-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        </svg>
                      </div>
                    </div>
                  ) : mediaModal.type === 'video' ? (
                    <div className="aspect-square relative overflow-hidden">
                      <SecureVideo
                        src={file}
                        className="w-full h-full object-cover"
                        muted
                        securityOptions={{ expiryHours: 4 }}
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <SecureImage
                      src={file}
                      alt={`Media ${index + 1}`}
                      className="w-full aspect-square object-cover"
                      securityOptions={{ expiryHours: 4 }}
                    />
                  )}
                  <div className="p-1">
                    <p className="text-xs text-gray-600 truncate">{mediaModal.type === 'pdf' ? 'PDF' : mediaModal.type === 'video' ? 'Video' : 'Image'} {index + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Full Size Media Viewer */}
    {fullViewer.isOpen && (
      <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[9999]">
        <div className="relative w-full h-full flex items-center justify-center">
          <button onClick={() => setFullViewer({isOpen: false, files: [], currentIndex: 0, type: 'image'})} className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl z-10">
            ✕
          </button>
          
          {fullViewer.files.length > 1 && (
            <>
              <button onClick={() => navigateMedia('prev')} className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 text-3xl z-10">
                ‹
              </button>
              <button onClick={() => navigateMedia('next')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 text-3xl z-10">
                ›
              </button>
            </>
          )}
          
          <div className="w-full h-full flex items-center justify-center p-4">
            {fullViewer.type === 'pdf' ? (
              <iframe src={fullViewer.files[fullViewer.currentIndex]} className="w-[90vw] h-[90vh] bg-white rounded" />
            ) : fullViewer.type === 'video' ? (
              <SecureVideo
                controls
                className="max-w-[90vw] max-h-[90vh]"
                src={fullViewer.files[fullViewer.currentIndex]}
                securityOptions={{ expiryHours: 4 }}
              />
            ) : (
              <SecureImage
                src={fullViewer.files[fullViewer.currentIndex]}
                alt="Full size media"
                className="max-w-[90vw] max-h-[90vh] object-contain"
                securityOptions={{ expiryHours: 4 }}
              />
            )}
          </div>
          
          {fullViewer.files.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded">
              {fullViewer.currentIndex + 1} / {fullViewer.files.length}
            </div>
          )}
        </div>
      </div>
    )}
    </>
  );
}
