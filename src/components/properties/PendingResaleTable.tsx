import { useState } from "react";
import { format } from "date-fns";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { Eye, Check, X } from "lucide-react";
import { Property } from "../../types/admin";
import { toDate } from "../../utils/helpers";

interface PendingResaleTableProps {
  properties: Property[];
  setShowPropertyDetails: (property: any) => void;
  setRejectingProperty: (property: any) => void;
  setShowRejectModal: (show: boolean) => void;
  actionLoading: boolean;
}

export const PendingResaleTable = (props: PendingResaleTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortFilter, setSortFilter] = useState("");

  const filteredProperties = props.properties.filter((property) => {
    const matchesSearch =
      !searchTerm ||
      property.society?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.sublocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.roadLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.station?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = !typeFilter || property.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortFilter) {
      case "date-desc":
        return toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime();
      case "date-asc":
        return toDate(a.createdAt).getTime() - toDate(b.createdAt).getTime();
      case "price-desc":
        return (b.expectedPrice || 0) - (a.expectedPrice || 0);
      case "price-asc":
        return (a.expectedPrice || 0) - (b.expectedPrice || 0);
      default:
        return 0;
    }
  });

  const availableTypes = Array.from(
    new Set(props.properties.map((p) => p.type).filter(Boolean))
  ).sort();

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 lg:gap-3">
            <div className="relative">
              <select
                className="appearance-none bg-white/80 border border-slate-200/60 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 hover:bg-white cursor-pointer min-w-[120px]"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                {availableTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <select
                className="appearance-none bg-white/80 border border-slate-200/60 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 hover:bg-white cursor-pointer min-w-[140px]"
                value={sortFilter}
                onChange={(e) => setSortFilter(e.target.value)}
              >
                <option value="">Sort by</option>
                <option value="date-desc">Latest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="price-asc">Price: Low to High</option>
              </select>
            </div>

            {(searchTerm || typeFilter || sortFilter) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setTypeFilter("");
                  setSortFilter("");
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

      {/* Properties Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        {sortedProperties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500">
              {searchTerm || typeFilter
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
                {sortedProperties.map((property, index) => (
                  <tr
                    key={`pending-resale-${property.id}-${index}-${
                      property.createdAt || Date.now()
                    }`}
                    className={`hover:bg-blue-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-blue-25"
                    }`}
                  >
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-600 border-r border-neutral-100">
                      {format(toDate(property.createdAt), "dd/MM/yy")}
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
                        ₹{property.expectedPrice?.toLocaleString("en-IN")}
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
                            props.setShowPropertyDetails({
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
                          onClick={() => {
                            // Handle approve
                          }}
                          disabled={props.actionLoading}
                          className="p-1"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            props.setRejectingProperty({
                              id: property.docId || property.id,
                              category: "resale",
                            });
                            props.setShowRejectModal(true);
                          }}
                          disabled={props.actionLoading}
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
        )}
      </div>
    </div>
  );
};
