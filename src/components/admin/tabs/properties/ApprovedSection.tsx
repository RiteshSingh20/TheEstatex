import Tabs from "../../../ui/Tabs";
import Input from "../../../ui/Input";
import Button from "../../../ui/Button";
import { format } from "date-fns";
import PropertyNameWithKey from "../../../PropertyNameWithKey";

type Property = any;

type ApprovedProps = {
  approvedProperties: {
    resale: Property[];
    rental: Property[];
    newProperties: any[];
  };
  approvedSearchTerms: { resale: string; rental: string; newProperty: string };
  setApprovedSearchTerms: (updater: (prev: any) => any) => void;
  approvedFilters: {
    resale: { type: string; sort: string };
    rental: { type: string; sort: string };
    newProperty: { bhk: string; sort: string };
  };
  setApprovedFilters: (updater: (prev: any) => any) => void;
  getAvailableResaleTypes: () => string[];
  getAvailableRentalTypes: () => string[];
  getAvailableNewPropertyTypes: () => string[];
  toDate: (v: any) => Date;
  onViewResale: (p: Property) => void;
  onViewRental: (p: Property) => void;
  onViewNew: (p: any) => void;
};

const ApprovedSection = ({
  approvedProperties,
  approvedSearchTerms,
  setApprovedSearchTerms,
  approvedFilters,
  setApprovedFilters,
  getAvailableResaleTypes,
  getAvailableRentalTypes,
  getAvailableNewPropertyTypes,
  toDate,
  onViewResale,
  onViewRental,
  onViewNew,
}: ApprovedProps) => {
  const tabs = [
    {
      id: "resale-approved",
      label: `Resale (${approvedProperties.resale.length})`,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  id="search-resale"
                  placeholder="Search by society, location, type..."
                  className="w-full"
                  value={approvedSearchTerms.resale}
                  onChange={(e) =>
                    setApprovedSearchTerms((prev) => ({
                      ...prev,
                      resale: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
                  value={approvedFilters.resale.type}
                  onChange={(e) =>
                    setApprovedFilters((prev) => ({
                      ...prev,
                      resale: { ...prev.resale, type: e.target.value },
                    }))
                  }
                >
                  <option value="">All Types</option>
                  {getAvailableResaleTypes().map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <select
                  className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
                  value={approvedFilters.resale.sort}
                  onChange={(e) =>
                    setApprovedFilters((prev) => ({
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

          {approvedProperties.resale.length === 0 ? (
            <div className="text-center py-12 bg-neutral-50 rounded-lg">
              <p className="text-neutral-500 text-lg font-medium">
                No approved resale properties
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedProperties.resale.map((property: any) => (
                <div
                  key={`approved-resale-${property.docId || property.id}`}
                  className="bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-neutral-900 text-lg truncate">
                          <PropertyNameWithKey
                            name={property.society || "-"}
                            keyAvailable={property.keyAvailable}
                          />
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
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        Approved
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
                        <span className="font-bold text-green-600 text-lg">
                          ₹{property.expectedPrice?.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500 text-sm">Added:</span>
                        <span className="text-neutral-700 text-sm">
                          {format(toDate(property.createdAt), "dd MMM yyyy")}
                        </span>
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
      id: "new-approved",
      label: `New Properties (${
        approvedProperties.newProperties?.length || 0
      })`,
      content: (
        <div className="space-y-4">
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  id="search-new"
                  placeholder="Search by project, developer, station..."
                  className="w-full"
                  value={approvedSearchTerms.newProperty}
                  onChange={(e) =>
                    setApprovedSearchTerms((prev) => ({
                      ...prev,
                      newProperty: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
                  value={approvedFilters.newProperty.bhk}
                  onChange={(e) =>
                    setApprovedFilters((prev) => ({
                      ...prev,
                      newProperty: { ...prev.newProperty, bhk: e.target.value },
                    }))
                  }
                >
                  <option value="">All Types</option>
                  {getAvailableNewPropertyTypes().map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <select
                  className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
                  value={approvedFilters.newProperty.sort}
                  onChange={(e) =>
                    setApprovedFilters((prev) => ({
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

          {approvedProperties.newProperties.length === 0 ? (
            <div className="text-center py-12 bg-neutral-50 rounded-lg">
              <p className="text-neutral-500 text-lg font-medium">
                No approved new properties
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedProperties.newProperties.map((property: any) => (
                <div
                  key={`approved-new-${property.id}`}
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
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        Approved
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
      id: "rental-approved",
      label: `Rental (${approvedProperties.rental.length})`,
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  id="search-rental"
                  placeholder="Search by society, location, type..."
                  className="w-full"
                  value={approvedSearchTerms.rental}
                  onChange={(e) =>
                    setApprovedSearchTerms((prev) => ({
                      ...prev,
                      rental: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
                  value={approvedFilters.rental.type}
                  onChange={(e) =>
                    setApprovedFilters((prev) => ({
                      ...prev,
                      rental: { ...prev.rental, type: e.target.value },
                    }))
                  }
                >
                  <option value="">All Types</option>
                  {getAvailableRentalTypes().map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <select
                  className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
                  value={approvedFilters.rental.sort}
                  onChange={(e) =>
                    setApprovedFilters((prev) => ({
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

          {approvedProperties.rental.length === 0 ? (
            <div className="text-center py-12 bg-neutral-50 rounded-lg">
              <p className="text-neutral-500 text-lg font-medium">
                No approved rental properties
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedProperties.rental.map((property: any) => (
                <div
                  key={`approved-rental-${property.docId || property.id}`}
                  className="bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-neutral-900 text-lg truncate">
                          <PropertyNameWithKey
                            name={property.society || "-"}
                            keyAvailable={property.keyAvailable}
                          />
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
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        Approved
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
                        <span className="font-bold text-green-600 text-lg">
                          ₹{property.rent?.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500 text-sm">Added:</span>
                        <span className="text-neutral-700 text-sm">
                          {format(toDate(property.createdAt), "dd MMM yyyy")}
                        </span>
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

export default ApprovedSection;
