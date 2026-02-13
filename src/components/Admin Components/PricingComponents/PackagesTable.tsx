import React, { useState, useEffect } from "react";
import { fetchResaleRentalStations, fetchNewPropertyStations } from "./StationService";
import { getPricingData } from "./PricingService";
import { db } from "../../../utils/firebase";
import { collection, getDocs, doc, updateDoc, deleteField } from "firebase/firestore";

interface Package {
  id: string;
  name: string;
  actual: number;
  offer: number;
  stations: string[];
  createdAt: string;
  category: "resaleRental" | "newProperty";
  isFreemium?: boolean;
}

interface PackagesTableProps {
  packages: { [key: string]: any };
  onEditPackage?: (pkg: Package) => void;
  onUpdatePackage?: (packageId: string, category: string, updates: any) => void;
  onDeletePackage?: (pkg: Package) => void;
}

const PackagesTable: React.FC<PackagesTableProps> = ({
  packages,
  onEditPackage,
  onUpdatePackage,
  onDeletePackage,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [viewingStations, setViewingStations] = useState<string | null>(null);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    offer: "",
    selectedStations: [] as string[],
    isFreemium: false,
    freemiumDuration: 1
  });
  const [allStations, setAllStations] = useState<{ resaleRental: any[], newProperty: any[] }>({
    resaleRental: [],
    newProperty: []
  });
  const [pricingData, setPricingData] = useState<any>({});
  const [stationFilters, setStationFilters] = useState({
    state: "",
    district: ""
  });
  const [assigningPackage, setAssigningPackage] = useState<Package | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState("3");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [existingAssignment, setExistingAssignment] = useState<any>(null);

  // Fetch stations when component mounts
  useEffect(() => {
    const loadStations = async () => {
      try {
        const [resaleRentalStations, newPropertyStations, pricing] = await Promise.all([
          fetchResaleRentalStations(),
          fetchNewPropertyStations(),
          getPricingData()
        ]);
        setAllStations({
          resaleRental: resaleRentalStations,
          newProperty: newPropertyStations
        });
        setPricingData(pricing);
      } catch (error) {
        console.error("Error loading stations:", error);
      }
    };
    loadStations();
  }, []);

  // Listen for create package event from tab button
  useEffect(() => {
    const handleCreatePackageEvent = (event: any) => {
      setEditingPackage({
        id: '',
        name: '',
        actual: 0,
        offer: 0,
        stations: [],
        createdAt: '',
        category: '' // Empty category initially
      });
      setEditForm({
        name: '',
        offer: '',
        selectedStations: []
      });
      setStationFilters({ state: '', district: '' });
    };

    window.addEventListener('createPackageFromTab', handleCreatePackageEvent);
    return () => {
      window.removeEventListener('createPackageFromTab', handleCreatePackageEvent);
    };
  }, []);

  // Fetch users when assign modal opens
  useEffect(() => {
    const fetchUsers = async () => {
      if (assigningPackage) {
        try {
          const [usersSnapshot, pricingSnapshot] = await Promise.all([
            getDocs(collection(db, "users")),
            getPricingData()
          ]);
          
          const usersData = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setUsers(usersData);
          
          // Check for existing assignment
          const assignments = pricingSnapshot.assignments || {};
          const existingAssign = Object.values(assignments).find((assignment: any) => 
            assignment.packageId === assigningPackage.id && assignment.status === 'active'
          );
          
          if (existingAssign) {
            setExistingAssignment(existingAssign);
            setSelectedUsers(existingAssign.assignedUsers || []);
            setSelectedDuration(existingAssign.duration?.toString() || "3");
          } else {
            setExistingAssignment(null);
            setSelectedUsers([]);
            setSelectedDuration("3");
          }
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      }
    };
    fetchUsers();
  }, [assigningPackage]);

  // Convert packages object to array
  const allPackages: Package[] = [];
  
  if (packages.resaleRental) {
    Object.entries(packages.resaleRental).forEach(([id, pkg]: [string, any]) => {
      allPackages.push({
        id,
        name: pkg.name,
        actual: pkg.actual,
        offer: pkg.offer,
        stations: pkg.stations || [],
        createdAt: pkg.createdAt,
        category: "resaleRental",
        isFreemium: Boolean(pkg.isFreemium)
      });
    });
  }
  
  if (packages.newProperty) {
    Object.entries(packages.newProperty).forEach(([id, pkg]: [string, any]) => {
      allPackages.push({
        id,
        name: pkg.name,
        actual: pkg.actual,
        offer: pkg.offer,
        stations: pkg.stations || [],
        createdAt: pkg.createdAt,
        category: "newProperty",
        isFreemium: Boolean(pkg.isFreemium)
      });
    });
  }

  const handleEditClick = (pkg: Package) => {
    setEditingPackage(pkg);
    setEditForm({
      name: pkg.name,
      offer: pkg.offer.toString(),
      selectedStations: pkg.stations,
      isFreemium: (pkg as any).isFreemium || false,
      freemiumDuration: (pkg as any).freemiumDuration || 1
    });
  };

  const handleUpdatePackage = () => {
    if (editingPackage && onUpdatePackage) {
      // Calculate total actual price from selected stations
      const categoryPricing = editingPackage.category === 'resaleRental' ? pricingData.resaleRental : pricingData.newProperty;
      const totalActual = editForm.selectedStations.reduce((total, stationId) => {
        const station = (editingPackage.category === 'resaleRental' ? allStations.resaleRental : allStations.newProperty)
          .find(s => s.id === stationId);
        if (station) {
          const stationKey = station.source === "custom" ? `custom_${station.name}` : station.name;
          const pricing = categoryPricing?.[stationKey];
          return total + (pricing?.actual || 0);
        }
        return total;
      }, 0);

      const packageData = {
        name: editForm.name,
        actual: totalActual,
        offer: editForm.isFreemium ? 0 : Number(editForm.offer),
        stations: editForm.selectedStations,
        isFreemium: editForm.isFreemium,
        freemiumDuration: editForm.isFreemium ? editForm.freemiumDuration : null
      };

      if (editingPackage.id) {
        // Update existing package
        onUpdatePackage(editingPackage.id, editingPackage.category, packageData);
      } else {
        // Create new package
        const packageId = `package_${Date.now()}`;
        onUpdatePackage(packageId, editingPackage.category, {
          ...packageData,
          createdAt: new Date().toISOString()
        });
      }
      setEditingPackage(null);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleUnassignUser = async (userId: string) => {
    if (!existingAssignment) return;
    
    try {
      const pricingSnapshot = await getPricingData();
      const assignments = pricingSnapshot.assignments || {};
      const assignmentId = Object.keys(assignments).find(id => 
        assignments[id].packageId === assigningPackage?.id && assignments[id].status === 'active'
      );
      
      if (assignmentId) {
        const updatedUsers = selectedUsers.filter(id => id !== userId);
        
        if (updatedUsers.length === 0) {
          // If no users left, delete the entire assignment
          const docRef = doc(db, 'settings/pricing');
          await updateDoc(docRef, {
            [`assignments.${assignmentId}`]: deleteField()
          });
          setExistingAssignment(null);
        } else {
          // Update assignment with remaining users
          const docRef = doc(db, 'settings/pricing');
          await updateDoc(docRef, {
            [`assignments.${assignmentId}.assignedUsers`]: updatedUsers
          });
          // Update existing assignment state
          setExistingAssignment(prev => ({
            ...prev,
            assignedUsers: updatedUsers
          }));
        }
        setSelectedUsers(updatedUsers);
        
        console.log("User unassigned successfully");
      }
    } catch (error) {
      console.error("Error unassigning user:", error);
    }
  };
  const handleAssignPackage = async () => {
    try {
      if (existingAssignment) {
        // Update existing assignment
        const pricingSnapshot = await getPricingData();
        const assignments = pricingSnapshot.assignments || {};
        const assignmentId = Object.keys(assignments).find(id => 
          assignments[id].packageId === assigningPackage?.id && assignments[id].status === 'active'
        );
        
        if (assignmentId) {
          const docRef = doc(db, 'settings/pricing');
          await updateDoc(docRef, {
            [`assignments.${assignmentId}.assignedUsers`]: selectedUsers,
            [`assignments.${assignmentId}.duration`]: Number(selectedDuration),
            [`assignments.${assignmentId}.expiresAt`]: new Date(Date.now() + (Number(selectedDuration) * 30 * 24 * 60 * 60 * 1000)).toISOString()
          });
        }
      } else {
        // Create new assignment
        const assignmentId = `assignment_${Date.now()}`;
        const assignmentData = {
          packageId: assigningPackage?.id,
          packageName: assigningPackage?.name,
          packageCategory: assigningPackage?.category,
          packageOffer: assigningPackage?.offer,
          packageStations: assigningPackage?.stations,
          assignedUsers: selectedUsers,
          duration: Number(selectedDuration),
          assignedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + (Number(selectedDuration) * 30 * 24 * 60 * 60 * 1000)).toISOString(),
          status: 'active'
        };
        
        const docRef = doc(db, 'settings/pricing');
        await updateDoc(docRef, {
          [`assignments.${assignmentId}`]: assignmentData
        });
      }
      
      console.log("Package assigned successfully");
      setAssigningPackage(null);
      setSelectedUsers([]);
      setUserSearchTerm("");
    } catch (error) {
      console.error("Error assigning package:", error);
    }
  };

  const toggleStationSelection = (stationId: string) => {
    setEditForm(prev => ({
      ...prev,
      selectedStations: prev.selectedStations.includes(stationId)
        ? prev.selectedStations.filter(id => id !== stationId)
        : [...prev.selectedStations, stationId]
    }));
  };

  const filteredPackages = allPackages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || pkg.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCategoryLabel = (category: string) => {
    return category === "resaleRental" ? "Resale & Rental" : "New Property";
  };

  const getDiscount = (actual: number, offer: number) => {
    return actual > 0 && offer < actual 
      ? Math.round(((actual - offer) / actual) * 100) : 0;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search packages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors min-w-[150px]"
        >
          <option value="">All Categories</option>
          <option value="resaleRental">Resale & Rental</option>
          <option value="newProperty">New Property</option>
        </select>
        
        <button
          onClick={() => {
            setSearchTerm("");
            setSelectedCategory("");
          }}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
        >
          Reset
        </button>
      </div>
      
      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="grid gap-4 px-4 py-3 bg-gray-50/50 border-b border-gray-100" style={{gridTemplateColumns: '120px 1fr 1fr 1fr 1fr 1fr 100px'}}>
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</div>
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Package Name</div>
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</div>
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Stations</div>
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Actual</div>
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Offer</div>
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</div>
        </div>
        
        {/* Body */}
        <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
          {filteredPackages.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              No packages found
            </div>
          ) : (
            filteredPackages.map((pkg) => {
              const discount = getDiscount(pkg.actual, pkg.offer);
              
              return (
                <div key={pkg.id} className="grid gap-4 px-4 py-3 hover:bg-gray-50/50 transition-colors" style={{gridTemplateColumns: '120px 1fr 1fr 1fr 1fr 1fr 100px'}}>
                  <div className="text-sm text-gray-500">{formatDate(pkg.createdAt)}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">{pkg.name}</div>
                      {pkg.isFreemium && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200 whitespace-nowrap">
                          Freemium
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      pkg.category === "resaleRental" 
                        ? "bg-blue-100 text-blue-700" 
                        : "bg-green-100 text-green-700"
                    }`}>
                      {getCategoryLabel(pkg.category)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{pkg.stations.length} station{pkg.stations.length !== 1 ? 's' : ''}</span>
                    <button
                      onClick={() => setViewingStations(pkg.id)}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="View stations"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-sm font-medium text-gray-900">₹{pkg.actual.toLocaleString()}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">₹{pkg.offer.toLocaleString()}</span>
                    {discount > 0 && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                        {discount}% OFF
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditClick(pkg)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit package"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        if (pkg.isFreemium) return;
                        setAssigningPackage(pkg);
                      }}
                      disabled={pkg.isFreemium}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:hover:bg-transparent"
                      title={pkg.isFreemium ? "Freemium package cannot be assigned to users" : "Assign package"}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDeletePackage?.(pkg)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete package"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>{filteredPackages.length} packages</span>
          </div>
          <div className="text-xs text-gray-500">
            {filteredPackages.length} of {allPackages.length} shown
          </div>
        </div>
      </div>
      
      {/* Stations Modal */}
      {viewingStations && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setViewingStations(null)}>
          <div className="bg-white rounded-lg p-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Package Stations</h3>
              <button
                onClick={() => setViewingStations(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              {(() => {
                const pkg = allPackages.find(p => p.id === viewingStations);
                return pkg?.stations.map((station, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="capitalize text-gray-700">{station}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Package Modal */}
      {editingPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setEditingPackage(null)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{editingPackage.id ? 'Edit Package' : 'Create Package'}</h3>
              <button
                onClick={() => setEditingPackage(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Package Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter package name"
                />
              </div>
              
              {!editingPackage.id && (
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={editingPackage.category}
                    onChange={(e) => setEditingPackage({...editingPackage, category: e.target.value as 'resaleRental' | 'newProperty'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    <option value="resaleRental">Resale & Rental</option>
                    <option value="newProperty">New Property</option>
                  </select>
                </div>
              )}
              
              {(editingPackage.id || editingPackage.category) && (
                <>
                  <div className={editForm.selectedStations.length > 0 ? "grid grid-cols-2 gap-4" : ""}>
                    {editForm.selectedStations.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Total Actual Price (₹)</label>
                        <input
                          type="number"
                          value={(() => {
                            const categoryPricing = editingPackage.category === 'resaleRental' ? pricingData.resaleRental : pricingData.newProperty;
                            return editForm.selectedStations.reduce((total, stationId) => {
                              const station = (editingPackage.category === 'resaleRental' ? allStations.resaleRental : allStations.newProperty)
                                .find(s => s.id === stationId);
                              if (station) {
                                const stationKey = station.source === "custom" ? `custom_${station.name}` : station.name;
                                const pricing = categoryPricing?.[stationKey];
                                return total + (pricing?.actual || 0);
                              }
                              return total;
                            }, 0);
                          })()}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          disabled
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                    <input
                      type="checkbox"
                      id="freemium"
                      checked={editForm.isFreemium}
                      onChange={(e) => setEditForm({...editForm, isFreemium: e.target.checked, offer: e.target.checked ? "0" : editForm.offer})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="freemium" className="text-sm font-medium text-gray-900 cursor-pointer">Freemium Package</label>
                  </div>
                  
                  {editForm.isFreemium && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Duration (Months)</label>
                      <select
                        value={editForm.freemiumDuration}
                        onChange={(e) => setEditForm({...editForm, freemiumDuration: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={1}>1 Month</option>
                        <option value={3}>3 Months</option>
                        <option value={6}>6 Months</option>
                        <option value={12}>12 Months</option>
                      </select>
                    </div>
                  )}
                    <div>
                      <label className="block text-sm font-medium mb-1">Offer Price (₹)</label>
                      <input
                        type="number"
                        value={editForm.offer}
                        onChange={(e) => setEditForm({...editForm, offer: e.target.value})}
                        disabled={editForm.isFreemium}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Enter offer price"
                      />
                    </div>
                  </div>
                  
                  
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium">Select Stations ({editForm.selectedStations.length} selected)</label>
                      <div className="flex gap-2">
                        <select
                          value={stationFilters.state}
                          onChange={(e) => setStationFilters({...stationFilters, state: e.target.value, district: ""})}
                          className="px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">All States</option>
                          {[...new Set((editingPackage.category === 'resaleRental' ? allStations.resaleRental : allStations.newProperty)
                            .filter(station => {
                              const categoryPricing = editingPackage.category === 'resaleRental' ? pricingData.resaleRental : pricingData.newProperty;
                              const stationKey = station.source === "custom" ? `custom_${station.name}` : station.name;
                              const pricing = categoryPricing?.[stationKey];
                              return pricing && pricing.actual > 0 && pricing.offer > 0;
                            })
                            .map(s => s.state).filter(Boolean))].sort().map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                        <select
                          value={stationFilters.district}
                          onChange={(e) => setStationFilters({...stationFilters, district: e.target.value})}
                          className="px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          disabled={!stationFilters.state}
                        >
                          <option value="">All Districts</option>
                          {[...new Set((editingPackage.category === 'resaleRental' ? allStations.resaleRental : allStations.newProperty)
                            .filter(station => {
                              const categoryPricing = editingPackage.category === 'resaleRental' ? pricingData.resaleRental : pricingData.newProperty;
                              const stationKey = station.source === "custom" ? `custom_${station.name}` : station.name;
                              const pricing = categoryPricing?.[stationKey];
                              return pricing && pricing.actual > 0 && pricing.offer > 0 && station.state === stationFilters.state;
                            })
                            .map(s => s.district).filter(Boolean))].sort().map(district => (
                            <option key={district} value={district}>{district}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-1">
                      {(editingPackage.category === 'resaleRental' ? allStations.resaleRental : allStations.newProperty)
                        .filter(station => {
                          // Filter stations that have pricing set
                          const categoryPricing = editingPackage.category === 'resaleRental' ? pricingData.resaleRental : pricingData.newProperty;
                          const stationKey = station.source === "custom" ? `custom_${station.name}` : station.name;
                          const pricing = categoryPricing?.[stationKey];
                          const hasPricing = pricing && pricing.actual > 0 && pricing.offer > 0;
                          
                          // Apply state and district filters
                          const matchesState = !stationFilters.state || station.state === stationFilters.state;
                          const matchesDistrict = !stationFilters.district || station.district === stationFilters.district;
                          
                          return hasPricing && matchesState && matchesDistrict;
                        })
                        .map((station) => (
                        <label key={station.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editForm.selectedStations.includes(station.id)}
                            onChange={() => toggleStationSelection(station.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{station.name}</span>
                          <span className="text-xs text-gray-500">({station.district}, {station.state})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingPackage(null)}
                  className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePackage}
                  disabled={!editForm.name || (!editForm.isFreemium && !editForm.offer) || editForm.selectedStations.length === 0}
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
                >
                  {editingPackage.id ? 'Update Package' : 'Create Package'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Assign Package Modal */}
      {assigningPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setAssigningPackage(null)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {existingAssignment ? 'Update Assignment' : 'Assign Package'}
              </h3>
              <button
                onClick={() => setAssigningPackage(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-md">
                <h4 className="font-medium text-sm text-gray-900">{assigningPackage.name}</h4>
                <p className="text-xs text-gray-500 mt-1">
                  {getCategoryLabel(assigningPackage.category)} • {assigningPackage.stations.length} stations • ₹{assigningPackage.offer.toLocaleString()}
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Select Users ({selectedUsers.length} selected)</label>
                  <div className="relative">
                    <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="pl-7 pr-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-32"
                    />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-1">
                  {(() => {
                    const filteredUsers = users.filter(user => {
                      // Exclude admin users
                      if (user.role === 'admin') return false;
                      
                      const searchLower = userSearchTerm.toLowerCase();
                      return (
                        user.fullName?.toLowerCase().includes(searchLower) ||
                        user.email?.toLowerCase().includes(searchLower) ||
                        user.phone?.includes(searchLower) ||
                        user.firmName?.toLowerCase().includes(searchLower) ||
                        user.city?.toLowerCase().includes(searchLower) ||
                        user.state?.toLowerCase().includes(searchLower)
                      );
                    });
                    
                    if (filteredUsers.length === 0) {
                      return (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          No Users
                        </div>
                      );
                    }
                    
                    return filteredUsers.map((user) => {
                      const isActuallyAssigned = existingAssignment && existingAssignment.assignedUsers?.includes(user.id);
                      return (
                        <div 
                          key={user.id} 
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          onClick={() => !isActuallyAssigned && toggleUserSelection(user.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                            disabled={isActuallyAssigned}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{user.fullName}</div>
                            <div className="text-xs text-gray-500 truncate">{user.email} • {user.phone}</div>
                            <div className="text-xs text-gray-400">{user.firmName} • {user.city}, {user.state}</div>
                          </div>
                          {isActuallyAssigned && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnassignUser(user.id);
                              }}
                              className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Unassign user"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Duration (months)</label>
                <select 
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">1 Month</option>
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setAssigningPackage(null)}
                  className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignPackage}
                  disabled={selectedUsers.length === 0}
                  className="flex-1 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
                >
                  {existingAssignment ? 'Update Assignment' : 'Assign Package'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackagesTable;
