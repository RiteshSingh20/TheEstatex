import React, { useState, useEffect } from "react";
import Button from "../../ui/Button";
import AllStationsTable from "./AllStationsTable";
import DurationDiscountsSection from "./DurationDiscountsSection";
import StationModal from "./StationModal";
import PackageModal from "./PackageModal";
import PackagesTable from "./PackagesTable";
import { fetchResaleRentalStations, fetchNewPropertyStations, clearStationCache } from "./StationService";
import { updateStationPricing, getPricingData, updateDurationDiscounts, updatePackage, deletePackage, Station } from "./PricingService";

const PricingManager: React.FC = () => {
  const [showAddStationModal, setShowAddStationModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allAvailableStations, setAllAvailableStations] = useState<Station[]>([]);
  const [resaleRentalPricing, setResaleRentalPricing] = useState<any>({});
  const [newPropertyPricing, setNewPropertyPricing] = useState<any>({});
  const [packages, setPackages] = useState<any>({});
  const [editingStationId, setEditingStationId] = useState<string | null>(null);
  const [editingStationName, setEditingStationName] = useState("");
  const [durationDiscounts, setDurationDiscounts] = useState({
    3: 10,
    6: 20,
    12: 40,
  });
  const [activeTab, setActiveTab] = useState("resale-rental");
  const [showStationModal, setShowStationModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  
  const [resaleSearchTerm, setResaleSearchTerm] = useState("");
  const [resaleSelectedState, setResaleSelectedState] = useState("");
  const [resaleSelectedDistrict, setResaleSelectedDistrict] = useState("");
  const [resaleSelectedRows, setResaleSelectedRows] = useState<string[]>([]);
  
  const [newSearchTerm, setNewSearchTerm] = useState("");
  const [newSelectedState, setNewSelectedState] = useState("");
  const [newSelectedDistrict, setNewSelectedDistrict] = useState("");
  const [newSelectedRows, setNewSelectedRows] = useState<string[]>([]);

  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true);
      try {
        const stations = activeTab === "resale-rental" 
          ? await fetchResaleRentalStations()
          : await fetchNewPropertyStations();
        setAllAvailableStations(stations);
      } finally {
        setLoading(false);
      }
    };
    
    if (activeTab === "resale-rental" || activeTab === "new-properties") {
      fetchStations();
    }
  }, [activeTab]);

  useEffect(() => {
    const loadPricingData = async () => {
      try {
        const pricingData = await getPricingData();
        setResaleRentalPricing(pricingData.resaleRental || {});
        setNewPropertyPricing(pricingData.newProperty || {});
        setPackages(pricingData.packages || {});
        setDurationDiscounts(pricingData.durationDiscounts || { 3: 10, 6: 20, 12: 40 });
      } catch (error) {
        console.error("Error loading pricing data:", error);
      }
    };

    loadPricingData();
  }, []);

  const handleUpdatePricing = (stationId: string, pricing: any) => {
    if (activeTab === "resale-rental") {
      setResaleRentalPricing(prev => ({ ...prev, [stationId]: pricing }));
    } else {
      setNewPropertyPricing(prev => ({ ...prev, [stationId]: pricing }));
    }
  };

  const handleEditStation = (station: Station) => {
    setEditingStation(station);
    setShowStationModal(true);
  };

  const handleAddStation = () => {
    setEditingStation(null);
    setShowStationModal(true);
  };

  const handleSaveStation = async (stationData: { name: string; actual: number; offer: number; district?: string; state?: string; isCustom?: boolean }) => {
    try {
      const type = activeTab === "resale-rental" ? "resaleRental" : "newProperty";
      const stationKey = stationData.isCustom ? `custom_${stationData.name}` : stationData.name;
      
      await updateStationPricing(type, stationKey, {
        actual: stationData.actual,
        offer: stationData.offer,
        district: stationData.district,
        state: stationData.state
      });
      
      if (activeTab === "resale-rental") {
        setResaleRentalPricing(prev => ({
          ...prev,
          [stationKey]: {
            actual: stationData.actual,
            offer: stationData.offer
          }
        }));
      } else {
        setNewPropertyPricing(prev => ({
          ...prev,
          [stationKey]: {
            actual: stationData.actual,
            offer: stationData.offer
          }
        }));
      }
      
      clearStationCache();
      const stations = activeTab === "resale-rental" 
        ? await fetchResaleRentalStations()
        : await fetchNewPropertyStations();
      setAllAvailableStations(stations);
      
      console.log("Station saved successfully");
    } catch (error) {
      console.error("Error saving station:", error);
    }
  };

  const handleCreatePackage = () => {
    const selectedStations = allAvailableStations.filter(s => 
      (activeTab === "resale-rental" ? resaleSelectedRows : newSelectedRows).includes(s.id)
    );
    
    const currentPricing = activeTab === "resale-rental" ? resaleRentalPricing : newPropertyPricing;
    
    const stationsWithoutPricing = selectedStations.filter(station => {
      const pricing = currentPricing[station.id] || 
                     currentPricing[station.name] || 
                     currentPricing[`custom_${station.name}`];
      return !pricing || pricing.actual === 0 || pricing.offer === 0;
    });
    
    if (stationsWithoutPricing.length > 0) {
      alert("Set Prices for all selected stations first.");
      return;
    }
    
    setShowPackageModal(true);
  };

  const handleUpdatePackage = async (packageId: string, category: string, updates: any) => {
    try {
      await updatePackage(category, packageId, {
        ...updates,
        isFreemium: updates.isFreemium || false,
        freemiumDuration: updates.freemiumDuration || null,
        actual: updates.actual || 0,
        createdAt: updates.createdAt || new Date().toISOString()
      });
      
      setPackages(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [packageId]: {
            ...prev[category][packageId],
            ...updates,
            isFreemium: updates.isFreemium || false,
            freemiumDuration: updates.freemiumDuration || null,
            createdAt: updates.createdAt || new Date().toISOString()
          }
        }
      }));
      
      console.log("Package updated successfully:", updates.name);
    } catch (error) {
      console.error("Error updating package:", error);
    }
  };

  const handleSavePackage = async (packageData: { name: string; actual: number; offer: number; stations: string[] }) => {
    try {
      const type = activeTab === "resale-rental" ? "resaleRental" : "newProperty";
      const packageId = `package_${Date.now()}`;
      
      await updatePackage(type, packageId, {
        name: packageData.name,
        actual: packageData.actual,
        offer: packageData.offer,
        stations: packageData.stations,
        isFreemium: false,
        freemiumDuration: null,
        createdAt: new Date().toISOString()
      });
      
      setPackages(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          [packageId]: {
            name: packageData.name,
            actual: packageData.actual,
            offer: packageData.offer,
            stations: packageData.stations,
            isFreemium: false,
            freemiumDuration: null,
            createdAt: new Date().toISOString()
          }
        }
      }));
      
      console.log("Package created successfully:", packageData.name);
    } catch (error) {
      console.error("Error creating package:", error);
    }
  };

  const handleSaveDiscounts = async () => {
    try {
      await updateDurationDiscounts(durationDiscounts);
      console.log("Discounts saved successfully");
    } catch (error) {
      console.error("Error saving discounts:", error);
    }
  };

  const handleDeletePackage = async (pkg: any) => {
    if (!window.confirm(`Are you sure you want to delete "${pkg.name}" package?`)) {
      return;
    }
    try {
      await deletePackage(pkg.category, pkg.id);
      setPackages((prev: any) => ({
        ...prev,
        [pkg.category]: Object.fromEntries(
          Object.entries(prev?.[pkg.category] || {}).filter(([id]) => id !== pkg.id)
        ),
      }));
      console.log("Package deleted successfully:", pkg.name);
    } catch (error) {
      console.error("Error deleting package:", error);
    }
  };

  const handleDeleteStation = async (station: Station) => {
    if (window.confirm(`Are you sure you want to delete "${station.name}" station?`)) {
      try {
        const type = activeTab === "resale-rental" ? "resaleRental" : "newProperty";
        const stationKey = `custom_${station.name}`;
        
        await updateStationPricing(type, stationKey, null);
        
        clearStationCache();
        const stations = activeTab === "resale-rental" 
          ? await fetchResaleRentalStations()
          : await fetchNewPropertyStations();
        setAllAvailableStations(stations);
        
        console.log("Station deleted successfully");
      } catch (error) {
        console.error("Error deleting station:", error);
      }
    }
  };

  const hasPackages = packages.resaleRental && Object.keys(packages.resaleRental).length > 0 ||
                     packages.newProperty && Object.keys(packages.newProperty).length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex items-center justify-between">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("resale-rental")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "resale-rental"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Resale & Rental
            </button>
            <button
              onClick={() => setActiveTab("new-properties")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "new-properties"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              New Properties
            </button>
            <button
              onClick={() => setActiveTab("discounts")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "discounts"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Duration Discounts
            </button>
            {hasPackages && (
              <button
                onClick={() => setActiveTab("packages")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "packages"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Custom Packages
              </button>
            )}
          </nav>
          <div className="flex items-center gap-3">
            {activeTab === "packages" ? (
              <button
                onClick={() => {
                  const event = new CustomEvent('createPackageFromTab', {
                    detail: { category: 'resaleRental' }
                  });
                  window.dispatchEvent(event);
                }}
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Package
              </button>
            ) : (
              <Button
                onClick={handleAddStation}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <span>+</span>
                Add Station
              </Button>
            )}
            {((activeTab === "resale-rental" && resaleSelectedRows.length > 0) || 
              (activeTab === "new-properties" && newSelectedRows.length > 0)) && (
              <button
                onClick={handleCreatePackage}
                className="px-3 py-2 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
              >
                Create Package
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {(activeTab === "resale-rental" || activeTab === "new-properties") && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading stations...</p>
                </div>
              ) : (
                <AllStationsTable
                  allAvailableStations={allAvailableStations}
                  newPropertyPricing={activeTab === "resale-rental" ? resaleRentalPricing : newPropertyPricing}
                  editingStationId={editingStationId}
                  editingStationName={editingStationName}
                  setEditingStationName={setEditingStationName}
                  setEditingStationId={setEditingStationId}
                  onUpdatePricing={handleUpdatePricing}
                  onEditStation={handleEditStation}
                  onDeleteStation={handleDeleteStation}
                  searchTerm={activeTab === "resale-rental" ? resaleSearchTerm : newSearchTerm}
                  setSearchTerm={activeTab === "resale-rental" ? setResaleSearchTerm : setNewSearchTerm}
                  selectedState={activeTab === "resale-rental" ? resaleSelectedState : newSelectedState}
                  setSelectedState={activeTab === "resale-rental" ? setResaleSelectedState : setNewSelectedState}
                  selectedDistrict={activeTab === "resale-rental" ? resaleSelectedDistrict : newSelectedDistrict}
                  setSelectedDistrict={activeTab === "resale-rental" ? setResaleSelectedDistrict : setNewSelectedDistrict}
                  selectedRows={activeTab === "resale-rental" ? resaleSelectedRows : newSelectedRows}
                  setSelectedRows={activeTab === "resale-rental" ? setResaleSelectedRows : setNewSelectedRows}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === "discounts" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <DurationDiscountsSection
              durationDiscounts={durationDiscounts}
              setDurationDiscounts={setDurationDiscounts}
              onSave={handleSaveDiscounts}
            />
          </div>
        )}

        {activeTab === "packages" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Custom Packages</h3>
            </div>
            <PackagesTable 
              packages={packages} 
              onUpdatePackage={handleUpdatePackage}
              onDeletePackage={handleDeletePackage}
            />
          </div>
        )}
      </div>
      
      <StationModal
        isOpen={showStationModal}
        onClose={() => setShowStationModal(false)}
        station={editingStation}
        stationPricing={editingStation ? (() => {
          const stationKey = editingStation.source === "custom" ? `custom_${editingStation.name}` : editingStation.name;
          return newPropertyPricing[stationKey] || null;
        })() : null}
        onSave={handleSaveStation}
      />
      
      <PackageModal
        isOpen={showPackageModal}
        onClose={() => setShowPackageModal(false)}
        selectedStations={allAvailableStations.filter(s => 
          (activeTab === "resale-rental" ? resaleSelectedRows : newSelectedRows).includes(s.id)
        )}
        stationPricing={activeTab === "resale-rental" ? resaleRentalPricing : newPropertyPricing}
        existingPackages={activeTab === "resale-rental" ? packages.resaleRental : packages.newProperty}
        onSave={handleSavePackage}
      />
    </div>
  );
};

export default PricingManager;
