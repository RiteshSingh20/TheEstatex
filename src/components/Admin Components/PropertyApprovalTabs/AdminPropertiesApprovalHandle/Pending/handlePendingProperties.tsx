import { toDate, format } from "date-fns";
import { User } from "firebase/auth";
import { Eye, Check, X } from "lucide-react";
import FilterBar from "../../../../FilterBar";
import Button from "../../../../ui/Button";
import Tabs from "../../../../ui/Tabs";
import { Property } from "../../../helperFunctions";

export function handlePendingProperties(
  pendingProperties: {
    resale: Property[];
    rental: Property[];
    newProperties: any[];
  },
  pendingSearchTerms: { resale: string; rental: string; newProperty: string },
  setPendingSearchTerms: any,
  pendingFilters: {
    resale: { type: string; sort: string };
    rental: { type: string; sort: string };
    newProperty: { bhk: string; sort: string };
  },
  setPendingFilters: any,
  getPendingResaleTypes: () => string[],
  setShowPropertyDetails: any,
  handleApproveProperty: (
    docId: string,
    category: "resale" | "rental"
  ) => Promise<void>,
  actionLoading: boolean,
  setRejectingProperty: any,
  setShowRejectModal: any,
  pendingNewPropertyReraRange: { min: string; max: string },
  setPendingNewPropertyReraRange: any,
  getUserInfo: (userId: string) => User,
  handleApproveNewProperty: (id: string) => Promise<void>
) {
  return (
    <div className="overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4">Pending Properties</h3>

      <Tabs
        variant="underline"
        tabs={[
          {
            id: "resale",
            label: `Resale (${pendingProperties.resale.length})`,
            content: (
              <div className="space-y-4">
                {/* Premium Search & Filter Bar */}
                <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-4 shadow-sm">
                  <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
                    {/* Search Input */}
                    <div className="flex-1 relative group">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <svg
                          className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors"
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
                        placeholder="Search properties..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200/60 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 hover:bg-white"
                        value={pendingSearchTerms.resale}
                        onChange={(e) =>
                          setPendingSearchTerms((prev) => ({
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
                          className="appearance-none bg-white/80 border border-slate-200/60 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 hover:bg-white cursor-pointer min-w-[120px]"
                          value={pendingFilters.resale.type}
                          onChange={(e) =>
                            setPendingFilters((prev) => ({
                              ...prev,
                              resale: {
                                ...prev.resale,
                                type: e.target.value,
                              },
                            }))
                          }
                        >
                          <option value="">All Types</option>
                          {getPendingResaleTypes().map((type) => (
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
                          className="appearance-none bg-white/80 border border-slate-200/60 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 hover:bg-white cursor-pointer min-w-[140px]"
                          value={pendingFilters.resale.sort}
                          onChange={(e) =>
                            setPendingFilters((prev) => ({
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
                      {(pendingSearchTerms.resale ||
                        pendingFilters.resale.type ||
                        pendingFilters.resale.sort) && (
                        <button
                          onClick={() => {
                            setPendingSearchTerms((prev) => ({
                              ...prev,
                              resale: "",
                            }));
                            setPendingFilters((prev) => ({
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

                <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
                  {(() => {
                    // Filter and sort pending resale properties
                    let filteredPendingResale = pendingProperties.resale.filter(
                      (property) => {
                        const searchTerm =
                          pendingSearchTerms.resale.toLowerCase();
                        const matchesSearch =
                          !searchTerm ||
                          property.society
                            ?.toLowerCase()
                            .includes(searchTerm) ||
                          property.sublocation
                            ?.toLowerCase()
                            .includes(searchTerm) ||
                          property.roadLocation
                            ?.toLowerCase()
                            .includes(searchTerm) ||
                          property.type?.toLowerCase().includes(searchTerm) ||
                          property.station?.toLowerCase().includes(searchTerm);

                        const matchesType =
                          !pendingFilters.resale.type ||
                          property.type === pendingFilters.resale.type;

                        return matchesSearch && matchesType;
                      }
                    );

                    // Sort properties
                    if (pendingFilters.resale.sort) {
                      filteredPendingResale.sort((a, b) => {
                        switch (pendingFilters.resale.sort) {
                          case "date-desc":
                            try {
                              const dateB = b.createdAt
                                ? toDate(b.createdAt)
                                : new Date(0);
                              const dateA = a.createdAt
                                ? toDate(a.createdAt)
                                : new Date(0);
                              return dateB.getTime() - dateA.getTime();
                            } catch {
                              return 0;
                            }
                          case "date-asc":
                            try {
                              const dateA = a.createdAt
                                ? toDate(a.createdAt)
                                : new Date(0);
                              const dateB = b.createdAt
                                ? toDate(b.createdAt)
                                : new Date(0);
                              return dateA.getTime() - dateB.getTime();
                            } catch {
                              return 0;
                            }
                          case "price-desc":
                            return (
                              (b.expectedPrice || 0) - (a.expectedPrice || 0)
                            );
                          case "price-asc":
                            return (
                              (a.expectedPrice || 0) - (b.expectedPrice || 0)
                            );
                          default:
                            return 0;
                        }
                      });
                    }

                    return filteredPendingResale.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-neutral-500">
                          {pendingSearchTerms.resale
                            ? "No matching resale properties found"
                            : "No pending resale properties"}
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-200">
                          <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                            <tr>
                              <th className="px-3 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider border-r border-blue-200">
                                Date
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider border-r border-blue-200">
                                Property
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider border-r border-blue-200">
                                Location
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider border-r border-blue-200">
                                Price
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider border-r border-blue-200">
                                Type
                              </th>
                              <th className="px-3 py-3 text-center text-xs font-semibold text-blue-700 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-neutral-100">
                            {filteredPendingResale.map((property, index) => (
                              <tr
                                key={`pending-resale-${property.id}-${index}-${
                                  property.createdAt || Date.now()
                                }`}
                                className={`hover:bg-blue-50 transition-colors ${
                                  index % 2 === 0 ? "bg-white" : "bg-blue-25"
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
                                    ₹
                                    {property.expectedPrice?.toLocaleString(
                                      "en-IN"
                                    )}
                                  </div>
                                </td>
                                <td className="px-3 py-3 whitespace-nowrap border-r border-neutral-100">
                                  <div className="text-sm text-neutral-900">
                                    {property.type}
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
                                    <Button
                                      size="sm"
                                      variant="primary"
                                      onClick={() =>
                                        handleApproveProperty(
                                          property.docId || property.id,
                                          "resale"
                                        )
                                      }
                                      disabled={actionLoading}
                                      className="p-1"
                                    >
                                      <Check className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="danger"
                                      onClick={() => {
                                        setRejectingProperty({
                                          id: property.docId || property.id,
                                          category: "resale",
                                        });
                                        setShowRejectModal(true);
                                      }}
                                      disabled={actionLoading}
                                      className="p-1"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ),
          },
          {
            id: "rental",
            label: `Rental (${pendingProperties.rental.length})`,
            content: (
              <div className="space-y-4">
                {/* Premium Search & Filter Bar */}
                <div className="bg-gradient-to-r from-slate-50 via-green-50 to-slate-50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-4 shadow-sm">
                  <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
                    {/* Search Input */}
                    <div className="flex-1 relative group">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <svg
                          className="w-4 h-4 text-slate-400 group-focus-within:text-green-500 transition-colors"
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
                        placeholder="Search properties..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200/60 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all duration-200 hover:bg-white"
                        value={pendingSearchTerms.rental}
                        onChange={(e) =>
                          setPendingSearchTerms((prev) => ({
                            ...prev,
                            rental: e.target.value,
                          }))
                        }
                      />
                    </div>

                    {/* Filter Controls */}
                    <div className="flex gap-2 lg:gap-3">
                      {/* Type Filter */}
                      <div className="relative">
                        <select
                          className="appearance-none bg-white/80 border border-slate-200/60 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all duration-200 hover:bg-white cursor-pointer min-w-[120px]"
                          value={pendingFilters.rental.type}
                          onChange={(e) =>
                            setPendingFilters((prev) => ({
                              ...prev,
                              rental: {
                                ...prev.rental,
                                type: e.target.value,
                              },
                            }))
                          }
                        >
                          <option value="">All Types</option>
                          {(() => {
                            const types = new Set<string>();
                            pendingProperties.rental.forEach((property) => {
                              if (property.type) {
                                types.add(property.type);
                              }
                            });
                            return Array.from(types)
                              .sort()
                              .map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ));
                          })()}
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
                          className="appearance-none bg-white/80 border border-slate-200/60 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all duration-200 hover:bg-white cursor-pointer min-w-[140px]"
                          value={pendingFilters.rental.sort}
                          onChange={(e) =>
                            setPendingFilters((prev) => ({
                              ...prev,
                              rental: {
                                ...prev.rental,
                                sort: e.target.value,
                              },
                            }))
                          }
                        >
                          <option value="">Sort by</option>
                          <option value="date-desc">Latest First</option>
                          <option value="date-asc">Oldest First</option>
                          <option value="rent-desc">Rent: High to Low</option>
                          <option value="rent-asc">Rent: Low to High</option>
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
                      {(pendingSearchTerms.rental ||
                        pendingFilters.rental.type ||
                        pendingFilters.rental.sort) && (
                        <button
                          onClick={() => {
                            setPendingSearchTerms((prev) => ({
                              ...prev,
                              rental: "",
                            }));
                            setPendingFilters((prev) => ({
                              ...prev,
                              rental: { type: "", sort: "" },
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

                <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
                  {(() => {
                    // Filter and sort pending rental properties
                    let filteredPendingRental = pendingProperties.rental.filter(
                      (property) => {
                        const searchTerm =
                          pendingSearchTerms.rental.toLowerCase();
                        const matchesSearch =
                          !searchTerm ||
                          property.society
                            ?.toLowerCase()
                            .includes(searchTerm) ||
                          property.sublocation
                            ?.toLowerCase()
                            .includes(searchTerm) ||
                          property.roadLocation
                            ?.toLowerCase()
                            .includes(searchTerm) ||
                          property.type?.toLowerCase().includes(searchTerm) ||
                          property.station?.toLowerCase().includes(searchTerm);

                        const matchesType =
                          !pendingFilters.rental.type ||
                          property.type === pendingFilters.rental.type;

                        return matchesSearch && matchesType;
                      }
                    );

                    // Sort properties
                    if (pendingFilters.rental.sort) {
                      filteredPendingRental.sort((a, b) => {
                        switch (pendingFilters.rental.sort) {
                          case "date-desc":
                            try {
                              const dateB = b.createdAt
                                ? toDate(b.createdAt)
                                : new Date(0);
                              const dateA = a.createdAt
                                ? toDate(a.createdAt)
                                : new Date(0);
                              return dateB.getTime() - dateA.getTime();
                            } catch {
                              return 0;
                            }
                          case "date-asc":
                            try {
                              const dateA = a.createdAt
                                ? toDate(a.createdAt)
                                : new Date(0);
                              const dateB = b.createdAt
                                ? toDate(b.createdAt)
                                : new Date(0);
                              return dateA.getTime() - dateB.getTime();
                            } catch {
                              return 0;
                            }
                          case "rent-desc":
                            return (b.rent || 0) - (a.rent || 0);
                          case "rent-asc":
                            return (a.rent || 0) - (b.rent || 0);
                          default:
                            return 0;
                        }
                      });
                    }

                    return filteredPendingRental.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-neutral-500">
                          {pendingSearchTerms.rental
                            ? "No matching rental properties found"
                            : "No pending rental properties"}
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-200">
                          <thead className="bg-gradient-to-r from-green-50 to-green-100">
                            <tr>
                              <th className="px-3 py-3 text-left text-xs font-semibold text-green-700 uppercase tracking-wider border-r border-green-200">
                                Date
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-semibold text-green-700 uppercase tracking-wider border-r border-green-200">
                                Property
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-semibold text-green-700 uppercase tracking-wider border-r border-green-200">
                                Location
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-semibold text-green-700 uppercase tracking-wider border-r border-green-200">
                                Rent
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-semibold text-green-700 uppercase tracking-wider border-r border-green-200">
                                Type
                              </th>
                              <th className="px-3 py-3 text-center text-xs font-semibold text-green-700 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-neutral-100">
                            {filteredPendingRental.map((property, index) => (
                              <tr
                                key={`pending-rental-${property.id}-${index}-${
                                  property.createdAt || Date.now()
                                }`}
                                className={`hover:bg-green-50 transition-colors ${
                                  index % 2 === 0 ? "bg-white" : "bg-green-25"
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
                                    ₹{property.rent?.toLocaleString("en-IN")}
                                  </div>
                                  <div className="text-xs text-neutral-500">
                                    /month
                                  </div>
                                </td>
                                <td className="px-3 py-3 whitespace-nowrap border-r border-neutral-100">
                                  <div className="text-sm text-neutral-900">
                                    {property.type}
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
                                          category: "rental",
                                        })
                                      }
                                      className="p-1"
                                    >
                                      <Eye className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="primary"
                                      onClick={() =>
                                        handleApproveProperty(
                                          property.docId || property.id,
                                          "rental"
                                        )
                                      }
                                      disabled={actionLoading}
                                      className="p-1"
                                    >
                                      <Check className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="danger"
                                      onClick={() => {
                                        setRejectingProperty({
                                          id: property.docId || property.id,
                                          category: "rental",
                                        });
                                        setShowRejectModal(true);
                                      }}
                                      disabled={actionLoading}
                                      className="p-1"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ),
          },
          {
            id: "newProperty",
            label: `New Properties (${
              pendingProperties.newProperties?.length || 0
            })`,
            content: (
              <div className="space-y-4">
                <FilterBar
                  searchTerm={pendingSearchTerms.newProperty}
                  setSearchTerm={(term) =>
                    setPendingSearchTerms((prev) => ({
                      ...prev,
                      newProperty: term,
                    }))
                  }
                  bhkFilter={pendingFilters.newProperty.bhk}
                  setBhkFilter={(bhk) =>
                    setPendingFilters((prev) => ({
                      ...prev,
                      newProperty: { ...prev.newProperty, bhk },
                    }))
                  }
                  reraRange={pendingNewPropertyReraRange}
                  setReraRange={setPendingNewPropertyReraRange}
                  availableBhkTypes={(() => {
                    const types = new Set<string>();
                    (pendingProperties.newProperties || []).forEach(
                      (property) => {
                        if (property.flatType) {
                          types.add(property.flatType);
                        }
                      }
                    );
                    return Array.from(types).sort();
                  })()}
                />
                <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
                  {(() => {
                    // Filter and sort pending new properties
                    let filteredPendingNewProperties = (
                      pendingProperties.newProperties || []
                    ).filter((property) => {
                      const searchTerm =
                        pendingSearchTerms.newProperty.toLowerCase();
                      const matchesSearch =
                        !searchTerm ||
                        property.projectName
                          ?.toLowerCase()
                          .includes(searchTerm) ||
                        property.developerName
                          ?.toLowerCase()
                          .includes(searchTerm) ||
                        property.station?.toLowerCase().includes(searchTerm) ||
                        property.subLocation
                          ?.toLowerCase()
                          .includes(searchTerm);

                      const matchesBHK =
                        !pendingFilters.newProperty.bhk ||
                        property.flatType === pendingFilters.newProperty.bhk;

                      const reraCarpet = parseFloat(property.reraCarpet) || 0;
                      const minRera = pendingNewPropertyReraRange.min
                        ? parseFloat(pendingNewPropertyReraRange.min)
                        : 0;
                      const maxRera = pendingNewPropertyReraRange.max
                        ? parseFloat(pendingNewPropertyReraRange.max)
                        : Infinity;
                      const matchesReraRange =
                        reraCarpet >= minRera && reraCarpet <= maxRera;

                      return matchesSearch && matchesBHK && matchesReraRange;
                    });

                    return filteredPendingNewProperties.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-neutral-500">
                          {pendingSearchTerms.newProperty ||
                          pendingFilters.newProperty.bhk ||
                          pendingNewPropertyReraRange.min ||
                          pendingNewPropertyReraRange.max
                            ? "No matching new properties found"
                            : "No pending new properties"}
                        </p>
                      </div>
                    ) : (
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
                                Type
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider border-r border-purple-200">
                                Rera Carpet
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider border-r border-purple-200">
                                Submitted by
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider border-r border-purple-200">
                                Edited by
                              </th>
                              <th className="px-3 py-3 text-center text-xs font-semibold text-purple-700 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-neutral-100">
                            {filteredPendingNewProperties.map(
                              (property, index) => (
                                <tr
                                  key={`pending-new-${property.id}-${index}-${
                                    property.createdAt || Date.now()
                                  }`}
                                  className={`group relative hover:bg-purple-50 transition-colors cursor-pointer border-r-4 border-transparent hover:border-purple-400 ${
                                    index % 2 === 0
                                      ? "bg-white"
                                      : "bg-purple-25"
                                  }`}
                                >
                                  <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-600 border-r border-neutral-100">
                                    {(() => {
                                      try {
                                        const dateValue =
                                          property.createdAt ||
                                          property.dateUpdateCostSheet;
                                        if (!dateValue) return "-";
                                        const date = toDate(dateValue);
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
                                    <div className="max-w-xs">
                                      <div className="text-sm text-neutral-900 truncate">
                                        {property.subLocation}
                                      </div>
                                      {
                                        <div className="text-xs text-neutral-500">
                                          In {property.station}
                                        </div>
                                      }
                                    </div>
                                  </td>
                                  <td className="px-3 py-3 whitespace-nowrap border-r border-neutral-100">
                                    <div className="text-sm text-neutral-900">
                                      {property.flatType}
                                    </div>
                                  </td>
                                  <td className="px-3 py-3 whitespace-nowrap border-r border-neutral-100">
                                    <div className="text-sm text-neutral-900">
                                      {property.reraCarpet} Sq ft
                                    </div>
                                  </td>
                                  <td className="px-3 py-3 border-r border-neutral-100">
                                    <div className="max-w-xs">
                                      {(() => {
                                        const submitter = getUserInfo(
                                          property.submittedBy
                                        );
                                        const getValidDate = (value: any) => {
                                          if (!value) return null;

                                          // If it's a Firestore Timestamp
                                          if (value?.seconds) {
                                            return new Date(
                                              value.seconds * 1000
                                            );
                                          }

                                          // If it's already a Date object
                                          if (value instanceof Date) {
                                            return value;
                                          }

                                          // If it's a string (ISO)
                                          const d = new Date(value);
                                          return isNaN(d.getTime()) ? null : d;
                                        };

                                        const createdAtDate = getValidDate(
                                          property.createdAt
                                        );

                                        if (submitter) {
                                          return (
                                            <div className="flex items-start gap-3 py-2 border-b border-neutral-100">
                                              <div className="flex flex-col items-start space-y-1">
                                                {/* Role */}
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-blue-100 text-blue-700">
                                                  {submitter.role}
                                                </span>

                                                {/* Time */}
                                                {createdAtDate && (
                                                  <span className="text-[10px] text-neutral-400">
                                                    {format(
                                                      createdAtDate,
                                                      "dd MMM yy - hh:mm a"
                                                    )}
                                                  </span>
                                                )}

                                                {/* Email */}
                                                <div className="text-xs text-neutral-600 truncate">
                                                  {submitter.email}
                                                </div>

                                                {/* Name */}
                                                <div className="text-xs text-neutral-400 truncate">
                                                  {submitter.fullName}
                                                </div>
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
                                  <td className="px-3 py-3 border-r border-neutral-100">
                                    <div className="max-w-xs">
                                      {(() => {
                                        if (property.editedBy) {
                                          const editor = getUserInfo(
                                            property.editedBy
                                          );
                                          if (editor) {
                                            return (
                                              <div className="flex items-start gap-3 py-2 border-b border-neutral-100">
                                                <div className="flex flex-col items-start space-y-1">
                                                  {/* Role */}
                                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-green-100 text-green-700">
                                                    {editor.role}
                                                  </span>

                                                  {/* Time */}
                                                  {property.editedAt && (
                                                    <span className="text-[10px] text-neutral-400">
                                                      {format(
                                                        new Date(
                                                          property.editedAt
                                                        ),
                                                        "dd MMM yy - hh:mm a"
                                                      )}
                                                    </span>
                                                  )}

                                                  {/* Email */}
                                                  <div className="text-xs text-neutral-600">
                                                    {editor.email}
                                                  </div>

                                                  {/* Name */}
                                                  <div className="text-xs text-neutral-400 truncate">
                                                    {editor.fullName}
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          }
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
                                    <div className="flex justify-center space-x-1">
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
                                      <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() =>
                                          handleApproveNewProperty(property.id)
                                        }
                                        disabled={actionLoading}
                                        className="p-1"
                                      >
                                        <Check className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={() => {
                                          setRejectingProperty({
                                            id: property.id,
                                            category: "newProperty",
                                          });
                                          setShowRejectModal(true);
                                        }}
                                        disabled={actionLoading}
                                        className="p-1"
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
