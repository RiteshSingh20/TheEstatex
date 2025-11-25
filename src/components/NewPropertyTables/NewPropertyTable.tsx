import { User } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { Edit } from "lucide-react";
import React from "react";
import toast from "react-hot-toast";
import { needsUpdate } from "../../pages/CostSheetFormProps";
import { State, City } from "../../types";
import { updateCostSheet } from "../../utils/firestoreListings";
import { sanitizeInput } from "../../utils/formSubmissionUtils";
import { CostSheet } from "../CompareModal";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Tabs from "../ui/Tabs";
import { handleUpdatedPropertiesTable } from "./handleUpdatedPropertiesTable";
import { handleUpdateRequiredTable } from "./handleUpdateRequiredTable";
import { handlePendingNewPropertiesTable } from "./handlePendingNewPropertiesTable";
import { handleRejectedNewPropertiesTable } from "./handleRejectedNewPropertiesTable";
import { NewPropertyModal } from "./NewPropertyModal";

export function handleNewPropertyTable(
  costSheets: unknown[],
  user: User | null,
  searchTerm: string,
  bhkFilter: string,
  reraRange: { min: string; max: string },
  sortBy: {
    approved: "date" | "project";
    pending: "date" | "project";
    rejected: "date" | "project";
  },
  sortOrder: {
    approved: { date: "desc" | "asc"; project: "asc" | "desc" };
    pending: { date: "desc" | "asc"; project: "asc" | "desc" };
    rejected: { date: "desc" | "asc"; project: "asc" | "desc" };
  },
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>,
  setBhkFilter: React.Dispatch<React.SetStateAction<string>>,
  setReraRange: React.Dispatch<
    React.SetStateAction<{ min: string; max: string }>
  >,
  availableBhkTypes: any[],
  setSortBy: React.Dispatch<
    React.SetStateAction<{
      approved: "date" | "project";
      pending: "date" | "project";
      rejected: "date" | "project";
    }>
  >,
  setSortOrder: React.Dispatch<
    React.SetStateAction<{
      approved: { date: "desc" | "asc"; project: "asc" | "desc" };
      pending: { date: "desc" | "asc"; project: "asc" | "desc" };
      rejected: { date: "desc" | "asc"; project: "asc" | "desc" };
    }>
  >,
  states: State[],
  setPreloadedStateData: React.Dispatch<
    React.SetStateAction<{ stateCode: string; cities: City[] } | null>
  >,
  setSelectedSheet: React.Dispatch<React.SetStateAction<CostSheet | null>>,
  setEditingProperty: React.Dispatch<React.SetStateAction<CostSheet | null>>,
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>,

  setCostSheets: React.Dispatch<React.SetStateAction<unknown[]>>,
  selectedSheet: CostSheet | null,
  preloadedStateData: { stateCode: string; cities: City[] } | null,
  setSelectedStateCode: React.Dispatch<React.SetStateAction<string>>,
  setCities: React.Dispatch<React.SetStateAction<City[]>>,
  Section,
  Field
): React.ReactNode {
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">New Properties</h2>
      <Tabs
        tabs={(() => {
          // Calculate counts for tab labels
          const allApprovedSheets = (costSheets as any[]).filter(
            (sheet: any) =>
              sheet.isApproved &&
              (sheet.isApproved || sheet.submittedBy === user?.id)
          );

          const updatedCount = allApprovedSheets.filter(
            (sheet) => !needsUpdate(sheet)
          ).length;
          const updateRequiredCount = allApprovedSheets.filter((sheet) =>
            needsUpdate(sheet)
          ).length;

          return [
            {
              id: "updated",
              label: `Updated (${updatedCount})`,
              content: (() => {
                const approvedSheets = (costSheets as any[])
                  .filter(
                    (sheet: any) =>
                      sheet.isApproved &&
                      (sheet.isApproved || sheet.submittedBy === user?.id) &&
                      !needsUpdate(sheet)
                  )
                  .filter((sheet: any) => {
                    const matchesSearch =
                      !searchTerm ||
                      (sheet.projectName || "")
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      (sheet.developerName || "")
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      (sheet.station || "")
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase());
                    const matchesBhk =
                      !bhkFilter || (sheet.flatType || "").includes(bhkFilter);
                    const reraCarpetNum = parseFloat(sheet.reraCarpet) || 0;
                    const matchesRera =
                      (!reraRange.min ||
                        reraCarpetNum >= parseFloat(reraRange.min)) &&
                      (!reraRange.max ||
                        reraCarpetNum <= parseFloat(reraRange.max));
                    return matchesSearch && matchesBhk && matchesRera;
                  })
                  .sort((a: any, b: any) => {
                    if (sortBy.approved === "date") {
                      const getDateValue = (item: any) => {
                        const dateValue =
                          item.dateUpdateCostSheet ||
                          item.updatedAt ||
                          item.createdAt;
                        if (dateValue instanceof Timestamp) {
                          return dateValue.toDate();
                        }
                        return new Date(dateValue);
                      };
                      const aDate = getDateValue(a);
                      const bDate = getDateValue(b);
                      return sortOrder.approved.date === "desc"
                        ? bDate.getTime() - aDate.getTime()
                        : aDate.getTime() - bDate.getTime();
                    } else {
                      const aProject = (a.projectName || "").toLowerCase();
                      const bProject = (b.projectName || "").toLowerCase();
                      return sortOrder.approved.project === "asc"
                        ? aProject.localeCompare(bProject)
                        : bProject.localeCompare(aProject);
                    }
                  });
                return handleUpdatedPropertiesTable(
                  searchTerm,
                  setSearchTerm,
                  bhkFilter,
                  setBhkFilter,
                  reraRange,
                  setReraRange,
                  availableBhkTypes,
                  approvedSheets,
                  setSortBy,
                  setSortOrder,
                  sortBy,
                  sortOrder,
                  states,
                  setPreloadedStateData,
                  setSelectedSheet,
                  setEditingProperty,
                  setShowForm,
                  user,
                  setCostSheets
                );
              })(),
            },
            {
              id: "update-required",
              label: React.createElement(
                "span",
                { className: updateRequiredCount > 0 ? "tab-glow" : "" },
                `Update Required (${updateRequiredCount})${
                  updateRequiredCount > 0 ? " ⚠️" : ""
                }`
              ),
              disabled: updateRequiredCount === 0,
              content: (() => {
                const approvedSheets = (costSheets as any[])
                  .filter(
                    (sheet: any) =>
                      sheet.isApproved &&
                      (sheet.isApproved || sheet.submittedBy === user?.id) &&
                      needsUpdate(sheet)
                  )
                  .filter((sheet: any) => {
                    const matchesSearch =
                      !searchTerm ||
                      (sheet.projectName || "")
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      (sheet.developerName || "")
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      (sheet.station || "")
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase());
                    const matchesBhk =
                      !bhkFilter || (sheet.flatType || "").includes(bhkFilter);
                    const reraCarpetNum = parseFloat(sheet.reraCarpet) || 0;
                    const matchesRera =
                      (!reraRange.min ||
                        reraCarpetNum >= parseFloat(reraRange.min)) &&
                      (!reraRange.max ||
                        reraCarpetNum <= parseFloat(reraRange.max));
                    return matchesSearch && matchesBhk && matchesRera;
                  })
                  .sort((a: any, b: any) => {
                    const aDate =
                      a.createdAt instanceof Timestamp
                        ? a.createdAt.toDate()
                        : new Date(a.createdAt);
                    const bDate =
                      b.createdAt instanceof Timestamp
                        ? b.createdAt.toDate()
                        : new Date(b.createdAt);
                    if (sortBy.approved === "date") {
                      return sortOrder.approved.date === "desc"
                        ? bDate.getTime() - aDate.getTime()
                        : aDate.getTime() - bDate.getTime();
                    } else {
                      const aProject = (a.projectName || "").toLowerCase();
                      const bProject = (b.projectName || "").toLowerCase();
                      return sortOrder.approved.project === "asc"
                        ? aProject.localeCompare(bProject)
                        : bProject.localeCompare(aProject);
                    }
                  });
                return handleUpdateRequiredTable(
                  searchTerm,
                  setSearchTerm,
                  bhkFilter,
                  setBhkFilter,
                  reraRange,
                  setReraRange,
                  availableBhkTypes,
                  approvedSheets,
                  setSortBy,
                  setSortOrder,
                  sortBy,
                  sortOrder,
                  setSelectedSheet,
                  setEditingProperty,
                  setShowForm,
                  user,
                  setCostSheets
                );
              })(),
            },
            ...(user?.role !== "admin"
              ? [
                  {
                    id: "pending",
                    label: "Pending Properties",
                    content: (() => {
                      const pendingSheets = (costSheets as any[])
                        .filter(
                          (sheet: any) =>
                            !sheet.isApproved &&
                            !sheet.isRejected &&
                            sheet.submittedBy === user?.id
                        )
                        .filter((sheet: any) => {
                          const matchesSearch =
                            !searchTerm ||
                            (sheet.projectName || "")
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            (sheet.developerName || "")
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            (sheet.station || "")
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase());
                          const matchesBhk =
                            !bhkFilter ||
                            (sheet.flatType || "").includes(bhkFilter);
                          const reraCarpetNum =
                            parseFloat(sheet.reraCarpet) || 0;
                          const matchesRera =
                            (!reraRange.min ||
                              reraCarpetNum >= parseFloat(reraRange.min)) &&
                            (!reraRange.max ||
                              reraCarpetNum <= parseFloat(reraRange.max));
                          return matchesSearch && matchesBhk && matchesRera;
                        })
                        .sort((a: any, b: any) => {
                          const aDate =
                            a.createdAt instanceof Timestamp
                              ? a.createdAt.toDate()
                              : new Date(a.createdAt);
                          const bDate =
                            b.createdAt instanceof Timestamp
                              ? b.createdAt.toDate()
                              : new Date(b.createdAt);
                          if (sortBy.pending === "date") {
                            return sortOrder.pending.date === "desc"
                              ? bDate.getTime() - aDate.getTime()
                              : aDate.getTime() - bDate.getTime();
                          } else {
                            const aProject = (
                              a.projectName || ""
                            ).toLowerCase();
                            const bProject = (
                              b.projectName || ""
                            ).toLowerCase();
                            return sortOrder.pending.project === "asc"
                              ? aProject.localeCompare(bProject)
                              : bProject.localeCompare(aProject);
                          }
                        });
                      return handlePendingNewPropertiesTable(
                        searchTerm,
                        setSearchTerm,
                        bhkFilter,
                        setBhkFilter,
                        reraRange,
                        setReraRange,
                        availableBhkTypes,
                        pendingSheets,
                        setSortBy,
                        setSortOrder,
                        sortBy,
                        sortOrder,
                        setSelectedSheet,
                        setEditingProperty,
                        setShowForm
                      );
                    })(),
                  },
                ]
              : []),
            ...(user?.role !== "admin"
              ? [
                  {
                    id: "rejected",
                    label: "Rejected Properties",
                    content: (() => {
                      const rejectedSheets = (costSheets as any[])
                        .filter(
                          (sheet: any) =>
                            sheet.isRejected && sheet.submittedBy === user?.id
                        )
                        .filter((sheet: any) => {
                          const matchesSearch =
                            !searchTerm ||
                            (sheet.projectName || "")
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            (sheet.developerName || "")
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            (sheet.station || "")
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase());
                          const matchesBhk =
                            !bhkFilter ||
                            (sheet.flatType || "").includes(bhkFilter);
                          const reraCarpetNum =
                            parseFloat(sheet.reraCarpet) || 0;
                          const matchesRera =
                            (!reraRange.min ||
                              reraCarpetNum >= parseFloat(reraRange.min)) &&
                            (!reraRange.max ||
                              reraCarpetNum <= parseFloat(reraRange.max));
                          return matchesSearch && matchesBhk && matchesRera;
                        })
                        .sort((a: any, b: any) => {
                          const aDate =
                            a.createdAt instanceof Timestamp
                              ? a.createdAt.toDate()
                              : new Date(a.createdAt);
                          const bDate =
                            b.createdAt instanceof Timestamp
                              ? b.createdAt.toDate()
                              : new Date(b.createdAt);
                          if (sortBy.rejected === "date") {
                            return sortOrder.rejected.date === "desc"
                              ? bDate.getTime() - aDate.getTime()
                              : aDate.getTime() - bDate.getTime();
                          } else {
                            const aProject = (
                              a.projectName || ""
                            ).toLowerCase();
                            const bProject = (
                              b.projectName || ""
                            ).toLowerCase();
                            return sortOrder.rejected.project === "asc"
                              ? aProject.localeCompare(bProject)
                              : bProject.localeCompare(aProject);
                          }
                        });
                      return rejectedSheets.length === 0 ? (
                        <p className="text-neutral-500 p-4">
                          {searchTerm ||
                          bhkFilter ||
                          reraRange.min ||
                          reraRange.max
                            ? "No matching properties found for the applied filters."
                            : "No rejected properties."}
                        </p>
                      ) : (
                        handleRejectedNewPropertiesTable(
                          searchTerm,
                          setSearchTerm,
                          bhkFilter,
                          setBhkFilter,
                          availableBhkTypes,
                          reraRange,
                          setReraRange,
                          setSortBy,
                          setSortOrder,
                          sortBy,
                          sortOrder,
                          rejectedSheets,
                          setSelectedSheet,
                          setEditingProperty,
                          setShowForm,
                          setCostSheets
                        )
                      );
                    })(),
                  },
                ]
              : []),
          ];
        })()}
      />

      {/* Detail Viewer */}
      {selectedSheet && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] flex flex-col relative">
            <button
              onClick={() => setSelectedSheet(null)}
              className="absolute top-6 right-6 text-gray-500 hover:text-red-500 text-xl z-20 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md"
            >
              ✕
            </button>

            {/* Sticky Header */}
            <div className="sticky top-0 bg-white rounded-t-lg border-b border-gray-200 p-6 pr-10 z-10">
              <div className="mb-3">
                <h3 className="text-xl font-semibold pr-8">
                  {sanitizeInput(selectedSheet.projectName || "")} by{" "}
                  {sanitizeInput(selectedSheet.developerName || "")}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Status:{" "}
                  {selectedSheet.isApproved
                    ? "Approved"
                    : selectedSheet.isRejected
                    ? "Rejected"
                    : "Pending"}
                  {user?.role === "admin" && (
                    <span className="ml-2 text-xs bg-blue-100 px-2 py-1 rounded">
                      Admin View
                    </span>
                  )}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap pr-8">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Use preloaded data if available
                    if (preloadedStateData) {
                      setSelectedStateCode(preloadedStateData.stateCode);
                      setCities(preloadedStateData.cities);
                    }
                    setEditingProperty(selectedSheet);
                    setSelectedSheet(null);
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                {(user?.role === "admin" || user?.role === "manager") &&
                  selectedSheet.isApproved && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await updateCostSheet(selectedSheet.id, {
                            isApproved: false,
                            approvalStatus: "pending",
                            unapprovedBy: user.id,
                            unapprovedAt: new Date().toISOString(),
                          });
                          setCostSheets((prev) =>
                            prev.map((sheet) =>
                              (sheet as any).id === selectedSheet.id
                                ? {
                                    ...sheet,
                                    isApproved: false,
                                    approvalStatus: "pending",
                                  }
                                : sheet
                            )
                          );
                          setSelectedSheet(null);
                          toast.success("Property unapproved!");
                        } catch (error) {
                          toast.error("Failed to unapprove property");
                        }
                      }}
                    >
                      Unapprove
                    </Button>
                  )}
              </div>
            </div>

            {/* Scrollable Content */}
            <NewPropertyModal Section={Section} Field={Field} selectedSheet={selectedSheet} />
          </div>
        </div>
      )}
    </Card>
  );
}
