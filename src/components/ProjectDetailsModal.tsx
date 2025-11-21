import React from "react";
import { CostSheet } from "../../src/pages/Compare";
import { X } from "lucide-react";
import Modal from "./ui/Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  data: CostSheet | null;
}

const ProjectDetailsModal: React.FC<Props> = ({ open, onClose, data }) => {
  if (!data) return null;

  const formatCurrency = (
    amount: number | string | undefined | null
  ): string => {
    const numeric = typeof amount === "string" ? parseFloat(amount) : amount;
    return typeof numeric === "number" && !isNaN(numeric)
      ? `₹ ${numeric.toLocaleString("en-IN")}/-`
      : "—";
  };

  const formatValueByField = (key: string, value: any): React.ReactNode => {
    if (typeof value === "boolean") return value ? "Yes" : "No";

    if (value?.seconds && value?.nanoseconds) {
      return new Date(value.seconds * 1000).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }

    // Handle Maha Rera Number as hyperlink
    if (key === "mahaReraNumber" && value && data.mahaReraLink) {
      return (
        <a
          href={data.mahaReraLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline break-all hover:text-blue-800"
        >
          {value}
        </a>
      );
    }

    if (typeof value === "string" && value.startsWith("http")) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline break-all"
        >
          View
        </a>
      );
    }

    if (Array.isArray(value)) {
      if (key === "locationHighlights") {
        return (
          <ul className="list-disc pl-5 text-sm">
            {value.map((highlight: string, idx: number) => (
              <li key={idx} className="break-words">
                {highlight.trim()}
              </li>
            ))}
          </ul>
        );
      }

      return value.join(", ");
    }

    if (typeof value === "object" && value !== null) {
      const isSimpleObj = Object.values(value).every(
        (v) => typeof v === "string" || typeof v === "number"
      );
      return isSimpleObj
        ? Object.entries(value)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ")
        : JSON.stringify(value);
    }

    switch (key) {
      case "landParcel":
        return `${value} Acre`;
      case "totalPackage":
      case "psfRate":
      case "parkingCharge":
        return formatCurrency(value);
      case "reraCarpet":
      case "saleableArea":
        return `${value} Sq.ft.`;
      case "floorRise":
        return `₹ ${value} / sq.ft. / floor`;
      case "reraPossession":
        return value ? `${value}` : "—";
      default:
        return value || "—";
    }
  };

  const excludeFields = [
    "id",
    "possessionCharges",
    "possessionMonth",
    "possessionYear",
    "projectName",
    "availableStations",
    "availibility",
    "avRate",
    "registration",
    "createdAt",
    "locationHighlightTimes",
    "type",
  ];

  const sections: { title: string; fields: string[] }[] = [
    {
      title: "Basic Details",
      fields: [
        "dateUpdateCostSheet",
        "developerName",
        "projectName",
        "subLocation",
        "landmark",
        "pinCode",
        "station",
        "district",
        "state",
        "landParcel",
        "towers",
        "storey",
        "possession",
        "reraPossession",
      ],
    },
    {
      title: "Pricing Details",
      fields: [
        "wingBuildingNo",
        "flatType",
        "saleableArea",
        "reraCarpet",
        "psfRate",
        "avRate",
        "floorRise",
        "registration",
      ],
    },
    {
      title: "Other Charges & Payment Plans",
      fields: [
        "fixedComponent",
        "possessionCharges",
        "parkingCharge",
        "totalPackage",
        "paymentScheme",
      ],
    },
    {
      title: "Amenities",
      fields: ["apartmentAmenities", "projectAmenities", "locationHighlights"],
    },
    {
      title: "Others",
      fields: [
        "type",
        "mahaReraNumber",
        "possessionMonth",
        "possessionYear",
        "isCosmo",
        "availibility",
        "imageUrl",
        "videoUrl",
        "siteHeadName",
        "siteHeadNumber",
      ],
    },
  ];

  const formatFieldLabel = (key: string): string => {
    if (key === "possession") {
      return "Developer Possession";
    }
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/[_-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="max-w-4xl w-full max-h-[70vh] flex flex-col select-none" style={{userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none'}}>
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-semibold">{data.projectName}</h2>
          <button onClick={onClose}>
            <X className="h-6 w-6 text-neutral-500" />
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain p-6 pt-4">
          {sections.map((section) => (
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
                  .filter((field) => !excludeFields.includes(field))
                  .map((field) => {
                    const isWideField = field === "locationHighlights";
                    return (
                      <div
                        key={field}
                        className={
                          isWideField
                            ? "lg:col-span-2 md:col-span-2 sm:col-span-2 col-span-1"
                            : ""
                        }
                      >
                        <div className="text-sm text-neutral-500">
                          {formatFieldLabel(field)}
                        </div>
                        <div className="text-sm font-medium text-neutral-900">
                          {formatValueByField(
                            field,
                            data[field as keyof CostSheet]
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}

          {/* Sourcing Managers Section */}
          <div className="mb-10">
            <div className="flex items-center gap-4 my-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <h3 className="text-lg font-semibold text-blue-700 whitespace-nowrap">
                Sourcing Managers
              </h3>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {(data as any).sourcingManagers && Array.isArray((data as any).sourcingManagers) && (data as any).sourcingManagers.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-neutral-200">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                        Contact
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {(data as any).sourcingManagers.map((manager: any, index: number) => (
                      <tr key={index} className="hover:bg-neutral-50">
                        <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-800">
                          {manager.name || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-800">
                          {manager.contact || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              (data as any).smName || (data as any).smContact ? (
                <div className="overflow-hidden rounded-lg border border-neutral-200">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                          Contact
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      <tr className="hover:bg-neutral-50">
                        <td className="px-4 py-3 text-sm text-neutral-800">
                          {(data as any).smName || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-800">
                          {(data as any).smContact || "-"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-sm text-neutral-500 italic">
                  No sourcing manager information available
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProjectDetailsModal;
