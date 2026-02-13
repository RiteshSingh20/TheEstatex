import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../utils/authContext";

type PackageCategory = "resaleRental" | "newProperty";

interface SpecialPackage {
  id: string;
  name: string;
  category: PackageCategory;
  stations: string[];
  actual: number;
  offer: number;
  createdAt?: string;
  isFreemium?: boolean;
  freemiumDuration?: number;
}

const getCategoryLabel = (category: PackageCategory) =>
  category === "resaleRental" ? "Resale & Rental" : "New Property";

const formatDate = (dateValue?: string) => {
  if (!dateValue) return "—";
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const SpecialPackages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [packages, setPackages] = useState<SpecialPackage[]>([]);
  const [assignedPackageIds, setAssignedPackageIds] = useState<Set<string>>(
    () => new Set()
  );
  const [assignedToAnyoneIds, setAssignedToAnyoneIds] = useState<Set<string>>(
    () => new Set()
  );
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null
  );
  const [showStationsFor, setShowStationsFor] = useState<string | null>(null);
  const [showPackageDetailsFor, setShowPackageDetailsFor] = useState<
    string | null
  >(null);
  const [usedFreemiumPackages, setUsedFreemiumPackages] = useState<Set<string>>(() => new Set());
  const [expiringPackages, setExpiringPackages] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const docRef = doc(db, "settings", "pricing");
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (!snap.exists()) {
        setPackages([]);
        setAssignedPackageIds(new Set());
        setAssignedToAnyoneIds(new Set());
        setSelectedPackageId(null);
        return;
      }

      const data = snap.data();
      const pricingPackages = data.packages || {};
      const assignments = data.assignments || {};
      const nextAssignedIds = new Set<string>();
      const nextAssignedToAnyoneIds = new Set<string>();
      const now = Date.now();

      if (user?.id) {
        Object.values(assignments).forEach((assignment: any) => {
          if (!assignment || assignment.status !== "active") return;
          if (assignment.expiresAt) {
            const expiresAt = new Date(assignment.expiresAt).getTime();
            if (!Number.isNaN(expiresAt) && expiresAt < now) return;
          }
          if (assignment.packageId) {
            nextAssignedToAnyoneIds.add(assignment.packageId);
          }
          const assignedUsers: string[] = Array.isArray(assignment.assignedUsers)
            ? assignment.assignedUsers
            : [];
          if (!assignedUsers.includes(user.id)) return;
          if (assignment.packageId) {
            nextAssignedIds.add(assignment.packageId);
          }
        });
      } else {
        Object.values(assignments).forEach((assignment: any) => {
          if (!assignment || assignment.status !== "active") return;
          if (assignment.expiresAt) {
            const expiresAt = new Date(assignment.expiresAt).getTime();
            if (!Number.isNaN(expiresAt) && expiresAt < now) return;
          }
          if (assignment.packageId) {
            nextAssignedToAnyoneIds.add(assignment.packageId);
          }
        });
      }
      const nextPackages: SpecialPackage[] = [];

      if (pricingPackages.resaleRental) {
        Object.entries(pricingPackages.resaleRental).forEach(
          ([id, pkg]: [string, any]) => {
            nextPackages.push({
              id,
              name: pkg.name || "Untitled Package",
              category: "resaleRental",
              stations: Array.isArray(pkg.stations) ? pkg.stations : [],
              actual: Number(pkg.actual || 0),
              offer: Number(pkg.offer || 0),
              createdAt: pkg.createdAt,
              isFreemium: pkg.isFreemium || false,
              freemiumDuration: pkg.freemiumDuration || 1,
            });
          }
        );
      }

      if (pricingPackages.newProperty) {
        Object.entries(pricingPackages.newProperty).forEach(
          ([id, pkg]: [string, any]) => {
            nextPackages.push({
              id,
              name: pkg.name || "Untitled Package",
              category: "newProperty",
              stations: Array.isArray(pkg.stations) ? pkg.stations : [],
              actual: Number(pkg.actual || 0),
              offer: Number(pkg.offer || 0),
              createdAt: pkg.createdAt,
              isFreemium: pkg.isFreemium || false,
              freemiumDuration: pkg.freemiumDuration || 1,
            });
          }
        );
      }

      nextPackages.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });

      setAssignedPackageIds(nextAssignedIds);
      setAssignedToAnyoneIds(nextAssignedToAnyoneIds);
      setPackages(nextPackages);
      setSelectedPackageId((currentId) => {
        if (currentId && nextPackages.some((pkg) => pkg.id === currentId)) {
          return currentId;
        }
        return nextPackages.length > 0 ? nextPackages[0].id : null;
      });
    });

    return () => unsubscribe();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const userRef = doc(db, "users", user.id);
    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const usedPackages = snap.data()?.usedFreemiumPackages || [];
        setUsedFreemiumPackages(new Set(usedPackages));
      }
    });
    return () => unsubscribe();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const pricingRef = doc(db, "settings", "pricing");
    const unsubscribe = onSnapshot(pricingRef, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      const subscriptions = data.userSubscriptions?.[user.id] || {};
      const expiring = new Map<string, string>();
      const now = Date.now();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

      Object.values(subscriptions).forEach((sub: any) => {
        if (sub.isFreemium && sub.endDate) {
          const endTime = new Date(sub.endDate).getTime();
          if (!Number.isNaN(endTime) && endTime - now < sevenDaysMs && endTime >= now) {
            expiring.set(sub.packageId, new Date(sub.endDate).toLocaleDateString());
          }
        }
      });

      setExpiringPackages(expiring);
    });
    return () => unsubscribe();
  }, [user?.id]);

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    expiringPackages.forEach((expireDate, packageId) => {
      const notification = new Notification("Plan Expiring Soon", {
        body: `Your plan is going to expire on ${expireDate}`,
        icon: "/logo.png",
      });
      setTimeout(() => notification.close(), 5000);
    });
  }, [expiringPackages]);

  const visiblePackages = useMemo(() => {
    return packages.filter(
      (pkg) =>
        !assignedToAnyoneIds.has(pkg.id) || assignedPackageIds.has(pkg.id)
    );
  }, [packages, assignedToAnyoneIds, assignedPackageIds]);

  const stationsPackage = useMemo(
    () => visiblePackages.find((pkg) => pkg.id === showStationsFor) || null,
    [visiblePackages, showStationsFor]
  );

  const detailsPackage = useMemo(
    () => visiblePackages.find((pkg) => pkg.id === showPackageDetailsFor) || null,
    [visiblePackages, showPackageDetailsFor]
  );

  useEffect(() => {
    if (
      showPackageDetailsFor &&
      !packages.some((pkg) => pkg.id === showPackageDetailsFor)
    ) {
      setShowPackageDetailsFor(null);
    }
    if (showStationsFor && !packages.some((pkg) => pkg.id === showStationsFor)) {
      setShowStationsFor(null);
    }
  }, [packages, showPackageDetailsFor, showStationsFor]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#19386710] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/subscription")}
          className="flex items-center text-[#193867] hover:text-[#152b5f] mb-6"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Plans
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#193867]">
            Custom Packages
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Select a package to view its real-time pricing details.
          </p>
        </div>

        {visiblePackages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No custom packages available yet.
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Select one package to continue checkout.
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!selectedPackageId) return;
                  navigate("/subscription/custom-packages/checkout", {
                    state: { packageId: selectedPackageId },
                  });
                }}
                disabled={!selectedPackageId}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  selectedPackageId
                    ? "bg-[#193867] text-white hover:bg-[#152b5f]"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                Proceed to Payment
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {visiblePackages.map((pkg) => {
                const isActive = pkg.id === selectedPackageId;
                const isAssigned = assignedPackageIds.has(pkg.id);
                const isUsed = usedFreemiumPackages.has(pkg.id);
                const isDisabled = pkg.isFreemium && isUsed;
                
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => {
                      if (!isDisabled) {
                        setSelectedPackageId(pkg.id);
                        setShowPackageDetailsFor(pkg.id);
                      }
                    }}
                    disabled={isDisabled}
                    className={`relative text-left rounded-xl border p-4 transition-all shadow-sm ${
                      isDisabled
                        ? "border-gray-300 bg-gray-100 opacity-60 cursor-not-allowed"
                        : isAssigned
                        ? isActive
                          ? "border-emerald-400 bg-emerald-50"
                          : "border-emerald-200 bg-emerald-50/70 hover:border-emerald-400"
                        : isActive
                        ? "border-[#193867] bg-[#19386710]"
                        : "border-gray-200 bg-white hover:border-[#193867]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="selected-package"
                              checked={isActive}
                              onChange={() => {
                                if (!isDisabled) {
                                  setSelectedPackageId(pkg.id);
                                }
                              }}
                              onClick={(event) => event.stopPropagation()}
                              className="h-4 w-4 text-[#193867] focus:ring-[#193867]"
                            />
                            <span className="text-sm font-semibold text-gray-900">
                              {pkg.name}
                            </span>
                          </div>
                          {isAssigned && (
                            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                              Only for you
                            </span>
                          )}
                          {pkg.isFreemium && isUsed && (
                            <span className="rounded-full bg-gray-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                              Already Used
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Created {formatDate(pkg.createdAt)}
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          pkg.category === "resaleRental"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {getCategoryLabel(pkg.category)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                      <span>{pkg.stations.length} stations</span>
                      <span className="text-xs font-semibold text-[#193867]">
                        {pkg.offer === 0 ? "FREE" : `₹${pkg.offer.toLocaleString()}`}
                      </span>
                    </div>
                    {expiringPackages.has(pkg.id) && (
                      <div className="mt-2 text-xs text-orange-600 font-medium">
                        Your plan is going to expire soon on {expiringPackages.get(pkg.id)}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

          </div>
        )}

        {detailsPackage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={() => setShowPackageDetailsFor(null)}
          >
            <div
              className="w-full max-w-2xl rounded-xl bg-white shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {detailsPackage.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {getCategoryLabel(detailsPackage.category)} •{" "}
                    {detailsPackage.stations.length} stations
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPackageDetailsFor(null)}
                  className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
                  aria-label="Close"
                >
                  <svg
                    className="h-4 w-4"
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
                </button>
              </div>
              <div className="overflow-x-auto px-4 pb-5">
                <table className="w-full text-sm">
                  <thead className="bg-white text-gray-600">
                    <tr className="border-b border-gray-100">
                      <th className="px-4 py-2 text-left font-medium">
                        Package Name
                      </th>
                      <th className="px-4 py-2 text-left font-medium">
                        Category
                      </th>
                      <th className="px-4 py-2 text-left font-medium">
                        Stations Count
                      </th>
                      <th className="px-4 py-2 text-left font-medium">
                        Actual Price
                      </th>
                      <th className="px-4 py-2 text-left font-medium">
                        Offer Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-900">
                    <tr className="border-b border-gray-100 last:border-none">
                      <td className="px-4 py-2 font-medium">
                        {detailsPackage.name}
                      </td>
                      <td className="px-4 py-2">
                        {getCategoryLabel(detailsPackage.category)}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <span>{detailsPackage.stations.length}</span>
                          <button
                            type="button"
                            onClick={() => setShowStationsFor(detailsPackage.id)}
                            className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                            title="View stations"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-2 font-semibold">
                        ₹{detailsPackage.actual.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 font-semibold text-[#193867]">
                        ₹{detailsPackage.offer.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {stationsPackage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={() => setShowStationsFor(null)}
          >
            <div
              className="w-full max-w-md rounded-xl bg-white shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Stations for {stationsPackage.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {stationsPackage.stations.length} stations
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStationsFor(null)}
                  className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
                  aria-label="Close"
                >
                  <svg
                    className="h-4 w-4"
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
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto px-4 py-3">
                {stationsPackage.stations.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    No stations configured for this package.
                  </div>
                ) : (
                  <ul className="space-y-2 text-sm text-gray-700">
                    {stationsPackage.stations.map((station, index) => (
                      <li
                        key={`${stationsPackage.id}-${station}-${index}`}
                        className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2"
                      >
                        <span className="h-2 w-2 rounded-full bg-[#193867]" />
                        <span>{station}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecialPackages;
