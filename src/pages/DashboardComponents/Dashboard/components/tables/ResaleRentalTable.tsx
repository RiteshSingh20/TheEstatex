import React from "react";
import Card from "../../../../../components/ui/Card";
import { getFloorCategory } from "../../utils/propertyFormatters";
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
  keyAvailable?: boolean | string;
}

interface ResaleRentalTableProps {
  filteredProperties: ResaleProperty[];
  propertyCategory: string;
  currentPage: number;
  itemsPerPage: number;
  user: any;
  appliedFilters: any;
  isPropertySelected: (property: ResaleProperty) => boolean;
  togglePropertySelection: (property: ResaleProperty) => void;
  handlePropertyClick: (property: ResaleProperty) => void;
  setProcessedCount?: (count: number) => void;
}

const ResaleRentalTable: React.FC<ResaleRentalTableProps> = ({
  filteredProperties,
  propertyCategory,
  currentPage,
  itemsPerPage,
  user,
  appliedFilters,
  isPropertySelected,
  togglePropertySelection,
  handlePropertyClick,
  setProcessedCount,
}) => {
  // Update processed count when properties change
  React.useEffect(() => {
    if (setProcessedCount) {
      setProcessedCount(filteredProperties.length);
    }
  }, [filteredProperties.length, setProcessedCount]);
  const getCurrentPageData = (data: ResaleProperty[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  return (
    <Card>
      <div className="overflow-x-auto">
        <table
          className="min-w-full divide-y divide-neutral-200 table-fixed select-none"
          style={{
            tableLayout: "fixed",
            transition: "all 0.3s ease",
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
          }}
        >
          <thead className="bg-blue-100 border-b-2 border-blue-200">
            <tr>
              <th className="w-16 px-3 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wide">
                Select
              </th>
              <th className="w-16 px-3 py-3 text-center text-xs font-semibold text-blue-900 uppercase tracking-wide">
                Sr. No
              </th>
              {propertyCategory === "Resale" && (
                <>
                  <th className="w-24 px-3 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wide">
                    Direct / Broker
                  </th>
                  <th className="w-48 px-3 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wide">
                    Building / Society
                  </th>
                  <th className="w-40 px-3 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wide">
                    {appliedFilters.station ? "Road / Location" : "Location"}
                  </th>
                  <th className="w-32 px-3 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wide">
                    Expected Price
                  </th>
                  <th className="w-28 px-3 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wide">
                    FLR No
                  </th>
                  <th className="w-20 px-3 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wide">
                    FLAT No
                  </th>
                  <th className="w-32 px-3 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wide">
                    Name
                  </th>
                </>
              )}
              {propertyCategory === "Rental" && (
                <>
                  <th className="w-24 px-3 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wide">
                    Direct / Broker
                  </th>
                  <th className="w-48 px-3 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wide">
                    Building / Society
                  </th>
                  <th className="w-40 px-3 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wide">
                    {appliedFilters.station ? "Road / Location" : "Location"}
                  </th>
                  <th className="w-24 px-3 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wide">
                    Rent
                  </th>
                  <th className="w-28 px-3 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wide">
                    Deposit
                  </th>
                  <th className="w-20 px-3 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wide">
                    FLAT No
                  </th>
                  <th className="w-32 px-3 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wide">
                    Name
                  </th>
                </>
              )}
              <th className="w-28 px-3 py-3 text-center text-xs font-semibold text-blue-900 uppercase tracking-wide">
                Contact
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-neutral-200">
            {getCurrentPageData(
              filteredProperties.sort((a, b) => {
                const aIsOwn = a.userId === user?.id;
                const bIsOwn = b.userId === user?.id;
                if (aIsOwn && !bIsOwn) return -1;
                if (!aIsOwn && bIsOwn) return 1;

                if (propertyCategory === "Resale") {
                  const priceA = a.expectedPrice || 0;
                  const priceB = b.expectedPrice || 0;
                  return priceA - priceB;
                }
                if (propertyCategory === "Rental") {
                  const rentA = a.rent || 0;
                  const rentB = b.rent || 0;
                  return rentA - rentB;
                }
                return 0;
              })
            ).map((property, index) => {
              const uniquePropertyKey = `${property.id}-${
                property.userId || "no-user"
              }-${index}`;

              return (
                <tr
                  key={uniquePropertyKey}
                  className={`hover:bg-neutral-50 ${
                    isPropertySelected(property)
                      ? "bg-primary/5"
                      : property.userId === user?.id
                      ? "bg-green-50"
                      : ""
                  }`}
                >
                  <td className="px-3 py-3 text-xs">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                      checked={isPropertySelected(property)}
                      onChange={() => togglePropertySelection(property)}
                    />
                  </td>
                  <td className="px-3 py-3 text-xs text-neutral-600">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  {propertyCategory === "Resale" && (
                    <>
                      <td className="px-3 py-3 text-xs font-medium text-neutral-900">
                        {property.userId === user?.id ? "Direct" : "Broker"}
                      </td>
                      <td
                        className="px-3 py-3 text-xs text-primary cursor-pointer hover:underline truncate"
                        onClick={() => handlePropertyClick(property)}
                        title={property.society?.toString()}
                      >
                        <div className="relative">
                          <div>
                            <PropertyNameWithKey
                              name={property.society || "-"}
                              keyAvailable={property.keyAvailable}
                            />
                          </div>
                          {(property as any).plusProperty && (
                            <div className="absolute -top-3 right-0 text-[9px] font-semibold text-white leading-none bg-amber-500 px-1 py-0.5 rounded-full">
                              {(property as any).plusProperty}
                            </div>
                          )}
                        </div>
                      </td>
                      <td
                        className="px-3 py-3 text-xs text-neutral-900 truncate"
                        title={appliedFilters.station ? property.sublocation : `${property.sublocation} in ${property.station}`}
                      >
                        {appliedFilters.station ? property.sublocation : (
                          <div>
                            <div>{property.sublocation}</div>
                            <div className="text-gray-500">in {property.station}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs text-neutral-900 font-semibold">
                        ₹{property.expectedPrice?.toLocaleString("en-IN")}
                      </td>
                      <td className="px-3 py-3 text-xs text-neutral-900">
                        {getFloorCategory(
                          property.floorNo,
                          property.totalFloors
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs text-neutral-900">
                        {property.userId !== user?.id
                          ? "--"
                          : property.flatNo || "N/A"}
                      </td>
                      <td
                        className="px-3 py-3 text-xs text-neutral-900 truncate"
                        title={
                          property.userId === user?.id
                            ? property.ownerName
                            : property.userFullName
                        }
                      >
                        {property.userId === user?.id
                          ? property.ownerName
                          : property.userFullName}
                      </td>
                      <td className="px-3 py-3 text-xs text-neutral-900 text-center">
                        {property.userId === user?.id
                          ? property.ownerNumber
                          : property.userMarketingPhoneNumber}
                      </td>
                    </>
                  )}
                  {propertyCategory === "Rental" && (
                    <>
                      <td className="px-3 py-3 text-xs font-medium text-neutral-900">
                        {property.userId === user?.id ? "Direct" : "Broker"}
                      </td>
                      <td
                        className="px-3 py-3 text-xs text-primary cursor-pointer hover:underline truncate"
                        onClick={() => handlePropertyClick(property)}
                        title={property.society?.toString()}
                      >
                        <PropertyNameWithKey
                          name={property.society || "-"}
                          keyAvailable={property.keyAvailable}
                        />
                      </td>
                      <td
                        className="px-3 py-3 text-xs text-neutral-900 truncate"
                        title={appliedFilters.station ? property.sublocation : `${property.sublocation} in ${property.station}`}
                      >
                        {appliedFilters.station ? property.sublocation : (
                          <div>
                            <div>{property.sublocation}</div>
                            <div className="text-gray-500">in {property.station}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs text-neutral-900 font-semibold">
                        ₹
                        {property.rent
                          ? property.rent.toLocaleString("en-IN")
                          : "N/A"}
                      </td>
                      <td className="px-3 py-3 text-xs text-neutral-900">
                        ₹
                        {property.deposit
                          ? property.deposit.toLocaleString("en-IN")
                          : "N/A"}
                      </td>
                      <td className="px-3 py-3 text-xs text-neutral-900">
                        {property.userId !== user?.id
                          ? "--"
                          : property.flatNo || "N/A"}
                      </td>
                      <td
                        className="px-3 py-3 text-xs text-neutral-900 truncate"
                        title={
                          property.userId === user?.id
                            ? property.ownerName
                            : property.userFullName
                        }
                      >
                        {property.userId === user?.id
                          ? property.ownerName
                          : property.userFullName}
                      </td>
                      <td className="px-3 py-3 text-xs text-neutral-900 text-center">
                        {property.userId === user?.id
                          ? property.ownerNumber
                          : property.userMarketingPhoneNumber}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default ResaleRentalTable;
