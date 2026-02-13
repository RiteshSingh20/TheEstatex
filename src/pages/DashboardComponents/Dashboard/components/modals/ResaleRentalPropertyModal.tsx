import React from "react";
import { X } from "lucide-react";
import PropertyNameWithKey from "../../../../../components/PropertyNameWithKey";

interface ResaleProperty {
  id: string;
  docId: string;
  isApproved?: boolean;
  userListingState?: string;
  listingState?: string;
  userId?: string;
  society?: string | number;
  sublocation?: string;
  roadLocation?: string;
  expectedPrice?: number;
  floorNo?: string | number;
  flatNo?: string | number;
  contactName?: string;
  ownerName?: string;
  userFullName?: string;
  ownerNumber?: string;
  keyAvailable?: boolean | string;
  userMarketingPhoneNumber?: string;
  contactNumber?: string;
  type?: string;
  station?: string;
  cosmo?: boolean;
  rent?: number;
  deposit?: number;
  possession?: string;
  terrace?: boolean;
  directBroker?: string;
  totalFloors?: string | number;
  landmark?: string;
  pincode?: string;
  district?: string;
  state?: string;
  masterBed?: boolean;
  carpetArea?: string | number;
  builtUpArea?: string | number;
  propertyAge?: string | number;
  ocAvailable?: string | boolean;
  amenities?: string[];
  furnishing?: string;
  parking?: string;
  terraceGallery?: string;
  cosmoSociety?: string | boolean;
  negotiable?: string | boolean;
  maintenance?: string | number;
  connectedPerson?: string;
  imageUrl?: string;
  videoUrl?: string;
  plusProperty?: string;
}

interface ResaleRentalPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: ResaleProperty | null;
  propertyCategory: string;
  user: any;
}

const ResaleRentalPropertyModal: React.FC<ResaleRentalPropertyModalProps> = ({
  isOpen,
  onClose,
  property,
  propertyCategory,
  user,
}) => {
  if (!isOpen || !property) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[70vh] flex flex-col select-none"
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-semibold">
            <PropertyNameWithKey
              name={property.society || "-"}
              keyAvailable={property.keyAvailable}
            />
          </h2>
          <button onClick={onClose}>
            <X className="h-6 w-6 text-neutral-500" />
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain p-6 pt-4">
          {[
            {
              title: "Basic Details",
              fields: [
                "society",
                "sublocation",
                "landmark",
                "pincode",
                "station",
                "district",
                "state",
              ],
            },
            {
              title: "Property Details",
              fields: [
                "type",
                "masterBed",
                "totalFloors",
                "carpetArea",
                "builtUpArea",
                "propertyAge",
                "ocAvailable",
                "amenities",
                "furnishing",
                "parking",
                "terraceGallery",
                "cosmoSociety",
                "expectedPrice",
                "negotiable",
                "maintenance",
                ...(propertyCategory === "Rental" ? ["rent", "deposit"] : []),
              ],
            },
            {
              title: "Others",
              fields: [
                "connectedPerson",
                "imageUrl",
                "videoUrl",
                "keyAvailable",
                ...(property.userId === user?.id
                  ? ["ownerName", "ownerNumber"]
                  : ["userFullName", "userMarketingPhoneNumber"]),
              ],
            },
          ].map((section) => (
            <div key={section.title} className="mb-10">
              <div className="flex items-center gap-4 my-4">
                <div className="flex-grow border-t border-gray-300"></div>
                <h3 className="text-lg font-semibold text-blue-700 whitespace-nowrap">
                  {section.title}
                </h3>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {section.fields
                  .filter(
                    (field) =>
                      (property as any)[field] !== undefined &&
                      (property as any)[field] !== null &&
                      (property as any)[field] !== ""
                  )
                  .map((field) => (
                    <div key={field}>
                      <div className="text-sm text-neutral-500">
                        {field === "userFullName"
                          ? "Broker Name"
                          : field === "userMarketingPhoneNumber"
                          ? "Broker Number"
                          : field
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                      </div>
                      <div className="text-sm font-medium text-neutral-900">
                        {field === "imageUrl" || field === "videoUrl" ? (
                          (property as any)[field] ? (
                            <a
                              href={(property as any)[field]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline hover:text-blue-800"
                            >
                              {field === "imageUrl"
                                ? "View Images"
                                : "View Video"}
                            </a>
                          ) : (
                            "—"
                          )
                        ) : Array.isArray((property as any)[field]) ? (
                          (property as any)[field].join(", ")
                        ) : typeof (property as any)[field] === "boolean" ? (
                          (property as any)[field] ? (
                            "Yes"
                          ) : (
                            "No"
                          )
                        ) : (property as any)[field] === "true" ||
                          (property as any)[field] === true ? (
                          "Yes"
                        ) : (property as any)[field] === "false" ||
                          (property as any)[field] === false ? (
                          "No"
                        ) : field === "expectedPrice" ||
                          field === "rent" ||
                          field === "deposit" ||
                          field === "maintenance" ? (
                          `₹${Number((property as any)[field]).toLocaleString(
                            "en-IN"
                          )}`
                        ) : field === "carpetArea" ||
                          field === "builtUpArea" ? (
                          `${(property as any)[field]} sq ft`
                        ) : field === "propertyAge" ? (
                          `${(property as any)[field]} years`
                        ) : (
                          (property as any)[field]?.toString() || "—"
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResaleRentalPropertyModal;
