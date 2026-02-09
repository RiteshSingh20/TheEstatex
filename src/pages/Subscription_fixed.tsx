import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Building, Check, Clock, Zap, ChevronLeft, Shield } from "lucide-react";
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
import { onSnapshot, doc, collection, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../utils/firebase";

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

type SpecialPackageCategory = "resaleRental" | "newProperty";

interface SpecialPackage {
  id: string;
  name: string;
  category: SpecialPackageCategory;
  stations: string[];
  actual: number;
  offer: number;
  createdAt?: string;
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
  const [showSpecialPackages, setShowSpecialPackages] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [specialPackages, setSpecialPackages] = useState<SpecialPackage[]>([]);
  const [selectedSpecialPackageId, setSelectedSpecialPackageId] = useState<
    string | null
  >(null);
  const [durationDiscounts, setDurationDiscounts] = useState<{
    3: number;
    6: number;
    12: number;
  }>({ 3: 10, 6: 20, 12: 40 });

  // Rest of the component code remains the same...
  // (Copy the rest from the original file)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#19386710] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Component JSX */}
      </div>
    </div>
  );
};

export default Subscription;
