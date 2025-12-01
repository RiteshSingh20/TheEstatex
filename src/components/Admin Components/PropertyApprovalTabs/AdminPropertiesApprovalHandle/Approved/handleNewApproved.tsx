import { format } from "date-fns";
import { Eye } from "lucide-react";
import Button from "../../../../ui/Button";
import { Property } from "../../../helperFunctions";

export function handleNewApproved(
  approvedSearchTerms: { resale: string; rental: string; newProperty: string },
  setApprovedSearchTerms: any,
  approvedFilters: {
    resale: { type: string; sort: string };
    rental: { type: string; sort: string };
    newProperty: { bhk: string; sort: string };
  },
  setApprovedFilters: any,
  getAvailableNewPropertyTypes: () => string[],
  filteredApprovedProperties: {
    resale: Property[];
    rental: Property[];
    newProperties: any[];
  },
  setShowPropertyDetails: any,
  getUserInfo: (userId: string) => any
) {
  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="bg-gradient-to-r from-slate-50 via-purple-50 to-slate-50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          {/* Search Input */}
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 text-slate-400 group-focus-within:text-purple-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by project, developer, station..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200/60 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 hover:bg-white"
              value={approvedSearchTerms.newProperty}
              onChange={(e) =>
                setApprovedSearchTerms((prev) => ({
                  ...prev,
                  newProperty: e.target.value,
                }))
              }
            />
          </div>

          {/* Filter Controls */}
          <div className="flex gap-2 lg:gap-3">
            {/* Type Filter */}
            <div className="relative">
              <select
                className="appearance-none bg-white/80 border border-slate-200/60 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 hover:bg-white cursor-pointer min-w-[120px]"
                value={approvedFilters.newProperty.bhk}
                onChange={(e) =>
                  setApprovedFilters((prev) => ({
                    ...prev,
                    newProperty: {
                      ...prev.newProperty,
                      bhk: e.target.value,
                    },
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
              <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Sort Filter */}
            <div className="relative">
              <select
                className="appearance-none bg-white/80 border border-slate-200/60 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 hover:bg-white cursor-pointer min-w-[140px]"
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
              <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(approvedSearchTerms.newProperty ||
              approvedFilters.newProperty.bhk ||
              approvedFilters.newProperty.sort) && (
              <button
                onClick={() => {
                  setApprovedSearchTerms((prev) => ({
                    ...prev,
                    newProperty: "",
                  }));
                  setApprovedFilters((prev) => ({
                    ...prev,
                    newProperty: {
                      bhk: "",
                      sort: "",
                    },
                  }));
                }}
                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 rounded-lg text-sm font-medium text-slate-600 transition-all duration-200 flex items-center gap-1.5"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredApprovedProperties.newProperties.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 rounded-lg">
          <div className="text-neutral-400 mb-2">
            <svg
              className="w-16 h-16 mx-auto"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </div>
          <p className="text-neutral-500 text-lg font-medium">
            No approved new properties
          </p>
          <p className="text-neutral-400 text-sm mt-1">
            Approved new developments will appear here
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-gradient-to-r from-purple-50 to-purple-100">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider border-r border-purple-200">
                    Date
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider border-r border-purple-200">
                    Project
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider border-r border-purple-200">
                    Station
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider border-r border-purple-200">
                    Sub Location
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider border-r border-purple-200">
                    Approved By
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-purple-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-100">
                {filteredApprovedProperties.newProperties.map(
                  (property: any, index) => (
                    <tr
                      key={`approved-new-${property.id}`}
                      className={`hover:bg-purple-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-purple-25"
                      }`}
                    >
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-600 border-r border-neutral-100">
                        {(() => {
                          const dateValue =
                            property.createdAt || property.dateUpdateCostSheet;
                          if (!dateValue) return "-";
                          try {
                            let date;
                            if (typeof dateValue === "string") {
                              date = new Date(dateValue);
                            } else if (dateValue.toDate) {
                              date = dateValue.toDate();
                            } else {
                              date = dateValue;
                            }
                            return isNaN(date.getTime())
                              ? "-"
                              : format(date, "dd/MM/yy");
                          } catch {
                            return "-";
                          }
                        })()}
                      </td>
                      <td className="px-3 py-3 border-r border-neutral-100">
                        <div className="max-w-xs">
                          <div className="text-sm font-medium text-neutral-900 truncate">
                            {property.projectName}
                          </div>
                          <div className="text-xs text-neutral-500">
                            by {property.developerName}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 border-r border-neutral-100">
                        <div className="text-sm text-neutral-900">
                          {property.location || property.station}
                        </div>
                      </td>
                      <td className="px-3 py-3 border-r border-neutral-100">
                        <div className="text-sm text-neutral-900">
                          {property.subLocation}
                        </div>
                      </td>
                      <td className="px-3 py-3 border-r border-neutral-100">
                        <div className="w-fit">
                          {(() => {
                            // Show approved by user details
                            if (property.approvedBy) {
                              const getValidDate = (value: any) => {
                                if (!value) return null;
                                if (value?.seconds) return new Date(value.seconds * 1000);
                                if (value instanceof Date) return value;
                                const d = new Date(value);
                                return isNaN(d.getTime()) ? null : d;
                              };
                              
                              const approvedDate = getValidDate(property.approvedAt);
                              
                              return (
                                <div className="flex flex-col space-y-1">
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-green-100 text-green-700">
                                    Admin (Approved)
                                  </span>
                                  {approvedDate && (
                                    <span className="text-[10px] text-neutral-400">
                                      {format(approvedDate, "dd MMM yy - hh:mm a")}
                                    </span>
                                  )}
                                  <div className="text-xs text-neutral-600">
                                    {(() => {
                                      if (getUserInfo && typeof getUserInfo === 'function') {
                                        const user = getUserInfo(property.approvedBy);
                                        if (user) {
                                          return (
                                            <div className="space-y-0.5">
                                              <div className="text-xs text-neutral-600 truncate">
                                                {user.email}
                                              </div>
                                              <div className="text-xs text-neutral-400 truncate">
                                                {user.fullName}
                                              </div>
                                            </div>
                                          );
                                        }
                                      }
                                      return `ID: ${property.approvedBy}`;
                                    })()} 
                                  </div>
                                </div>
                              );
                            }
                            return (
                              <div className="text-xs text-neutral-500">
                                -
                              </div>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setShowPropertyDetails({
                              ...property,
                              category: "newProperty",
                            })
                          }
                          className="p-1"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
