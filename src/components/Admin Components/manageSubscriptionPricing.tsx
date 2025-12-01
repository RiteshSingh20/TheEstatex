import { setDoc, doc } from "firebase/firestore";
import { Edit, Trash2, CreditCard, Plus, Search, List } from "lucide-react";
import toast from "react-hot-toast";
import { PricingState, StationPricing } from "../../types/admin";
import { db } from "../../utils/firebase";
import { setPricing } from "../../utils/firestoreListings";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Tabs from "../ui/Tabs";

export function manageSubscriptionPricing(currentPricing: { actualPrice?: { RR: number; }; discountedPrice?: { RR: number; }; }, pricing: PricingState, setPricingState, setCurrentPricing, newStationPricing: { actual: number; offer: number; }, setNewStationPricing, newPropertyPricing: { [key: string]: StationPricing; }, customStationNames: { [key: string]: string; }, setCustomStationNames, setNewPropertyPricing, stationSearchTerm: string, setStationSearchTerm, setShowStationDropdown, showStationDropdown: boolean, allMergedStations: { id: string; name: string; }[], durationDiscounts: { 3: number; 6: number; 12: number; }, setDurationDiscounts, getDynamicCostSheetStationCount: () => number, editingStationId: string | null, editingStationName: string, setEditingStationName, setEditingStationId) {
  return <div>
    {/* Header */}
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <CreditCard className="h-5 w-5 text-white" />
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
            label: " 🏠 Rental & Resale",
            content: (
              <div>
                <div className="border-l-4 border-green-500 pl-4 mb-6">
                  <h4 className="text-lg font-semibold text-neutral-800 mb-2">
                    Rental & Resale Package (Annual Subscription)
                  </h4>
                  <p className="text-sm text-neutral-600">
                    All-access package covering all 29 stations for
                    rental and resale properties
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
                        pattern="[0-9]*"
                        placeholder="e.g., 5000"
                        value={pricing.actualPrice === undefined ||
                          pricing.actualPrice === null
                          ? ""
                          : pricing.actualPrice}
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                        onChange={(e) => {
                          const val = e.target.value;
                          setPricingState((prev) => ({
                            ...prev,
                            actualPrice: val === "" ? undefined : Number(val),
                          }));
                        } } />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-700">
                        Discount (%)
                      </label>
                      <Input
                        id="discount"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="e.g., 50"
                        value={pricing.discount === undefined ||
                          pricing.discount === null
                          ? ""
                          : pricing.discount}
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                        onChange={(e) => {
                          const val = e.target.value;
                          setPricingState((prev) => ({
                            ...prev,
                            discount: val === "" ? undefined : Number(val),
                            offerPrice: prev.actualPrice && val !== ""
                              ? prev.actualPrice -
                              Math.round(
                                (Number(val) / 100) *
                                prev.actualPrice
                              )
                              : prev.offerPrice,
                          }));
                        } } />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-700">
                        Final Offer Price (₹/year)
                      </label>
                      <Input
                        id="offerPrice"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="e.g., 2500"
                        value={pricing.offerPrice === undefined ||
                          pricing.offerPrice === null
                          ? ""
                          : pricing.offerPrice}
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] font-semibold text-green-600"
                        onChange={(e) => {
                          const val = e.target.value;
                          setPricingState((prev) => ({
                            ...prev,
                            offerPrice: val === "" ? undefined : Number(val),
                            discount: prev.actualPrice && val !== ""
                              ? Math.round(
                                ((prev.actualPrice - Number(val)) /
                                  prev.actualPrice) *
                                100
                              )
                              : prev.discount,
                          }));
                        } } />
                    </div>
                  </div>

                  {pricing.actualPrice && pricing.offerPrice && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Preview:</strong> Customers will see "₹
                        {pricing.offerPrice.toLocaleString("en-IN")} per
                        year"
                        {pricing.discount &&
                          ` (${pricing.discount}% off from ₹${pricing.actualPrice.toLocaleString(
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
                      actualPrice: {
                        RR: pricing.actualPrice ?? 2500,
                      },
                      discountedPrice: {
                        RR: pricing.offerPrice ?? 2500,
                      },
                    });
                    toast.success(
                      "Rental & Resale pricing updated successfully!"
                    );
                  } }
                  className="w-full md:w-auto flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Save Rental & Resale Pricing
                </Button>
              </div>
            ),
          },
          {
            id: "new-property",
            label: "🏠 New Property",
            content: (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Management */}
                  <div className="space-y-4">
                    {/* Add New Station */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                      <h5 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Add New Station
                      </h5>
                      <div className="space-y-3">
                        <Input
                          id="newStationName"
                          placeholder="Enter station name"
                          value={pricing.newStationName || ""}
                          onChange={(e) => setPricingState({
                            ...pricing,
                            newStationName: e.target.value,
                          })} />
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            id="newStationActual"
                            type="text"
                            inputMode="numeric"
                            placeholder="Actual price"
                            value={newStationPricing.actual}
                            onChange={(e) => setNewStationPricing((prev) => ({
                              ...prev,
                              actual: Number(e.target.value) || 0,
                            }))} />
                          <Input
                            id="newStationOffer"
                            type="text"
                            inputMode="numeric"
                            placeholder="Offer price"
                            value={newStationPricing.offer}
                            onChange={(e) => setNewStationPricing((prev) => ({
                              ...prev,
                              offer: Number(e.target.value) || 0,
                            }))} />
                        </div>
                        <Button
                          variant="primary"
                          disabled={!pricing.newStationName?.trim()}
                          onClick={async () => {
                            const name = (
                              pricing.newStationName || ""
                            ).trim();
                            if (!name)
                              return toast.error(
                                "Station name required"
                              );

                            try {
                              const newStationId = "custom-" +
                                name.toLowerCase().replace(/\s+/g, "-");
                              const updatedPricing = {
                                ...newPropertyPricing,
                                [newStationId]: newStationPricing,
                              };

                              const updatedStationNames = {
                                ...customStationNames,
                                [newStationId]: name,
                              };
                              await setDoc(
                                doc(db, "settings", "pricing"),
                                {
                                  newPropertyPricing: updatedPricing,
                                  newPropertyStationNames: updatedStationNames,
                                },
                                { merge: true }
                              );

                              setCustomStationNames(
                                updatedStationNames
                              );
                              setNewPropertyPricing(updatedPricing);
                              setPricingState((prev) => ({
                                ...prev,
                                newStationName: "",
                              }));
                              setNewStationPricing({
                                actual: 1500,
                                offer: 1500,
                              });
                              toast.success(
                                `Station "${name}" added successfully!`
                              );
                            } catch (error) {
                              toast.error("Failed to add station");
                            }
                          } }
                          className="w-full"
                        >
                          Add Station
                        </Button>
                      </div>
                    </div>

                    {/* Quick Edit */}
                    <div className="bg-neutral-50 rounded-lg p-4 border">
                      <h5 className="font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Quick Edit Pricing
                      </h5>
                      <div className="relative mb-3">
                        <input
                          type="text"
                          placeholder="Search station to edit..."
                          value={stationSearchTerm}
                          onChange={(e) => setStationSearchTerm(e.target.value)}
                          onFocus={() => setShowStationDropdown(true)}
                          className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        {showStationDropdown && (
                          <div className="absolute z-10 w-full bg-white border border-neutral-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                            {allMergedStations
                              .filter((station) => station.name
                                .toLowerCase()
                                .includes(
                                  stationSearchTerm.toLowerCase()
                                )
                              )
                              .map((station) => (
                                <div
                                  key={station.id}
                                  className="px-3 py-2 hover:bg-neutral-100 cursor-pointer text-sm"
                                  onClick={() => {
                                    setPricingState({
                                      ...pricing,
                                      selectedStationId: station.id,
                                    });
                                    setStationSearchTerm(station.name);
                                    setShowStationDropdown(false);
                                  } }
                                >
                                  {station.name}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>

                      {pricing.selectedStationId && (
                        <div className="mb-2">
                          <button
                            onClick={() => {
                              setPricingState({
                                ...pricing,
                                selectedStationId: "",
                              });
                              setStationSearchTerm("");
                            } }
                            className="text-xs text-neutral-500 hover:text-neutral-700"
                          >
                            Clear selection
                          </button>
                        </div>
                      )}
                      {pricing.selectedStationId && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium text-neutral-600 mb-1 block">
                                Actual Price
                              </label>
                              <Input
                                id="editStationActual"
                                type="text"
                                inputMode="numeric"
                                value={newPropertyPricing[pricing.selectedStationId]?.actual || 0}
                                onChange={(e) => {
                                  const actual = Number(e.target.value);
                                  setNewPropertyPricing((prev) => ({
                                    ...prev,
                                    [pricing.selectedStationId!]: {
                                      ...prev[pricing.selectedStationId!],
                                      actual,
                                    },
                                  }));
                                } }
                                className="text-sm" />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-neutral-600 mb-1 block">
                                Offer Price
                              </label>
                              <Input
                                id="editStationOffer"
                                type="text"
                                inputMode="numeric"
                                value={newPropertyPricing[pricing.selectedStationId]?.offer || 0}
                                onChange={(e) => {
                                  const offer = Number(e.target.value);
                                  setNewPropertyPricing((prev) => ({
                                    ...prev,
                                    [pricing.selectedStationId!]: {
                                      ...prev[pricing.selectedStationId!],
                                      offer,
                                    },
                                  }));
                                } }
                                className="text-sm font-semibold text-green-600" />
                            </div>
                          </div>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={async () => {
                              await setPricing({
                                newPropertyPricing,
                              } as any);
                              toast.success("Pricing updated!");
                            } }
                            className="w-full"
                          >
                            Save Changes
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Duration Discounts Section */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                      <h5 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs">
                          %
                        </span>
                        Duration-based Discounts
                      </h5>
                      <p className="text-xs text-purple-700 mb-3">
                        Set additional discounts for longer subscription
                        durations
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-medium text-purple-700 mb-1 block">
                            3 Months (%)
                          </label>
                          <Input
                            id="discount3m"
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9]*\.?[0-9]*"
                            value={durationDiscounts[3]}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "" ||
                                /^\d*\.?\d*$/.test(val)) {
                                const value = val === ""
                                  ? 0
                                  : Math.max(
                                    0,
                                    Math.min(100, Number(val))
                                  );
                                setDurationDiscounts((prev) => ({
                                  ...prev,
                                  3: value,
                                }));
                              }
                            } }
                            onWheel={(e) => e.currentTarget.blur()}
                            className="text-xs h-8 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-purple-700 mb-1 block">
                            6 Months (%)
                          </label>
                          <Input
                            id="discount6m"
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9]*\.?[0-9]*"
                            value={durationDiscounts[6]}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "" ||
                                /^\d*\.?\d*$/.test(val)) {
                                const value = val === ""
                                  ? 0
                                  : Math.max(
                                    0,
                                    Math.min(100, Number(val))
                                  );
                                setDurationDiscounts((prev) => ({
                                  ...prev,
                                  6: value,
                                }));
                              }
                            } }
                            onWheel={(e) => e.currentTarget.blur()}
                            className="text-xs h-8 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-purple-700 mb-1 block">
                            1 Year (%)
                          </label>
                          <Input
                            id="discount12m"
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9]*\.?[0-9]*"
                            value={durationDiscounts[12]}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "" ||
                                /^\d*\.?\d*$/.test(val)) {
                                const value = val === ""
                                  ? 0
                                  : Math.max(
                                    0,
                                    Math.min(100, Number(val))
                                  );
                                setDurationDiscounts((prev) => ({
                                  ...prev,
                                  12: value,
                                }));
                              }
                            } }
                            onWheel={(e) => e.currentTarget.blur()}
                            className="text-xs h-8 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]" />
                        </div>
                      </div>
                      <Button
                        onClick={async () => {
                          try {
                            await setDoc(
                              doc(db, "settings", "additionalOff"),
                              {
                                durationDiscounts,
                              },
                              { merge: true }
                            );
                            toast.success(
                              "Duration discounts updated!"
                            );
                          } catch (error) {
                            toast.error(`Failed to update discounts`);
                          }
                        } }
                        className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white text-xs py-2"
                      >
                        Save Discounts
                      </Button>
                    </div>
                  </div>

                  {/* Right Column - Overview */}
                  <div>
                    <div className="bg-white rounded-lg border border-neutral-200">
                      <div className="p-4 border-b border-neutral-200">
                        <h5 className="font-semibold text-neutral-800 flex items-center gap-2">
                          <List className="h-5 w-5" />
                          All {getDynamicCostSheetStationCount()}{" "}
                          Stations
                        </h5>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        <table className="min-w-full divide-y divide-neutral-200">
                          <thead className="bg-neutral-50 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                                Station
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                                Actual
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                                Offer
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-neutral-200">
                            {allMergedStations.map((station) => {
                              const stationPricing = newPropertyPricing[station.id];
                              const hasDiscount = stationPricing &&
                                stationPricing.actual >
                                stationPricing.offer;
                              const isCustomStation = station.id.startsWith("custom-");
                              return (
                                <tr
                                  key={station.id}
                                  className="hover:bg-neutral-50"
                                >
                                  <td className="px-3 py-2 text-sm">
                                    <div className="flex items-center gap-2">
                                      {editingStationId ===
                                        station.id ? (
                                        <input
                                          type="text"
                                          value={editingStationName}
                                          onChange={(e) => setEditingStationName(
                                            e.target.value
                                          )}
                                          onBlur={() => {
                                            if (editingStationName.trim() &&
                                              editingStationName !==
                                              station.name) {
                                              const updatedStationNames = {
                                                ...customStationNames,
                                                [station.id]: editingStationName.trim(),
                                              };
                                              setDoc(
                                                doc(
                                                  db,
                                                  "settings",
                                                  "pricing"
                                                ),
                                                {
                                                  newPropertyStationNames: updatedStationNames,
                                                },
                                                { merge: true }
                                              );
                                              setCustomStationNames(
                                                updatedStationNames
                                              );
                                              toast.success(
                                                "Station renamed!"
                                              );
                                            }
                                            setEditingStationId(null);
                                          } }
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter")
                                              e.currentTarget.blur();
                                            if (e.key === "Escape") {
                                              setEditingStationId(null);
                                              setEditingStationName(
                                                station.name
                                              );
                                            }
                                          } }
                                          className="border rounded px-2 py-1 text-xs w-full"
                                          autoFocus />
                                      ) : (
                                        <>
                                          <span className="font-medium">
                                            {station.name}
                                          </span>
                                          {isCustomStation && (
                                            <div className="flex items-center gap-1">
                                              <button
                                                onClick={() => {
                                                  setEditingStationId(
                                                    station.id
                                                  );
                                                  setEditingStationName(
                                                    station.name
                                                  );
                                                } }
                                                className="text-blue-600 hover:text-blue-800"
                                              >
                                                <Edit className="h-3 w-3" />
                                              </button>
                                              <button
                                                onClick={async () => {
                                                  if (confirm(
                                                    `Delete station "${station.name}"? This action cannot be undone.`
                                                  )) {
                                                    try {
                                                      const updatedPricing = {
                                                        ...newPropertyPricing,
                                                      };
                                                      delete updatedPricing[station.id];

                                                      const updatedStationNames = {
                                                        ...customStationNames,
                                                      };
                                                      delete updatedStationNames[station.id];

                                                      await setPricing({
                                                        newPropertyPricing: updatedPricing,
                                                        newPropertyStationNames: updatedStationNames,
                                                      });

                                                      setNewPropertyPricing(
                                                        updatedPricing
                                                      );
                                                      setCustomStationNames(
                                                        updatedStationNames
                                                      );
                                                      toast.success(
                                                        `Station "${station.name}" deleted successfully!`
                                                      );
                                                    } catch (error) {
                                                      toast.error(
                                                        "Failed to delete station"
                                                      );
                                                    }
                                                  }
                                                } }
                                                className="text-red-600 hover:text-red-800"
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </button>
                                            </div>
                                          )}
                                        </>
                                      )}
                                      {isCustomStation && (
                                        <span className="px-1 py-0.5 text-xs bg-blue-100 text-blue-600 rounded">
                                          Custom
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-sm text-neutral-600">
                                    ₹
                                    {stationPricing?.actual?.toLocaleString(
                                      "en-IN"
                                    ) || 0}
                                  </td>
                                  <td className="px-3 py-2 text-sm font-semibold text-green-600">
                                    ₹
                                    {stationPricing?.offer?.toLocaleString(
                                      "en-IN"
                                    ) || 0}
                                  </td>
                                  <td className="px-3 py-2 text-sm">
                                    {hasDiscount ? (
                                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                        {Math.round(
                                          ((stationPricing.actual -
                                            stationPricing.offer) /
                                            stationPricing.actual) *
                                          100
                                        )}
                                        % OFF
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-600 rounded-full">
                                        Regular
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
        ]} />
    </Card>
  </div>;
}