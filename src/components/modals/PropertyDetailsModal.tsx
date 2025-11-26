import { useState } from "react";
import { X, Eye, Check, Edit } from "lucide-react";
import Button from "../../components/ui/Button";
import { Property } from "../../types/admin";
import { format } from "date-fns";
import { toDate } from "../../utils/helpers";

interface PropertyDetailsModalProps {
  show: boolean;
  onClose: () => void;
  property: Property | null;
  userDataMap: { [key: string]: any };
  user: any;
}

const Field = ({ label, value }: { label: string; value: any }) => {
  const displayValue =
    typeof value === "boolean" ? (value ? "Yes" : "No") : String(value ?? "-");
  return (
    <div className="text-sm">
      <div className="text-neutral-500 font-medium">{label}</div>
      <div className="text-neutral-800">{displayValue}</div>
    </div>
  );
};

const PropertyDetailsModal = (props: PropertyDetailsModalProps) => {
  const [editMode, setEditMode] = useState(false);

  if (!props.show || !props.property) return null;

  const { property } = props;
  const submitter = props.userDataMap[property.userId || property.submittedBy];

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col relative">
        <button
          onClick={props.onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-red-500 text-xl z-20 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md"
        >
          ✕
        </button>

        <div className="sticky top-0 bg-white rounded-t-lg border-b border-gray-200 p-6 z-10">
          <h3 className="text-lg font-semibold mb-4">
            {property.category === "resale"
              ? "Resale Property Details"
              : property.category === "rental"
              ? "Rental Property Details"
              : "New Property Details"}
          </h3>

          <div className="mb-4">
            <span
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                property.isApproved
                  ? "bg-success/10 text-success"
                  : "bg-warning/10 text-warning"
              }`}
            >
              {property.isApproved ? "Approved" : "Pending Approval"}
            </span>
            <span className="ml-2 text-sm text-neutral-500">
              Created on {format(toDate(property.createdAt), "dd MMM yyyy")}
            </span>
          </div>

          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              icon={<Eye className="h-4 w-4 mr-1" />}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? "View" : "Edit"}
            </Button>

            {props.user?.role === "admin" && property.isApproved && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // Handle unapprove
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Unapprove
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Property details content based on category */}
          {property.category === "newProperty" ? (
            // New property details
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-semibold text-neutral-700 mb-2">
                  Basic Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-neutral-200 p-4 rounded-md bg-neutral-50">
                  <Field label="Project Name" value={property.projectName} />
                  <Field
                    label="Developer Name"
                    value={property.developerName}
                  />
                  <Field label="Station" value={property.station} />
                  <Field label="Sub-Location" value={property.subLocation} />
                  <Field label="Flat Type" value={property.flatType} />
                  <Field label="RERA Carpet" value={property.reraCarpet} />
                </div>
              </div>
            </div>
          ) : (
            // Resale/Rental property details
            <div className="space-y-6">
              <div className="bg-neutral-50 rounded-lg p-4">
                <h5 className="font-semibold text-neutral-700 mb-3">
                  Basic Details
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Building/Society Name"
                    value={property.society}
                  />
                  <Field label="Sublocation" value={property.sublocation} />
                  <Field label="Station" value={property.station} />
                  <Field label="Configuration" value={property.type} />
                </div>
              </div>

              <div className="bg-neutral-50 rounded-lg p-4">
                <h5 className="font-semibold text-neutral-700 mb-3">
                  Property Details
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Expected Price"
                    value={property.expectedPrice}
                  />
                  <Field label="Rent" value={property.rent} />
                  <Field label="Deposit" value={property.deposit} />
                  <Field label="Furnishing" value={property.furnishing} />
                </div>
              </div>
            </div>
          )}

          {/* Submitter Information */}
          {submitter && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h5 className="font-semibold text-blue-800 mb-3">Submitted by</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-sm">
                  <div className="text-blue-600 font-medium">Full Name</div>
                  <div className="text-blue-800">{submitter.fullName}</div>
                </div>
                <div className="text-sm">
                  <div className="text-blue-600 font-medium">Email</div>
                  <div className="text-blue-800">{submitter.email}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsModal;
