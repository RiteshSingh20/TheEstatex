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
        <NewPropertyModal 
          Section={Section} 
          Field={Field} 
          selectedSheet={selectedSheet}
          user={user}
          preloadedStateData={preloadedStateData}
          setSelectedStateCode={setSelectedStateCode}
          setCities={setCities}
          setEditingProperty={setEditingProperty}
          setSelectedSheet={setSelectedSheet}
          setCostSheets={setCostSheets}
        />
      )}
    </Card>
  );
}
