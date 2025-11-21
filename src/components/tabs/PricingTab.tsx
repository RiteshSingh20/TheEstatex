import { useState, useEffect } from "react";
import Card from "../../components/ui/Card";
import Tabs from "../../components/ui/Tabs";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { getPricing, setPricing } from "../../utils/firestoreListings";
// import { doc, setDoc } from "firebase/firestore";
// import { db } from "../../utils/firebase";
import toast from "react-hot-toast";
// import { PricingState, StationPricing } from "../../types/admin";

export const PricingTab = () => {
  const [pricing, setPricingState] = useState<PricingState>({
    rentalResalePrice: 2500,
    newPropertyPrice: 1500,
    resalePrice: 2500,
    rentalPrice: 2500,
    actualPrice: undefined,
    discount: undefined,
    offerPrice: undefined,
  });

  const [newStationPricing, setNewStationPricing] = useState({
    actual: 1500,
    offer: 1500,
  });

  const [currentPricing, setCurrentPricing] = useState<{
    actualPrice?: { RR: number };
    discountedPrice?: { RR: number };
  }>({});

  useEffect(() => {
    getPricing().then((data) => {
      setPricingState({
        rentalResalePrice: data.rentalResalePrice || 2500,
        newPropertyPrice: data.newPropertyPrice || 1500,
        resalePrice: data.resalePrice || 2500,
        rentalPrice: data.rentalPrice || 2500,
      });

      setCurrentPricing({
        actualPrice: data.actualPrice,
        discountedPrice: data.discountedPrice,
      });
    });
  }, []);

  return (
    <div>
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">₹</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-blue-900">
              Subscription Pricing Management
            </h3>
            <p className="text-blue-700 text-sm">
              Configure pricing for all subscription plans
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <Tabs
          variant="underline"
          tabs={[
            {
              id: "rental-resale",
              label: "🏠 Rental & Resale",
              content: (
                <div>
                  <div className="border-l-4 border-green-500 pl-4 mb-6">
                    <h4 className="text-lg font-semibold text-neutral-800 mb-2">
                      Rental & Resale Package (Annual Subscription)
                    </h4>
                    <p className="text-sm text-neutral-600">
                      All-access package covering all 29 stations for rental and
                      resale properties
                    </p>

                    {currentPricing.actualPrice?.RR &&
                      currentPricing.discountedPrice?.RR && (
                        <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                                Current Live Pricing
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-lg font-bold text-neutral-700 line-through">
                                  ₹
                                  {currentPricing.actualPrice.RR.toLocaleString(
                                    "en-IN"
                                  )}
                                </span>
                                <span className="text-xl font-bold text-green-600">
                                  ₹
                                  {currentPricing.discountedPrice.RR.toLocaleString(
                                    "en-IN"
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                                {Math.round(
                                  ((currentPricing.actualPrice.RR -
                                    currentPricing.discountedPrice.RR) /
                                    currentPricing.actualPrice.RR) *
                                    100
                                )}
                                % OFF
                              </div>
                              <div className="text-xs text-neutral-500 mt-1">
                                You save ₹
                                {(
                                  currentPricing.actualPrice.RR -
                                  currentPricing.discountedPrice.RR
                                ).toLocaleString("en-IN")}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>

                  <div className="bg-neutral-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-700">
                          Actual Price (₹/year)
                        </label>
                        <Input
                          id="actualPrice"
                          type="text"
                          inputMode="numeric"
                          placeholder="e.g., 5000"
                          value={
                            pricing.actualPrice === undefined ||
                            pricing.actualPrice === null
                              ? ""
                              : pricing.actualPrice
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            setPricingState((prev) => ({
                              ...prev,
                              actualPrice: val === "" ? undefined : Number(val),
                            }));
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-700">
                          Discount (%)
                        </label>
                        <Input
                          id="discount"
                          type="text"
                          inputMode="numeric"
                          placeholder="e.g., 50"
                          value={
                            pricing.discount === undefined ||
                            pricing.discount === null
                              ? ""
                              : pricing.discount
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            setPricingState((prev) => ({
                              ...prev,
                              discount: val === "" ? undefined : Number(val),
                              offerPrice:
                                prev.actualPrice && val !== ""
                                  ? prev.actualPrice -
                                    Math.round(
                                      (Number(val) / 100) * prev.actualPrice
                                    )
                                  : prev.offerPrice,
                            }));
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-700">
                          Final Offer Price (₹/year)
                        </label>
                        <Input
                          id="offerPrice"
                          type="text"
                          inputMode="numeric"
                          placeholder="e.g., 2500"
                          value={
                            pricing.offerPrice === undefined ||
                            pricing.offerPrice === null
                              ? ""
                              : pricing.offerPrice
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            setPricingState((prev) => ({
                              ...prev,
                              offerPrice: val === "" ? undefined : Number(val),
                              discount:
                                prev.actualPrice && val !== ""
                                  ? Math.round(
                                      ((prev.actualPrice - Number(val)) /
                                        prev.actualPrice) *
                                        100
                                    )
                                  : prev.discount,
                            }));
                          }}
                          className="font-semibold text-green-600"
                        />
                      </div>
                    </div>

                    {pricing.actualPrice && pricing.offerPrice && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>Preview:</strong> Customers will see "₹
                          {pricing.offerPrice.toLocaleString("en-IN")} per year"
                          {pricing.discount &&
                            ` (${
                              pricing.discount
                            }% off from ₹${pricing.actualPrice.toLocaleString(
                              "en-IN"
                            )})`}
                        </p>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="primary"
                    disabled={!pricing.actualPrice || !pricing.offerPrice}
                    onClick={async () => {
                      const payload: any = {
                        actualPrice: {
                          RR: pricing.actualPrice ?? 2500,
                          ND: pricing.newPropertyPrice ?? 1500,
                        },
                        discountedPrice: {
                          RR: pricing.offerPrice ?? 2500,
                          ND: pricing.newPropertyPrice ?? 1500,
                        },
                      };
                      await setPricing(payload);
                      setCurrentPricing({
                        actualPrice: { RR: pricing.actualPrice ?? 2500 },
                        discountedPrice: { RR: pricing.offerPrice ?? 2500 },
                      });
                      toast.success(
                        "Rental & Resale pricing updated successfully!"
                      );
                    }}
                    className="w-full md:w-auto"
                  >
                    💾 Save Rental & Resale Pricing
                  </Button>
                </div>
              ),
            },
            // Add other pricing tabs here...
          ]}
        />
      </Card>
    </div>
  );
};
