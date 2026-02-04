import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePropertyBloc } from '../hooks/usePropertyBloc';
import toast from 'react-hot-toast';

interface RentalFormData {
  buildingSocietyName: string;
  sublocation: string;
  landmark: string;
  locationStation: string;
  pinCode: string;
  state: string;
  district: string;
  configuration: string;
  masterBed: string;
  buildingNoWing: string;
  flatNo: string;
  floorNo: string;
  totalFloors: string;
  carpetArea: string;
  builtUpArea: string;
  propertyAge: string;
  petFriendly: string;
  cosmoSociety: string;
  furnishing: string;
  terraceGallery: string;
  parking: string;
  parkingType: string;
  expectedRent: string;
  securityDeposit: string;
  exitDirection: string;
  maintenancePerMonth: string;
  plusProperty: string;
  plusPropertyType: string;
  amenities: string[];
  ownerName: string;
  ownerNumber: string;
  image: FileList | null;
  video: FileList | null;
}

interface TabLabel {
  icon: string;
  label: string;
}

interface RentalPropertyFormProps {
  onBack?: () => void;
  editProperty?: any;
}

const RentalPropertyForm: React.FC<RentalPropertyFormProps> = ({ onBack, editProperty }) => {
  const [currentTab, setCurrentTab] = useState<number>(0);
  const navigate = useNavigate();
  const [showAmenityModal, setShowAmenityModal] = useState<boolean>(false);
  const [customAmenity, setCustomAmenity] = useState<string>('');
  const [formData, setFormData] = useState<RentalFormData>({
    buildingSocietyName: '',
    sublocation: '',
    landmark: '',
    locationStation: '',
    pinCode: '',
    state: '',
    district: '',
    configuration: '',
    masterBed: '',
    buildingNoWing: '',
    flatNo: '',
    floorNo: '',
    totalFloors: '',
    carpetArea: '',
    builtUpArea: '',
    propertyAge: '',
    petFriendly: '',
    cosmoSociety: '',
    furnishing: '',
    terraceGallery: '',
    parking: '',
    parkingType: '',
    expectedRent: '',
    securityDeposit: '',
    exitDirection: '',
    maintenancePerMonth: '',
    plusProperty: '',
    plusPropertyType: '',
    amenities: [],
    ownerName: '',
    ownerNumber: '',
    image: null,
    video: null
  });

  const tabs: string[] = ['basic', 'property', 'contacts'];
  const tabLabels: TabLabel[] = [
    { icon: 'fas fa-info-circle', label: 'Basic Details' },
    { icon: 'fas fa-home', label: 'Property Details' },
    { icon: 'fas fa-address-book', label: 'Contacts & Collaterals' }
  ];

  const fixedAmenities = ['Swimming Pool', 'Gymnasium', 'Club House', 'Kid\'s Play Area', 'Modular Kitchen', 'Gas Pipeline'];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'carpetArea' && value) {
      const carpetAreaNum = parseFloat(value);
      const builtUpArea = Math.round(carpetAreaNum * 1.2);
      setFormData(prev => ({ ...prev, [name]: value, builtUpArea: builtUpArea.toString() }));
    } else if (name === 'builtUpArea' && value) {
      const builtUpAreaNum = parseFloat(value);
      const carpetArea = Math.round(builtUpAreaNum / 1.2);
      setFormData(prev => ({ ...prev, [name]: value, carpetArea: carpetArea.toString() }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMasterBedChange = (value: string) => {
    setFormData(prev => ({ ...prev, masterBed: prev.masterBed === value ? '' : value }));
  };

  const handleAmenityChange = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const addCustomAmenity = () => {
    if (customAmenity.trim() && !formData.amenities.includes(customAmenity.trim())) {
      setFormData(prev => ({ ...prev, amenities: [...prev.amenities, customAmenity.trim()] }));
      setCustomAmenity('');
      setShowAmenityModal(false);
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData(prev => ({ ...prev, amenities: prev.amenities.filter(a => a !== amenity) }));
  };

  const removeFile = (index: number, type: 'image' | 'video') => {
    if (type === 'image') {
      const files = formData.image ? Array.from(formData.image) : [];
      files.splice(index, 1);
      const dt = new DataTransfer();
      files.forEach(file => dt.items.add(file));
      setFormData(prev => ({ ...prev, image: dt.files }));
      updateImagePreviews(dt.files);
    } else {
      setFormData(prev => ({ ...prev, video: null }));
      const container = document.getElementById('videoPreview');
      if (container) container.innerHTML = '';
    }
  };

  const updateImagePreviews = (files: FileList) => {
    const previewContainer = document.getElementById('imagePreview');
    if (previewContainer) {
      previewContainer.innerHTML = '';
      Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const wrapper = document.createElement('div');
          wrapper.style.cssText = 'position: relative; display: inline-block; margin: 2px;';
          const img = document.createElement('img');
          img.src = e.target?.result as string;
          img.style.cssText = 'width: 80px; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;';
          const removeBtn = document.createElement('button');
          removeBtn.innerHTML = '×';
          removeBtn.style.cssText = 'position: absolute; top: -5px; right: -5px; width: 18px; height: 18px; border-radius: 50%; background: #e74c3c; color: white; border: none; cursor: pointer; font-size: 12px; line-height: 1;';
          removeBtn.onclick = () => removeFile(index, 'image');
          wrapper.appendChild(img);
          wrapper.appendChild(removeBtn);
          previewContainer.appendChild(wrapper);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    
    if (name === 'image' && files) {
      const existingFiles = formData.image ? Array.from(formData.image) : [];
      const newFiles = Array.from(files);
      const totalFiles = existingFiles.length + newFiles.length;
      
      if (totalFiles > 20) {
        alert(`Maximum 20 images allowed. You can add ${20 - existingFiles.length} more images.`);
        e.target.value = '';
        return;
      }
      
      const dt = new DataTransfer();
      [...existingFiles, ...newFiles].forEach(file => dt.items.add(file));
      setFormData(prev => ({ ...prev, image: dt.files }));
      updateImagePreviews(dt.files);
    } else if (name === 'video' && files?.[0]) {
      // Use same pattern as images - create DataTransfer
      const dt = new DataTransfer();
      dt.items.add(files[0]);
      
      setFormData(prev => ({ ...prev, video: dt.files }));
      
      const previewContainer = document.getElementById('videoPreview');
      if (previewContainer) {
        previewContainer.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'position: relative; display: inline-block;';
        const video = document.createElement('video');
        video.src = URL.createObjectURL(files[0]);
        video.style.cssText = 'width: 120px; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;';
        video.controls = false;
        video.muted = true;
        video.preload = 'auto';
        video.oncanplay = () => {
          video.currentTime = 1;
          video.play().then(() => {
            setTimeout(() => video.pause(), 100);
          }).catch(() => {});
        };
        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '×';
        removeBtn.style.cssText = 'position: absolute; top: -5px; right: -5px; width: 18px; height: 18px; border-radius: 50%; background: #e74c3c; color: white; border: none; cursor: pointer; font-size: 12px; line-height: 1;';
        removeBtn.onclick = () => removeFile(0, 'video');
        wrapper.appendChild(video);
        wrapper.appendChild(removeBtn);
        previewContainer.appendChild(wrapper);
      }
    }
    
    e.target.value = '';
  };

  const handleTabChange = (tabIndex: number) => {
    setCurrentTab(tabIndex);
  };

  const { state, submitProperty, updateProperty, resetForm } = usePropertyBloc();

  // Reset form state when component mounts or populate with edit data
  useEffect(() => {
    resetForm();
    
    // If editing, populate form with existing data
    if (editProperty) {
      setFormData({
        buildingSocietyName: editProperty.society || '',
        sublocation: editProperty.sublocation || '',
        landmark: editProperty.landmark || '',
        locationStation: editProperty.station || '',
        pinCode: editProperty.pincode || '',
        state: editProperty.state || '',
        district: editProperty.district || '',
        configuration: editProperty.type || '',
        masterBed: editProperty.masterBed ? 'Yes' : 'No',
        buildingNoWing: editProperty.buildingNo || '',
        flatNo: editProperty.flatNo?.toString() || '',
        floorNo: editProperty.floorNo?.toString() || '',
        totalFloors: editProperty.totalFloors?.toString() || '',
        carpetArea: editProperty.carpetArea?.toString() || '',
        builtUpArea: editProperty.builtUpArea?.toString() || '',
        propertyAge: editProperty.propertyAge?.toString() || '',
        petFriendly: editProperty.petFriendly ? 'Yes' : 'No',
        cosmoSociety: editProperty.cosmoSociety ? 'Yes' : 'No',
        furnishing: editProperty.furnishing || '',
        terraceGallery: editProperty.terraceGallery || '',
        parking: editProperty.parking || '',
        parkingType: editProperty.parkingType || '',
        expectedRent: editProperty.expectedRent?.toString() || '',
        securityDeposit: editProperty.securityDeposit?.toString() || '',
        exitDirection: editProperty.exitDirection || '',
        maintenancePerMonth: editProperty.maintenance?.toString() || '',
        plusProperty: editProperty.plusProperty ? 'Yes' : 'No',
        plusPropertyType: editProperty.plusPropertyType || '',
        amenities: editProperty.amenities || [],
        ownerName: editProperty.ownerName || '',
        ownerNumber: editProperty.ownerNumber || '',
        image: null,
        video: null
      });
    }
  }, [editProperty]); // Add editProperty to dependency array

  useEffect(() => {
    if (state.success && state.message) {
      toast.success(state.message);
      // Navigate directly to Inventory page
      navigate('/inventory');
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.success, state.error, state.message, navigate]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.buildingSocietyName || !formData.configuration || !formData.expectedRent) {
      toast.error('Please fill all required fields');
      return;
    }

    // Check if editing or creating new property
    if (editProperty && editProperty.docId) {
      // Update existing property
      updateProperty(
        editProperty.docId,
        {
          ...formData,
          propertyType: 'Residential',
          transactionType: 'Rental'
        },
        formData.image,
        formData.video?.[0]
      );
    } else {
      // Create new property
      submitProperty(
        formData,
        formData.image,
        formData.video,
        'Residential',
        'Rental'
      );
    }
  };

  const handleNext = () => {
    if (currentTab < tabs.length - 1) {
      setCurrentTab(currentTab + 1);
    }
  };

  const handlePrevious = () => {
    if (currentTab > 0) {
      setCurrentTab(currentTab - 1);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="min-h-[calc(100vh-120px)]">
        <div className="max-w-7xl mx-auto p-0.5">
          {onBack && (
            <div className="px-8 py-4 text-left">
              <button 
                onClick={onBack}
                className="inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary text-sm py-1 px-3"
              >
                <i className="fas fa-arrow-left mr-2"></i> Back to Form Selection
              </button>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-card overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-primary to-primary-dark p-4 text-white">
              <h2 className="text-lg font-bold mb-0.5">Add Rental Property</h2>
              <p className="opacity-90 text-sm">Enter comprehensive rental property details and configuration settings</p>
            </div>
            <div className="flex bg-neutral-50 border-b border-neutral-200 rounded-t-lg">
              {tabLabels.map((tab, index) => (
                <button
                  key={index}
                  className={`flex-1 bg-transparent border-none px-4 py-3 cursor-pointer text-sm font-semibold transition-all duration-300 relative ${currentTab === index ? 'bg-white text-neutral-700 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'}`}
                  onClick={() => handleTabChange(index)}
                  type="button"
                >
                  <i className={tab.icon}></i> {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="pt-6 pb-1.5 px-1.5">
                {/* Basic Details Tab */}
                {currentTab === 0 && (
                  <div className="block">
                  
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2 mb-6 shadow-sm border border-gray-200">
                    <div className="font-bold text-gray-800 mb-1 text-sm flex items-center before:content-['▶'] before:text-blue-600 before:mr-2 before:text-xs">Property Information</div>
                    <div className="grid grid-cols-7 gap-1 bg-white rounded border border-gray-200 p-1" style={{gridTemplateColumns: '1fr 1fr 1.5fr 1fr 0.6fr 1fr 1fr'}}>
                      <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Building/Society Name</div>
                      <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Sub-Location</div>
                      <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Landmark</div>
                      <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Location / Station</div>
                      <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">PIN Code</div>
                      <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">State</div>
                      <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">District</div>
                      
                      <div className="p-1">
                        <input name="buildingSocietyName" value={formData.buildingSocietyName} onChange={handleInputChange} placeholder="Enter building/society name" className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" />
                      </div>
                      <div className="p-1">
                        <input name="sublocation" value={formData.sublocation} onChange={handleInputChange} placeholder="Enter sub-location" className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" />
                      </div>
                      <div className="p-1">
                        <input name="landmark" value={formData.landmark} onChange={handleInputChange} placeholder="Enter nearby landmark" className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" />
                      </div>
                      <div className="p-1">
                        <input name="locationStation" value={formData.locationStation} onChange={handleInputChange} placeholder="Enter location/station" className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" />
                      </div>
                      <div className="p-1">
                        <input name="pinCode" value={formData.pinCode} onChange={handleInputChange} placeholder="Enter PIN code" className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" />
                      </div>
                      <div className="p-1">
                        <input name="state" value={formData.state} onChange={handleInputChange} placeholder="Enter state" className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" />
                      </div>
                      <div className="p-1">
                        <input name="district" value={formData.district} onChange={handleInputChange} placeholder="Enter district" className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" />
                      </div>
                    </div>
                  </div>
                  </div>
                )}

                {/* Property Details Tab */}
                {currentTab === 1 && (
                  <div className="block">
                  
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2 mb-6 shadow-sm border border-gray-200">
                    <div className="grid grid-cols-7 gap-1 bg-white rounded border border-gray-200 p-1">
                      <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm" style={{gridColumn: 'span 2'}}>Configuration *</div>
                      <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Building No./Wing</div>
                      <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Flat No</div>
                      <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Floor No. *</div>
                      <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Total Floors *</div>
                      <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Property Age (years) *</div>
                      
                      <div className="p-1" style={{gridColumn: 'span 2'}}>
                        <div className="flex gap-2 items-start">
                          <select name="configuration" value={formData.configuration} onChange={handleInputChange} required className="flex-1 p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white">
                            <option value="">Select Configuration</option>
                            <option value="1 RK">1 RK</option>
                            <option value="1 BHK">1 BHK</option>
                            <option value="1.5 BHK">1.5 BHK</option>
                            <option value="2 BHK">2 BHK</option>
                            <option value="2.5 BHK">2.5 BHK</option>
                            <option value="3 BHK">3 BHK</option>
                            <option value="3.5 BHK">3.5 BHK</option>
                            <option value="4 BHK">4 BHK</option>
                            <option value="4.5 BHK">4.5 BHK</option>
                            <option value="5 BHK">5 BHK</option>
                            <option value="Penthouse / Duplex">Penthouse / Duplex</option>
                            <option value="Row House">Row House</option>
                            <option value="Bungalow">Bungalow</option>
                            <option value="Villa">Villa</option>
                          </select>
                          {formData.configuration === '1 BHK' && (
                            <div className={`flex-1 p-2 rounded flex items-center gap-2 ${formData.masterBed ? 'bg-gray-50 border border-gray-200' : 'bg-orange-50 border-2 border-orange-400'}`}>
                              <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">Master Bed:</span>
                              <label className="flex items-center gap-1 text-xs cursor-pointer" onClick={() => handleMasterBedChange('Yes')}>
                                <input type="radio" name="masterBed" value="Yes" checked={formData.masterBed === 'Yes'} readOnly className="m-0" />
                                Yes
                              </label>
                              <label className="flex items-center gap-1 text-xs cursor-pointer" onClick={() => handleMasterBedChange('No')}>
                                <input type="radio" name="masterBed" value="No" checked={formData.masterBed === 'No'} readOnly className="m-0" />
                                No
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="p-1">
                        <input name="buildingNoWing" value={formData.buildingNoWing} onChange={handleInputChange} placeholder="Building/Wing" className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" />
                      </div>
                      <div className="p-1">
                        <input name="flatNo" value={formData.flatNo} onChange={handleInputChange} placeholder="Flat Number" className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" />
                      </div>
                      <div className="p-1">
                        <input name="floorNo" value={formData.floorNo} onChange={handleInputChange} placeholder="Floor" required className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" />
                      </div>
                      <div className="p-1">
                        <input name="totalFloors" value={formData.totalFloors} onChange={handleInputChange} placeholder="Total" required className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" />
                      </div>
                      <div className="p-1">
                        <input name="propertyAge" value={formData.propertyAge} onChange={handleInputChange} placeholder="Years" required className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2 mb-6 shadow-sm border border-gray-200">
                    <div className="grid gap-1 bg-white rounded border border-gray-200 p-1" style={{gridTemplateColumns: formData.parking === 'Available' ? '0.9fr 0.9fr 1fr 1.4fr 0.7fr 0.9fr' : '1fr 1fr 1fr 1fr 1fr 1fr'}}>
                      <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Carpet Area (sq ft) *</div>
                      <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Built-up Area (sq ft) *</div>
                      <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Furnishing *</div>
                      <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Parking *</div>
                      <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Pet Friendly *</div>
                      <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Cosmo Society *</div>
                      
                      <div className="p-1">
                        <input name="carpetArea" value={formData.carpetArea} onChange={handleInputChange} placeholder="Carpet Area" required className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" />
                      </div>
                      <div className="p-1">
                        <input name="builtUpArea" value={formData.builtUpArea} onChange={handleInputChange} placeholder="Built-up Area" required className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" />
                      </div>
                      <div className="p-1">
                        <select name="furnishing" value={formData.furnishing} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white cursor-pointer">
                          <option value="">Select Furnishing</option>
                          <option value="Fully Furnished">Fully Furnished</option>
                          <option value="Semi Furnished">Semi Furnished</option>
                          <option value="Unfurnished">Unfurnished</option>
                        </select>
                      </div>
                      <div className="p-1">
                        <div className="flex gap-2">
                          <select name="parking" value={formData.parking} onChange={handleInputChange} required className="flex-1 p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white cursor-pointer">
                            <option value="">Parking?</option>
                            <option value="Available">Available</option>
                            <option value="Not Available">Not Available</option>
                          </select>
                          {formData.parking === 'Available' && (
                            <div className="flex-1 relative z-10">
                              <select name="parkingType" value={formData.parkingType} onChange={handleInputChange} className={`w-full p-2 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm cursor-pointer ${formData.parkingType ? 'border border-gray-300 bg-white' : 'border-2 border-orange-400 bg-orange-50'}`}>
                                <option value="">Select Type</option>
                                <option value="Open">Open</option>
                                <option value="Covered">Covered</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="p-1">
                        <select name="petFriendly" value={formData.petFriendly} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white cursor-pointer">
                          <option value="">Pet Friendly?</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div className="p-1">
                        <select name="cosmoSociety" value={formData.cosmoSociety} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white cursor-pointer">
                          <option value="">Cosmo Society</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2 mb-6 shadow-sm border border-gray-200">
                    <div className="grid grid-cols-5 gap-1 bg-white rounded border border-gray-200 p-1">
                      <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Expected Rent (₹) *</div>
                      <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Security Deposit (₹) *</div>
                      <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Terrace / Balcony</div>
                      <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Exit Direction</div>
                      <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Plus Property</div>
                      
                      <div className="p-1">
                        <input name="expectedRent" value={formData.expectedRent} onChange={handleInputChange} placeholder="Monthly Rent" required className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" />
                      </div>
                      <div className="p-1">
                        <input name="securityDeposit" value={formData.securityDeposit} onChange={handleInputChange} placeholder="Security Deposit" required className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" />
                      </div>
                      <div className="p-1">
                        <select name="terraceGallery" value={formData.terraceGallery} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white cursor-pointer">
                          <option value="">Select Option</option>
                          <option value="Terrace">Terrace</option>
                          <option value="Balcony">Balcony</option>
                          <option value="Both">Both</option>
                          <option value="None">None</option>
                        </select>
                      </div>
                      <div className="p-1">
                        <select name="exitDirection" value={formData.exitDirection} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white cursor-pointer">
                          <option value="">Select Direction</option>
                          <option value="North">North</option>
                          <option value="South">South</option>
                          <option value="East">East</option>
                          <option value="West">West</option>
                          <option value="North-East">North-East</option>
                          <option value="North-West">North-West</option>
                          <option value="South-East">South-East</option>
                          <option value="South-West">South-West</option>
                        </select>
                      </div>
                      <div className="p-1">
                        <div className="flex gap-1">
                          <select name="plusProperty" value={formData.plusProperty} onChange={handleInputChange} className={`p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white cursor-pointer ${formData.plusProperty === 'Yes' ? 'flex-1' : 'flex-1'}`}>
                            <option value="">Plus Property?</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                          {formData.plusProperty === 'Yes' && (
                            <select name="plusPropertyType" value={formData.plusPropertyType} onChange={handleInputChange} className={`flex-1 p-1 rounded text-xs transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm cursor-pointer ${formData.plusPropertyType ? 'border border-gray-300 bg-white' : 'border-2 border-orange-400 bg-orange-50'}`}>
                              <option value="">Select Type</option>
                              <option value="+1">+1</option>
                              <option value="+2">+2</option>
                              <option value="Goodluck">Goodluck</option>
                            </select>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2 mb-6 shadow-sm border border-gray-200">
                    <div className="grid grid-cols-1 gap-1 bg-white rounded border border-gray-200 p-1">
                      <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Amenities *</div>
                      <div className="p-1">
                        <div className="w-full min-h-[120px] p-2 border border-gray-300 rounded bg-white">
                          <div className="flex flex-wrap gap-2 mb-4">
                            {fixedAmenities.map(amenity => (
                              <label key={amenity} className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer text-sm whitespace-nowrap ${formData.amenities.includes(amenity) ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                <input 
                                  type="checkbox" 
                                  checked={formData.amenities.includes(amenity)} 
                                  onChange={() => handleAmenityChange(amenity)} 
                                  className="m-0" 
                                />
                                {amenity}
                              </label>
                            ))}
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-2">
                            {formData.amenities.filter(a => !fixedAmenities.includes(a)).map(amenity => (
                              <span key={amenity} className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 rounded text-xs border border-orange-200 whitespace-nowrap">
                                {amenity}
                                <button type="button" onClick={() => removeAmenity(amenity)} className="bg-none border-none text-orange-600 cursor-pointer p-0 text-sm hover:text-orange-800">×</button>
                              </span>
                            ))}
                          </div>
                          
                          <button type="button" onClick={() => setShowAmenityModal(true)} className="px-2 py-1 bg-blue-500 text-white border-none rounded cursor-pointer text-xs hover:bg-blue-600 transition-colors">+ Add Custom Amenity</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                )}

                {/* Contacts & Collaterals Tab */}
                {currentTab === 2 && (
                  <div className="block">
                  
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2 mb-6 shadow-sm border border-gray-200">
                    <div className="grid grid-cols-3 gap-1 bg-white rounded border border-gray-200 p-1">
                      <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Owner Details</div>
                      <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm flex justify-between items-center">
                        <span>Images (Max 20)</span>
                        <div className="flex items-center gap-1 cursor-pointer px-1 py-0.5 rounded hover:bg-gray-200 transition-colors" onClick={() => document.getElementById('imageUpload')?.click()}>
                          <i className="fas fa-paperclip text-sm text-blue-600"></i>
                          <span className="text-blue-600 font-semibold text-xs">Upload</span>
                        </div>
                      </div>
                      <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm flex justify-between items-center">
                        <span>Video</span>
                        <div className="flex items-center gap-1 cursor-pointer px-1 py-0.5 rounded hover:bg-gray-200 transition-colors" onClick={() => document.getElementById('videoUpload')?.click()}>
                          <i className="fas fa-paperclip text-sm text-blue-600"></i>
                          <span className="text-blue-600 font-semibold text-xs">Upload</span>
                        </div>
                      </div>
                      
                      <div className="p-1">
                        <div className="flex gap-2">
                          <input name="ownerName" value={formData.ownerName} onChange={handleInputChange} placeholder="Owner Name (Optional)" className="flex-1 p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" />
                          <input name="ownerNumber" value={formData.ownerNumber} onChange={handleInputChange} placeholder="Owner Number (Optional)" className="flex-1 p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" />
                        </div>
                      </div>
                      <div className="p-1">
                        <input type="file" id="imageUpload" name="image" onChange={handleFileChange} accept="image/*" multiple className="hidden" />
                        <div id="imagePreview" className="min-h-[100px] border-2 border-dashed border-gray-300 rounded p-2 bg-gray-50"></div>
                      </div>
                      <div className="p-1">
                        <input type="file" id="videoUpload" name="video" onChange={handleFileChange} accept="video/*" className="hidden" />
                        <div id="videoPreview" className="min-h-[100px] border-2 border-dashed border-gray-300 rounded p-2 bg-gray-50"></div>
                      </div>
                    </div>
                  </div>
                  </div>
                )}
              </div>

              <div className="bg-neutral-50 px-4 py-3 border-t border-neutral-200 flex justify-between items-center">
                <div>
                  <button
                    type="button"
                    disabled={state.isLoading}
                    className="inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary text-sm py-1 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handlePrevious}
                    style={{display: currentTab === 0 ? 'none' : 'inline-flex'}}
                  >
                    <i className="fas fa-arrow-left"></i> Previous
                  </button>
                </div>
                <div className="ml-auto">
                  <button
                    type="button"
                    disabled={state.isLoading}
                    className="inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-accent text-white hover:bg-accent-dark focus:ring-accent text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleNext}
                    style={{display: currentTab === tabs.length - 1 ? 'none' : 'inline-flex'}}
                  >
                    Next <i className="fas fa-arrow-right"></i>
                  </button>
                  <button
                    type="submit"
                    disabled={state.isLoading}
                    className="inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-success text-white hover:bg-success-dark focus:ring-success text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{display: currentTab === tabs.length - 1 ? 'inline-flex' : 'none'}}
                  >
                    {state.isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i> Submitting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i> Submit Property
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {showAmenityModal && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <div style={{background: 'white', padding: '1.5rem', borderRadius: '8px', minWidth: '300px', maxWidth: '90%'}}>
            <h3 style={{margin: '0 0 1rem 0', fontSize: '1.1rem'}}>Add Custom Amenity</h3>
            <input 
              type="text" 
              value={customAmenity} 
              onChange={(e) => setCustomAmenity(e.target.value)} 
              placeholder="Enter amenity name" 
              style={{width: '100%', padding: '0.5rem', border: '1px solid #bdc3c7', borderRadius: '4px', marginBottom: '1rem'}} 
              onKeyPress={(e) => e.key === 'Enter' && addCustomAmenity()}
            />
            <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
              <button type="button" onClick={() => setShowAmenityModal(false)} style={{padding: '0.5rem 1rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer'}}>Cancel</button>
              <button type="button" onClick={addCustomAmenity} style={{padding: '0.5rem 1rem', background: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalPropertyForm;