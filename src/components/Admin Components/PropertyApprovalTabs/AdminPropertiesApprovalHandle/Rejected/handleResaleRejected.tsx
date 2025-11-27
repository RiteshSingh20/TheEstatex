import { toDate, format } from "date-fns";
import { User } from "firebase/auth";
import { Eye, Check } from "lucide-react";
import Button from "../../../../ui/Button";
import { Property } from "../../../helperFunctions";

export function handleResaleRejected(
  rejectedSearchTerms: { resale: string; rental: string; newProperty: string },
  setRejectedSearchTerms: any,
  rejectedFilters: {
    resale: { type: string; sort: string };
    rental: { type: string; sort: string };
    newProperty: { bhk: string; sort: string };
  },
  setRejectedFilters: any,
  getRejectedResaleTypes: () => string[],
  filteredRejectedProperties: {
    resale: Property[];
    rental: Property[];
    newProperties: any[];
  },
  setShowPropertyDetails: any,
  user: User | null,
  handleApproveRejectedProperty: (
    propertyId: string,
    category: "resale" | "rental" | "newProperty"
  ) => Promise<void>,
  actionLoading: boolean
) {
  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="bg-gradient-to-r from-slate-50 via-red-50 to-slate-50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          {/* Search Input */}
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 text-slate-400 group-focus-within:text-red-500 transition-colors"
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
              placeholder="Search by society, location, type..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200/60 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all duration-200 hover:bg-white"
              value={rejectedSearchTerms.resale}
              onChange={(e) =>
                setRejectedSearchTerms((prev) => ({
                  ...prev,
                  resale: e.target.value,
                }))
              }
            />
          </div>

          {/* Filter Controls */}
          <div className="flex gap-2 lg:gap-3">
            {/* Type Filter */}
            <div className="relative">
              <select
                className="appearance-none bg-white/80 border border-slate-200/60 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all duration-200 hover:bg-white cursor-pointer min-w-[120px]"
                value={rejectedFilters.resale.type}
                onChange={(e) =>
                  setRejectedFilters((prev) => ({
                    ...prev,
                    resale: {
                      ...prev.resale,
                      type: e.target.value,
                    },
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
                className="appearance-none bg-white/80 border border-slate-200/60 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all duration-200 hover:bg-white cursor-pointer min-w-[140px]"
                value={rejectedFilters.resale.sort}
                onChange={(e) =>
                  setRejectedFilters((prev) => ({
                    ...prev,
                    resale: {
                      ...prev.resale,
                      sort: e.target.value,
                    },
                  }))
                }
              >
                <option value="">Sort by</option>
                <option value="date-desc">Latest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="price-asc">Price: Low to High</option>
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
            {(rejectedSearchTerms.resale ||
              rejectedFilters.resale.type ||
              rejectedFilters.resale.sort) && (
              <button
                onClick={() => {
                  setRejectedSearchTerms((prev) => ({
                    ...prev,
                    resale: "",
                  }));
                  setRejectedFilters((prev) => ({
                    ...prev,
                    resale: { type: "", sort: "" },
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

      {filteredRejectedProperties.resale.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 rounded-lg">
          <div className="text-neutral-400 mb-2">
            <svg
              className="w-16 h-16 mx-auto"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-neutral-500 text-lg font-medium">
            No rejected resale properties
          </p>
          <p className="text-neutral-400 text-sm mt-1">
            Rejected properties will appear here
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-gradient-to-r from-red-50 to-red-100">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-red-700 uppercase tracking-wider border-r border-red-200">
                    Date
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-red-700 uppercase tracking-wider border-r border-red-200">
                    Property
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-red-700 uppercase tracking-wider border-r border-red-200">
                    Location
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-red-700 uppercase tracking-wider border-r border-red-200">
                    Price
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-red-700 uppercase tracking-wider border-r border-red-200">
                    Type
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-red-700 uppercase tracking-wider border-r border-red-200">
                    Rejection Reason
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-red-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-100">
                {filteredRejectedProperties.resale.map(
                  (property: Property, index) => (
                    <tr
                      key={`rejected-resale-${property.docId || property.id}`}
                      className={`hover:bg-red-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-red-25"
                      }`}
                    >
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-600 border-r border-neutral-100">
                        {(() => {
                          try {
                            if (!property.createdAt) return "-";
                            const date = toDate(property.createdAt);
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
                            {property.society}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {property.roadLocation}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 border-r border-neutral-100">
                        <div className="max-w-xs">
                          <div className="text-sm text-neutral-900 truncate">
                            {property.sublocation}
                          </div>
                          {property.station && (
                            <div className="text-xs text-neutral-500">
                              In {property.station}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap border-r border-neutral-100">
                        <div className="text-sm font-semibold text-neutral-900">
                          ?{property.expectedPrice?.toLocaleString("en-IN")}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap border-r border-neutral-100">
                        <div className="text-sm text-neutral-900">
                          {property.type}
                        </div>
                      </td>
                      <td className="px-3 py-3 border-r border-neutral-100">
                        <div className="max-w-xs">
                          <div className="text-sm text-red-600 truncate">
                            {property.rejectionReason || "No reason provided"}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setShowPropertyDetails({
                                ...property,
                                category: "resale",
                              })
                            }
                            className="p-1"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          {user?.role === "admin" && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() =>
                                handleApproveRejectedProperty(
                                  property.docId || property.id,
                                  "resale"
                                )
                              }
                              disabled={actionLoading}
                              className="p-1"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
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
