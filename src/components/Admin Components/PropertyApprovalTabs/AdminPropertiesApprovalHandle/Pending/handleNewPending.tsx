import { toDate, format } from "date-fns";
import { User } from "firebase/auth";
import { Eye, Check, X } from "lucide-react";
import FilterBar from "../../../../FilterBar";
import Button from "../../../../ui/Button";
import { Property } from "../../../helperFunctions";

export function handleNewPending(pendingSearchTerms: { resale: string; rental: string; newProperty: string; }, setPendingSearchTerms: any, pendingFilters: { resale: { type: string; sort: string; }; rental: { type: string; sort: string; }; newProperty: { bhk: string; sort: string; }; }, setPendingFilters: any, pendingNewPropertyReraRange: { min: string; max: string; }, setPendingNewPropertyReraRange: any, pendingProperties: { resale: Property[]; rental: Property[]; newProperties: any[]; }, getUserInfo: (userId: string) => User, setShowPropertyDetails: any, handleApproveNewProperty: (id: string) => Promise<void>, actionLoading: boolean, setRejectingProperty: any, setShowRejectModal: any) {
  return <div className="space-y-4">
    <FilterBar
      searchTerm={pendingSearchTerms.newProperty}
      setSearchTerm={(term) => setPendingSearchTerms((prev) => ({
        ...prev,
        newProperty: term,
      }))}
      bhkFilter={pendingFilters.newProperty.bhk}
      setBhkFilter={(bhk) => setPendingFilters((prev) => ({
        ...prev,
        newProperty: { ...prev.newProperty, bhk },
      }))}
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
      })()} />
    <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
      {(() => {
        // Filter and sort pending new properties
        let filteredPendingNewProperties = (
          pendingProperties.newProperties || []
        ).filter((property) => {
          const searchTerm = pendingSearchTerms.newProperty.toLowerCase();
          const matchesSearch = !searchTerm ||
            property.projectName
              ?.toLowerCase()
              .includes(searchTerm) ||
            property.developerName
              ?.toLowerCase()
              .includes(searchTerm) ||
            property.location?.toLowerCase().includes(searchTerm) ||
            property.subLocation
              ?.toLowerCase()
              .includes(searchTerm);

          const matchesBHK = !pendingFilters.newProperty.bhk ||
            property.flatType === pendingFilters.newProperty.bhk;

          const reraCarpet = parseFloat(property.reraCarpet) || 0;
          const minRera = pendingNewPropertyReraRange.min
            ? parseFloat(pendingNewPropertyReraRange.min)
            : 0;
          const maxRera = pendingNewPropertyReraRange.max
            ? parseFloat(pendingNewPropertyReraRange.max)
            : Infinity;
          const matchesReraRange = reraCarpet >= minRera && reraCarpet <= maxRera;

          return matchesSearch && matchesBHK && matchesReraRange;
        }).sort((a, b) => {
          const getValidDate = (value: any) => {
            if (!value) return new Date(0);
            if (value?.seconds) return new Date(value.seconds * 1000);
            if (value instanceof Date) return value;
            const d = new Date(value);
            return isNaN(d.getTime()) ? new Date(0) : d;
          };
          const dateA = getValidDate(a.createdAt || a.dateUpdateCostSheet);
          const dateB = getValidDate(b.createdAt || b.dateUpdateCostSheet);
          return dateB.getTime() - dateA.getTime();
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
                    Sub Location
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider border-r border-purple-200">
                    User Details
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
                      key={`pending-new-${property.id}-${index}-${property.createdAt || Date.now()}`}
                      className={`group relative hover:bg-purple-50 transition-colors cursor-pointer border-r-4 border-transparent hover:border-purple-400 ${index % 2 === 0
                          ? "bg-white"
                          : "bg-purple-25"}`}
                    >
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-600 border-r border-neutral-100">
                        {(() => {
                          const getValidDate = (value: any) => {
                            if (!value) return null;
                            if (value?.seconds) {
                              return new Date(value.seconds * 1000);
                            }
                            if (value instanceof Date) {
                              return value;
                            }
                            const d = new Date(value);
                            return isNaN(d.getTime()) ? null : d;
                          };
                          
                          const dateValue = property.createdAt || property.dateUpdateCostSheet;
                          const validDate = getValidDate(dateValue);
                          return validDate ? format(validDate, "dd/MM/yy") : "-";
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
                          {property.location}
                        </div>
                      </td>
                      <td className="px-3 py-3 border-r border-neutral-100">
                        <div className="text-sm text-neutral-900">
                          {property.subLocation}
                        </div>
                      </td>
                      <td className="px-3 py-3 border-r border-neutral-100">
                        <div className="max-w-xs">
                          {(() => {
                            // Show edited by if exists, otherwise show submitted by
                            const userId = property.editedBy || property.submittedBy;
                            const user = getUserInfo(userId);
                            const getValidDate = (value: any) => {
                              if (!value) return null;
                              if (value?.seconds) return new Date(value.seconds * 1000);
                              if (value instanceof Date) return value;
                              const d = new Date(value);
                              return isNaN(d.getTime()) ? null : d;
                            };
                            
                            const dateValue = property.editedBy ? property.editedAt : property.createdAt;
                            const validDate = getValidDate(dateValue);
                            
                            if (user) {
                              return (
                                <div className="flex flex-col space-y-1">
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium ${
                                    property.editedBy ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {user.role} {property.editedBy ? '(Edited)' : '(Created)'}
                                  </span>
                                  {validDate && (
                                    <span className="text-[10px] text-neutral-400">
                                      {format(validDate, "dd MMM yy - hh:mm a")}
                                    </span>
                                  )}
                                  <div className="text-xs text-neutral-600 truncate">
                                    {user.email}
                                  </div>
                                  <div className="text-xs text-neutral-400 truncate">
                                    {user.fullName}
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
                        <div className="flex justify-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowPropertyDetails({
                              ...property,
                              category: "newProperty",
                            })}
                            className="p-1"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleApproveNewProperty(property.id)}
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
                            } }
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
  </div>;
}