import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import Button from "../../ui/Button";
import Card from "../../ui/Card";
import Input from "../../ui/Input";
import toast from "react-hot-toast";
import { db } from "../../../utils/firebase";
import { collection, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";

interface CustomPackage {
  id: string;
  name: string;
  description: string;
  locations: string[];
  actualPrice: number;
  offerPrice: number;
  durationDiscounts: { 1: number; 3: number; 6: number; 12: number };
  createdAt: string;
}

const ManageCustomPackages = () => {
  const [packages, setPackages] = useState<CustomPackage[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    locations: "",
    actualPrice: "",
    offerPrice: "",
    discount1: "0",
    discount3: "10",
    discount6: "20",
    discount12: "40",
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(db, "settings", "customPackages", "packages")
      );
      const data: CustomPackage[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as CustomPackage);
      });
      setPackages(data);
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast.error("Failed to load packages");
    }
  };

  const handleSave = async () => {
    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.locations.trim() ||
      !formData.actualPrice ||
      !formData.offerPrice
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const packageId = editingId || `pkg-${Date.now()}`;
      const locationArray = formData.locations
        .split(",")
        .map((loc) => loc.trim())
        .filter((loc) => loc);

      const packageData = {
        name: formData.name,
        description: formData.description,
        locations: locationArray,
        actualPrice: Number(formData.actualPrice),
        offerPrice: Number(formData.offerPrice),
        durationDiscounts: {
          1: Number(formData.discount1),
          3: Number(formData.discount3),
          6: Number(formData.discount6),
          12: Number(formData.discount12),
        },
        createdAt: editingId ? packages.find((p) => p.id === editingId)?.createdAt : new Date().toISOString(),
      };

      await setDoc(
        doc(db, "settings", "customPackages", "packages", packageId),
        packageData
      );

      toast.success(
        editingId ? "Package updated successfully!" : "Package created successfully!"
      );

      setFormData({
        name: "",
        description: "",
        locations: "",
        actualPrice: "",
        offerPrice: "",
        discount1: "0",
        discount3: "10",
        discount6: "20",
        discount12: "40",
      });
      setEditingId(null);
      setShowModal(false);
      fetchPackages();
    } catch (error) {
      console.error("Error saving package:", error);
      toast.error("Failed to save package");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pkg: CustomPackage) => {
    setFormData({
      name: pkg.name,
      description: pkg.description,
      locations: pkg.locations.join(", "),
      actualPrice: pkg.actualPrice.toString(),
      offerPrice: pkg.offerPrice.toString(),
      discount1: pkg.durationDiscounts[1].toString(),
      discount3: pkg.durationDiscounts[3].toString(),
      discount6: pkg.durationDiscounts[6].toString(),
      discount12: pkg.durationDiscounts[12].toString(),
    });
    setEditingId(pkg.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;

    try {
      await deleteDoc(doc(db, "settings", "customPackages", "packages", id));
      toast.success("Package deleted successfully!");
      fetchPackages();
    } catch (error) {
      console.error("Error deleting package:", error);
      toast.error("Failed to delete package");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      locations: "",
      actualPrice: "",
      offerPrice: "",
      discount1: "0",
      discount3: "10",
      discount6: "20",
      discount12: "40",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">📦</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-900">
                Custom Packages Management
              </h3>
              <p className="text-blue-700 text-sm">
                Create and manage custom subscription packages for users
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Package
          </Button>
        </div>
      </Card>

      {/* Packages List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-gray-900">{pkg.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(pkg)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(pkg.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4 pb-4 border-b">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Actual Price:</span>
                <span className="font-semibold">₹{pkg.actualPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Offer Price:</span>
                <span className="font-semibold text-green-600">
                  ₹{pkg.offerPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <span className="font-semibold">
                  {Math.round(
                    ((pkg.actualPrice - pkg.offerPrice) / pkg.actualPrice) * 100
                  )}
                  %
                </span>
              </div>
            </div>

            <div className="mb-4">
              <h5 className="text-xs font-semibold text-gray-700 mb-2">
                Duration Discounts:
              </h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-gray-600">1 Month</div>
                  <div className="font-semibold">{pkg.durationDiscounts[1]}%</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-gray-600">3 Months</div>
                  <div className="font-semibold">{pkg.durationDiscounts[3]}%</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-gray-600">6 Months</div>
                  <div className="font-semibold">{pkg.durationDiscounts[6]}%</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-gray-600">1 Year</div>
                  <div className="font-semibold">{pkg.durationDiscounts[12]}%</div>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              Locations: {pkg.locations.length}
            </div>
          </Card>
        ))}
      </div>

      {packages.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-gray-500 mb-4">No custom packages created yet</p>
          <Button
            variant="primary"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create First Package
          </Button>
        </Card>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                {editingId ? "Edit Package" : "Create New Package"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Package Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Premium Mumbai Package"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe what's included in this package"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Locations (comma-separated) *
                </label>
                <textarea
                  value={formData.locations}
                  onChange={(e) =>
                    setFormData({ ...formData, locations: e.target.value })
                  }
                  placeholder="e.g., Bandra, Andheri, Dadar"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Actual Price (₹) *
                  </label>
                  <Input
                    type="number"
                    value={formData.actualPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, actualPrice: e.target.value })
                    }
                    placeholder="e.g., 5000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Offer Price (₹) *
                  </label>
                  <Input
                    type="number"
                    value={formData.offerPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, offerPrice: e.target.value })
                    }
                    placeholder="e.g., 2500"
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Duration-based Discounts (%)
                </h4>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      1 Month
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount1}
                      onChange={(e) =>
                        setFormData({ ...formData, discount1: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      3 Months
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount3}
                      onChange={(e) =>
                        setFormData({ ...formData, discount3: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      6 Months
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount6}
                      onChange={(e) =>
                        setFormData({ ...formData, discount6: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      1 Year
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount12}
                      onChange={(e) =>
                        setFormData({ ...formData, discount12: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  isLoading={loading}
                  className="flex-1"
                >
                  {editingId ? "Update Package" : "Create Package"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ManageCustomPackages;
