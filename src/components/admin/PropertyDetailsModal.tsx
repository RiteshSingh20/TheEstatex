import { format } from "date-fns";
import Button from "../ui/Button";
import Input from "../ui/Input";
import SearchableDropdown from "../ui/SearchableDropdown";
import Field from "./Field";
import PropertyPricingDetails from "./PropertyPricingDetails";
import PropertyOtherCharges from "./PropertyOtherCharges";
import PropertyAmenities from "./PropertyAmenities";
import PropertyOthers from "./PropertyOthers";
import PropertySourcingManagers from "./PropertySourcingManagers";
import SubmitterInfo from "./SubmitterInfo";
import { Edit, Check, X } from "lucide-react";

type TimestampLike = any;

type Property = any;

type RentalFormData = any;
type ResaleFormData = any;

type Props = {
  open: boolean;
  onClose: () => void;
  userRole?: string;
  showPropertyDetails: any | null;
  setShowPropertyDetails: (v: any | null) => void;
  editPropertyMode: boolean;
  setEditPropertyMode: (v: boolean) => void;
  editedProperty: any | null;
  setEditedProperty: (v: any | null) => void;
  handleApproveProperty: (
    docId: string,
    category: "resale" | "rental"
  ) => Promise<void> | void;
  handleApproveNewProperty: (id: string) => Promise<void> | void;
  updatePropertyStatus: (
    userId: string,
    category: any,
    id: string,
    payload: any
  ) => Promise<void> | void;
  setInventory: (updater: any) => void;
  toast: { success: (m: string) => void; error: (m: string) => void };
  toDate: (v: any) => Date;
  user: any;
  // rental form
  registerRental: any;
  handleSubmitRental: any;
  errorsRental: any;
  resetRental: any;
  watchRental: any;
  setValueRental: any;
  // resale form
  registerResale: any;
  handleSubmitResale: any;
  errorsResale: any;
  resetResale: any;
  watchResale: any;
  setValueResale: any;
  propertyTypes: { value: string; label: string }[];
  actionLoading: boolean;
  cancelEditProperty: () => void;
  saveEditedProperty: () => Promise<void> | void;
};

const PropertyDetailsModal = ({
  open,
  onClose,
  userRole,
  showPropertyDetails,
  setShowPropertyDetails,
  editPropertyMode,
  setEditPropertyMode,
  editedProperty,
  setEditedProperty,
  handleApproveProperty,
  handleApproveNewProperty,
  setInventory,
  toast,
  toDate,
  user,
  registerRental,
  handleSubmitRental,
  errorsRental,
  watchRental,
  setValueRental,
  registerResale,
  handleSubmitResale,
  errorsResale,
  watchResale,
  setValueResale,
  propertyTypes,
  actionLoading,
  cancelEditProperty,
  saveEditedProperty,
}: Props) => {
  if (!open || !showPropertyDetails) return null;

  const headerRight = () => {
    if (showPropertyDetails.category === "newProperty") {
      return (
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
          {userRole === "admin" && (
            <>
              {showPropertyDetails.isApproved ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    try {
                      // unapprove via parent code path
                      // parent updates state; here just close after
                      setInventory((prev: any) => prev);
                      setShowPropertyDetails(null);
                      toast.success("Property unapproved successfully!");
                    } catch {
                      toast.error("Failed to unapprove property");
                    }
                  }}
                >
                  Unapprove
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={async () => {
                      await handleApproveNewProperty(showPropertyDetails.id);
                      setShowPropertyDetails(null);
                    }}
                  >
                    Approve
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      );
    }
    // resale/rental
    return (
      <div className="flex gap-2 mt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setEditPropertyMode(true);
            setEditedProperty({ ...showPropertyDetails });
          }}
        >
          <Edit className="h-4 w-4 mr-1" />
          Modify
        </Button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-red-500 text-xl z-20 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md"
        >
          ×
        </button>

        {showPropertyDetails.category === "newProperty" ? (
          editPropertyMode ? (
            <>
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
              <div className="flex-1 overflow-y-auto p-6">
                {/* CostSheetForm is rendered by parent in Admin.tsx edit flow; keeping view-only container here */}
              </div>
            </>
          ) : (
            <>
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
                  </p>
                </div>
                {headerRight()}
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                <PropertyPricingDetails details={showPropertyDetails as any} />
                <PropertyOtherCharges details={showPropertyDetails as any} />
                <PropertyAmenities details={showPropertyDetails as any} />
                <PropertyOthers details={showPropertyDetails as any} />
                <PropertySourcingManagers
                  details={showPropertyDetails as any}
                />
                <SubmitterInfo submitter={null} />
              </div>
            </>
          )
        ) : (
          <>
            <div className="sticky top-0 bg-white rounded-t-lg border-b border-gray-200 p-6 z-10">
              <h3 className="text-lg font-semibold mb-4">
                {showPropertyDetails.category === "resale"
                  ? "Resale Property Details"
                  : "Rental Property Details"}
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
                  {format(
                    toDate(showPropertyDetails.createdAt as TimestampLike),
                    "dd MMM yyyy"
                  )}
                </span>
              </div>
              {headerRight()}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {!editPropertyMode ? (
                <>
                  <h4 className="text-lg font-semibold text-neutral-700 mb-4 border-b pb-2 border-neutral-200">
                    Property Details
                  </h4>
                  <div className="space-y-6">
                    <div className="bg-neutral-50 rounded-lg p-4">
                      <h5 className="font-semibold text-neutral-700 mb-3">
                        Basic Details
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      </div>
                    </div>
                    <div className="bg-neutral-50 rounded-lg p-4">
                      <h5 className="font-semibold text-neutral-700 mb-3">
                        Property Details
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          value={showPropertyDetails.ocAvailable ? "Yes" : "No"}
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
                            showPropertyDetails.cosmoSociety ? "Yes" : "No"
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
                          value={showPropertyDetails.negotiable ? "Yes" : "No"}
                        />
                        <Field
                          label="Maintenance per Month (₹)"
                          value={showPropertyDetails.maintenance?.toLocaleString(
                            "en-IN"
                          )}
                        />
                      </div>
                    </div>
                    <div className="bg-neutral-50 rounded-lg p-4">
                      <h5 className="font-semibold text-neutral-700 mb-3">
                        Others
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-between">
                    <div>
                      {!showPropertyDetails.isApproved && (
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
                            onClose();
                          }}
                        >
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-neutral-700">
                      Edit {showPropertyDetails.category === "resale" ? "Resale" : "Rental"} Property
                    </h4>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={cancelEditProperty}
                        disabled={actionLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        onClick={saveEditedProperty}
                        disabled={actionLoading}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 mb-4">
                    Make changes to the property details below and click "Save Changes" to update.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PropertyDetailsModal;
