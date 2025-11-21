import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import { getPricing } from "../utils/firestoreListings";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";

interface PricingData {
  actualPrice?: {
    RR?: number;
    ND?: number;
  };
  discountedPrice?: {
    RR?: number;
    ND?: number;
  };
  newPropertyPricing?: {
    [key: string]: {
      actual: number;
      offer: number;
    };
  };
}

const Pricing = () => {
  const [pricing, setPricing] = useState<PricingData>({});
  const [loading, setLoading] = useState(true);
  const [contactEmail, setContactEmail] = useState("info@theestatex.com");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pricingData, contactData] = await Promise.all([
          getPricing(),
          getDoc(doc(db, "settings", "contact"))
        ]);
        
        setPricing(pricingData);
        
        if (contactData.exists()) {
          const contact = contactData.data();
          setContactEmail(contact.email || "info@theestatex.com");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const rentalResalePrice = pricing.discountedPrice?.RR || 2500;
  
  // Get lowest station price from newPropertyPricing
  const getLowestStationPrice = () => {
    if (!pricing.newPropertyPricing) return 1500;
    const prices = Object.values(pricing.newPropertyPricing).map(station => station.offer);
    return prices.length > 0 ? Math.min(...prices) : 1500;
  };
  
  const newPropertyPrice = getLowestStationPrice();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#19386710] py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <Card className="p-8">
          <h1 className="text-4xl font-bold mb-8 text-[#193867]">
            Pricing and Plans for EstateX
          </h1>
          <p className="mb-6 text-[#193867] text-lg leading-relaxed">
            EstateX provides a subscription-based platform to help real estate professionals manage and filter property listings. Please note that EstateX does not facilitate real estate transactions or sell properties directly. Our services are designed for brokers to effectively manage their listings and gain valuable market insights.
          </p>
          
          <hr className="border-[#193867] mb-8" />
          
          <h2 className="text-3xl font-semibold mb-6 text-[#193867]">
            Our Subscription Plans
          </h2>
          <p className="mb-6 text-[#193867] text-lg leading-relaxed">
            We offer a variety of plans to meet your specific needs:
          </p>
          
          {loading ? (
            <div className="text-center py-8">
              <p className="text-[#193867] text-lg">Loading pricing information...</p>
            </div>
          ) : (
            <ul className="list-disc list-inside mb-6 text-[#193867] text-lg leading-relaxed space-y-4">
              <li>
                <strong>Rental & Resale Package (1-Year Subscription)</strong> starts from: <strong>₹{rentalResalePrice.toLocaleString('en-IN')} per year</strong>
                <br />
                <span className="ml-6 text-base">
                  This plan gives you comprehensive access to rental and resale properties across all available locations of India in EstateX data. It's the ideal choice for brokers who need a broad overview of the market.
                </span>
              </li>
              <li>
                <strong>New Property Pricing (Per Location/Month)</strong> starts from: <strong>₹{newPropertyPrice.toLocaleString('en-IN')} per month</strong>
                <br />
                <span className="ml-6 text-base">
                  This flexible plan lets you select and monitor new property developments in individual stations. It's perfect for those who want to focus on specific areas of interest.
                </span>
              </li>
              <li>
                <strong>Enterprise Plan</strong>
                <br />
                <span className="ml-6 text-base">
                  For larger firms or those with unique requirements, we offer a custom Enterprise Plan. Please contact us to discuss tailored services and receive a personalized quote.
                </span>
              </li>
            </ul>
          )}
          
          <hr className="border-[#193867] mb-8" />
          
          <h2 className="text-3xl font-semibold mb-6 text-[#193867]">
            Secure Payments
          </h2>
          <p className="mb-6 text-[#193867] text-lg leading-relaxed">
            All payments are securely processed through Razorpay, ensuring your transactions are safe and reliable.
          </p>
          
          <hr className="border-[#193867] mb-8" />
          
          <h2 className="text-3xl font-semibold mb-6 text-[#193867]">
            Important Information
          </h2>
          <p className="mb-6 text-[#193867] text-lg leading-relaxed">
            EstateX is a listing management and filtering service for real estate brokers. We do not engage in direct property sales or handle any real estate transactions. All pricing is for informational purposes related to our platform subscription, not for property sales.
          </p>
          <p className="mb-6 text-[#193867] text-lg leading-relaxed">
            For any questions about our pricing or services, please reach out to us at{" "}
            <a
              href={`mailto:${contactEmail}`}
              className="text-primary underline"
            >
              {contactEmail}
            </a>
            .
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Pricing;
