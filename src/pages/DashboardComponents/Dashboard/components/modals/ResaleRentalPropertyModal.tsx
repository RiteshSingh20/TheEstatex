import React from "react";
import { X } from "lucide-react";
import PropertyNameWithKey from "../../../../../components/PropertyNameWithKey";

interface ResaleProperty {
  id: string;
  docId: string;
  userId?: string;
  society?: string | number;
  sublocation?: string;
  expectedPrice?: number;
  floorNo?: string | number;
  flatNo?: string | number;
  ownerName?: string;
  userFullName?: string;
  ownerNumber?: string;
  keyAvailable?: boolean | string;
  userMarketingPhoneNumber?: string;
  type?: string;
  station?: string;
  rent?: number;
  deposit?: number;
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
  imageUrls?: string[];
  videoUrl?: string;
}

interface ResaleRentalPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: ResaleProperty | null;
  propertyCategory: string;
  user: any;
}

type MediaType = "image" | "video" | "pdf";

const ResaleRentalPropertyModal: React.FC<ResaleRentalPropertyModalProps> = ({
  isOpen,
  onClose,
  property,
  propertyCategory,
  user,
}) => {
  const [mediaModal, setMediaModal] = React.useState<{
    isOpen: boolean;
    title: string;
    files: string[];
    type: MediaType;
  }>({ isOpen: false, title: "", files: [], type: "image" });

  const [fullViewer, setFullViewer] = React.useState<{
    isOpen: boolean;
    files: string[];
    currentIndex: number;
    type: MediaType;
  }>({ isOpen: false, files: [], currentIndex: 0, type: "image" });

  const parseMediaUrls = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value
        .map((v) => {
          if (typeof v === "string") return v.trim();
          if (v && typeof v === "object" && typeof (v as any).url === "string") {
            return (v as any).url.trim();
          }
          return "";
        })
        .filter(Boolean);
    }
    if (typeof value === "string") {
      return value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    }
    return [];
  };

  const imageUrls = parseMediaUrls(
    (property as any)?.imageUrls || (property as any)?.imageUrl
  );
  const videoUrls = parseMediaUrls((property as any)?.videoUrl);

  const openMediaModal = (title: string, files: string[], type: MediaType) => {
    setMediaModal({ isOpen: true, title, files, type });
  };

  const openFullViewer = (files: string[], index: number, type: MediaType) => {
    setFullViewer({ isOpen: true, files, currentIndex: index, type });
  };

  const navigateMedia = (direction: "prev" | "next") => {
    setFullViewer((prev) => ({
      ...prev,
      currentIndex:
        direction === "prev"
          ? (prev.currentIndex - 1 + prev.files.length) % prev.files.length
          : (prev.currentIndex + 1) % prev.files.length,
    }));
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!fullViewer.isOpen) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigateMedia("prev");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        navigateMedia("next");
      } else if (e.key === "Escape") {
        e.preventDefault();
        setFullViewer({ isOpen: false, files: [], currentIndex: 0, type: "image" });
      }
    };

    if (fullViewer.isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [fullViewer.isOpen]);

  if (!isOpen || !property) return null;

  return (
    <>
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
                          {Array.isArray((property as any)[field]) ? (
                            (property as any)[field].join(", ")
                          ) : typeof (property as any)[field] === "boolean" ? (
                            (property as any)[field] ? "Yes" : "No"
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
                            `Rs. ${Number((property as any)[field]).toLocaleString("en-IN")}`
                          ) : field === "carpetArea" || field === "builtUpArea" ? (
                            `${(property as any)[field]} sq ft`
                          ) : field === "propertyAge" ? (
                            `${(property as any)[field]} years`
                          ) : (
                            (property as any)[field]?.toString() || "-"
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}

            {(imageUrls.length > 0 || videoUrls.length > 0) && (
              <div className="mb-4">
                <h5 className="font-medium mb-3">Media Files</h5>
                <div className="grid grid-cols-2 gap-3">
                  {imageUrls.length > 0 && (
                    <div className="border border-gray-200 rounded-lg p-3 bg-white">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">
                          Images ({imageUrls.length})
                        </span>
                        <button
                          onClick={() => openMediaModal("Images", imageUrls, "image")}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  )}

                  {videoUrls.length > 0 && (
                    <div className="border border-gray-200 rounded-lg p-3 bg-white">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">
                          Videos ({videoUrls.length})
                        </span>
                        <button
                          onClick={() => openMediaModal("Videos", videoUrls, "video")}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {mediaModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[70vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">{mediaModal.title}</h3>
              <button
                onClick={() =>
                  setMediaModal({ isOpen: false, title: "", files: [], type: "image" })
                }
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {mediaModal.files.map((file, index) => (
                  <div
                    key={index}
                    className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => openFullViewer(mediaModal.files, index, mediaModal.type)}
                  >
                    {mediaModal.type === "video" ? (
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
                      <p className="text-xs text-gray-600 truncate">
                        {mediaModal.type === "video" ? "Video" : "Image"} {index + 1}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {fullViewer.isOpen && (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[9999]">
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={() =>
                setFullViewer({ isOpen: false, files: [], currentIndex: 0, type: "image" })
              }
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl z-10"
            >
              ×
            </button>

            {fullViewer.files.length > 1 && (
              <>
                <button
                  onClick={() => navigateMedia("prev")}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 text-3xl z-10"
                >
                  ‹
                </button>
                <button
                  onClick={() => navigateMedia("next")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 text-3xl z-10"
                >
                  ›
                </button>
              </>
            )}

            <div className="w-full h-full flex items-center justify-center p-4">
              {fullViewer.type === "video" ? (
                <video
                  controls
                  className="max-w-[90vw] max-h-[90vh]"
                  src={fullViewer.files[fullViewer.currentIndex]}
                />
              ) : (
                <img
                  src={fullViewer.files[fullViewer.currentIndex]}
                  alt="Full size media"
                  className="max-w-[90vw] max-h-[90vh] object-contain"
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
};

export default ResaleRentalPropertyModal;
