import React from "react";
import { format, toDate } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { Edit, Check, X, MapPin, Building, IndianRupee, Home, Calendar, User, Phone, Mail, ExternalLink, Image, Video, Users } from "lucide-react";
import toast from "react-hot-toast";
import CostSheetForm from "../../components/Admin Components/CostSheetForm";
import {
  updateRentalProperty,
  updateResaleProperty,
} from "../../utils/firestoreListings";
import { updatePropertyStatus } from "../../utils/localStorage";
import Button from "../ui/Button";
import Input from "../ui/Input";
import SearchableDropdown from "../ui/SearchableDropdown";
import { Property } from "./helperFunctions";
import { TYPOLOGIES } from "../../constants/typologies";

interface ShowPropertyDetails extends Property {
  category?: string;
  [key: string]: any;
}

// Property configuration constants
const propertyTypes = [
  "1 RK",
  "1 BHK",
  "1.5 BHK",
  "2 BHK",
  "2.5 BHK",
  "3 BHK",
  "3.5 BHK",
  "4 BHK",
  "4.5 BHK",
  "5 BHK",
  "1 + 1 Jodi",
  "1 + 2 Jodi",
  "2 + 2 Jodi",
  "2 + 3 Jodi",
  "3 + 3 Jodi",
  "Penthouse / Duplex",
  "Row House",
  "Bungalow",
  "Villa",
];

const furnishingOptions = ["Unfurnished", "Semi-Furnished", "Fully Furnished"];

const parkingOptions = [
  "No Parking",
  "1 Covered",
  "1 Open",
  "2 Covered",
  "2 Open",
  "1 Covered + 1 Open",
];

