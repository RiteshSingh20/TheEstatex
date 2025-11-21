// src\pages\SubscriptionCheckout.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, CreditCard, Shield, XCircle } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useAuth } from "../utils/authContext";
import { formatCurrency } from "../utils/helper";
import toast from "react-hot-toast";
import {
  createPaymentRecord,
  completeSubscriptionPayment,
} from "../utils/firestoreListings";
import { motion } from "framer-motion";

const SubscriptionCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, reloadUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "success" | "failed"
  >("pending");
  const [subscription, setSubscription] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  useEffect(() => {
    if (!location.state?.subscription || !location.state?.subscriptionId) {
      toast.error("Missing subscription information");
      navigate("/subscription");
      return;
    }

    setSubscription(location.state.subscription);
    setSubscriptionId(location.state.subscriptionId);
  }, [location, navigate]);

  if (!subscription || !subscriptionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
          <p>Loading subscription details...</p>
        </div>
      </div>
    );
  }

  const { actualPrice, discountedPrice } = subscription;
  const savedAmount = actualPrice - discountedPrice;

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error("You need to be logged in to complete payment");
      navigate("/login");
      return;
    }

    const res = await loadRazorpayScript();

    if (!res) {
      toast.error("Failed to load Razorpay SDK. Are you online?");
      return;
    }

    setIsProcessing(true);

    // Create payment record before opening Razorpay checkout
    const paymentData = {
      userId: user.id,
      amount: discountedPrice,
      currency: "INR",
      subscriptionId: subscriptionId,
      paymentMethod: "razorpay",
    };

    let paymentId = null;

    try {
      paymentId = await createPaymentRecord(user.id, paymentData);
    } catch (error) {
      toast.error("Failed to create payment record. Please try again.");
      setIsProcessing(false);
      return;
    }

    const options = {
      key: "rzp_test_lRCdq1wZYplq4w", // Razorpay test key_id (updated for testing)
      // key: "rzp_live_xhqYnqDIm32BfA", // Razorpay test key_id (updated for testing)
      amount: discountedPrice * 100, // amount in paise
      currency: "INR",
      name: "EstateX",
      description:
        subscription.type === "RR"
          ? "Rental & Resale Subscription"
          : "New Properties Subscription",
      handler: async function (response: Record<string, unknown>) {
        try {
          await completeSubscriptionPayment(
            user.id,
            subscriptionId,
            paymentId,
            String(response.razorpay_payment_id)
          );
          await reloadUser();
          setPaymentStatus("success");
          toast.success("Payment successful! Subscription activated.");
          setTimeout(() => {
            navigate("/dashboard");
          }, 3000);
        } catch {
          setPaymentStatus("failed");
          toast.error(
            "Payment failed during processing. Please contact support."
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
      theme: {
        color: "#2563eb",
      },
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
  };

  const renderOrderSummary = () => (
    <Card className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Plan:</span>
          <span className="font-medium">
            {subscription.type === "RR"
              ? "Rental & Resale (1 Year)"
              : "New Properties (" +
                subscription.locations.length +
                " stations)"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Actual Price:</span>
          <span className="font-medium">{formatCurrency(actualPrice)}</span>
        </div>

        <div className="flex justify-between text-green-600">
          <span>Discount:</span>
          <span>-{formatCurrency(savedAmount)}</span>
        </div>

        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span className="text-lg text-primary">
              {formatCurrency(discountedPrice)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-blue-500 mr-2" />
          <span className="text-sm text-blue-700">
            Your payment is secured with 256-bit SSL encryption
          </span>
        </div>
      </div>
    </Card>
  );

  const renderPaymentForm = () => (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Payment Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <CreditCard className="h-6 w-6 text-gray-600 mr-2" />
            <span className="font-medium">Credit/Debit Card</span>
          </div>
          <p className="text-sm text-gray-600">
            Pay securely with your Visa, Mastercard, or Rupay card
          </p>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-600 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <span className="font-medium">UPI</span>
          </div>
          <p className="text-sm text-gray-600">
            Pay instantly using any UPI app
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Number
          </label>
          <div className="bg-white border border-gray-300 rounded-lg px-4 py-2 flex items-center">
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              className="w-full focus:outline-none"
            />
            <div className="flex space-x-2">
              <div className="w-8 h-5 bg-gray-200 rounded-sm"></div>
              <div className="w-8 h-5 bg-gray-200 rounded-sm"></div>
              <div className="w-8 h-5 bg-gray-200 rounded-sm"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <input
              type="text"
              placeholder="MM/YY"
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVV
            </label>
            <input
              type="text"
              placeholder="123"
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cardholder Name
          </label>
          <input
            type="text"
            placeholder="John Doe"
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
          />
        </div>
      </div>

      <Button
        variant="primary"
        fullWidth
        className="mt-6"
        onClick={handlePayment}
        isLoading={isProcessing}
      >
        Pay {formatCurrency(discountedPrice)}
      </Button>
    </Card>
  );

  const renderSuccessMessage = () => (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center py-12"
    >
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
        <CheckCircle className="h-12 w-12 text-green-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Payment Successful!
      </h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Your subscription has been activated. You now have full access to
        premium property listings.
      </p>
      <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
    </motion.div>
  );

  const renderFailedMessage = () => (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center py-12"
    >
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
        <XCircle className="h-12 w-12 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        We couldn't process your payment. Please try again or use a different
        payment method.
      </p>
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => navigate("/subscription")}>
          Back to Plans
        </Button>
        <Button onClick={() => setPaymentStatus("pending")}>Try Again</Button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Complete Your Subscription
          </h1>
          <p className="text-gray-600 mt-2">
            Secure your access to premium property listings
          </p>
        </div>

        {paymentStatus === "pending" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">{renderPaymentForm()}</div>
            <div>{renderOrderSummary()}</div>
          </div>
        )}

        {paymentStatus === "success" && renderSuccessMessage()}
        {paymentStatus === "failed" && renderFailedMessage()}
      </div>
    </div>
  );
};

export default SubscriptionCheckout;
