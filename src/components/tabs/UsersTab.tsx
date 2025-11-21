import { useState, useMemo } from "react";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import RoleBadge from "../../components/ui/RoleBadge";
import { Eye } from "lucide-react";
import { User } from "../../types";

interface UsersTabProps {
  users: User[];
  permissions: any;
  setShowUserModal: (show: boolean) => void;
  setUserDetails: (user: User) => void;
  fetchUserSubscriptions: (userId: string) => void;
}

export const UsersTab = (props: UsersTabProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filteredUsers = useMemo(() => {
    return props.users.filter((user) => {
      const roleMatch = roleFilter === "all" || user.role === roleFilter;
      const searchMatch =
        !searchTerm ||
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm) ||
        user.reraNumber?.includes(searchTerm) ||
        user.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.state?.toLowerCase().includes(searchTerm.toLowerCase());

      return roleMatch && searchMatch;
    });
  }, [props.users, searchTerm, roleFilter]);

  const viewUserDetails = async (user: User) => {
    props.setUserDetails(user);
    await props.fetchUserSubscriptions(user.id as string);
    props.setShowUserModal(true);
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Registered Users</h3>
        <div className="flex items-center gap-4">
          {!props.permissions.canModifyUsers() && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              View Only Access
            </span>
          )}
          <div className="text-sm text-neutral-500">
            Showing {filteredUsers.length} of {props.users.length} users
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4 p-4 bg-neutral-50 rounded-lg">
        <div className="flex-1">
          <Input
            id="search-users"
            label="Search by name, email, phone, RERA, city or state"
            placeholder="Type to search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Filter by Role
          </label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="executive">Executive</option>
            <option value="user">User</option>
          </select>
        </div>
        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setRoleFilter("all");
            }}
            className="h-[42px]"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-100">
            <tr>
              {[
                "Name",
                "Email",
                "Phone",
                "Location",
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
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-neutral-50 transition-colors even:bg-neutral-50/50"
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-neutral-500">
                      RERA: {user.reraNumber || "—"}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-neutral-800 whitespace-nowrap">
                  {user.email || "—"}
                </td>
                <td className="px-4 py-4 text-sm text-neutral-800 whitespace-nowrap">
                  {user.phone || "—"}
                </td>
                <td className="px-4 py-4 text-sm text-neutral-800 whitespace-nowrap">
                  {user.city || "—"}, {user.state || "—"}
                </td>
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
                <td className="px-4 py-4 whitespace-nowrap">
                  <RoleBadge role={user.role} size="sm" showIcon />
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm flex items-center gap-2">
                  <Button
                    variant="text"
                    size="sm"
                    icon={<Eye className="h-4 w-4" />}
                    onClick={() => viewUserDetails(user)}
                  >
                    {props.permissions.canModifyUsers() ? "Update" : "View"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