export function handlePropertyDetails(
  setShowPropertyDetails: (property: ShowPropertyDetails | null) => void,
  cancelEditProperty: () => void,
  showPropertyDetails: ShowPropertyDetails,
  editPropertyMode: boolean,
  setInventory: any,
  user: any | null,
  setEditPropertyMode: (mode: boolean) => void,
  setEditedProperty: (property: ShowPropertyDetails | null) => void,
  handleApproveNewProperty: (id: string) => Promise<void>,
  setRejectingProperty: any,
  setShowRejectModal: (show: boolean) => void,
  Field: any,
  getUserInfo: (userId: string) => any,
  startEditProperty: () => void,
  handleApproveProperty: (
    docId: string,
    category: "resale" | "rental"
  ) => Promise<void>,
  setActionLoading: (loading: boolean) => void,
  actionLoading: boolean,
  handleSubmitRental: any,
  errorsRental: any,
  registerRental: any,
  watchRental: any,
  setValueRental: any,
  handleSubmitResale: any,
  errorsResale: any,
  registerResale: any,
  watchResale: any,
  setValueResale: any,
  editedProperty: ShowPropertyDetails | null,
  saveEditedProperty: () => Promise<void>,
  mediaModal: {isOpen: boolean, title: string, files: string[], type: 'image' | 'video' | 'pdf'},
  setMediaModal: React.Dispatch<React.SetStateAction<{isOpen: boolean, title: string, files: string[], type: 'image' | 'video' | 'pdf'}>>,
  fullViewer: {isOpen: boolean, files: string[], currentIndex: number, type: 'image' | 'video' | 'pdf'},
  setFullViewer: React.Dispatch<React.SetStateAction<{isOpen: boolean, files: string[], currentIndex: number, type: 'image' | 'video' | 'pdf'}>>
) {
  const formatLandParcel = (parcel: any, unit: any) => {
    if (parcel === undefined || parcel === null || String(parcel).trim() === "") {
      return "-";
    }
    const unitValue = String(unit || "").trim().toLowerCase();
    const normalizedUnit =
      unitValue === "sqft" || unitValue === "sq ft" || unitValue === "sq.ft"
        ? "sq.ft"
        : unitValue === "sqm" || unitValue === "sq m" || unitValue === "sq.m"
        ? "sq.m"
        : String(unit || "").trim();
    return `${parcel}${normalizedUnit ? ` ${normalizedUnit}` : ""}`;
  };

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



  return (
    <>
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-lg w-full max-h-[95vh] flex flex-col relative ${
        editPropertyMode ? 'max-w-7xl' : 'max-w-4xl'
      }`}>
        <button
          onClick={() => {
            setShowPropertyDetails(null);
            cancelEditProperty();
          }}
          className="absolute top-6 right-6 text-gray-500 hover:text-red-500 text-xl z-20 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md"
        >
          ✕
        </button>

        {showPropertyDetails &&
        showPropertyDetails.category === "newProperty" ? (
          editPropertyMode ? (
            // Edit mode - use CostSheetForm
            <>
              {/* Sticky Header for Edit Mode */}
              <div className="sticky top-0 bg-white rounded-t-lg border-b border-gray-200 p-6 pr-10 z-10">
                <div className="mb-3">
                  <h3 className="text-xl font-semibold pr-8">Edit Property</h3>
                </div>
                <div className="flex gap-2 flex-wrap pr-8">
                  <Button variant="outline" onClick={cancelEditProperty}>
                    Cancel
                  </Button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <CostSheetForm
                  editProperty={showPropertyDetails}
                  onSave={(updatedProperty) => {
                    setInventory((prev) => ({
                      ...prev,
                      newProperties:
                        prev.newProperties?.map((p) =>
                          p.id === updatedProperty.id ? updatedProperty : p
                        ) || [],
                    }));
                    setShowPropertyDetails(updatedProperty);
                    cancelEditProperty();
                  }}
                />
              </div>
            </>
          ) : (
            // View mode
            <>
              {/* Sticky Header */}
              <div className="sticky top-0 bg-white rounded-t-lg border-b border-gray-200 p-6 pr-10 z-10">
                <div className="mb-3">
                  <h3 className="text-xl font-semibold pr-8">
                    Property Details: {showPropertyDetails.projectName} by{" "}
                    {showPropertyDetails.developerName}
                    {(() => {
                      const getValidDate = (value: any) => {
                        if (!value) return null;
                        if (value?.seconds) return new Date(value.seconds * 1000);
                        if (value instanceof Date) return value;
                        const d = new Date(value);
                        return isNaN(d.getTime()) ? null : d;
                      };
                      const createdDate = getValidDate(showPropertyDetails.createdAt);
                      return createdDate ? (
                        <span className="text-sm text-gray-500 font-normal ml-2">
                          ({createdDate.toLocaleDateString('en-GB')})
                        </span>
                      ) : null;
                    })()} 
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Status:{" "}
                    {showPropertyDetails.isApproved
                      ? "Approved"
                      : showPropertyDetails.isRejected
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
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Edit className="h-4 w-4" />}
                    onClick={() => {
                      setEditPropertyMode(true);
                      setEditedProperty(showPropertyDetails);
                    }}
                  >
                    Edit
                  </Button>
                  {user?.role === "admin" && (
                    <>
                      {showPropertyDetails.isApproved ? (
                        // APPROVED NEW PROPERTIES MODAL: Only show Edit and Unapprove buttons
                        // This ensures approved new properties viewing modal shows only relevant actions
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              const { updateCostSheet } = await import(
                                "../../utils/firestoreListings"
                              );
                              await updateCostSheet(showPropertyDetails.id, {
                                isApproved: false,
                                approvalStatus: "pending",
                                unapprovedBy: user.id,
                                unapprovedAt: new Date().toISOString(),
                              });
                              setInventory((prev) => ({
                                ...prev,
                                newProperties:
                                  prev.newProperties?.map((p) =>
                                    p.id === showPropertyDetails.id
                                      ? {
                                          ...p,
                                          isApproved: false,
                                          approvalStatus: "pending",
                                        }
                                      : p
                                  ) || [],
                              }));
                              setShowPropertyDetails(null);
                              toast.success(
                                "Property unapproved successfully!"
                              );
                            } catch (error) {
                              toast.error("Failed to unapprove property");
                            }
                          }}
                        >
                          Unapprove
                        </Button>
                      ) : (
                        // PENDING/REJECTED NEW PROPERTIES MODAL: Show Approve and Reject buttons
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={async () => {
                              try {
                                await handleApproveNewProperty(
                                  showPropertyDetails.id
                                );
                                setShowPropertyDetails(null);
                              } catch (error) {
                                // Error already handled in handleApproveNewProperty
                              }
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setRejectingProperty({
                                id: showPropertyDetails.id,
                                category: "newProperty",
                              });
                              setShowRejectModal(true);
                            }}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {(() => {
                  // Helper function to format possession dates by RERA number
                  const formatPossessionDates = (dateField: string) => {
                    const subTabData = showPropertyDetails.subTabData;
                    if (!subTabData) {
                      return dateField === 'reraPossession' ? showPropertyDetails.reraPossession || "-" : "-";
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
                    
                    return orderedDates.length > 0 ? orderedDates.join(' | ') : (dateField === 'reraPossession' ? showPropertyDetails.reraPossession || "-" : "-");
                  };

                  // Helper function to format RERA numbers
                  const formatReraNumbers = () => {
                    const subTabData = showPropertyDetails.subTabData;
                    if (!subTabData) {
                      return showPropertyDetails.mahaReraNumber || "-";
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
                    
                    if (orderedReraEntries.length === 0) return showPropertyDetails.mahaReraNumber || "-";
                    
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
                    const typologies = showPropertyDetails.typologies;
                    if (!typologies || !Array.isArray(typologies)) {
                      return showPropertyDetails.type || "-";
                    }
                    
                    const uniqueTypes = [...new Set(typologies.map((t: any) => t.type).filter(Boolean))];
                    return uniqueTypes.length > 0 ? uniqueTypes.join(' | ') : (showPropertyDetails.type || "-");
                  };

                  // Helper function to format availability
                  const formatAvailability = () => {
                    const typologies = showPropertyDetails.typologies;
                    if (!typologies || !Array.isArray(typologies)) {
                      return showPropertyDetails.projectStatus || "-";
                    }
                    
                    // Check if any typology has availability as "Available"
                    const hasAvailable = typologies.some((t: any) => t.availability === 'Available');
                    if (hasAvailable) {
                      return "Available";
                    }
                    
                    const uniqueAvailability = [...new Set(typologies.map((t: any) => t.availability).filter(Boolean))];
                    return uniqueAvailability.length > 0 ? uniqueAvailability.join(' | ') : (showPropertyDetails.projectStatus || "-");
                  };

                  const typologies = showPropertyDetails.typologies;
                  const subTabData = showPropertyDetails.subTabData;
                  
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
                  
                  // Create a simple component for the pricing section with tabs
                  const PricingSection = () => {
                    const [activeTab, setActiveTab] = React.useState(wingNumbers[0] || '');
                    
                    React.useEffect(() => {
                      if (wingNumbers.length > 0 && !wingNumbers.includes(activeTab)) {
                        setActiveTab(wingNumbers[0]);
                      }
                    }, [wingNumbers, activeTab]);
                    
                    return (
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
                              {groupedByWing[activeTab]?.map((typology: any, index: number) => (
                                <tr key={index} className="hover:bg-neutral-50">
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
                              ))}
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
                                if (showPropertyDetails.subTabData) {
                                  const subTabData = showPropertyDetails.subTabData;
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
                                return showPropertyDetails.flatsPerFloor || "Not specified";
                              })()} 
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-neutral-700">Parking Charges:</span>
                              <span className="text-sm text-neutral-800">
                              {(() => {
                                if (showPropertyDetails.subTabData) {
                                  const subTabData = showPropertyDetails.subTabData;
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
                    );
                  };
                  
                  return (
                    <>
                      {/* Section 1: Basic Details */}
                      <div>
                        <h4 className="text-md font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Basic Details
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-neutral-200 p-4 rounded-md bg-neutral-50">
                          <Field label="Update date" value={(() => {
                            const getValidDate = (value: any) => {
                              if (!value) return null;
                              if (value?.seconds) return new Date(value.seconds * 1000);
                              if (value instanceof Date) return value;
                              const d = new Date(value);
                              return isNaN(d.getTime()) ? null : d;
                            };
                            const updateDate = getValidDate(showPropertyDetails.dateUpdateCostSheet);
                            return updateDate ? updateDate.toLocaleDateString('en-GB') : showPropertyDetails.dateUpdateCostSheet || "-";
                          })()} />
                          <Field label="Developer Name" value={showPropertyDetails.developerName} />
                          <Field label="Project Name" value={showPropertyDetails.projectName} />
                          <Field label="Sub-Location" value={showPropertyDetails.subLocation} />
                          <Field label="Road" value={showPropertyDetails.road} />
                          <Field label="Landmark" value={showPropertyDetails.landmark} />
                          <Field label="Location" value={showPropertyDetails.location} />
                          <Field label="District" value={`${showPropertyDetails.district || "-"}${showPropertyDetails.pinCode ? ` - ${showPropertyDetails.pinCode}` : ""}`} />
                          <Field label="State" value={showPropertyDetails.state} />
                          <Field
                            label="Land Parcel"
                            value={formatLandParcel(
                              showPropertyDetails.landParcel,
                              showPropertyDetails.landParcelUnit
                            )}
                          />
                          <Field label="Total Towers" value={showPropertyDetails.towers} />
                          <Field label="Total Storey" value={(() => {
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
                            return formatStorey(showPropertyDetails.storey);
                          })()} />
                        </div>
                      </div>

                      {/* Section 2: Pricing Details */}
                      <div>
                        <h4 className="text-md font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                          <IndianRupee className="h-4 w-4" />
                          Pricing Details
                        </h4>
                        <div className="border border-neutral-200 p-4 rounded-md bg-neutral-50">
                          {typologies && Array.isArray(typologies) && typologies.length > 0 ? (
                            <PricingSection />
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <Field label="Wing/Building No." value={showPropertyDetails.wingBuildingNo} />
                              <Field label="BHK Type" value={showPropertyDetails.flatType} />
                              <Field label="Saleable Area" value={showPropertyDetails.saleableArea} />
                              <Field label="RERA Carpet / Usable Carpet" value={showPropertyDetails.reraCarpet} />
                              <Field label="Per Sq. ft. Rate" value={showPropertyDetails.psfRate} />
                              <Field label="Agreement Value Rate" value={showPropertyDetails.avRate} />
                              <Field label="Floor Rise Rate" value={showPropertyDetails.floorRise} />
                              <Field label="Registration Fee/ Charge" value={showPropertyDetails.registration} />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Section 3: Other charges & Payment Plans */}
                      <div>
                        <h4 className="text-md font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                          <IndianRupee className="h-4 w-4" />
                          Other charges & Payment Plans
                        </h4>
                        <div className="border border-neutral-200 p-4 rounded-md bg-neutral-50">
                          {/* Payment Schemes Grid Layout */}
                          <div className="col-span-2 mb-6">
                            <h5 className="font-medium mb-3 text-neutral-700 flex items-center">
                              <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              Payment Scheme Details
                            </h5>
                            {showPropertyDetails.paymentSchemes && Array.isArray(showPropertyDetails.paymentSchemes) && showPropertyDetails.paymentSchemes.length > 0 ? (
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
                                    {showPropertyDetails.paymentSchemes.map((scheme: any, index: number) => (
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
                            {showPropertyDetails.ladderSections && Array.isArray(showPropertyDetails.ladderSections) && showPropertyDetails.ladderSections.length > 0 ? (
                              (() => {
                                const ladderSections = showPropertyDetails.ladderSections;
                                
                                return (
                                  <div>
                                    <h5 className="font-medium mb-3 text-neutral-700 flex items-center cursor-pointer" onClick={(e) => {
                                      const content = e.currentTarget.nextElementSibling as HTMLElement;
                                      const icon = e.currentTarget.querySelector('svg');
                                      if (content && icon) {
                                        if (content.style.display === 'none') {
                                          content.style.display = 'block';
                                          icon.style.transform = 'rotate(90deg)';
                                        } else {
                                          content.style.display = 'none';
                                          icon.style.transform = 'rotate(0deg)';
                                        }
                                      }
                                    }}>
                                      <svg className="w-4 h-4 mr-2 text-blue-600 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                      Ladder Details
                                    </h5>
                                    
                                    <div style={{display: 'none'}}>
                                        {/* All Ladder Sections */}
                                        <div className="space-y-6">
                                          {ladderSections.map((section: any, sectionIndex: number) => (
                                            <div key={sectionIndex} className="space-y-3">
                                              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                                                <div className="flex items-center text-sm">
                                                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                                                  </svg>
                                                  <span className="font-medium text-blue-800">Ladder {sectionIndex + 1} Period:</span>
                                                  <span className="ml-2 text-blue-700 font-medium">
                                                    {(() => {
                                                      const startDate = section?.startDate;
                                                      const endDate = section?.endDate;
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
                                                    {section?.rows && Array.isArray(section.rows) ? (
                                                      section.rows.map((row: any, rowIndex: number) => (
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
                                          ))}
                                        </div>
                                    </div>
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
                        </div>
                      </div>

                      {/* Section 4: Amenities */}
                      <div>
                        <h4 className="text-md font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          Amenities
                        </h4>
                        <div className="border border-neutral-200 p-4 rounded-md bg-neutral-50">
                          <div className="col-span-2">
                            <h5 className="font-medium mb-2">Apartment Amenities</h5>
                            <Field
                              label=""
                              value={
                                Array.isArray(showPropertyDetails.apartmentAmenities)
                                  ? showPropertyDetails.apartmentAmenities
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
                                Array.isArray(showPropertyDetails.projectAmenities)
                                  ? showPropertyDetails.projectAmenities
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
                                Array.isArray(showPropertyDetails.locationHighlights)
                                  ? showPropertyDetails.locationHighlights
                                      .sort((a, b) => a.localeCompare(b))
                                      .join(", ")
                                  : "-"
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 5: Others */}
                      <div>
                        <h4 className="text-md font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Others
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-neutral-200 p-4 rounded-md bg-neutral-50">
                          <Field label="Project Type" value={formatProjectTypes()} />
                          <div>
                            <div className="text-sm text-neutral-500 mb-1">Maha RERA Number</div>
                            <div className="text-sm text-neutral-900">{formatReraNumbers()}</div>
                          </div>
                          <Field
                            label="Developer Possession"
                            value={formatPossessionDates('developerPossession')}
                          />
                          <Field
                            label="Rera Possession"
                            value={formatPossessionDates('reraPossession')}
                          />
                          <Field label="Is Cosmo?" value={showPropertyDetails.isCosmo} />
                          <Field label="Availability" value={formatAvailability()} />
                          
                          {/* Media Files Section */}
                          <div className="col-span-2">
                            <h5 className="font-medium mb-3">Media Files</h5>
                            <div className="grid grid-cols-2 gap-3">
                              {/* Brochure */}
                              <div className="border border-gray-200 rounded-lg p-3 bg-white">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-900">Brochure (1)</span>
                                  {showPropertyDetails.mediaFiles?.brochure ? (
                                    <button onClick={() => openMediaModal('Brochure', [showPropertyDetails.mediaFiles.brochure], 'pdf')} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                      View
                                    </button>
                                  ) : (
                                    <span className="text-xs text-gray-500">Not Available</span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Elevation Images */}
                              <div className="border border-gray-200 rounded-lg p-3 bg-white">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-900">Elevation Images ({showPropertyDetails.mediaFiles?.elevationImages?.length || 0})</span>
                                  {showPropertyDetails.mediaFiles?.elevationImages?.length > 0 ? (
                                    <button onClick={() => openMediaModal('Elevation Images', showPropertyDetails.mediaFiles.elevationImages, 'image')} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                      View
                                    </button>
                                  ) : (
                                    <span className="text-xs text-gray-500">Not Available</span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Amenities Images */}
                              <div className="border border-gray-200 rounded-lg p-3 bg-white">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-900">Amenities Images ({showPropertyDetails.mediaFiles?.amenitiesImages?.length || 0})</span>
                                  {showPropertyDetails.mediaFiles?.amenitiesImages?.length > 0 ? (
                                    <button onClick={() => openMediaModal('Amenities Images', showPropertyDetails.mediaFiles.amenitiesImages, 'image')} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                      View
                                    </button>
                                  ) : (
                                    <span className="text-xs text-gray-500">Not Available</span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Floor Plan Images */}
                              <div className="border border-gray-200 rounded-lg p-3 bg-white">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-900">Floor Plan Images ({showPropertyDetails.mediaFiles?.floorPlanImages?.length || 0})</span>
                                  {showPropertyDetails.mediaFiles?.floorPlanImages?.length > 0 ? (
                                    <button onClick={() => window.open(showPropertyDetails.mediaFiles.floorPlanImages[0], '_blank')} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                      View
                                    </button>
                                  ) : (
                                    <span className="text-xs text-gray-500">Not Available</span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Project Walkthrough */}
                              {showPropertyDetails.mediaFiles?.projectWalkthrough?.length > 0 && (
                                <div className="border border-gray-200 rounded-lg p-3 bg-white">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-900">Project Walkthrough ({showPropertyDetails.mediaFiles.projectWalkthrough.length})</span>
                                    <button onClick={() => openMediaModal('Project Walkthrough', showPropertyDetails.mediaFiles.projectWalkthrough, 'video')} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
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
                                  {showPropertyDetails.mediaFiles?.typologyImages && Object.keys(showPropertyDetails.mediaFiles.typologyImages).length > 0 ? (
                                    Object.entries(showPropertyDetails.mediaFiles.typologyImages).map(([typology, images]: [string, any]) => (
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
                                  {showPropertyDetails.mediaFiles?.typologyVideos && Object.keys(showPropertyDetails.mediaFiles.typologyVideos).length > 0 ? (
                                    Object.entries(showPropertyDetails.mediaFiles.typologyVideos).map(([typology, video]: [string, any]) => (
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
                            {showPropertyDetails.siteHeads &&
                            Array.isArray(showPropertyDetails.siteHeads) &&
                            showPropertyDetails.siteHeads.length > 0 ? (
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
                                    {showPropertyDetails.siteHeads.map(
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
                            {showPropertyDetails.sourcingManagers &&
                            Array.isArray(showPropertyDetails.sourcingManagers) &&
                            showPropertyDetails.sourcingManagers.length > 0 ? (
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
                                    {showPropertyDetails.sourcingManagers.map(
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
                                        {showPropertyDetails.smName || "-"}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-900">
                                        {showPropertyDetails.smContact || "-"}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Submitter Information */}
                      {(() => {
                        const submitter = getUserInfo(
                          showPropertyDetails.submittedBy
                        );
                        if (submitter) {
                          return (
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                              <h4 className="text-md font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Submitted by
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="text-sm">
                                  <div className="text-blue-600 font-medium">
                                    Full Name
                                  </div>
                                  <div className="text-blue-800">
                                    {submitter.fullName}
                                  </div>
                                </div>
                                <div className="text-sm">
                                  <div className="text-blue-600 font-medium">
                                    Email
                                  </div>
                                  <div className="text-blue-800">
                                    {submitter.email}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </>
                  );
                })()}
              </div>
            </>
          )
        ) : showPropertyDetails ? (
          // Existing resale/rental property details
          <>
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white rounded-t-lg border-b border-gray-200 p-6 z-10">
              <h3 className="text-lg font-semibold mb-4">
                {showPropertyDetails.category === "resale"
                  ? `Resale Property - ${showPropertyDetails.society}`
                  : `Rental Property - ${showPropertyDetails.society}`}
              </h3>

              <div className="mb-4">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    showPropertyDetails.isApproved
                      ? "bg-success/10 text-success"
                      : "bg-warning/10 text-warning"
                  }`}
                >
                  {showPropertyDetails.isApproved
                    ? "Approved"
                    : "Pending Approval"}
                </span>
                <span className="ml-2 text-sm text-neutral-500">
                  Created on{" "}
                  {(() => {
                    try {
                      if (!showPropertyDetails.createdAt) return "N/A";
                      const date = toDate(showPropertyDetails.createdAt);
                      return isNaN(date.getTime())
                        ? "N/A"
                        : format(date, "dd MMM yyyy");
                    } catch {
                      return "N/A";
                    }
                  })()}
                </span>
              </div>

              {/* Action buttons for resale and rental properties */}
              {(showPropertyDetails.category === "resale" ||
                showPropertyDetails.category === "rental") && (
                <div className="flex gap-2 mt-3">
                  {/* Modify button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startEditProperty}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Modify
                  </Button>

                  <div>
                    {!showPropertyDetails.isApproved && !editPropertyMode && (
                      <Button
                        variant="primary"
                        icon={<Check className="h-4 w-4 mr-1" />}
                        onClick={async () => {
                          if (
                            showPropertyDetails.category === "resale" ||
                            showPropertyDetails.category === "rental"
                          ) {
                            await handleApproveProperty(
                              showPropertyDetails.id,
                              showPropertyDetails.category
                            );
                          }
                          setShowPropertyDetails(null);
                          cancelEditProperty();
                        }}
                      >
                        Approve
                      </Button>
                    )}
                  </div>

                  {/* Unapprove button for approved properties */}
                  {showPropertyDetails.isApproved && user?.role === "admin" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          setActionLoading(true);
                          // Update property status to unapproved
                          await updatePropertyStatus(
                            showPropertyDetails.userId!,
                            showPropertyDetails.category,
                            showPropertyDetails.docId || showPropertyDetails.id,
                            {
                              isApproved: false,
                              approvedAt: null,
                              approvedBy: null,
                            }
                          );

                          // Update local state
                          const propertyId =
                            showPropertyDetails.docId || showPropertyDetails.id;
                          setInventory((prev) => ({
                            ...prev,
                            [showPropertyDetails.category]: prev[
                              showPropertyDetails.category as
                                | "resale"
                                | "rental"
                            ].map((p) =>
                              (p.docId || p.id) === propertyId
                                ? { ...p, isApproved: false }
                                : p
                            ),
                          }));

                          setShowPropertyDetails(null);
                          toast.success("Property unapproved successfully!");
                        } catch (error) {
                          toast.error("Failed to unapprove property");
                        } finally {
                          setActionLoading(false);
                        }
                      }}
                      disabled={actionLoading}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Unapprove
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {editPropertyMode && showPropertyDetails.category === "rental" ? (
                <form
                  onSubmit={handleSubmitRental((data) => {
                    const processedData = {
                      ...data,
                      rent: data.expectedRent
                        ? Number(data.expectedRent)
                        : undefined,
                      deposit: data.securityDeposit
                        ? Number(data.securityDeposit)
                        : undefined,
                      contactName: data.ownerName,
                      contactNumber: data.ownerNumber,
                      flatNo: data.flatNo ? Number(data.flatNo) : undefined,
                      floorNo: data.floorNo ? Number(data.floorNo) : undefined,
                      totalFloors: data.totalFloors
                        ? Number(data.totalFloors)
                        : undefined,
                    };

                    updateRentalProperty(
                      showPropertyDetails.userId!,
                      showPropertyDetails.docId || showPropertyDetails.id,
                      processedData,
                      { skipApprovalReset: true }
                    )
                      .then(() => {
                        toast.success("Property updated successfully!");
                        cancelEditProperty();
                      })
                      .catch(() => {
                        toast.error("Failed to update property");
                      });
                  })}
                  className="space-y-6"
                >
                  <h4 className="text-lg font-semibold text-neutral-700 mb-4 border-b pb-2 border-neutral-200">
                    Edit Rental Property
                  </h4>

                  {/* Basic Details */}
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h5 className="font-semibold text-neutral-700 mb-3">
                      Basic Details
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        id="society"
                        label="Building/Society Name"
                        error={errorsRental.society?.message}
                        {...registerRental("society", {
                          required: "Building/Society name is required",
                        })}
                      />
                      <Input
                        id="sublocation"
                        label="Sublocation"
                        {...registerRental("sublocation")}
                      />
                      <Input
                        id="landmark"
                        label="Landmark"
                        {...registerRental("landmark")}
                      />
                      <Input
                        id="pincode"
                        label="PIN Code"
                        type="text"
                        maxLength={6}
                        {...registerRental("pincode", {
                          required: "PIN code is required",
                          pattern: {
                            value: /^[0-9]{6}$/,
                            message: "Enter valid 6-digit PIN code",
                          },
                        })}
                      />
                      <Input
                        id="station"
                        label="Station"
                        {...registerRental("station")}
                      />
                      <Input
                        id="district"
                        label="District"
                        {...registerRental("district")}
                      />
                      <Input
                        id="state"
                        label="State"
                        {...registerRental("state")}
                      />
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h5 className="font-semibold text-neutral-700 mb-3">
                      Property Details
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SearchableDropdown
                        label="Configuration"
                        value={watchRental("type")}
                        onChange={(val) => setValueRental("type", val)}
                        options={propertyTypes}
                        error={errorsRental.type?.message}
                      />
                      <Input
                        id="buildingNo"
                        label="Building No./Wing"
                        {...registerRental("buildingNo", {
                          required: "Building No./Wing is required",
                        })}
                      />
                      <Input
                        id="flatNo"
                        label="Flat No."
                        type="text"
                        {...registerRental("flatNo", {
                          required: "Flat No. is required",
                        })}
                      />
                      <Input
                        id="floorNo"
                        label="Floor No."
                        type="text"
                        {...registerRental("floorNo", {
                          required: "Floor No. is required",
                        })}
                      />
                      <Input
                        id="totalFloors"
                        label="Total Floors"
                        type="text"
                        {...registerRental("totalFloors", {
                          required: "Total floors is required",
                        })}
                      />
                      <Input
                        id="expectedRent"
                        label="Expected Rent (?)"
                        type="text"
                        {...registerRental("expectedRent", {
                          required: "Expected rent is required",
                        })}
                      />
                      <Input
                        id="securityDeposit"
                        label="Security Deposit (?)"
                        type="text"
                        {...registerRental("securityDeposit", {
                          required: "Security deposit is required",
                        })}
                      />
                      <SearchableDropdown
                        label="Furnishing"
                        value={watchRental("furnishing")}
                        onChange={(val) => setValueRental("furnishing", val)}
                        options={furnishingOptions}
                      />
                      <SearchableDropdown
                        label="Parking"
                        value={watchRental("parking")}
                        onChange={(val) => setValueRental("parking", val)}
                        options={parkingOptions}
                      />
                    </div>
                  </div>

                  {/* Others */}
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h5 className="font-semibold text-neutral-700 mb-3">
                      Others
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        id="ownerName"
                        label="Owner Name"
                        {...registerRental("ownerName", {
                          required: "Owner name is required",
                        })}
                      />
                      <Input
                        id="ownerNumber"
                        label="Owner Number"
                        type="text"
                        maxLength={10}
                        {...registerRental("ownerNumber", {
                          required: "Owner number is required",
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: "Enter valid 10-digit number",
                          },
                        })}
                      />
                      <Input
                        id="connectedPerson"
                        label="Connected Person"
                        placeholder="Employee name"
                        {...registerRental("connectedPerson")}
                      />
                      <Input
                        id="imageUrl"
                        label="Image URL"
                        {...registerRental("imageUrl")}
                      />
                      <Input
                        id="videoUrl"
                        label="Video URL"
                        {...registerRental("videoUrl")}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={actionLoading}
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelEditProperty}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : editPropertyMode &&
                showPropertyDetails.category === "resale" ? (
                <form
                  onSubmit={handleSubmitResale((data) => {
                    const processedData = {
                      ...data,
                      expectedPrice: data.expectedPrice
                        ? Number(data.expectedPrice)
                        : undefined,
                      carpetArea: data.carpetArea
                        ? Number(data.carpetArea)
                        : undefined,
                      builtUpArea: data.builtUpArea
                        ? Number(data.builtUpArea)
                        : undefined,
                      maintenance: data.maintenance
                        ? Number(data.maintenance)
                        : undefined,
                      contactName: data.ownerName,
                      contactNumber: data.ownerNumber,
                      flatNo: data.flatNo ? Number(data.flatNo) : undefined,
                      floorNo: data.floorNo ? Number(data.floorNo) : undefined,
                      totalFloors: data.totalFloors
                        ? Number(data.totalFloors)
                        : undefined,
                      propertyAge: data.propertyAge
                        ? Number(data.propertyAge)
                        : undefined,
                      negotiable: data.negotiable === "true",
                      ocAvailable: data.ocAvailable === "true",
                      cosmo: data.cosmoSociety === "true",
                      masterBed: data.masterBed === "true",
                    };

                    updateResaleProperty(
                      showPropertyDetails.userId!,
                      showPropertyDetails.docId || showPropertyDetails.id,
                      processedData,
                      { skipApprovalReset: true }
                    )
                      .then(() => {
                        toast.success("Property updated successfully!");
                        cancelEditProperty();
                      })
                      .catch(() => {
                        toast.error("Failed to update property");
                      });
                  })}
                  className="space-y-6"
                >
                  <h4 className="text-lg font-semibold text-neutral-700 mb-4 border-b pb-2 border-neutral-200">
                    Edit Resale Property
                  </h4>

                  {/* Basic Details */}
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h5 className="font-semibold text-neutral-700 mb-3">
                      Basic Details
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        id="society"
                        label="Building/Society Name"
                        error={errorsResale.society?.message}
                        {...registerResale("society", {
                          required: "Building/Society name is required",
                        })}
                      />
                      <Input
                        id="sublocation"
                        label="Sublocation"
                        {...registerResale("sublocation")}
                      />
                      <Input
                        id="landmark"
                        label="Landmark"
                        {...registerResale("landmark")}
                      />
                      <Input
                        id="pincode"
                        label="PIN Code"
                        type="text"
                        maxLength={6}
                        {...registerResale("pincode", {
                          required: "PIN code is required",
                          pattern: {
                            value: /^[0-9]{6}$/,
                            message: "Enter valid 6-digit PIN code",
                          },
                        })}
                      />
                      <Input
                        id="station"
                        label="Station"
                        {...registerResale("station")}
                      />
                      <Input
                        id="district"
                        label="District"
                        {...registerResale("district")}
                      />
                      <Input
                        id="state"
                        label="State"
                        {...registerResale("state")}
                      />
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h5 className="font-semibold text-neutral-700 mb-3">
                      Property Details
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SearchableDropdown
                        label="Configuration"
                        value={watchResale("type")}
                        onChange={(val) => setValueResale("type", val)}
                        options={propertyTypes}
                        error={errorsResale.type?.message}
                      />
                      <Input
                        id="buildingNo"
                        label="Building No./Wing"
                        {...registerResale("buildingNo", {
                          required: "Building No./Wing is required",
                        })}
                      />
                      <Input
                        id="flatNo"
                        label="Flat No."
                        type="text"
                        {...registerResale("flatNo", {
                          required: "Flat No. is required",
                        })}
                      />
                      <Input
                        id="floorNo"
                        label="Floor No."
                        type="text"
                        {...registerResale("floorNo", {
                          required: "Floor No. is required",
                        })}
                      />
                      <Input
                        id="totalFloors"
                        label="Total Floors"
                        type="text"
                        {...registerResale("totalFloors", {
                          required: "Total floors is required",
                        })}
                      />
                      <Input
                        id="expectedPrice"
                        label="Expected Price (?)"
                        type="text"
                        {...registerResale("expectedPrice", {
                          required: "Expected price is required",
                        })}
                      />
                      <Input
                        id="carpetArea"
                        label="Carpet Area (sq ft)"
                        type="text"
                        {...registerResale("carpetArea", {
                          required: "Carpet area is required",
                        })}
                      />
                      <Input
                        id="builtUpArea"
                        label="Built-up Area (sq ft)"
                        type="text"
                        {...registerResale("builtUpArea", {
                          required: "Built-up area is required",
                        })}
                      />
                      <Input
                        id="propertyAge"
                        label="Property Age (years)"
                        type="text"
                        {...registerResale("propertyAge", {
                          required: "Property age is required",
                        })}
                      />
                      <Input
                        id="maintenance"
                        label="Maintenance (?)"
                        type="text"
                        {...registerResale("maintenance")}
                      />
                    </div>
                  </div>

                  {/* Others */}
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h5 className="font-semibold text-neutral-700 mb-3">
                      Others
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        id="ownerName"
                        label="Owner Name"
                        {...registerResale("ownerName", {
                          required: "Owner name is required",
                        })}
                      />
                      <Input
                        id="ownerNumber"
                        label="Owner Number"
                        type="text"
                        {...registerResale("ownerNumber", {
                          required: "Owner number is required",
                        })}
                      />
                      <Input
                        id="connectedPerson"
                        label="Connected Person"
                        {...registerResale("connectedPerson")}
                      />
                      <Input
                        id="imageUrl"
                        label="Image URL"
                        {...registerResale("imageUrl")}
                      />
                      <Input
                        id="videoUrl"
                        label="Video URL"
                        {...registerResale("videoUrl")}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelEditProperty}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={actionLoading}
                    >
                      Update Property
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <h4 className="text-lg font-semibold text-neutral-700 mb-4 border-b pb-2 border-neutral-200">
                    Property Details
                  </h4>

                  <div className="space-y-6">
                    {/* Basic Details */}
                    <div className="bg-neutral-50 rounded-lg p-4">
                      <h5 className="font-semibold text-neutral-700 mb-3">
                        Basic Details
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {editPropertyMode ? (
                          <>
                            <div>
                              <label className="text-sm text-neutral-500">
                                Building/Society Name
                              </label>
                              <Input
                                id="editSociety"
                                value={editedProperty?.society ?? ""}
                                onChange={(e) =>
                                  setEditedProperty((prev) =>
                                    prev
                                      ? { ...prev, society: e.target.value }
                                      : prev
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="text-sm text-neutral-500">
                                Sublocation
                              </label>
                              <Input
                                id="editSublocation"
                                value={editedProperty?.sublocation ?? ""}
                                onChange={(e) =>
                                  setEditedProperty((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          sublocation: e.target.value,
                                        }
                                      : prev
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="text-sm text-neutral-500">
                                Landmark
                              </label>
                              <Input
                                id="editLandmark"
                                value={editedProperty?.landmark ?? ""}
                                onChange={(e) =>
                                  setEditedProperty((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          landmark: e.target.value,
                                        }
                                      : prev
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="text-sm text-neutral-500">
                                PIN Code
                              </label>
                              <Input
                                id="editPincode"
                                value={editedProperty?.pincode ?? ""}
                                onChange={(e) =>
                                  setEditedProperty((prev) =>
                                    prev
                                      ? { ...prev, pincode: e.target.value }
                                      : prev
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="text-sm text-neutral-500">
                                Station
                              </label>
                              <Input
                                id="editStation"
                                value={editedProperty?.station ?? ""}
                                onChange={(e) =>
                                  setEditedProperty((prev) =>
                                    prev
                                      ? { ...prev, station: e.target.value }
                                      : prev
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="text-sm text-neutral-500">
                                District
                              </label>
                              <Input
                                id="editDistrict"
                                value={editedProperty?.district ?? ""}
                                onChange={(e) =>
                                  setEditedProperty((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          district: e.target.value,
                                        }
                                      : prev
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="text-sm text-neutral-500">
                                State
                              </label>
                              <Input
                                id="editState"
                                value={editedProperty?.state ?? ""}
                                onChange={(e) =>
                                  setEditedProperty((prev) =>
                                    prev
                                      ? { ...prev, state: e.target.value }
                                      : prev
                                  )
                                }
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <Field
                              label="Building/Society Name"
                              value={showPropertyDetails.society}
                            />
                            <Field
                              label="Sublocation"
                              value={showPropertyDetails.sublocation}
                            />
                            <Field
                              label="Landmark"
                              value={showPropertyDetails.landmark}
                            />
                            <Field
                              label="PIN Code"
                              value={showPropertyDetails.pincode}
                            />
                            <Field
                              label="Station"
                              value={showPropertyDetails.station}
                            />
                            <Field
                              label="District"
                              value={showPropertyDetails.district}
                            />
                            <Field
                              label="State"
                              value={showPropertyDetails.state}
                            />
                          </>
                        )}
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="bg-neutral-50 rounded-lg p-4">
                      <h5 className="font-semibold text-neutral-700 mb-3">
                        Property Details
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {editPropertyMode ? (
                          <>
                            <div>
                              <label className="text-sm text-neutral-500">
                                Configuration
                              </label>
                              <Input
                                id="editType"
                                value={editedProperty?.type ?? ""}
                                onChange={(e) =>
                                  setEditedProperty((prev) =>
                                    prev
                                      ? { ...prev, type: e.target.value }
                                      : prev
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="text-sm text-neutral-500">
                                Building No./Wing
                              </label>
                              <Input
                                id="editBuildingNo"
                                value={editedProperty?.buildingNo ?? ""}
                                onChange={(e) =>
                                  setEditedProperty((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          buildingNo: e.target.value,
                                        }
                                      : prev
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="text-sm text-neutral-500">
                                Flat No.
                              </label>
                              <Input
                                id="editFlatNo"
                                value={editedProperty?.flatNo ?? ""}
                                onChange={(e) =>
                                  setEditedProperty((prev) =>
                                    prev
                                      ? { ...prev, flatNo: e.target.value }
                                      : prev
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="text-sm text-neutral-500">
                                Floor No.
                              </label>
                              <Input
                                id="editFloorNo"
                                value={editedProperty?.floorNo ?? ""}
                                onChange={(e) =>
                                  setEditedProperty((prev) =>
                                    prev
                                      ? { ...prev, floorNo: e.target.value }
                                      : prev
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="text-sm text-neutral-500">
                                Total Floors
                              </label>
                              <Input
                                id="editTotalFloors"
                                value={editedProperty?.totalFloors ?? ""}
                                onChange={(e) =>
                                  setEditedProperty((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          totalFloors:
                                            Number(e.target.value) || 0,
                                        }
                                      : prev
                                  )
                                }
                              />
                            </div>
                            {showPropertyDetails &&
                            showPropertyDetails.category === "resale" ? (
                              <div>
                                <label className="text-sm text-neutral-500">
                                  Expected Price (₹)
                                </label>
                                <Input
                                  id="editExpectedPrice"
                                  value={editedProperty?.expectedPrice ?? ""}
                                  onChange={(e) =>
                                    setEditedProperty((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            expectedPrice:
                                              Number(e.target.value) || 0,
                                          }
                                        : prev
                                    )
                                  }
                                />
                              </div>
                            ) : showPropertyDetails ? (
                              <>
                                <div>
                                  <label className="text-sm text-neutral-500">
                                    Monthly Rent (₹)
                                  </label>
                                  <Input
                                    id="editRent"
                                    value={editedProperty?.rent ?? ""}
                                    onChange={(e) =>
                                      setEditedProperty((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              rent: Number(e.target.value) || 0,
                                            }
                                          : prev
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-sm text-neutral-500">
                                    Deposit (₹)
                                  </label>
                                  <Input
                                    id="editDeposit"
                                    value={editedProperty?.deposit ?? ""}
                                    onChange={(e) =>
                                      setEditedProperty((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              deposit:
                                                Number(e.target.value) || 0,
                                            }
                                          : prev
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-sm text-neutral-500">
                                    Furnishing
                                  </label>
                                  <Input
                                    id="editFurnishing"
                                    value={editedProperty?.furnishing ?? ""}
                                    onChange={(e) =>
                                      setEditedProperty((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              furnishing: e.target.value,
                                            }
                                          : prev
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-sm text-neutral-500">
                                    Available From
                                  </label>
                                  <Input
                                    id="editAvailableFrom"
                                    value={editedProperty?.availableFrom ?? ""}
                                    onChange={(e) =>
                                      setEditedProperty((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              availableFrom: e.target.value,
                                            }
                                          : prev
                                      )
                                    }
                                  />
                                </div>
                              </>
                            ) : null}
                          </>
                        ) : (
                          <>
                            <Field
                              label="Configuration"
                              value={showPropertyDetails.type}
                            />
                            {showPropertyDetails.type === "1 BHK" && (
                              <Field
                                label="Master Bed"
                                value={showPropertyDetails.masterBed}
                              />
                            )}
                            <Field
                              label="Building No./Wing"
                              value={showPropertyDetails.buildingNo}
                            />
                            <Field
                              label="Flat No."
                              value={showPropertyDetails.flatNo}
                            />
                            <Field
                              label="Floor No."
                              value={showPropertyDetails.floorNo}
                            />
                            <Field
                              label="Total Floors"
                              value={showPropertyDetails.totalFloors}
                            />
                            <Field
                              label="Carpet Area (sq ft)"
                              value={showPropertyDetails.carpetArea}
                            />
                            <Field
                              label="Built-up Area (sq ft)"
                              value={showPropertyDetails.builtUpArea}
                            />
                            <Field
                              label="Property Age (years)"
                              value={showPropertyDetails.propertyAge}
                            />
                            <Field
                              label="OC Available"
                              value={
                                showPropertyDetails.ocAvailable === "true"
                                  ? "Yes"
                                  : "No"
                              }
                            />
                            <Field
                              label="Amenities"
                              value={
                                Array.isArray(showPropertyDetails.amenities)
                                  ? showPropertyDetails.amenities.join(", ")
                                  : showPropertyDetails.amenities
                              }
                            />
                            <Field
                              label="Furnishing"
                              value={showPropertyDetails.furnishing}
                            />
                            <Field
                              label="Parking"
                              value={showPropertyDetails.parking}
                            />
                            <Field
                              label="Terrace/Gallery"
                              value={showPropertyDetails.terraceGallery}
                            />
                            <Field
                              label="Cosmo Society"
                              value={
                                showPropertyDetails.cosmoSociety === "true"
                                  ? "Yes"
                                  : "No"
                              }
                            />
                            <Field
                              label="Expected Price (₹)"
                              value={showPropertyDetails.expectedPrice?.toLocaleString(
                                "en-IN"
                              )}
                            />
                            <Field
                              label="Negotiable"
                              value={
                                showPropertyDetails.negotiable === "true"
                                  ? "Yes"
                                  : "No"
                              }
                            />
                            <Field
                              label="Maintenance per Month (₹)"
                              value={showPropertyDetails.maintenance?.toLocaleString(
                                "en-IN"
                              )}
                            />
                          </>
                        )}
                      </div>
                    </div>

                    {/* Others */}
                    <div className="bg-neutral-50 rounded-lg p-4">
                      <h5 className="font-semibold text-neutral-700 mb-3">
                        Others
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {editPropertyMode ? (
                          <>
                            <div>
                              <label className="text-sm text-neutral-500">
                                Owner Name
                              </label>
                              <Input
                                id="editOwnerName"
                                value={editedProperty?.ownerName ?? ""}
                                onChange={(e) =>
                                  setEditedProperty((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          ownerName: e.target.value,
                                        }
                                      : prev
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="text-sm text-neutral-500">
                                Owner Number
                              </label>
                              <Input
                                id="editOwnerNumber"
                                value={editedProperty?.ownerNumber ?? ""}
                                onChange={(e) =>
                                  setEditedProperty((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          ownerNumber: e.target.value,
                                        }
                                      : prev
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="text-sm text-neutral-500">
                                Connected Person
                              </label>
                              <Input
                                id="editConnectedPerson"
                                value={editedProperty?.connectedPerson ?? ""}
                                onChange={(e) =>
                                  setEditedProperty((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          connectedPerson: e.target.value,
                                        }
                                      : prev
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="text-sm text-neutral-500">
                                Image URL
                              </label>
                              <Input
                                id="editImageUrl"
                                value={editedProperty?.imageUrl ?? ""}
                                onChange={(e) =>
                                  setEditedProperty((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          imageUrl: e.target.value,
                                        }
                                      : prev
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="text-sm text-neutral-500">
                                Video URL
                              </label>
                              <Input
                                id="editVideoUrl"
                                value={editedProperty?.videoUrl ?? ""}
                                onChange={(e) =>
                                  setEditedProperty((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          videoUrl: e.target.value,
                                        }
                                      : prev
                                  )
                                }
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <Field
                              label="Owner Name"
                              value={showPropertyDetails.ownerName}
                            />
                            <Field
                              label="Owner Number"
                              value={showPropertyDetails.ownerNumber}
                            />
                            <Field
                              label="Connected Person"
                              value={showPropertyDetails.connectedPerson}
                            />
                            <Field
                              label="Image URL"
                              value={showPropertyDetails.imageUrl}
                            />
                            <Field
                              label="Video URL"
                              value={showPropertyDetails.videoUrl}
                            />
                          </>
                        )}
                      </div>
                    </div>

                    {/* Submitter Information */}
                    {(() => {
                      const submitter = getUserInfo(showPropertyDetails.userId);
                      if (submitter) {
                        return (
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <h5 className="font-semibold text-blue-800 mb-3">
                              Submitted by
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="text-sm">
                                <div className="text-blue-600 font-medium">
                                  Full Name
                                </div>
                                <div className="text-blue-800">
                                  {submitter.fullName}
                                </div>
                              </div>
                              <div className="text-sm">
                                <div className="text-blue-600 font-medium">
                                  Email
                                </div>
                                <div className="text-blue-800">
                                  {submitter.email}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Status */}
                    <div className="bg-yellow-50 border border-yellow-400 rounded-lg p-4">
                      <h5 className="font-semibold text-neutral-700 mb-3">
                        Status
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {editPropertyMode ? (
                          <div>
                            <label className="text-sm text-neutral-500">
                              Approval Status
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={!!editedProperty?.isApproved}
                                onChange={(e) =>
                                  setEditedProperty((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          isApproved: e.target.checked,
                                        }
                                      : prev
                                  )
                                }
                              />
                              <span>
                                {editedProperty?.isApproved
                                  ? "Approved"
                                  : "Pending"}
                              </span>
                            </label>
                          </div>
                        ) : (
                          <>
                            <Field
                              label="Approval Status"
                              value={
                                showPropertyDetails.isApproved
                                  ? "Approved"
                                  : "Pending"
                              }
                            />
                            <Field
                              label="Created At"
                              value={(() => {
                                try {
                                  if (!showPropertyDetails.createdAt)
                                    return "N/A";
                                  const date = toDate(
                                    showPropertyDetails.createdAt as Timestamp
                                  );
                                  return isNaN(date.getTime())
                                    ? "N/A"
                                    : format(date, "dd MMM yyyy");
                                } catch {
                                  return "N/A";
                                }
                              })()}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between">
                    {editPropertyMode && (
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          isLoading={actionLoading}
                          onClick={saveEditedProperty}
                        >
                          Save
                        </Button>
                        <Button variant="outline" onClick={cancelEditProperty}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        ) : null}
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
                    <div className="aspect-square bg-red-50 flex items-center justify-center relative border-2 border-red-200">
                      <div className="text-center">
                        <svg className="w-12 h-12 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-xs text-red-600 font-medium">PDF</p>
                      </div>
                    </div>
                  ) : mediaModal.type === 'video' ? (
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      <video src={file} className="w-full h-full object-cover" muted />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <img src={file} alt={`Media ${index + 1}`} className="w-full aspect-square object-cover" />
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
              <video controls className="max-w-[90vw] max-h-[90vh]" src={fullViewer.files[fullViewer.currentIndex]} />
            ) : (
              <img src={fullViewer.files[fullViewer.currentIndex]} alt="Full size media" className="max-w-[90vw] max-h-[90vh] object-contain" />
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
