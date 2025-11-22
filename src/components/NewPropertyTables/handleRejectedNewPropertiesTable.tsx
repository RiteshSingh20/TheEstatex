import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { Search, Eye, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";
import { updateCostSheet, deleteCostSheet } from "../../utils/firestoreListings";
import { CostSheet } from "../CompareModal";
import Button from "../ui/Button";

export function handleRejectedNewPropertiesTable(searchTerm: string, setSearchTerm: React.Dispatch<React.SetStateAction<string>>, bhkFilter: string, setBhkFilter: React.Dispatch<React.SetStateAction<string>>, availableBhkTypes: any[], reraRange: { min: string; max: string; }, setReraRange: React.Dispatch<React.SetStateAction<{ min: string; max: string; }>>, setSortBy: React.Dispatch<React.SetStateAction<{ approved: "date" | "project"; pending: "date" | "project"; rejected: "date" | "project"; }>>, setSortOrder: React.Dispatch<React.SetStateAction<{ approved: { date: "desc" | "asc"; project: "asc" | "desc"; }; pending: { date: "desc" | "asc"; project: "asc" | "desc"; }; rejected: { date: "desc" | "asc"; project: "asc" | "desc"; }; }>>, sortBy: { approved: "date" | "project"; pending: "date" | "project"; rejected: "date" | "project"; }, sortOrder: { approved: { date: "desc" | "asc"; project: "asc" | "desc"; }; pending: { date: "desc" | "asc"; project: "asc" | "desc"; }; rejected: { date: "desc" | "asc"; project: "asc" | "desc"; }; }, rejectedSheets: any[], setSelectedSheet: React.Dispatch<React.SetStateAction<CostSheet | null>>, setEditingProperty: React.Dispatch<React.SetStateAction<CostSheet | null>>, setShowForm: React.Dispatch<React.SetStateAction<boolean>>, setCostSheets: React.Dispatch<React.SetStateAction<unknown[]>>) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const totalItems = rejectedSheets.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = rejectedSheets.slice(startIndex, endIndex);

    return <div>
        <div className="mb-4 flex gap-3 items-center flex-wrap">
            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                    type="text"
                    placeholder="Search properties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-2 border border-neutral-300 rounded text-sm w-48" />
            </div>
            <select
                value={bhkFilter}
                onChange={(e) => setBhkFilter(e.target.value)}
                className="px-3 py-2 border border-neutral-300 rounded text-sm"
            >
                <option value="">All BHK</option>
                {availableBhkTypes.map((bhk) => (
                    <option key={bhk} value={bhk}>
                        {bhk}
                    </option>
                ))}
            </select>
            <div className="flex gap-2 items-center">
                <input
                    type="number"
                    placeholder="Min"
                    value={reraRange.min}
                    onChange={(e) => setReraRange((prev) => ({
                        ...prev,
                        min: e.target.value,
                    }))}
                    className="px-2 py-2 border border-neutral-300 rounded text-sm w-20" />
                <span className="text-neutral-500">-</span>
                <input
                    type="number"
                    placeholder="Max"
                    value={reraRange.max}
                    onChange={(e) => setReraRange((prev) => ({
                        ...prev,
                        max: e.target.value,
                    }))}
                    className="px-2 py-2 border border-neutral-300 rounded text-sm w-20" />
                <span className="text-xs text-neutral-500">
                    Rera Carpet
                </span>
            </div>
        </div>
        <div className="overflow-x-auto rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-neutral-200 bg-white text-sm">
                <thead className="bg-neutral-50 sticky top-0 z-10">
                    <tr>
                        <th className="px-5 py-3 text-left font-semibold text-neutral-700 tracking-wide whitespace-nowrap">
                            <button
                                onClick={() => {
                                    setSortBy((prev) => ({
                                        ...prev,
                                        rejected: "date",
                                    }));
                                    setSortOrder((prev) => ({
                                        ...prev,
                                        rejected: {
                                            ...prev.rejected,
                                            date: prev.rejected.date === "desc"
                                                ? "asc"
                                                : "desc",
                                        },
                                    }));
                                } }
                                className="flex items-center gap-2 hover:text-neutral-900"
                            >
                                Date
                                <span className="px-0.5 py-0 text-[10px] bg-blue-100 text-blue-800 rounded">
                                    {sortBy.rejected === "date"
                                        ? sortOrder.rejected.date === "desc"
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
                                        rejected: "project",
                                    }));
                                    setSortOrder((prev) => ({
                                        ...prev,
                                        rejected: {
                                            ...prev.rejected,
                                            project: prev.rejected.project === "asc"
                                                ? "desc"
                                                : "asc",
                                        },
                                    }));
                                } }
                                className="flex items-center gap-2 hover:text-neutral-900"
                            >
                                Project
                                <span className="px-0.5 py-0 text-[10px] bg-green-100 text-green-800 rounded">
                                    {sortBy.rejected === "project"
                                        ? sortOrder.rejected.project === "asc"
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
                            Rejection Reason
                        </th>
                        <th className="px-5 py-3 text-left font-semibold text-neutral-700 tracking-wide whitespace-nowrap">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                    {currentItems.map((item, idx) => (
                        <tr
                            key={idx}
                            className="hover:bg-neutral-50 transition-all duration-150"
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
                            <td className="px-5 py-3 text-sm text-red-600 max-w-xs truncate">
                                {item.rejectionReason ||
                                    "No reason provided"}
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
                                        onClick={async () => {
                                            try {
                                                // Reset rejection status and approval status for resubmission
                                                const resubmitData = {
                                                    isRejected: false,
                                                    isApproved: false,
                                                    approvalStatus: "pending",
                                                    rejectionReason: null,
                                                    rejectedBy: null,
                                                    rejectedAt: null,
                                                };

                                                // Update in Firestore immediately
                                                await updateCostSheet(
                                                    item.id,
                                                    resubmitData
                                                );

                                                // Prepare data for editing
                                                const editData = {
                                                    ...item,
                                                    ...resubmitData,
                                                };

                                                setEditingProperty(editData);
                                                setShowForm(true);
                                                toast.success(
                                                    "Property resubmitted for approval. You can make additional changes if needed."
                                                );
                                            } catch (error) {
                                                toast.error(
                                                    "Failed to resubmit property: " +
                                                    (error instanceof Error
                                                        ? error.message
                                                        : "Unknown error")
                                                );
                                            }
                                        } }
                                        title="Resubmit for approval"
                                    >
                                        Resubmit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={async () => {
                                            if (!item.id) {
                                                toast.error(
                                                    "Property ID not found"
                                                );
                                                return;
                                            }
                                            if (confirm(
                                                `Delete "${item.projectName}"? This cannot be undone.`
                                            )) {
                                                try {
                                                    await deleteCostSheet(item.id);
                                                    setCostSheets((prev) => prev.filter(
                                                        (sheet) => (sheet as CostSheet)
                                                            .id !== item.id
                                                    )
                                                    );
                                                    toast.success(
                                                        "Property deleted successfully!"
                                                    );
                                                } catch (error) {
                                                    
                                                    toast.error(
                                                        `Failed to delete property: ${error instanceof Error
                                                            ? error.message
                                                            : "Unknown error"}`
                                                    );
                                                }
                                            }
                                        } }
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
        {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-neutral-200">
                <div className="flex items-center text-sm text-neutral-700">
                    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-neutral-700">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        )}
    </div>;
}