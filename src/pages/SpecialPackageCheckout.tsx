import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../utils/authContext";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";
import {
  createPaymentRecord,
  createSubscription,
  completeSubscriptionPayment,
} from "../utils/firestoreListings";

type PackageCategory = "resaleRental" | "newProperty";

interface SpecialPackage {
  id: string;
  name: string;
  category: PackageCategory;
  stations: string[];
  actual: number;
  offer: number;
  createdAt?: string;
}

interface Assignment {
  packageId: string;
  assignedUsers: string[];
  duration: number;
  expiresAt?: string;
  status?: string;
}

const SpecialPackageCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, reloadUser } = useAuth();
  const [pkg, setPkg] = useState<SpecialPackage | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const packageId = location.state?.packageId as string | undefined;

  useEffect(() => {
    if (!packageId) {
      toast.error("Missing package selection");
      navigate("/subscription/custom-packages");
    }
  }, [packageId, navigate]);

  useEffect(() => {
    if (!packageId || !user?.id) return;
    const docRef = doc(db, "settings", "pricing");
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (!snap.exists()) {
        setPkg(null);
        setAssignment(null);
        setIsLoaded(true);
        return;
      }

      const data = snap.data();
      const pricingPackages = data.packages || {};
      const assignments = data.assignments || {};

      let nextPackage: SpecialPackage | null = null;

      if (pricingPackages.resaleRental?.[packageId]) {
        const raw = pricingPackages.resaleRental[packageId];
        nextPackage = {
          id: packageId,
          name: raw.name || "Untitled Package",
          category: "resaleRental",
          stations: Array.isArray(raw.stations) ? raw.stations : [],
          actual: Number(raw.actual || 0),
          offer: Number(raw.offer || 0),
          createdAt: raw.createdAt,
        };
      } else if (pricingPackages.newProperty?.[packageId]) {
        const raw = pricingPackages.newProperty[packageId];
        nextPackage = {
          id: packageId,
          name: raw.name || "Untitled Package",
          category: "newProperty",
          stations: Array.isArray(raw.stations) ? raw.stations : [],
          actual: Number(raw.actual || 0),
          offer: Number(raw.offer || 0),
          createdAt: raw.createdAt,
        };
      }

      setPkg(nextPackage);

      let nextAssignment: Assignment | null = null;
      Object.values(assignments).forEach((raw: any) => {
        if (!raw || raw.status !== "active") return;
        if (raw.packageId !== packageId) return;
        const assignedUsers = Array.isArray(raw.assignedUsers)
          ? raw.assignedUsers
          : [];
        if (!assignedUsers.includes(user.id)) return;
        nextAssignment = {
          packageId,
          assignedUsers,
          duration: Number(raw.duration || 1),
          expiresAt: raw.expiresAt,
          status: raw.status,
        };
      });

      setAssignment(nextAssignment);
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, [packageId, user?.id]);

  const durationMonths = assignment?.duration ?? 1;
  const actualTotal = pkg ? pkg.actual * durationMonths : 0;
  const offerTotal = pkg ? pkg.offer * durationMonths : 0;

  const endDateText = useMemo(() => {
    if (assignment?.expiresAt) {
      const expires = new Date(assignment.expiresAt);
      if (!Number.isNaN(expires.getTime())) {
        return expires.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }
    }
    if (!durationMonths) return "--";
    const now = new Date();
    const end = new Date(now);
    end.setMonth(end.getMonth() + durationMonths);
    return end.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [assignment?.expiresAt, durationMonths]);

  const handleCompleteOrder = async () => {
    if (!user || !pkg) {
      toast.error("Package not available");
      return;
    }

    setIsProcessing(true);
    try {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setMonth(now.getMonth() + durationMonths);

      const subscription = {
        userId: user.id,
        type: pkg.category === "resaleRental" ? ("RR" as const) : ("ND" as const),
        locations: pkg.stations,
        amount: offerTotal,
        actualPrice: actualTotal,
        discountedPrice: offerTotal,
        startDate: Timestamp.fromDate(now),
        endDate: Timestamp.fromDate(endDate),
        createdAt: Timestamp.fromDate(now),
        packageId: pkg.id,
        duration: durationMonths,
        subscriptions: [],
      };

      const subscriptionId = await createSubscription(user.id, subscription);
      const paymentId = await createPaymentRecord(user.id, {
        userId: user.id,
        amount: offerTotal,
        currency: "INR",
        subscriptionId,
        paymentMethod: "razorpay",
      });

      const loadScript = () =>
        new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });

      const loaded = await loadScript();
      if (!loaded) {
        toast.error("Failed to load payment gateway. Are you online?");
        setIsProcessing(false);
        return;
      }

      const options = {
        key: "rzp_test_lRCdq1wZYplq4w",
        amount: offerTotal * 100,
        currency: "INR",
        name: "EstateX",
        description: "Custom Package Subscription",
        handler: async (response: Record<string, unknown>) => {
          try {
            await completeSubscriptionPayment(
              user.id,
              subscriptionId,
              paymentId,
              String(response.razorpay_payment_id)
            );
            await reloadUser();
            toast.success("Payment successful! Subscription activated.");
            navigate("/dashboard");
          } catch {
            toast.error("Payment failed. Please contact support.");
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user.fullName || "",
          email: user.email || "",
          contact: user.phone || "",
        },
        theme: { color: "#193867" },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast.error("Payment cancelled.");
          },
        },
      };

      const rzp = new ((window as unknown as Record<string, unknown>)
        .Razorpay as new (options: Record<string, unknown>) => unknown)(options);
      rzp.open();
    } catch (error) {
      toast.error("Failed to initiate payment");
      setIsProcessing(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-600">
          Loading package checkout details...
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center text-gray-600">
          Package not found or no longer available.
        </div>
      </div>
    );
  }

  if (!assignment) {
    // Unassigned package: allow user to choose duration before checkout
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="text-sm text-gray-600">
            Review and complete your custom package subscription
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  {pkg.name}
                </h2>
                <p className="text-sm text-gray-600">
                  {pkg.category === "resaleRental"
                    ? "Resale & Rental Access"
                    : "New Property Access"}
                </p>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Selected Months
                    </div>
                    <div className="text-xs text-gray-500">
                      Assigned duration
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {durationMonths} Month{durationMonths > 1 ? "s" : ""}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Subscription End Date
                    </div>
                    <div className="text-xs text-gray-500">
                      Based on selected duration
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {endDateText}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-900 mb-2">
                    Location Access
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pkg.stations.map((station) => (
                      <span
                        key={`${pkg.id}-${station}`}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        {station}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 h-fit">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Order Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Actual Price</span>
                <span className="font-semibold text-gray-900">
                  ₹{actualTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Offer Price</span>
                <span className="font-semibold text-gray-900">
                  ₹{offerTotal.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-semibold">
                <span>Total</span>
                <span className="text-[#193867]">
                  ₹{offerTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <Button
              onClick={handleCompleteOrder}
              disabled={isProcessing}
              className="w-full mt-5 bg-[#B85817] hover:bg-[#9b4a12] text-white py-3 text-base font-semibold rounded-lg transition-colors"
            >
              {isProcessing ? "Processing..." : "Complete Order"}
            </Button>

            <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
              <Shield className="h-4 w-4 mr-2" />
              Secure checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialPackageCheckout;
