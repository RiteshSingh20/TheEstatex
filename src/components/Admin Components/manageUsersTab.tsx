import { format } from "date-fns";
import { Eye, X } from "lucide-react";
import { UserRole, User } from "../../types";
import { getUserResaleProperties, getUserRentalProperties } from "../../utils/firestoreListings";
import { Permission } from "../../utils/rbac";
import Button from "../ui/Button";
import Card from "../ui/Card";
import RoleBadge from "../ui/RoleBadge";

export function manageUsersTab(permissions: any, filteredUsers: User[], users: User[], searchTerm: string, setSearchTerm: any, roleFilter: string, setRoleFilter: any, setModalLoading: any, setShowPropertiesModal: any, setModalTitle: any, setModalProperties: any, viewUserDetails: (user: User) => Promise<void>, showPropertiesModal: boolean, modalTitle: string, modalLoading: boolean, modalProperties: any[]) {
  return <Card>
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">Registered Users</h3>
      <div className="flex items-center gap-4">
        {!permissions.canModifyUsers() && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            View Only Access
          </span>
        )}
        <div className="text-sm text-neutral-500">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>
    </div>

    {/* ADD FILTER BAR */}
    <div className="flex flex-col lg:flex-row gap-3 p-3 bg-neutral-50 rounded-lg border">
      <div className="flex-1">
        <input
          id="search-users"
          type="text"
          placeholder="Search by name, email, phone, RERA, city or state..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-9 rounded-md border border-neutral-300 focus:border-primary focus:ring-primary px-4 py-2 focus:outline-none focus:ring-1" />
      </div>
      <div className="w-full lg:w-40">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")}
          className="w-full h-9 border border-neutral-300 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="executive">Executive</option>
          <option value="user">User</option>
        </select>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setSearchTerm("");
          setRoleFilter("all");
        } }
        className="h-9 px-4"
      >
        Clear
      </Button>
    </div>

    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-neutral-200">
        <thead className="bg-neutral-100">
          <tr>
            {[
              "Date",
              "Name",
              "Email / Phone",
              "Location",
              "Resale Listings",
              "Rental Listings",
              "Subscriptions",
              "Role",
              "Actions",
            ].map((header) => (
              <th
                key={header}
                className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wide"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 bg-white">
          {filteredUsers
            .sort((a, b) => {
              const aDate = a.createdAt
                ? new Date(a.createdAt)
                : new Date(0);
              const bDate = b.createdAt
                ? new Date(b.createdAt)
                : new Date(0);
              return bDate.getTime() - aDate.getTime();
            })
            .map((user) => (
              <tr
                key={user.id}
                className="hover:bg-neutral-50 transition-colors even:bg-neutral-50/50"
              >
                {/* Date */}
                <td className="px-4 py-4 text-sm text-neutral-800 whitespace-nowrap">
                  {user.createdAt
                    ? format(
                      user.createdAt instanceof Date
                        ? user.createdAt
                        : new Date(user.createdAt),
                      "dd/MM/yyyy"
                    )
                    : "-"}
                </td>

                {/* Name & RERA */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-neutral-500">
                      RERA: {user.reraNumber || "-"}
                    </p>
                  </div>
                </td>

                {/* Email / Phone */}
                <td className="px-4 py-4 text-sm text-neutral-800 whitespace-nowrap">
                  <div>
                    <div>{user.email || "-"}</div>
                    <div>{user.phone || "-"}</div>
                  </div>
                </td>

                {/* Location */}
                <td className="px-4 py-4 text-sm text-neutral-800 whitespace-nowrap">
                  {user.city || "-"}, {user.state || "-"}
                </td>

                {/* Resale Listings */}
                <td className="px-4 py-4 text-sm text-neutral-800 whitespace-nowrap text-center">
                  <button
                    onClick={async () => {
                      if (user.resalePropertiesCount > 0) {
                        setModalLoading(true);
                        setShowPropertiesModal(true);
                        setModalTitle(
                          `${user.fullName}'s Resale Properties`
                        );
                        try {
                          const properties = await getUserResaleProperties(user.id);
                          setModalProperties(properties);
                        } catch (error) {
                          setModalProperties([]);
                        } finally {
                          setModalLoading(false);
                        }
                      }
                    } }
                    className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors cursor-pointer"
                    disabled={user.resalePropertiesCount === 0}
                  >
                    {user.resalePropertiesCount || 0}
                  </button>
                </td>

                {/* Rental Listings */}
                <td className="px-4 py-4 text-sm text-neutral-800 whitespace-nowrap text-center">
                  <button
                    onClick={async () => {
                      if (user.rentalPropertiesCount > 0) {
                        setModalLoading(true);
                        setShowPropertiesModal(true);
                        setModalTitle(
                          `${user.fullName}'s Rental Properties`
                        );
                        try {
                          const properties = await getUserRentalProperties(user.id);
                          setModalProperties(properties);
                        } catch (error) {
                          setModalProperties([]);
                        } finally {
                          setModalLoading(false);
                        }
                      }
                    } }
                    className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors cursor-pointer"
                    disabled={user.rentalPropertiesCount === 0}
                  >
                    {user.rentalPropertiesCount || 0}
                  </button>
                </td>

                {/* Subscriptions */}
                <td className="px-4 py-4 text-sm whitespace-nowrap">
                  {user.subscriptionCount ? (
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                      {user.subscriptionCount} subscription
                      {user.subscriptionCount > 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-neutral-200 text-neutral-600">
                      No Subscriptions
                    </span>
                  )}
                </td>

                {/* User Roles */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <RoleBadge role={user.role} size="sm" showIcon />
                </td>

                {/* Actions */}
                <td className="px-4 py-4 whitespace-nowrap text-sm flex items-center gap-2">
                  <Button
                    variant="text"
                    size="sm"
                    icon={<Eye className="h-4 w-4" />}
                    onClick={() => viewUserDetails(user)}
                  >
                    {permissions.canModifyUsers() ? "Update" : "View"}
                  </Button>
                  {/* <Button
                  variant="text"
                  size="sm"
                  icon={<Shield className="h-4 w-4" />}
                  onClick={() => makeUserAdmin(user)}
                >
                  {user.role === 'admin' ? "Remove Admin" : "Make Admin"}
                </Button> */}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>

    {/* Properties Modal */}
    {showPropertiesModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">{modalTitle}</h3>
            <button
              onClick={() => {
                setShowPropertiesModal(false);
                setModalProperties([]);
                setModalTitle("");
              } }
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {modalLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="text-neutral-500">
                  Loading properties...
                </div>
              </div>
            ) : modalProperties.length === 0 ? (
              <div className="text-center text-neutral-500 py-8">
                No properties found
              </div>
            ) : (
              <div className="overflow-x-auto">
                {(() => {
                  const showAreaColumn = modalProperties.length > 0 &&
                    modalProperties.some(
                      (p) => p.expectedPrice !== undefined
                    );

                  return (
                    <table className="min-w-full divide-y divide-neutral-200 text-sm">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                            Society
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                            Type
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                            Station
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                            Price
                          </th>
                          {showAreaColumn && (
                            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                              Area
                            </th>
                          )}
                          <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                            Status
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {modalProperties.map((property, index) => {
                          const isResale = property.expectedPrice !== undefined;
                          return (
                            <tr
                              key={property.docId || index}
                              className="hover:bg-neutral-50"
                            >
                              <td className="px-3 py-2 text-neutral-900">
                                <div className="font-medium">
                                  {property.society || "-"}
                                </div>
                                <div className="text-xs text-neutral-500">
                                  {property.sublocation || ""}
                                </div>
                              </td>
                              <td className="px-3 py-2 text-neutral-700">
                                {property.type || "-"}
                              </td>
                              <td className="px-3 py-2 text-neutral-700">
                                {property.station || "-"}
                              </td>
                              <td className="px-3 py-2 text-neutral-700">
                                {isResale ? (
                                  <div>
                                    <div className="font-medium">
                                      ₹
                                      {(
                                        property.expectedPrice / 100000
                                      ).toFixed(1)}
                                      L
                                    </div>
                                    {property.maintenance && (
                                      <div className="text-xs text-neutral-500">
                                        ₹{property.maintenance}/m
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div>
                                    <div className="font-medium">
                                      ₹{property.rent || "-"}
                                    </div>
                                    {property.deposit && (
                                      <div className="text-xs text-neutral-500">
                                        Dep: ₹{property.deposit}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </td>
                              {showAreaColumn && (
                                <td className="px-3 py-2 text-neutral-700">
                                  {isResale ? (
                                    <div>
                                      <div>
                                        {property.carpetArea || "-"} sq
                                        ft
                                      </div>
                                      {property.builtUpArea && (
                                        <div className="text-xs text-neutral-500">
                                          Built: {property.builtUpArea}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div>-</div>
                                  )}
                                </td>
                              )}
                              <td className="px-3 py-2">
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${property.isApproved
                                      ? "bg-green-100 text-green-700"
                                      : property.isRejected
                                        ? "bg-red-100 text-red-700"
                                        : "bg-yellow-100 text-yellow-700"}`}
                                >
                                  {property.isApproved
                                    ? "Approved"
                                    : property.isRejected
                                      ? "Rejected"
                                      : "Pending"}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-neutral-700">
                                {property.createdAt
                                  ? format(
                                    property.createdAt.toDate
                                      ? property.createdAt.toDate()
                                      : new Date(property.createdAt),
                                    "dd/MM/yyyy"
                                  )
                                  : "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </Card>;
}