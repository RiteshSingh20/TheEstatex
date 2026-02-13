import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Building, Check, Clock, Zap, ChevronLeft, Shield, Package } from "lucide-react";
import { collection, getDocs, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useAuth } from "../utils/authContext";
import toast from "react-hot-toast";
import {
  createSubscription,
  createPaymentRecord,
  completeSubscriptionPayment,
} from "../utils/firestoreListings";
import { Timestamp } from "firebase/firestore";
import { Subscription as SubscriptionType } from "../types";
import { motion } from "framer-motion";
import { stations, getMergedStations } from "../utils/stations";

// Razorpay type definition
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  handler: (response: Record<string, unknown>) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: { color: string };
  modal: {
    ondismiss: () => void;
  };
}

interface Razorpay {
  new (options: RazorpayOptions): {
    open: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: Razorpay;
  }
}

// Helper to convert Firestore timestamp to Date
const toDate = (dateValue: Timestamp | Date | string | number | null): Date => {
  if (!dateValue) return new Date();
  if (dateValue instanceof Timestamp) return dateValue.toDate();
  if (dateValue instanceof Date) return dateValue;
  return new Date(dateValue);
};

const Subscription = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, reloadUser, loading } = useAuth();
  type PlanType = "RR" | "ND";
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [selectedNewStations, setSelectedNewStations] = useState<string[]>([]);
  const [pricing, setPricing] = useState({
    rentalResalePrice: 2500,
    newPropertyPrices: {} as Record<string, number>,
    actualPrice: { RR: 12500, ND: 2000 },
    discountedPrice: { RR: 2500, ND: 1500 },
  });
  const [mergedStationsList, setMergedStationsList] = useState(stations);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expiringSubscriptions, setExpiringSubscriptions] = useState<
    SubscriptionType[]
  >([]);
  const [subscriptionMode, setSubscriptionMode] = useState<1 | 3 | 6 | 12>(12);
  const [availableStationsCount, setAvailableStationsCount] = useState(0);
  const [stationsLoaded, setStationsLoaded] = useState(false);
  const [rrStationsCount, setRRStationsCount] = useState(0);
  const [ndStationsCount, setNDStationsCount] = useState(0);
  const [ndMergedStationsList, setNDMergedStationsList] = useState<
    { id: string; name: string }[]
  >([]);
  const [stationPricing, setStationPricing] = useState<{
    [key: string]: { actual: number; offer: number };
  }>({});
  const [stationDurations, setStationDurations] = useState<{
    [key: string]: 1 | 3 | 6 | 12;
  }>({});
  const [showCheckout, setShowCheckout] = useState(false);
  const [durationDiscounts, setDurationDiscounts] = useState<{
    3: number;
    6: number;
    12: number;
  }>({ 3: 10, 6: 20, 12: 40 });
  const [customPackages, setCustomPackages] = useState<any[]>([]);

  // Memoize station list to prevent unnecessary re-renders
  const memoizedNDStationsList = useMemo(
    () => ndMergedStationsList,
    [ndMergedStationsList]
  );

  // Free trial functionality
  const isFreeTrialActive = () => {
    const currentDate = new Date();
    const trialEndDate = new Date('2025-11-30T23:59:59');
    return currentDate <= trialEndDate;
  };

  const activateFreeTrial = async () => {
    if (!user?.id) {
      toast.error('User not found');
      return;
    }
    
    try {
      setIsProcessing(true);
      await updateDoc(doc(db, 'users', user.id), {
        freeTrialActivated: true
      });
      
      // Add a small delay to ensure Firestore consistency
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await reloadUser();
      toast.success('Free trial activated successfully!');
    } catch (error) {
      
      toast.error('Failed to activate free trial');
    } finally {
      setIsProcessing(false);
    }
  };

  const getDynamicStationCount = (planType: "RR" | "ND" | "SP" | "Enterprise") => {
    if (!stationsLoaded) return stations.length;
    if (planType === "RR") return rrStationsCount;
    if (planType === "ND") return ndStationsCount;
    return stations.length;
  };

  const normalizeStationName = (name: string) => {
    return name.replace(/\s+(East|West)$/i, "").trim();
  };

  const fetchCustomPackages = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(db, "settings", "customPackages", "packages")
      );
      const packages: any[] = [];
      querySnapshot.forEach((doc) => {
        packages.push({ id: doc.id, ...doc.data() });
      });
      setCustomPackages(packages);
    } catch (error) {
      console.error("Error fetching custom packages:", error);
    }
  };

  const fetchAvailableStations = async () => {
    try {
      // Fetch ND stations (costSheets) - this is the primary data source
      const costSheetsSnap = await getDocs(collection(db, "TestingCostSheets"));
      const ndAvailableStations = new Set<string>();
      const ndAvailableList: { id: string; name: string }[] = [];
      const ndSeen = new Set<string>();

      costSheetsSnap.forEach((doc) => {
        const data = doc.data();
        if (data.station) {
          const normalized = normalizeStationName(data.station).toLowerCase();
          if (!ndSeen.has(normalized)) {
            ndSeen.add(normalized);
            ndAvailableStations.add(normalized);
            ndAvailableList.push({
              id: `costsheet-${data.station.toLowerCase().replace(/\s+/g, "-")}`,
              name: normalizeStationName(data.station),
            });
          }
        }
        if (data.availableStations?.length) {
          data.availableStations.forEach((station: string) => {
            const normalized = normalizeStationName(station).toLowerCase();
            if (!ndSeen.has(normalized)) {
              ndSeen.add(normalized);
              ndAvailableStations.add(normalized);
              ndAvailableList.push({
                id: `costsheet-${station.toLowerCase().replace(/\s+/g, "-")}`,
                name: normalizeStationName(station),
              });
            }
          });
        }
      });

      const staticCount = stations.length;
      const ndAvailableCount = ndAvailableStations.size;

      // Set ND stations - use available list if we have data, otherwise use static
      if (ndAvailableCount > 0) {
        setNDStationsCount(ndAvailableCount);
        setNDMergedStationsList(ndAvailableList);
      } else {
        setNDStationsCount(staticCount);
        setNDMergedStationsList(
          stations.map((s) => ({ id: s.id, name: s.name }))
        );
      }

      // RR stations - use static count as default (no need to query all users)
      setRRStationsCount(staticCount);
      setStationsLoaded(true);
    } catch (error) {
      // Fallback to static stations on error
      setRRStationsCount(stations.length);
      setNDStationsCount(stations.length);
      setNDMergedStationsList(
        stations.map((s) => ({ id: s.id, name: s.name }))
      );
      setStationsLoaded(true);
    }
  };

  const [subscriptionModes, setSubscriptionModes] = useState([
    { value: 1, label: "1 Month", multiplier: 1, discount: 0 },
    { value: 3, label: "3 Months", multiplier: 3, discount: 0.1 },
    { value: 6, label: "6 Months", multiplier: 6, discount: 0.2 },
    { value: 12, label: "1 Year", multiplier: 12, discount: 0.4 },
  ]);

  function getDynamicPrice(plan: PlanType) {
    if (plan === "RR") {
      const base = pricing.discountedPrice.RR;
      const mode =
        subscriptionModes.find((m) => m.value === subscriptionMode) ||
        subscriptionModes[3];
      const price = base * mode.multiplier * (1 - mode.discount);
      return Math.round(price);
    } else if (plan === "ND") {
      if (selectedNewStations.length === 0) return 0;

      // Calculate total price using individual station durations
      const totalPrice = selectedNewStations.reduce((total, stationId) => {
        const adminPricing = stationPricing[stationId];
        const basePrice =
          adminPricing?.offer ||
          pricing.newPropertyPrices[stationId] ||
          pricing.discountedPrice.ND ||
          0;
        const duration = stationDurations[stationId] || 1;
        const mode =
          subscriptionModes.find((m) => m.value === duration) ||
          subscriptionModes[0];
        const stationTotal = basePrice * mode.multiplier * (1 - mode.discount);
        return total + stationTotal;
      }, 0);

      return Math.round(totalPrice);
    }

    return 0;
  }

  const loadRazorpayScript = useCallback(() => {
    return new Promise((resolve) => {
      if ((window as unknown as Record<string, unknown>).Razorpay)
        return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  useEffect(() => {
    const docRef = doc(db, "settings", "pricing");
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const merged = getMergedStations(
          data.newPropertyPrices || {},
          data.newPropertyStationNames || {}
        );
        setPricing({
          rentalResalePrice: data.rentalResalePrice || 2500,
          newPropertyPrices: data.newPropertyPrices || {},
          actualPrice: data.actualPrice || { RR: 12500, ND: 2000 },
          discountedPrice: data.discountedPrice || { RR: 2500, ND: 1500 },
        });

        // Set station pricing from admin settings
        if (data.newPropertyPricing) {
          setStationPricing(data.newPropertyPricing);
        }

        setMergedStationsList(merged);
      }
    });

    // Fetch duration discounts from additionalOff document
    const additionalOffRef = doc(db, "settings", "additionalOff");
    const unsubscribeAdditionalOff = onSnapshot(additionalOffRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.durationDiscounts) {
          setDurationDiscounts(data.durationDiscounts);
          setSubscriptionModes([
            { value: 1, label: "1 Month", multiplier: 1, discount: 0 },
            {
              value: 3,
              label: "3 Months",
              multiplier: 3,
              discount: data.durationDiscounts[3] / 100 || 0.1,
            },
            {
              value: 6,
              label: "6 Months",
              multiplier: 6,
              discount: data.durationDiscounts[6] / 100 || 0.2,
            },
            {
              value: 12,
              label: "1 Year",
              multiplier: 12,
              discount: data.durationDiscounts[12] / 100 || 0.4,
            },
          ]);
        }
      }
    });

    fetchAvailableStations();
    fetchCustomPackages();
    return () => {
      unsubscribe();
      unsubscribeAdditionalOff();
    };
  }, []);

  useEffect(() => {
    if (user?.subscriptions) {
      const activeLocations = new Set<string>();
      user.subscriptions.forEach((sub) => {
        if (sub.type === "ND" && sub.status === "active" && sub.locations) {
          sub.locations.forEach((loc) => activeLocations.add(loc));
        }
      });
      setSelectedNewStations(Array.from(activeLocations));
    }
  }, [user]);

  useEffect(() => {
    if (user?.subscriptions) {
      const now = new Date();
      const expiring = user.subscriptions.filter((sub: SubscriptionType) => {
        if (sub.status !== "active") return false;

        const endDate = toDate(sub.endDate);
        const diffDays = Math.ceil(
          (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        return diffDays <= 3 && diffDays > 0;
      });

      setExpiringSubscriptions(expiring);
    }
  }, [user]);

  useEffect(() => {
    // Only redirect to login if we're certain the user is not authenticated
    // and we're not in a loading state
    if (!loading && !user && !localStorage.getItem('justSignedUp')) {
      navigate("/login");
    }
    if (user) localStorage.removeItem("justSignedUp");
  }, [user, loading, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const plan = params.get("plan");
    if ((plan === "RR" || plan === "ND") && !selectedPlan) {
      setSelectedPlan(plan as PlanType);
      if (plan === "ND") setSelectedNewStations([]);
    }
  }, [location.search, selectedPlan]);

  // Auto-navigate back to station selection if no stations selected in checkout
  useEffect(() => {
    if (showCheckout && selectedNewStations.length === 0) {
      setShowCheckout(false);
    }
  }, [showCheckout, selectedNewStations.length]);

  const calculateNPTotals = () => {
    const actualTotal = selectedNewStations.reduce((total, stationId) => {
      // Get actual price from admin settings, fallback to default
      const adminPricing = stationPricing[stationId];
      const actualPrice = adminPricing?.actual || pricing.actualPrice.ND || 0;
      return total + actualPrice;
    }, 0);

    const discountedTotal = selectedNewStations.reduce((total, stationId) => {
      // Get offer price from admin settings, fallback to old pricing structure
      const adminPricing = stationPricing[stationId];
      const stationPrice =
        adminPricing?.offer ||
        pricing.newPropertyPrices[stationId] ||
        pricing.discountedPrice.ND ||
        0;
      return total + stationPrice;
    }, 0);

    return { actualTotal, discountedTotal };
  };

  const handleProceedToCheckout = async () => {
    if (!user || !selectedPlan) {
      toast.error("No authenticated user or plan not selected");
      return;
    }
    if (selectedPlan === "ND" && selectedNewStations.length === 0) {
      toast.error("Please select at least one location");
      return;
    }
    const razorpayLoaded = await loadRazorpayScript();
    if (!razorpayLoaded) {
      toast.error("Failed to load payment gateway. Are you online?");
      return;
    }
    setIsProcessing(true);
    try {
      if (selectedPlan === "ND") {
        // Create individual subscriptions for each station with their respective durations
        const subscriptionPromises = selectedNewStations.map(
          async (stationId) => {
            const station = ndMergedStationsList.find(
              (s) => s.id === stationId
            );
            if (!station) return null;

            const adminPricing = stationPricing[stationId];
            const basePrice =
              adminPricing?.offer ||
              pricing.newPropertyPrices[stationId] ||
              pricing.discountedPrice.ND;
            const duration = stationDurations[stationId] || 1;
            const mode = subscriptionModes.find((m) => m.value === duration);
            const totalPrice =
              basePrice * (mode?.multiplier || 1) * (1 - (mode?.discount || 0));
            const actualPrice =
              (adminPricing?.actual || pricing.actualPrice.ND) *
              (mode?.multiplier || 1);

            const now = new Date();
            const endDate = new Date(now);
            endDate.setMonth(now.getMonth() + duration);

            const subscriptionLocations = [
              `${station.name} East`,
              `${station.name} West`,
            ];

            const newSubscription = {
              userId: user.id,
              type: "ND" as const,
              locations: subscriptionLocations,
              amount: Math.round(totalPrice),
              actualPrice: Math.round(actualPrice),
              discountedPrice: Math.round(totalPrice),
              startDate: Timestamp.fromDate(now),
              endDate: Timestamp.fromDate(endDate),
              createdAt: Timestamp.fromDate(now),
              subscriptions: [],
              stationId: stationId,
              duration: duration,
            };

            return createSubscription(user.id, newSubscription);
          }
        );

        const subscriptionIds = await Promise.all(subscriptionPromises);
        const validSubscriptionIds = subscriptionIds.filter(
          (id) => id !== null
        );

        // Calculate total amount for payment
        const totalAmount = selectedNewStations.reduce((total, stationId) => {
          const adminPricing = stationPricing[stationId];
          const basePrice =
            adminPricing?.offer ||
            pricing.newPropertyPrices[stationId] ||
            pricing.discountedPrice.ND;
          const duration = stationDurations[stationId] || 1;
          const mode = subscriptionModes.find((m) => m.value === duration);
          const stationTotal =
            basePrice * (mode?.multiplier || 1) * (1 - (mode?.discount || 0));
          return total + Math.round(stationTotal);
        }, 0);

        // Create a single payment record for all subscriptions
        const paymentId = await createPaymentRecord(user.id, {
          userId: user.id,
          amount: totalAmount,
          currency: "INR",
          subscriptionId: validSubscriptionIds[0], // Use first subscription ID as reference
          paymentMethod: "razorpay",
        });

        const options = {
          key: "rzp_test_lRCdq1wZYplq4w",
          // key: "rzp_live_xhqYnqDIm32BfA",
          amount: totalAmount * 100,
          currency: "INR",
          name: "EstateX",
          description: "New Properties Subscription",
          handler: async (response: Record<string, unknown>) => {
            try {
              // Complete payment for all subscriptions
              await Promise.all(
                validSubscriptionIds.map((subscriptionId) =>
                  completeSubscriptionPayment(
                    user.id,
                    subscriptionId,
                    paymentId,
                    (response as unknown as { razorpay_payment_id: string })
                      .razorpay_payment_id
                  )
                )
              );
              await reloadUser();
              toast.success("Payment successful! Subscriptions activated.");
              setSelectedPlan(null);
              setSelectedNewStations([]);
              setStationDurations({});
              setShowCheckout(false);
              navigate("/dashboard");
            } catch (error) {
              
              toast.error("Payment processing failed. Please contact support.");
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
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      toast.error("Failed to process subscription");
      
      setIsProcessing(false);
    }
  };

  const renderExpiringCard = () => {
    if (expiringSubscriptions.length === 0) return null;

    const reminders: { location: string; days: number }[] = [];
    const now = new Date();

    expiringSubscriptions.forEach((sub) => {
      if (sub.type === "ND" && sub.status === "active" && sub.locations) {
        const endDate = toDate(sub.endDate);
        const diffDays = Math.ceil(
          (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays > 0 && diffDays <= 3) {
          sub.locations.forEach((loc) => {
            reminders.push({
              location:
                mergedStationsList.find((s) => s.id === loc)?.name || loc,
              days: diffDays,
            });
          });
        }
      }
    });

    if (reminders.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 max-w-2xl mx-auto bg-gradient-to-r from-[#B85817] to-[#d97e3d] text-white px-6 py-4 rounded-xl shadow-lg"
      >
        <div className="flex flex-col">
          <div className="flex items-center mb-2">
            <Clock className="h-5 w-5 mr-2" />
            <strong className="font-bold text-lg">
              Subscription Expiring Soon!
            </strong>
          </div>

          {reminders.map((reminder, index) => (
            <div key={index} className="mb-2 last:mb-0">
              <p className="text-white/90">
                Your subscription for{" "}
                <span className="font-semibold">{reminder.location}</span> ends
                in {reminder.days} day{reminder.days > 1 ? "s" : ""}
              </p>
            </div>
          ))}

          <button
            onClick={() => {
              const npSub = expiringSubscriptions.find(
                (sub) => sub.type === "ND"
              );
              if (npSub) {
                setSelectedPlan("ND");
                setSelectedNewStations(npSub.locations || []);
                window.scrollTo(0, 0);
              }
            }}
            className="mt-3 self-start bg-white text-[#B85817] font-bold py-2 px-6 rounded-lg hover:bg-gray-100 transition-all shadow-md"
          >
            Renew Now
          </button>
        </div>
      </motion.div>
    );
  };

  const renderPlanCard = (plan: "RR" | "ND" | "SP" | "Enterprise") => {
    const isRR = plan === "RR";
    const isND = plan === "ND";
    const isSpecial = plan === "SP";
    const isEnterprise = plan === "Enterprise";
    const isSelected = selectedPlan === plan && !isSpecial && !isEnterprise;
    // Get lowest price for ND from available stations
    const getLowestNDPrice = () => {
      if (ndMergedStationsList.length === 0) return pricing.discountedPrice.ND;
      const prices = ndMergedStationsList.map((station) => {
        const adminPricing = stationPricing[station.id];
        return (
          adminPricing?.offer ||
          pricing.newPropertyPrices[station.id] ||
          pricing.discountedPrice.ND
        );
      });
      return Math.min(...prices);
    };

    const actualPrice = isSpecial || isEnterprise
      ? 0
      : plan === "RR"
      ? pricing.actualPrice.RR
      : pricing.actualPrice.ND;
    const discountedPrice = isSpecial || isEnterprise
      ? 0
      : plan === "RR"
      ? pricing.discountedPrice.RR
      : getLowestNDPrice();
    const savedPrice = actualPrice - discountedPrice;
    const savePercent =
      actualPrice > 0 ? Math.round((savedPrice / actualPrice) * 100) : 0;

    let hasActiveSubscription = false;
    if (user?.subscriptions) {
      if (plan === "ND") {
        const activeNDLocations = new Set<string>();
        user.subscriptions.forEach((sub) => {
          if (sub.type === "ND" && sub.status === "active" && sub.locations) {
            sub.locations.forEach((loc) => activeNDLocations.add(loc));
          }
        });
        hasActiveSubscription = stations.every((station) =>
          activeNDLocations.has(station.id)
        );
      } else if (plan === "RR") {
        hasActiveSubscription = user.subscriptions.some(
          (sub) => sub.type === plan && sub.status === "active"
        );
      }
    }

    return (
      <motion.div
        whileHover={{
          scale: hasActiveSubscription || isSpecial || isEnterprise ? 1 : 1.02,
        }}
        className="h-full"
      >
        <Card
          className={`h-full transition-all duration-300 relative overflow-hidden rounded-lg ${
            isSpecial || isEnterprise
              ? "border-2 border-dashed border-gray-300 bg-gray-50 opacity-75"
              : isSelected
              ? "border-2 border-[#193867] shadow-lg bg-white"
              : "border border-gray-200 hover:border-gray-300 hover:shadow-md bg-white"
          } ${hasActiveSubscription ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isSpecial && (
            <div className="absolute top-4 right-4 bg-gray-600 text-white px-2 py-1 rounded text-xs font-semibold">
              Customizable
            </div>
          )}
          {isEnterprise && (
            <div className="absolute top-4 right-4 bg-gray-600 text-white px-2 py-1 rounded text-xs font-semibold">
              Coming Soon
            </div>
          )}

          <div className="flex flex-col h-full p-6">
            <div className="mb-6">
              {!isSpecial && !isEnterprise && (
                <div className="flex items-center gap-2 mb-3">
                  {isRR && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                      Most Popular
                    </span>
                  )}
                  {isND && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                      Flexible
                    </span>
                  )}
                </div>
              )}

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {isRR
                  ? "Rental & Resale"
                  : isND
                  ? "New Developments"
                  : isSpecial
                  ? "Special Package"
                  : "Enterprise"}
              </h3>

              <p className="text-gray-600 text-sm leading-relaxed">
                {isRR
                  ? "Complete access to rental and resale properties across all Western line stations"
                  : isND
                  ? "Selective access to new development projects with custom duration options"
                  : isSpecial
                  ? "Tailored access plans with custom stations, durations, and support for unique business needs"
                  : "Custom solutions for large teams and organizations with advanced features"}
              </p>
            </div>

            <div className="mb-6">
              {!isSpecial && !isEnterprise ? (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  {isND ? (
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                        Starting from
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        ₹{discountedPrice?.toLocaleString() || "0"}
                      </div>
                      <div className="text-sm text-gray-600">per month</div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-gray-900">
                        ₹{discountedPrice?.toLocaleString() || "0"}
                      </div>
                      <div className="text-sm text-gray-600">per year</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-gray-500">
                      Custom
                    </div>
                    <div className="text-sm text-gray-500">pricing</div>
                  </div>
                </div>
              )}

              {!isSpecial && !isEnterprise && savedPrice > 0 && (
                <div className="mt-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                    Save {savePercent}% (₹{savedPrice.toLocaleString()})
                  </span>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                What's Included:
              </h3>
              {isSpecial ? (
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <div className="bg-gray-200 p-1 rounded-full mr-3 mt-0.5 flex-shrink-0">
                      <Check className="h-4 w-4 text-gray-600" />
                    </div>
                    <span>Custom packages tailored to your team needs</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-gray-200 p-1 rounded-full mr-3 mt-0.5 flex-shrink-0">
                      <Check className="h-4 w-4 text-gray-600" />
                    </div>
                    <span>Flexible station bundles and durations</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-gray-200 p-1 rounded-full mr-3 mt-0.5 flex-shrink-0">
                      <Check className="h-4 w-4 text-gray-600" />
                    </div>
                    <span>Dedicated onboarding and priority support</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-gray-200 p-1 rounded-full mr-3 mt-0.5 flex-shrink-0">
                      <Check className="h-4 w-4 text-gray-600" />
                    </div>
                    <span>Real-time pricing from admin configured packages</span>
                  </li>
                </ul>
              ) : isEnterprise ? (
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <div className="bg-gray-200 p-1 rounded-full mr-3 mt-0.5 flex-shrink-0">
                      <Check className="h-4 w-4 text-gray-600" />
                    </div>
                    <span>Custom coverage across selected locations</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-gray-200 p-1 rounded-full mr-3 mt-0.5 flex-shrink-0">
                      <Check className="h-4 w-4 text-gray-600" />
                    </div>
                    <span>Team management and advanced controls</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-gray-200 p-1 rounded-full mr-3 mt-0.5 flex-shrink-0">
                      <Check className="h-4 w-4 text-gray-600" />
                    </div>
                    <span>Dedicated onboarding and priority support</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-gray-200 p-1 rounded-full mr-3 mt-0.5 flex-shrink-0">
                      <Check className="h-4 w-4 text-gray-600" />
                    </div>
                    <span>Custom pricing with SLA options</span>
                  </li>
                </ul>
              ) : (
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <div className="bg-gray-200 p-1 rounded-full mr-3 mt-0.5 flex-shrink-0">
                      <Check className="h-4 w-4 text-gray-600" />
                    </div>
                    <span>
                      Access to{" "}
                      <span className="font-semibold text-gray-900">
                        All {getDynamicStationCount(plan)} Stations
                      </span>{" "}
                      from Virar to Churchgate
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-gray-200 p-1 rounded-full mr-3 mt-0.5 flex-shrink-0">
                      <Check className="h-4 w-4 text-gray-600" />
                    </div>
                    <span>
                      {isRR
                        ? "1 year full access"
                        : "1 month access per location"}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-gray-200 p-1 rounded-full mr-3 mt-0.5 flex-shrink-0">
                      <Check className="h-4 w-4 text-gray-600" />
                    </div>
                    <span>Includes both East & West areas</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-gray-200 p-1 rounded-full mr-3 mt-0.5 flex-shrink-0">
                      <Check className="h-4 w-4 text-gray-600" />
                    </div>
                    <span>Premium support and analytics</span>
                  </li>
                </ul>
              )}
            </div>

            <div className="mt-auto">
              {isRR && savedPrice > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      <span className="line-through">
                        ₹{actualPrice?.toLocaleString()}
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                        BEST VALUE
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                        Save ₹{savedPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                variant={isSelected ? "primary" : "secondary"}
                fullWidth
                className={`text-base font-semibold py-3 rounded-lg transition-all duration-200 shadow-sm ${
                  hasActiveSubscription
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : isSelected
                    ? "bg-blue-800 hover:bg-blue-900 text-white shadow-md"
                    : isRR || isSpecial
                    ? "bg-blue-800 hover:bg-blue-900 text-white hover:shadow-md"
                    : isEnterprise
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-800 hover:bg-blue-900 text-white hover:shadow-md"
                }`}
                onClick={async (e) => {
                  e.stopPropagation();
                  if (hasActiveSubscription) return;
                  if (isEnterprise) return;
                  if (isSpecial) {
                    navigate("/subscription/custom-packages");
                    return;
                  }

                  if (plan === "RR") {
                    // Direct payment for RR plan
                    if (!user) {
                      toast.error("No authenticated user");
                      return;
                    }

                    const razorpayLoaded = await loadRazorpayScript();
                    if (!razorpayLoaded) {
                      toast.error(
                        "Failed to load payment gateway. Are you online?"
                      );
                      return;
                    }

                    setIsProcessing(true);

                    try {
                      const now = new Date();
                      const endDate = new Date(now);
                      endDate.setMonth(now.getMonth() + 12); // Fixed 12 months for RR

                      const subscriptionLocations = stations.flatMap(
                        (station) => [
                          `${station.name} East`,
                          `${station.name} West`,
                        ]
                      );

                      const newSubscription = {
                        userId: user.id,
                        type: "RR" as const,
                        locations: subscriptionLocations,
                        amount: pricing.discountedPrice.RR,
                        actualPrice: pricing.actualPrice.RR,
                        discountedPrice: pricing.discountedPrice.RR,
                        startDate: Timestamp.fromDate(now),
                        endDate: Timestamp.fromDate(endDate),
                        createdAt: Timestamp.fromDate(now),
                        subscriptions: [],
                      };

                      const subscriptionId = await createSubscription(
                        user.id,
                        newSubscription
                      );
                      const paymentId = await createPaymentRecord(user.id, {
                        userId: user.id,
                        amount: pricing.discountedPrice.RR,
                        currency: "INR",
                        subscriptionId,
                        paymentMethod: "razorpay",
                      });

                      const options = {
                        key: "rzp_test_lRCdq1wZYplq4w",
                        // key: "rzp_live_xhqYnqDIm32BfA",
                        amount: pricing.discountedPrice.RR * 100,
                        currency: "INR",
                        name: "EstateX",
                        description: "Rental & Resale Subscription",
                        handler: async (response: Record<string, unknown>) => {
                          try {
                            await completeSubscriptionPayment(
                              user.id,
                              subscriptionId,
                              paymentId,
                              (
                                response as unknown as {
                                  razorpay_payment_id: string;
                                }
                              ).razorpay_payment_id
                            );
                            await reloadUser();
                            toast.success(
                              "Payment successful! Subscription activated."
                            );
                            navigate("/dashboard");
                          } catch (error) {
                            
                            toast.error(
                              "Payment processing failed. Please contact support."
                            );
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

                      const rzp = new window.Razorpay(options);
                      rzp.open();
                    } catch (error) {
                      toast.error("Failed to process subscription");
                      
                      setIsProcessing(false);
                    }
                  } else {
                    setSelectedPlan(plan);
                    if (plan === "ND") setSelectedNewStations([]);
                  }
                }}
                disabled={
                  hasActiveSubscription ||
                  (plan === "RR" && isProcessing) ||
                  isEnterprise
                }
              >
                {hasActiveSubscription
                  ? "✓ Active Subscription"
                  : plan === "RR" && isProcessing
                  ? "Processing Payment..."
                  : isSelected
                  ? "✓ Plan Selected"
                  : isSpecial
                  ? "Get Customize Offer"
                  : isEnterprise
                  ? "Coming Soon"
                  : plan === "ND"
                  ? "Select Plan"
                  : "Get Started"}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-[#193867] rounded-full mb-4"></div>
          <div className="h-4 bg-[#19386720] rounded w-48 mb-2"></div>
          <div className="h-4 bg-[#19386720] rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#19386710] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {renderExpiringCard()}

        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="inline-block bg-gradient-to-r from-[#193867] to-[#2a4a7f] p-2 rounded-xl shadow-lg mb-4">
              <Building className="h-8 w-8 text-white" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-3 text-2xl font-bold text-[#193867]"
          >
            Property Access Plans
          </motion.h1>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-base text-[#193867] max-w-xl mx-auto"
          >
            Choose the perfect plan to unlock premium property listings along
            the Western line
          </motion.p>
        </div>

        {/* Free Trial Banner */}
        {isFreeTrialActive() && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 max-w-4xl mx-auto relative overflow-hidden"
          >
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-emerald-500/10"></div>
              <div className="relative px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-emerald-400 text-sm font-medium uppercase tracking-wider">Free Trial Active</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      You've got free trial till 30th November 2025
                    </h3>
                    <p className="text-slate-300 text-sm">
                      Enjoy full access to all premium features during the trial period
                    </p>
                  </div>
                  <div className="ml-6">
                    <Button
                      onClick={activateFreeTrial}
                      disabled={isProcessing || user?.freeTrialActivated}
                      className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                        user?.freeTrialActivated 
                          ? 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600' 
                          : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg hover:shadow-emerald-500/25 border border-emerald-400/20'
                      }`}
                    >
                      {isProcessing ? 'Activating...' : user?.freeTrialActivated ? 'Activated' : 'Activate'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {!selectedPlan ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <div className={isFreeTrialActive() ? 'opacity-50 pointer-events-none' : ''}>
                {renderPlanCard("RR")}
              </div>
              <div className={isFreeTrialActive() ? 'opacity-50 pointer-events-none' : ''}>
                {renderPlanCard("ND")}
              </div>
              <div className={isFreeTrialActive() ? 'opacity-50 pointer-events-none' : ''}>
                {renderPlanCard("SP")}
              </div>
              <div className={isFreeTrialActive() ? 'opacity-50 pointer-events-none' : ''}>
                {renderPlanCard("Enterprise")}
              </div>
            </motion.div>

            {customPackages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Custom Packages
                    </h2>
                  </div>
                  <p className="text-gray-600">
                    Tailored packages created specifically for your needs
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customPackages.map((pkg) => (
                    <motion.div
                      key={pkg.id}
                      whileHover={{ scale: 1.02 }}
                      className="h-full"
                    >
                      <Card className="h-full border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg transition-all">
                        <div className="flex flex-col h-full p-6">
                          <div className="mb-4">
                            <div className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                              Custom Package
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {pkg.name}
                            </h3>
                            <p className="text-gray-600 text-sm">{pkg.description}</p>
                          </div>

                          <div className="bg-white rounded-lg p-4 mb-4">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Actual Price:</span>
                                <span className="font-semibold line-through text-gray-500">
                                  ₹{pkg.actualPrice.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Offer Price:</span>
                                <span className="font-bold text-green-600 text-lg">
                                  ₹{pkg.offerPrice.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Discount:</span>
                                <span className="font-semibold text-green-600">
                                  {Math.round(
                                    ((pkg.actualPrice - pkg.offerPrice) /
                                      pkg.actualPrice) *
                                      100
                                  )}
                                  %
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">
                              Locations:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {pkg.locations.slice(0, 3).map((loc: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs"
                                >
                                  {loc}
                                </span>
                              ))}
                              {pkg.locations.length > 3 && (
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                  +{pkg.locations.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-auto">
                            <Button
                              variant="primary"
                              fullWidth
                              onClick={() => {
                                navigate("/subscription/custom-checkout", {
                                  state: { customPackage: pkg },
                                });
                              }}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              Select Package
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <button
                onClick={() => setSelectedPlan(null)}
                className="flex items-center text-[#193867] hover:text-[#152b5f] mr-4"
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back to plans
              </button>
              <h2 className="text-2xl font-bold text-[#193867]">
                {selectedPlan === "RR"
                  ? "Rental & Resale Subscription"
                  : "New Properties Subscription"}
              </h2>
            </div>

            {selectedPlan === "ND" && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-[#193867]">
                    Select Stations ({selectedNewStations.length} selected)
                  </label>
                  <button
                    onClick={() => setSelectedNewStations([])}
                    className="text-sm text-[#B85817] hover:text-[#a34d14]"
                  >
                    Clear All
                  </button>
                </div>

                {!showCheckout ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {memoizedNDStationsList.length > 0 ? memoizedNDStationsList.map((station) => {
                        const isSelected = selectedNewStations.includes(
                          station.id
                        );
                        const adminPricing = stationPricing[station.id];
                        const price =
                          adminPricing?.offer ||
                          pricing.newPropertyPrices[station.id] ||
                          pricing.discountedPrice.ND;
                        const actualPrice = adminPricing?.actual;
                        const hasDiscount = actualPrice && actualPrice > price;

                        return (
                          <motion.div
                            key={station.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`cursor-pointer border-2 rounded-md p-3 transition-all ${
                              isSelected
                                ? "border-[#B85817] bg-[#B8581710]"
                                : "border-[#19386720] bg-white hover:border-[#19386740]"
                            }`}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedNewStations((prev) =>
                                  prev.filter((id) => id !== station.id)
                                );
                              } else {
                                setSelectedNewStations((prev) => [
                                  ...prev,
                                  station.id,
                                ]);
                              }
                            }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-[#193867] text-sm">
                                {station.name}
                              </h3>
                              <div
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  isSelected
                                    ? "bg-[#B85817] border-[#B85817]"
                                    : "border-[#19386740]"
                                }`}
                              >
                                {isSelected && (
                                  <Check className="h-2.5 w-2.5 text-white" />
                                )}
                              </div>
                            </div>
                            <div className="space-y-1">
                              {hasDiscount && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-[#19386780]">
                                    Original:
                                  </span>
                                  <span className="text-xs text-[#19386780] line-through">
                                    ₹{actualPrice?.toLocaleString("en-IN")}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-[#193867] font-medium">
                                  {hasDiscount ? "Offer Price:" : "Price:"}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-[#B85817]">
                                    ₹{price?.toLocaleString("en-IN")}
                                  </span>
                                  {hasDiscount && (
                                    <span className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
                                      {Math.round(
                                        ((actualPrice! - price) /
                                          actualPrice!) *
                                          100
                                      )}
                                      % OFF
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="mt-2 text-xs text-[#B85817] font-medium">
                                ✓ Selected
                              </div>
                            )}
                          </motion.div>
                        );
                      }) : (
                        <div className="col-span-full text-center py-8 text-[#19386780]">
                          <Building className="h-12 w-12 mx-auto mb-3 text-[#19386740]" />
                          <p>Loading stations...</p>
                        </div>
                      )}
                    </div>

                    {selectedNewStations.length === 0 && (
                      <div className="text-center py-8 text-[#19386780]">
                        <Building className="h-12 w-12 mx-auto mb-3 text-[#19386740]" />
                        <p>Select at least one station to continue</p>
                      </div>
                    )}

                    <div className="flex justify-center mt-8">
                      <Button
                        onClick={() => {
                          if (selectedNewStations.length === 0) {
                            toast.error("Please select at least one station");
                            return;
                          }
                          const initialDurations: {
                            [key: string]: 1 | 3 | 6 | 12;
                          } = {};
                          selectedNewStations.forEach((stationId) => {
                            initialDurations[stationId] = 1;
                          });
                          setStationDurations(initialDurations);
                          setShowCheckout(true);
                        }}
                        disabled={selectedNewStations.length === 0}
                        className="bg-[#B85817] hover:bg-[#a34d14] text-white px-8 py-3 text-lg font-semibold rounded-xl"
                      >
                        Proceed to Payment
                      </Button>
                    </div>
                  </>
                ) : (
                  selectedNewStations.length > 0 && (
                    <div className="mt-8">
                      {/* Header */}
                      <div className="mb-8">
                        <button
                          onClick={() => setShowCheckout(false)}
                          className="flex items-center text-[#193867] hover:text-[#152b5f] mb-4 transition-colors"
                        >
                          <ChevronLeft className="h-5 w-5 mr-1" />
                          Back to station selection
                        </button>
                        <h1 className="text-2xl font-bold text-[#193867] mb-1.5">
                          Checkout
                        </h1>
                        <p className="text-gray-600 text-sm">
                          Review and complete your subscription
                        </p>
                      </div>

                      {/* Main Layout - Left Content + Right Sidebar */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Content - Station Details */}
                        <div className="lg:col-span-2 space-y-4">
                          <div className="bg-white border border-gray-200 rounded-lg">
                            <div className="p-6 border-b border-gray-200">
                              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                                New Properties Subscription
                              </h2>
                              <p className="text-gray-600 text-sm">
                                Access to premium property listings in selected
                                stations
                              </p>
                            </div>

                            <div className="divide-y divide-gray-200">
                              {selectedNewStations.map((stationId) => {
                                const station = memoizedNDStationsList.find(
                                  (s) => s.id === stationId
                                );
                                if (!station) return null;

                                const adminPricing = stationPricing[stationId];
                                const offerPrice =
                                  adminPricing?.offer ||
                                  pricing.newPropertyPrices[stationId] ||
                                  pricing.discountedPrice.ND;
                                const actualPrice =
                                  adminPricing?.actual ||
                                  pricing.actualPrice.ND;
                                const currentDuration =
                                  stationDurations[stationId] || 1;
                                const mode =
                                  subscriptionModes.find(
                                    (m) => m.value === currentDuration
                                  ) || subscriptionModes[0];

                                const finalActualPrice =
                                  actualPrice * mode.multiplier;

                                // Calculate total discount percentage: base discount + duration discount
                                const baseDiscountPercent =
                                  actualPrice > 0
                                    ? ((actualPrice - offerPrice) /
                                        actualPrice) *
                                      100
                                    : 0;
                                const durationDiscountPercent =
                                  mode.discount * 100;
                                const totalDiscountPercent = Math.round(
                                  baseDiscountPercent + durationDiscountPercent
                                );

                                // Apply total discount to actual price to get final offer price
                                const finalOfferPrice =
                                  finalActualPrice *
                                  (1 - totalDiscountPercent / 100);

                                const now = new Date();
                                const renewDate = new Date(now);
                                renewDate.setMonth(
                                  now.getMonth() + currentDuration
                                );

                                return (
                                  <div key={stationId} className="p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <h3 className="text-base font-semibold text-gray-900">
                                        {station.name} - Location Access
                                      </h3>
                                      <button
                                        onClick={() => {
                                          setSelectedNewStations((prev) =>
                                            prev.filter(
                                              (id) => id !== stationId
                                            )
                                          );
                                          setStationDurations((prev) => {
                                            const newDurations = { ...prev };
                                            delete newDurations[stationId];
                                            return newDurations;
                                          });
                                        }}
                                        className="text-gray-400 hover:text-red-500 p-1"
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <select
                                        value={currentDuration}
                                        onChange={(e) => {
                                          setStationDurations((prev) => ({
                                            ...prev,
                                            [stationId]: parseInt(
                                              e.target.value
                                            ) as 1 | 3 | 6 | 12,
                                          }));
                                        }}
                                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#193867]"
                                      >
                                        {subscriptionModes.map((mode) => (
                                          <option
                                            key={mode.value}
                                            value={mode.value}
                                          >
                                            {mode.label}
                                          </option>
                                        ))}
                                      </select>

                                      <div className="text-right">
                                        <div className="text-lg font-bold text-[#193867]">
                                          ₹
                                          {Math.round(
                                            finalOfferPrice
                                          ).toLocaleString()}
                                        </div>
                                        <div className="text-xs text-gray-500 line-through">
                                          ₹
                                          {Math.round(
                                            finalActualPrice
                                          ).toLocaleString()}
                                        </div>
                                        {totalDiscountPercent > 0 && (
                                          <div className="text-xs font-semibold text-green-600">
                                            {totalDiscountPercent}% off
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="text-xs text-gray-600 mt-2">
                                      Renewal on{" "}
                                      {renewDate.toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      })}{" "}
                                      for ₹
                                      {Math.round(
                                        finalOfferPrice
                                      ).toLocaleString()}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Right Sidebar - Order Summary */}
                        <div className="lg:col-span-1">
                          <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-3">
                              Order Summary
                            </h3>

                            <div className="space-y-2 mb-4">
                              {selectedNewStations.map((stationId) => {
                                const station = memoizedNDStationsList.find(
                                  (s) => s.id === stationId
                                );
                                if (!station) return null;

                                const adminPricing = stationPricing[stationId];
                                const offerPrice =
                                  adminPricing?.offer ||
                                  pricing.newPropertyPrices[stationId] ||
                                  pricing.discountedPrice.ND;
                                const actualPrice =
                                  adminPricing?.actual ||
                                  pricing.actualPrice.ND;
                                const currentDuration =
                                  stationDurations[stationId] || 1;
                                const mode =
                                  subscriptionModes.find(
                                    (m) => m.value === currentDuration
                                  ) || subscriptionModes[0];

                                const finalActualPrice =
                                  actualPrice * mode.multiplier;
                                const baseDiscountPercent =
                                  actualPrice > 0
                                    ? ((actualPrice - offerPrice) /
                                        actualPrice) *
                                      100
                                    : 0;
                                const durationDiscountPercent =
                                  mode.discount * 100;
                                const totalDiscountPercent = Math.round(
                                  baseDiscountPercent + durationDiscountPercent
                                );
                                const finalOfferPrice =
                                  finalActualPrice *
                                  (1 - totalDiscountPercent / 100);

                                return (
                                  <div
                                    key={stationId}
                                    className="flex justify-between items-start text-sm"
                                  >
                                    <div>
                                      <div className="font-medium text-gray-900">
                                        {station.name}
                                      </div>
                                      <div className="text-gray-500">
                                        {mode.label}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-semibold text-gray-900">
                                        ₹
                                        {Math.round(
                                          finalOfferPrice
                                        ).toLocaleString()}
                                      </div>
                                      {totalDiscountPercent > 0 && (
                                        <div className="text-gray-500 line-through text-xs">
                                          ₹
                                          {Math.round(
                                            finalActualPrice
                                          ).toLocaleString()}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="border-t border-gray-200 pt-3 mb-4">
                              <div className="flex justify-between items-center text-base font-semibold">
                                <span>Total</span>
                                <span className="text-[#193867]">
                                  ₹{getDynamicPrice("ND").toLocaleString()}
                                </span>
                              </div>
                            </div>

                            <Button
                              onClick={handleProceedToCheckout}
                              disabled={isProcessing}
                              className="w-full bg-[#193867] hover:bg-[#152b5f] text-white py-3 text-lg font-semibold rounded-lg transition-colors"
                            >
                              {isProcessing
                                ? "Processing..."
                                : "Complete Order"}
                            </Button>

                            <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                              <Shield className="h-4 w-4 mr-2" />
                              <span>Secure checkout</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="bg-gradient-to-r from-[#193867] to-[#2a4a7f] rounded-2xl shadow-xl p-8 text-white mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">
            Subscription Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
              <div className="w-12 h-12 bg-[#B85817] rounded-full flex items-center justify-center mb-4">
                <Building className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Exclusive Access</h3>
              <p>
                Get first access to new property listings before they hit the
                public market
              </p>
            </div>

            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
              <div className="w-12 h-12 bg-[#B85817] rounded-full flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Premium Features</h3>
              <p>
                Unlock advanced search filters, market analytics, and
                personalized alerts
              </p>
            </div>

            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
              <div className="w-12 h-12 bg-[#B85817] rounded-full flex items-center justify-center mb-4">
                <Check className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Platform</h3>
              <p>
                All transactions are protected with bank-level security and
                encryption
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-[#193867]">
            What Our Subscribers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border-l-4 border-[#193867] pl-4">
              <p className="text-[#193867] italic mb-4">
                "The full corridor access helped me find the perfect rental
                property in Bandra within my budget. The subscription paid for
                itself in just one deal!"
              </p>
              <div className="flex items-center">
                <div className="bg-[#19386720] border-2 border-dashed rounded-xl w-16 h-16" />
                <div className="ml-4">
                  <h4 className="font-bold text-[#193867]">Rajesh Mehta</h4>
                  <p className="text-[#19386780]">Property Investor</p>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-[#B85817] pl-4">
              <p className="text-[#193867] italic mb-4">
                "As a real estate agent, the new property subscription gives me
                an edge. I get notified about new developments before my
                competitors, helping me serve clients better."
              </p>
              <div className="flex items-center">
                <div className="bg-[#19386720] border-2 border-dashed rounded-xl w-16 h-16" />
                <div className="ml-4">
                  <h4 className="font-bold text-[#193867]">Priya Sharma</h4>
                  <p className="text-[#19386780]">Real Estate Agent</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="bg-gradient-to-br from-[#19386710] to-[#19386705] rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-[#193867]">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6 text-[#193867]">
            <div>
              <h3 className="text-base font-bold mb-1.5">
                What property categories does EstateX cover?
              </h3>
              <p className="text-sm">
                EstateX provides comprehensive access to{" "}
                <span className="font-semibold">Residential</span> properties
                (rental & resale),{" "}
                <span className="font-semibold">New Developments</span>{" "}
                (upcoming projects), and upcoming categories including{" "}
                <span className="font-semibold">Commercial</span>,{" "}
                <span className="font-semibold">Shops</span>, and{" "}
                <span className="font-semibold">Plots</span> across the Western
                Railway line from Virar to Churchgate.
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold mb-1.5">
                How does the subscription system work?
              </h3>
              <p className="text-sm">
                <span className="font-semibold">Rental & Resale</span>{" "}
                subscription provides 1-year access to all stations with
                residential properties.{" "}
                <span className="font-semibold">New Properties</span>{" "}
                subscription offers flexible monthly access to selected stations
                for new development projects. You'll receive renewal
                notifications 3 days before expiration.
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold mb-1.5">
                What advanced features are included?
              </h3>
              <p className="text-sm">
                EstateX includes dynamic filtering by property type, location,
                budget, possession date, amenities, and more. Advanced features
                include property comparison tools, WhatsApp sharing, cost sheet
                analysis, and real-time market data across all subscribed
                locations.
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold mb-1.5">
                How secure are payments and data?
              </h3>
              <p className="text-sm">
                All payments are processed through Razorpay's secure
                PCI-compliant gateway supporting credit/debit cards, UPI, and
                net banking. Your property data and personal information are
                protected with bank-level encryption and security protocols.
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold mb-1.5">
                Can I manage multiple property types in one platform?
              </h3>
              <p className="text-sm">
                Yes! EstateX is designed as a comprehensive property management
                platform. You can access residential rentals, resales, new
                developments, and upcoming commercial properties all from a
                single dashboard with unified search and comparison tools.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Subscription;
