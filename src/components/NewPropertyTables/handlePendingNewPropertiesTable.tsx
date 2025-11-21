import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { Eye, Edit } from "lucide-react";
import { CostSheet } from "../CompareModal";
import FilterBar from "../FilterBar";
import Button from "../ui/Button";

export function handlePendingNewPropertiesTable(searchTerm: string, setSearchTerm: React.Dispatch<React.SetStateAction<string>>, bhkFilter: string, setBhkFilter: React.Dispatch<React.SetStateAction<string>>, reraRange: { min: string; max: string; }, setReraRange: React.Dispatch<React.SetStateAction<{ min: string; max: string; }>>, availableBhkTypes: any[], pendingSheets: any[], setSortBy: React.Dispatch<React.SetStateAction<{ approved: "date" | "project"; pending: "date" | "project"; rejected: "date" | "project"; }>>, setSortOrder: React.Dispatch<React.SetStateAction<{ approved: { date: "desc" | "asc"; project: "asc" | "desc"; }; pending: { date: "desc" | "asc"; project: "asc" | "desc"; }; rejected: { date: "desc" | "asc"; project: "asc" | "desc"; }; }>>, sortBy: { approved: "date" | "project"; pending: "date" | "project"; rejected: "date" | "project"; }, sortOrder: { approved: { date: "desc" | "asc"; project: "asc" | "desc"; }; pending: { date: "desc" | "asc"; project: "asc" | "desc"; }; rejected: { date: "desc" | "asc"; project: "asc" | "desc"; }; }, setSelectedSheet: React.Dispatch<React.SetStateAction<CostSheet | null>>, setEditingProperty: React.Dispatch<React.SetStateAction<CostSheet | null>>, setShowForm: React.Dispatch<React.SetStateAction<boolean>>) {
    return <div>
        <FilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            bhkFilter={bhkFilter}
            setBhkFilter={setBhkFilter}
            reraRange={reraRange}
            setReraRange={setReraRange}
            availableBhkTypes={availableBhkTypes} />
        {pendingSheets.length === 0 ? (
            <p className="text-neutral-500 p-4">
                {searchTerm ||
                    bhkFilter ||
                    reraRange.min ||
                    reraRange.max
                    ? "No matching properties found for the applied filters."
                    : "No pending properties."}
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
                                            pending: "date",
                                        }));
                                        setSortOrder((prev) => ({
                                            ...prev,
                                            pending: {
                                                ...prev.pending,
                                                date: prev.pending.date === "desc"
                                                    ? "asc"
                                                    : "desc",
                                            },
                                        }));
                                    } }
                                    className="flex items-center gap-2 hover:text-neutral-900"
                                >
                                    Date
                                    <span className="px-0.5 py-0 text-[10px] bg-blue-100 text-blue-800 rounded">
                                        {sortBy.pending === "date"
                                            ? sortOrder.pending.date === "desc"
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
                                            pending: "project",
                                        }));
                                        setSortOrder((prev) => ({
                                            ...prev,
                                            pending: {
                                                ...prev.pending,
                                                project: prev.pending.project === "asc"
                                                    ? "desc"
                                                    : "asc",
                                            },
                                        }));
                                    } }
                                    className="flex items-center gap-2 hover:text-neutral-900"
                                >
                                    Project
                                    <span className="px-0.5 py-0 text-[10px] bg-green-100 text-green-800 rounded">
                                        {sortBy.pending === "project"
                                            ? sortOrder.pending.project ===
                                                "asc"
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
                                Rera Carpet
                            </th>
                            <th className="px-5 py-3 text-left font-semibold text-neutral-700 tracking-wide whitespace-nowrap">
                                Status
                            </th>
                            <th className="px-5 py-3 text-left font-semibold text-neutral-700 tracking-wide whitespace-nowrap">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                        {pendingSheets.map((item, idx) => (
                            <tr
                                key={idx}
                                className="hover:bg-neutral-50 transition-all duration-150"
                            >
                                <td className="px-5 py-3 whitespace-nowrap text-neutral-700">
                                    {item.createdAt
                                        ? format(
                                            item.createdAt instanceof
                                                Timestamp
                                                ? item.createdAt.toDate()
                                                : new Date(item.createdAt),
                                            "dd/MM/yyyy"
                                        )
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
                                    {item.reraCarpet || "-"}
                                </td>
                                <td className="px-5 py-3 whitespace-nowrap">
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                        Pending Approval
                                    </span>
                                </td>
                                <td className="px-5 py-3 whitespace-nowrap">
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setSelectedSheet(item)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            onClick={() => {
                                                setEditingProperty(item);
                                                setShowForm(true);
                                            } }
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
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