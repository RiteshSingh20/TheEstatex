import { format, toDate } from "date-fns";
import { User } from "../../types";
import { Timestamp } from "firebase/firestore";
import { Edit, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import CostSheetForm from "./CostSheetForm";
import {
  updateRentalProperty,
  updateResaleProperty,
} from "../../utils/firestoreListings";
import { updatePropertyStatus } from "../../utils/localStorage";
import Button from "../ui/Button";
import Input from "../ui/Input";
import SearchableDropdown from "../ui/SearchableDropdown";

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
  setShowPropertyDetails,
  cancelEditProperty: () => void,
  showPropertyDetails: ShowPropertyDetails,
  editPropertyMode: boolean,
  setInventory,
  user: User | null,
  setEditPropertyMode,
  setEditedProperty,
  handleApproveNewProperty: (id: string) => Promise<void>,
  setRejectingProperty,
  setShowRejectModal,
  Field,
  getUserInfo: (userId: string) => User,
  startEditProperty: () => void,
  handleApproveProperty: (
    docId: string,
    category: "resale" | "rental"
  ) => Promise<void>,
  setActionLoading,
  actionLoading: boolean,
  handleSubmitRental,
  errorsRental,
  registerRental,
  watchRental,
  setValueRental,
  handleSubmitResale,
  errorsResale,
  registerResale,
  watchResale,
  setValueResale,
  editedProperty: ShowPropertyDetails | null,
  saveEditedProperty: () => Promise<void>
) {
  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col relative">
        <button
          onClick={() => {
            setShowPropertyDetails(null);
            cancelEditProperty();
          }}
          className="absolute top-6 right-6 text-gray-500 hover:text-red-500 text-xl z-20 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md"
        >
          �
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
                {/* Section 1: Basic Details */}
                <div>
                  <h4 className="text-md font-semibold text-neutral-700 mb-2">
                    Basic Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-neutral-200 p-4 rounded-md bg-neutral-50">
                    <Field
                      label="Update date"
                      value={showPropertyDetails.dateUpdateCostSheet}
                    />
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        Location
                      </div>
                      <div className="text-neutral-800">
                        {String(showPropertyDetails.station ?? "-")}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        Developer Name
                      </div>
                      <div className="text-neutral-800">
                        {String(showPropertyDetails.developerName ?? "-")}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        Project Name
                      </div>
                      <div className="text-neutral-800">
                        {String(showPropertyDetails.projectName ?? "-")}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        Sub-Location
                      </div>
                      <div className="text-neutral-800">
                        {String(showPropertyDetails.subLocation ?? "-")}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        Landmark
                      </div>
                      <div className="text-neutral-800">
                        {String(showPropertyDetails.landmark ?? "-")}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        Pin Code
                      </div>
                      <div className="text-neutral-800">
                        {String(showPropertyDetails.pinCode ?? "-")}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        District
                      </div>
                      <div className="text-neutral-800">
                        {String(showPropertyDetails.district ?? "-")}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">State</div>
                      <div className="text-neutral-800">
                        {String(showPropertyDetails.state ?? "-")}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        Land Parcel
                      </div>
                      <div className="text-neutral-800">
                        {String(showPropertyDetails.landParcel ?? "-")}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        Total Towers
                      </div>
                      <div className="text-neutral-800">
                        {String(showPropertyDetails.towers ?? "-")}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        Total Storey
                      </div>
                      <div className="text-neutral-800">
                        {String(showPropertyDetails.storey ?? "-")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Pricing Details */}
                <div>
                  <h4 className="text-md font-semibold text-neutral-700 mb-2">
                    Pricing Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-neutral-200 p-4 rounded-md bg-neutral-50">
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        Wing/Building No.
                      </div>
                      <div className="text-neutral-800">
                        {String(showPropertyDetails.wingBuildingNo ?? "-")}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        BHK Type
                      </div>
                      <div className="text-neutral-800">
                        {String(showPropertyDetails.flatType ?? "-")}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        Saleable Area
                      </div>
                      <div className="text-neutral-800">
                        {String(showPropertyDetails.saleableArea ?? "-")}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        RERA Carpet / Usable Carpet
                      </div>
                      <div className="text-neutral-800">
                        {String(showPropertyDetails.reraCarpet ?? "-")}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        Per Sq. ft. Rate
                      </div>
                      <div className="text-neutral-800">
                        {String(showPropertyDetails.psfRate ?? "-")}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        Agreement Value Rate
                      </div>
                      <div className="text-neutral-800">
                        {String(showPropertyDetails.avRate ?? "-")}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        Floor Rise Rate
                      </div>
                      <div className="text-neutral-800">
                        {String(showPropertyDetails.floorRise ?? "-")}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        Registration Fee/ Charge
                      </div>
                      <div className="text-neutral-800">
                        {String(showPropertyDetails.registration ?? "-")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Other charges & Payment Plans */}
                <div>
                  <h4 className="text-md font-semibold text-neutral-700 mb-2">
                    Other charges & Payment Plans
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-neutral-200 p-4 rounded-md bg-neutral-50">
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        Fixed Component
                      </div>
                      <div className="text-neutral-800">
                        {String(showPropertyDetails.fixedComponent ?? "-")}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        Possession Charges
                      </div>
                      <div className="text-neutral-800">
                        {String(showPropertyDetails.possessionCharges ?? "-")}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        Parking Charges
                      </div>
                      <div className="text-neutral-800">
                        {String(showPropertyDetails.parkingCharge ?? "-")}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        Total Package
                      </div>
                      <div className="text-neutral-800">
                        {String(showPropertyDetails.totalPackage ?? "-")}
                      </div>
                    </div>
                    <div className="text-sm col-span-2">
                      <div className="text-neutral-500 font-medium">
                        Payment Schemes
                      </div>
                      <div className="text-neutral-800">
                        {Array.isArray(showPropertyDetails.paymentScheme)
                          ? showPropertyDetails.paymentScheme.join(", ")
                          : "-"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 4: Amenities */}
                <div>
                  <h4 className="text-md font-semibold text-neutral-700 mb-2">
                    Amenities
                  </h4>
                  <div className="grid grid-cols-1 gap-4 border border-neutral-200 p-4 rounded-md bg-neutral-50">
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium mb-2">
                        Apartment Amenities
                      </div>
                      <div className="text-neutral-800">
                        {Array.isArray(showPropertyDetails.apartmentAmenities)
                          ? showPropertyDetails.apartmentAmenities.join(", ")
                          : "-"}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium mb-2">
                        Project Amenities
                      </div>
                      <div className="text-neutral-800">
                        {Array.isArray(showPropertyDetails.projectAmenities)
                          ? showPropertyDetails.projectAmenities.join(", ")
                          : "-"}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium mb-2">
                        Location Highlights
                      </div>
                      <div className="text-neutral-800">
                        {Array.isArray(showPropertyDetails.locationHighlights)
                          ? showPropertyDetails.locationHighlights.join(", ")
                          : "-"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 5: Others */}
                <div>
                  <h4 className="text-md font-semibold text-neutral-700 mb-2">
                    Others
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-neutral-200 p-4 rounded-md bg-neutral-50">
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        Project Type
                      </div>
                      <div className="text-neutral-800">
                        {String(showPropertyDetails.type ?? "-")}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        Maha RERA Number
                      </div>
                      <div className="text-neutral-800">
                        {showPropertyDetails.mahaReraNumber ? (
                          showPropertyDetails.mahaReraLink ? (
                            <a
                              href={showPropertyDetails.mahaReraLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {showPropertyDetails.mahaReraNumber}
                            </a>
                          ) : (
                            showPropertyDetails.mahaReraNumber
                          )
                        ) : (
                          "-"
                        )}
                      </div>
                    </div>

                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        Possession
                      </div>
                      <div className="text-neutral-800">
                        {`${showPropertyDetails.possessionMonth || "-"} ${
                          showPropertyDetails.possessionYear || ""
                        }`}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        Is Cosmo?
                      </div>
                      <div className="text-neutral-800">
                        {String(showPropertyDetails.isCosmo ?? "-")}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        Availability
                      </div>
                      <div className="text-neutral-800">
                        {String(showPropertyDetails.availibility ?? "-")}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        Image URL
                      </div>
                      <div className="text-neutral-800">
                        {showPropertyDetails.imageUrl ? (
                          <a
                            href={showPropertyDetails.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            View Images
                          </a>
                        ) : (
                          "-"
                        )}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        Video URL
                      </div>
                      <div className="text-neutral-800">
                        {showPropertyDetails.videoUrl ? (
                          <a
                            href={showPropertyDetails.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            View Video
                          </a>
                        ) : (
                          "-"
                        )}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        Site Head Name
                      </div>
                      <div className="text-neutral-800">
                        {String(showPropertyDetails.siteHeadName ?? "-")}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-neutral-500 font-medium">
                        Site Head Number
                      </div>
                      <div className="text-neutral-800">
                        {String(showPropertyDetails.siteHeadNumber ?? "-")}
                      </div>
                    </div>
                    {/* Sourcing Managers */}
                    <div className="col-span-2">
                      <div className="text-neutral-500 font-medium mb-2">
                        Sourcing Managers
                      </div>
                      {showPropertyDetails.sourcingManagers &&
                      Array.isArray(showPropertyDetails.sourcingManagers) &&
                      showPropertyDetails.sourcingManagers.length > 0 ? (
                        <div className="overflow-hidden rounded-lg border border-neutral-200">
                          <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                                  #
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                                  Name
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                                  Contact
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-200">
                              {showPropertyDetails.sourcingManagers.map(
                                (manager: any, index: number) => (
                                  <tr
                                    key={index}
                                    className="hover:bg-neutral-50"
                                  >
                                    <td className="px-3 py-2 text-sm font-medium text-neutral-900">
                                      {index + 1}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-neutral-800">
                                      {manager.name || "-"}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-neutral-800">
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
                                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                                  Name
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                                  Contact
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white">
                              <tr className="hover:bg-neutral-50">
                                <td className="px-3 py-2 text-sm text-neutral-800">
                                  {String(showPropertyDetails.smName ?? "-")}
                                </td>
                                <td className="px-3 py-2 text-sm text-neutral-800">
                                  {String(showPropertyDetails.smContact ?? "-")}
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
                        <h4 className="text-md font-semibold text-blue-800 mb-2">
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
  );
}
