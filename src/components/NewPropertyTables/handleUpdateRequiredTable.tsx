import { format } from "date-fns";
import { User } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { Eye, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { deleteCostSheet } from "../../utils/firestoreListings";
import { CostSheet } from "../CompareModal";
import FilterBar from "../FilterBar";
import Button from "../ui/Button";

export function handleUpdateRequiredTable(searchTerm: string, setSearchTerm: React.Dispatch<React.SetStateAction<string>>, bhkFilter: string, setBhkFilter: React.Dispatch<React.SetStateAction<string>>, reraRange: { min: string; max: string; }, setReraRange: React.Dispatch<React.SetStateAction<{ min: string; max: string; }>>, availableBhkTypes: any[], approvedSheets: any[], setSortBy: React.Dispatch<React.SetStateAction<{ approved: "date" | "project"; pending: "date" | "project"; rejected: "date" | "project"; }>>, setSortOrder: React.Dispatch<React.SetStateAction<{ approved: { date: "desc" | "asc"; project: "asc" | "desc"; }; pending: { date: "desc" | "asc"; project: "asc" | "desc"; }; rejected: { date: "desc" | "asc"; project: "asc" | "desc"; }; }>>, sortBy: { approved: "date" | "project"; pending: "date" | "project"; rejected: "date" | "project"; }, sortOrder: { approved: { date: "desc" | "asc"; project: "asc" | "desc"; }; pending: { date: "desc" | "asc"; project: "asc" | "desc"; }; rejected: { date: "desc" | "asc"; project: "asc" | "desc"; }; }, setSelectedSheet: React.Dispatch<React.SetStateAction<CostSheet | null>>, setEditingProperty: React.Dispatch<React.SetStateAction<CostSheet | null>>, setShowForm: React.Dispatch<React.SetStateAction<boolean>>, user: User | null, setCostSheets: React.Dispatch<React.SetStateAction<unknown[]>>): React.ReactNode {

    return <div>
        <FilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            bhkFilter={bhkFilter}
            setBhkFilter={setBhkFilter}
            reraRange={reraRange}
            setReraRange={setReraRange}
            availableBhkTypes={availableBhkTypes} />
        {approvedSheets.length === 0 ? (
            <p className="text-neutral-500 p-4">
                {searchTerm ||
                    bhkFilter ||
                    reraRange.min ||
                    reraRange.max
                    ? "No matching properties found for the applied filters."
                    : "No properties require updates."}
            </p>
        ) : (
            <div className="overflow-x-auto rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-neutral-200 bg-white text-sm">
                    <thead className="bg-neutral-50 sticky top-0 z-10">
                        <tr>
                            <th className="px-5 py-3 text-left font-semibold text-neutral-700 tracking-wide whitespace-nowrap">
                                <button
                                    onClick={() => {
                                        setSortBy((prev) => ({
                                            ...prev,
                                            approved: "date",
                                        }));
                                        setSortOrder((prev) => ({
                                            ...prev,
                                            approved: {
                                                ...prev.approved,
                                                date: prev.approved.date === "desc"
                                                    ? "asc"
                                                    : "desc",
                                            },
                                        }));
                                    } }
                                    className="flex items-center gap-2 hover:text-neutral-900"
                                >
                                    Date
                                    <span className="px-0.5 py-0 text-[10px] bg-blue-100 text-blue-800 rounded">
                                        {sortBy.approved === "date"
                                            ? sortOrder.approved.date === "desc"
                                                ? "Newest first"
                                                : "Oldest first"
                                            : ""}
                                    </span>
                                </button>
                            </th>
                            <th className="px-5 py-3 text-left font-semibold text-neutral-700 tracking-wide whitespace-nowrap">
                                <button
                                    onClick={() => {
                                        setSortBy((prev) => ({
                                            ...prev,
                                            approved: "project",
                                        }));
                                        setSortOrder((prev) => ({
                                            ...prev,
                                            approved: {
                                                ...prev.approved,
                                                project: prev.approved.project === "asc"
                                                    ? "desc"
                                                    : "asc",
                                            },
                                        }));
                                    } }
                                    className="flex items-center gap-2 hover:text-neutral-900"
                                >
                                    Project
                                    <span className="px-0.5 py-0 text-[10px] bg-green-100 text-green-800 rounded">
                                        {sortBy.approved === "project"
                                            ? sortOrder.approved.project === "asc"
                                                ? "A to Z"
                                                : "Z to A"
                                            : ""}
                                    </span>
                                </button>
                            </th>
                            <th className="px-5 py-3 text-left font-semibold text-neutral-700 tracking-wide whitespace-nowrap">
                                Station
                            </th>
                            <th className="px-5 py-3 text-left font-semibold text-neutral-700 tracking-wide whitespace-nowrap">
                                Sub Location
                            </th>
                            <th className="px-5 py-3 text-left font-semibold text-neutral-700 tracking-wide whitespace-nowrap">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                        {approvedSheets.map((item, idx) => (
                            <tr
                                key={`update-${item.id}-${idx}`}
                                onClick={() => setSelectedSheet(item)}
                                className="hover:bg-neutral-50 transition-all duration-150 cursor-pointer bg-orange-50 border-l-4 border-orange-400"
                            >
                                <td className="px-5 py-3 whitespace-nowrap text-neutral-700">
                                    {item.createdAt
                                        ? (() => {
                                            const date = item.createdAt instanceof Timestamp
                                              ? item.createdAt.toDate()
                                              : new Date(item.createdAt);
                                            return !isNaN(date.getTime())
                                              ? format(date, "dd/MM/yyyy")
                                              : "-";
                                          })()
                                        : "-"}
                                </td>
                                <td className="px-5 py-3 font-medium text-neutral-900">
                                    <div>
                                        <div className="font-semibold">
                                            {item.projectName || "-"}
                                        </div>
                                        <div className="text-sm text-neutral-600">
                                            by{" "}
                                            {item.developerName ||
                                                "Unknown Developer"}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-3 whitespace-nowrap text-neutral-700">
                                    {item.station || "-"}
                                </td>
                                <td className="px-5 py-3 whitespace-nowrap text-neutral-700">
                                    {item.subLocation || "-"}
                                </td>
                                <td className="px-5 py-3 whitespace-nowrap">
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedSheet(item);
                                            } }
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingProperty(item);
                                            } }
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>

                                        {(user?.role === "admin" ||
                                            item.submittedBy === user?.id) && (
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (confirm(
                                                            `Delete "${item.projectName}"? This cannot be undone.`
                                                        )) {
                                                            try {
                                                                await deleteCostSheet(item.id!);
                                                                setCostSheets((prev) => prev.filter(
                                                                    (sheet) => (sheet as CostSheet).id !==
                                                                        item.id
                                                                )
                                                                );
                                                                toast.success(
                                                                    "Property deleted successfully!"
                                                                );
                                                            } catch (error) {
                                                                toast.error(
                                                                    "Failed to delete property"
                                                                );
                                                            }
                                                        }
                                                    } }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>;
}