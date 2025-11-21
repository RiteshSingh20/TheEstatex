import Tabs from "../../../ui/Tabs";
import Input from "../../../ui/Input";
import Button from "../../../ui/Button";
import { format } from "date-fns";

type Property = any;

type RejectedProps = {
  rejectedProperties: {
    resale: Property[];
    rental: Property[];
    newProperties: any[];
  };
  rejectedSearchTerms: { resale: string; rental: string; newProperty: string };
  setRejectedSearchTerms: (updater: (prev: any) => any) => void;
  rejectedFilters: {
    resale: { type: string; sort: string };
    rental: { type: string; sort: string };
    newProperty: { bhk: string; sort: string };
  };
  setRejectedFilters: (updater: (prev: any) => any) => void;
  getRejectedResaleTypes: () => string[];
  getRejectedRentalTypes: () => string[];
  getRejectedNewPropertyTypes: () => string[];
  toDate: (v: any) => Date;
  onViewResale: (p: Property) => void;
  onViewRental: (p: Property) => void;
  onViewNew: (p: any) => void;
  onApproveRejected: (
    id: string,
    category: "resale" | "rental" | "newProperty"
  ) => void;
  userRole?: string;
  actionLoading?: boolean;
};

const RejectedSection = ({
  rejectedProperties,
  rejectedSearchTerms,
  setRejectedSearchTerms,
  rejectedFilters,
  setRejectedFilters,
  getRejectedResaleTypes,
  getRejectedRentalTypes,
  getRejectedNewPropertyTypes,
  toDate,
  onViewResale,
  onViewRental,
  onViewNew,
  onApproveRejected,
  userRole,
  actionLoading,
}: RejectedProps) => {
  const tabs = [
    {
      id: "resale-rejected",
      label: `Resale (${rejectedProperties.resale.length})`,
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  id="search-rejected-resale"
                  placeholder="Search by society, location, type..."
                  className="w-full"
                  value={rejectedSearchTerms.resale}
                  onChange={(e) =>
                    setRejectedSearchTerms((prev) => ({
                      ...prev,
                      resale: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
                  value={rejectedFilters.resale.type}
                  onChange={(e) =>
                    setRejectedFilters((prev) => ({
                      ...prev,
                      resale: { ...prev.resale, type: e.target.value },
                    }))
                  }
                >
                  <option value="">All Types</option>
                  {getRejectedResaleTypes().map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <select
                  className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
                  value={rejectedFilters.resale.sort}
                  onChange={(e) =>
                    setRejectedFilters((prev) => ({
                      ...prev,
                      resale: { ...prev.resale, sort: e.target.value },
                    }))
                  }
                >
                  <option value="">Sort by</option>
                  <option value="date-desc">Latest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="price-asc">Price: Low to High</option>
                </select>
              </div>
            </div>
          </div>

          {rejectedProperties.resale.length === 0 ? (
            <div className="text-center py-12 bg-neutral-50 rounded-lg">
              <p className="text-neutral-500 text-lg font-medium">
                No rejected resale properties
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rejectedProperties.resale.map((property: any) => (
                <div
                  key={`rejected-resale-${property.docId || property.id}`}
                  className="bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-neutral-900 text-lg truncate">
                          {property.society}
                        </h4>
                        <p className="text-neutral-600 text-sm">
                          {property.roadLocation}
                        </p>
                        {property.station && (
                          <p className="text-neutral-500 text-xs mt-1">
                            Near {property.station}
                          </p>
                        )}
                      </div>
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                        Rejected
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500 text-sm">Type:</span>
                        <span className="font-medium text-neutral-900">
                          {property.type}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500 text-sm">Price:</span>
                        <span className="font-bold text-neutral-600 text-lg">
                          ₹{property.expectedPrice?.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500 text-sm">Added:</span>
                        <span className="text-neutral-700 text-sm">
                          {format(toDate(property.createdAt), "dd MMM yyyy")}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="text-neutral-500 text-sm">
                          Reason:
                        </span>
                        <p className="text-red-600 text-sm mt-1 truncate">
                          {property.rejectionReason || "No reason provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onClick={() => onViewResale(property)}
                      >
                        View Details
                      </Button>
                      {userRole === "admin" && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            onApproveRejected(
                              property.docId || property.id,
                              "resale"
                            )
                          }
                          disabled={!!actionLoading}
                        >
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "new-rejected",
      label: `New Properties (${
        rejectedProperties.newProperties?.length || 0
      })`,
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  id="search-rejected-new"
                  placeholder="Search by project, developer, station..."
                  className="w-full"
                  value={rejectedSearchTerms.newProperty}
                  onChange={(e) =>
                    setRejectedSearchTerms((prev) => ({
                      ...prev,
                      newProperty: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
                  value={rejectedFilters.newProperty.bhk}
                  onChange={(e) =>
                    setRejectedFilters((prev) => ({
                      ...prev,
                      newProperty: { ...prev.newProperty, bhk: e.target.value },
                    }))
                  }
                >
                  <option value="">All Types</option>
                  {getRejectedNewPropertyTypes().map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <select
                  className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
                  value={rejectedFilters.newProperty.sort}
                  onChange={(e) =>
                    setRejectedFilters((prev) => ({
                      ...prev,
                      newProperty: {
                        ...prev.newProperty,
                        sort: e.target.value,
                      },
                    }))
                  }
                >
                  <option value="">Sort by</option>
                  <option value="date-desc">Latest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="carpet-desc">Carpet: Large to Small</option>
                  <option value="carpet-asc">Carpet: Small to Large</option>
                </select>
              </div>
            </div>
          </div>

          {rejectedProperties.newProperties.length === 0 ? (
            <div className="text-center py-12 bg-neutral-50 rounded-lg">
              <p className="text-neutral-500 text-lg font-medium">
                No rejected new properties
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rejectedProperties.newProperties.map((property: any) => (
                <div
                  key={`rejected-new-${property.id}`}
                  className="bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-neutral-900 text-lg truncate">
                          {property.projectName}
                        </h4>
                        <p className="text-neutral-600 text-sm">
                          by {property.developerName}
                        </p>
                        <p className="text-neutral-500 text-xs mt-1">
                          {property.station}
                        </p>
                      </div>
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                        Rejected
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500 text-sm">Type:</span>
                        <span className="font-medium text-neutral-900">
                          {property.flatType || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500 text-sm">
                          RERA Carpet:
                        </span>
                        <span className="font-medium text-neutral-900">
                          {property.reraCarpet || "-"} sq ft
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500 text-sm">
                          Updated:
                        </span>
                        <span className="text-neutral-700 text-sm">
                          {(() => {
                            const dateValue =
                              property.createdAt ||
                              property.dateUpdateCostSheet;
                            if (!dateValue) return "-";
                            try {
                              let date: Date;
                              if (typeof dateValue === "string") {
                                date = new Date(dateValue);
                              } else if (dateValue.toDate) {
                                date = dateValue.toDate();
                              } else {
                                date = dateValue;
                              }
                              return isNaN(date.getTime())
                                ? "-"
                                : format(date, "dd MMM yyyy");
                            } catch {
                              return "-";
                            }
                          })()}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="text-neutral-500 text-sm">
                          Reason:
                        </span>
                        <p className="text-red-600 text-sm mt-1 truncate">
                          {property.rejectionReason || "No reason provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onClick={() => onViewNew(property)}
                      >
                        View Details
                      </Button>
                      {userRole === "admin" && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            onApproveRejected(property.id, "newProperty")
                          }
                          disabled={!!actionLoading}
                        >
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "rental-rejected",
      label: `Rental (${rejectedProperties.rental.length})`,
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  id="search-rejected-rental"
                  placeholder="Search by society, location, type..."
                  className="w-full"
                  value={rejectedSearchTerms.rental}
                  onChange={(e) =>
                    setRejectedSearchTerms((prev) => ({
                      ...prev,
                      rental: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
                  value={rejectedFilters.rental.type}
                  onChange={(e) =>
                    setRejectedFilters((prev) => ({
                      ...prev,
                      rental: { ...prev.rental, type: e.target.value },
                    }))
                  }
                >
                  <option value="">All Types</option>
                  {getRejectedRentalTypes().map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <select
                  className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
                  value={rejectedFilters.rental.sort}
                  onChange={(e) =>
                    setRejectedFilters((prev) => ({
                      ...prev,
                      rental: { ...prev.rental, sort: e.target.value },
                    }))
                  }
                >
                  <option value="">Sort by</option>
                  <option value="date-desc">Latest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="rent-desc">Rent: High to Low</option>
                  <option value="rent-asc">Rent: Low to High</option>
                </select>
              </div>
            </div>
          </div>

          {rejectedProperties.rental.length === 0 ? (
            <div className="text-center py-12 bg-neutral-50 rounded-lg">
              <p className="text-neutral-500 text-lg font-medium">
                No rejected rental properties
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rejectedProperties.rental.map((property: any) => (
                <div
                  key={`rejected-rental-${property.docId || property.id}`}
                  className="bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-neutral-900 text-lg truncate">
                          {property.society}
                        </h4>
                        <p className="text-neutral-600 text-sm">
                          {property.roadLocation}
                        </p>
                        {property.station && (
                          <p className="text-neutral-500 text-xs mt-1">
                            Near {property.station}
                          </p>
                        )}
                      </div>
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                        Rejected
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500 text-sm">Type:</span>
                        <span className="font-medium text-neutral-900">
                          {property.type}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500 text-sm">
                          Monthly Rent:
                        </span>
                        <span className="font-bold text-neutral-600 text-lg">
                          ₹{property.rent?.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500 text-sm">Added:</span>
                        <span className="text-neutral-700 text-sm">
                          {format(toDate(property.createdAt), "dd MMM yyyy")}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="text-neutral-500 text-sm">
                          Reason:
                        </span>
                        <p className="text-red-600 text-sm mt-1 truncate">
                          {property.rejectionReason || "No reason provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onClick={() => onViewRental(property)}
                      >
                        View Details
                      </Button>
                      {userRole === "admin" && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            onApproveRejected(
                              property.docId || property.id,
                              "rental"
                            )
                          }
                          disabled={!!actionLoading}
                        >
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
  ];

  return <Tabs variant="underline" tabs={tabs} />;
};

export default RejectedSection;
