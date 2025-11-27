import { toDate, format } from "date-fns";
import { User } from "firebase/auth";
import { Eye, Check, X } from "lucide-react";
import FilterBar from "../../../../FilterBar";
import Button from "../../../../ui/Button";
import { Property } from "../../../helperFunctions";

export function handleNewPending(
  pendingSearchTerms: { resale: string; rental: string; newProperty: string },
  setPendingSearchTerms: any,
  pendingFilters: {
    resale: { type: string; sort: string };
    rental: { type: string; sort: string };
    newProperty: { bhk: string; sort: string };
  },
  setPendingFilters: any,
  pendingNewPropertyReraRange: { min: string; max: string },
  setPendingNewPropertyReraRange: any,
  pendingProperties: {
    resale: Property[];
    rental: Property[];
    newProperties: any[];
  },
  getUserInfo: (userId: string) => User,
  setShowPropertyDetails: any,
  handleApproveNewProperty: (id: string) => Promise<void>,
  actionLoading: boolean,
  setRejectingProperty: any,
  setShowRejectModal: any
) {
  return (
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
          (pendingProperties.newProperties || []).forEach((property) => {
            if (property.flatType) {
              types.add(property.flatType);
            }
          });
          return Array.from(types).sort();
        })()}
      />
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        {(() => {
          // Filter and sort pending new properties
          let filteredPendingNewProperties = (
            pendingProperties.newProperties || []
          ).filter((property) => {
            const searchTerm = pendingSearchTerms.newProperty.toLowerCase();
            const matchesSearch =
              !searchTerm ||
              property.projectName?.toLowerCase().includes(searchTerm) ||
              property.developerName?.toLowerCase().includes(searchTerm) ||
              property.station?.toLowerCase().includes(searchTerm) ||
              property.subLocation?.toLowerCase().includes(searchTerm);

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
                  {filteredPendingNewProperties.map((property, index) => (
                    <tr
                      key={`pending-new-${property.id}-${index}-${
                        property.createdAt || Date.now()
                      }`}
                      className={`group relative hover:bg-purple-50 transition-colors cursor-pointer border-r-4 border-transparent hover:border-purple-400 ${
                        index % 2 === 0 ? "bg-white" : "bg-purple-25"
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
                            const submitter = getUserInfo(property.submittedBy);
                            const getValidDate = (value: any) => {
                              if (!value) return null;

                              // If it's a Firestore Timestamp
                              if (value?.seconds) {
                                return new Date(value.seconds * 1000);
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
                              <div className="text-xs text-neutral-500">-</div>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="px-3 py-3 border-r border-neutral-100">
                        <div className="max-w-xs">
                          {(() => {
                            if (property.editedBy) {
                              const editor = getUserInfo(property.editedBy);
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
                                            new Date(property.editedAt),
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
                              <div className="text-xs text-neutral-500">-</div>
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
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
