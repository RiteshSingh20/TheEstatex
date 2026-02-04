import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePropertyBloc } from '../hooks/usePropertyBloc';
import toast from 'react-hot-toast';

interface CommercialFormData {
  buildingSocietyName: string;
  sublocation: string;
  landmark: string;
  locationStation: string;
  pinCode: string;
  state: string;
  district: string;
  configuration: string;
  commercialType: string;
  buildingNoWing: string;
  flatNo: string;
  floorNo: string;
  totalFloors: string;
  carpetArea: string;
  builtUpArea: string;
  propertyAge: string;
  furnishing: string;
  washroom: string;
  parking: string;
  parkingType: string;
  ocAvailable: string;
  expectedPrice: string;
  negotiable: string;
  maintenancePerMonth: string;
  terraceGallery: string;
  exitDirection: string;
  plusProperty: string;
  plusPropertyType: string;
  additionalInformation: string;
  ownerName: string;
  ownerNumber: string;
  image: FileList | null;
  video: FileList | null;
}

interface CommercialResalePropertyFormProps {
  onBack?: () => void;
}

const CommercialResalePropertyForm: React.FC<CommercialResalePropertyFormProps> = ({ onBack }) => {
  const [currentTab, setCurrentTab] = useState<number>(0);
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CommercialFormData>({
    buildingSocietyName: '',
    sublocation: '',
    landmark: '',
    locationStation: '',
    pinCode: '',
    state: '',
    district: '',
    configuration: '',
    commercialType: '',
    buildingNoWing: '',
    flatNo: '',
    floorNo: '',
    totalFloors: '',
    carpetArea: '',
    builtUpArea: '',
    propertyAge: '',
    furnishing: '',
    washroom: '',
    parking: '',
    parkingType: '',
    ocAvailable: '',
    expectedPrice: '',
    negotiable: '',
    maintenancePerMonth: '',
    terraceGallery: '',
    exitDirection: '',
    plusProperty: '',
    plusPropertyType: '',
    additionalInformation: '',
    ownerName: '',
    ownerNumber: '',
    image: null,
    video: null
  });

  const tabs: string[] = ['basic', 'property', 'contacts'];
  const tabLabels = [
    { icon: 'fas fa-info-circle', label: 'Basic Details' },
    { icon: 'fas fa-building', label: 'Property Details' },
    { icon: 'fas fa-address-book', label: 'Contacts & Collaterals' }
  ];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const { state, submitProperty, resetForm } = usePropertyBloc();

  // Reset form state when component mounts
  useEffect(() => {
    resetForm();
  }, []);

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
    if (!formData.buildingSocietyName || !formData.configuration || !formData.expectedPrice) {
      toast.error('Please fill all required fields');
      return;
    }

    // Submit property
    submitProperty(
      formData,
      formData.image,
      formData.video,
      'Commercial',
      'Resale'
    );
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

  const getFieldLabel = (field: string) => {
    const { configuration, commercialType } = formData;
    
    // Special handling for Big Commercials carpet and built-up area labels
    if (configuration === 'Big Commercials' && commercialType && 
        commercialType !== 'Banquate Hall' && commercialType !== 'Restaurants') {
      if (field === 'carpetArea') return 'Land Parcel';
      if (field === 'builtUpArea') return 'Constructed Area';
    }
    
    const labels: { [key: string]: { [key: string]: string } } = {
      buildingNoWing: {
        'Shop': 'Building / Society',
        'Office': 'Building / Society',
        'Big Commercials': '',
        'Industrial': ''
      },
      flatNo: {
        'Shop': 'Shop No.',
        'Office': 'Office No.',
        'Big Commercials': 'Unit No.',
        'Industrial': 'Unit No.'
      },
      floorNo: {
        'Shop': 'Floor',
        'Office': 'Floor',
        'Big Commercials': '',
        'Industrial': ''
      },
      totalFloors: {
        'Shop': '',
        'Office': 'Total Floors',
        'Big Commercials': '',
        'Industrial': ''
      },
      propertyAge: {
        'Shop': 'Property Age (years) *',
        'Office': 'Property Age (years) *',
        'Big Commercials': '',
        'Industrial': ''
      },
      carpetArea: {
        'Shop': 'Carpet Area',
        'Office': 'Carpet Area',
        'Big Commercials': 'Carpet Area',
        'Industrial': 'Carpet Area'
      },
      builtUpArea: {
        'Shop': 'Usable Area',
        'Office': 'Usable Area',
        'Big Commercials': 'Usable Area',
        'Industrial': 'Usable Area'
      },
      terraceGallery: {
        'Shop': 'Otla',
        'Office': '',
        'Big Commercials': '',
        'Industrial': ''
      },
      exitDirection: {
        'Shop': 'Facing / Direction',
        'Office': 'Facing / Direction',
        'Big Commercials': '',
        'Industrial': ''
      }
    };
    return labels[field]?.[configuration || 'Shop'] || '';
  };

  const shouldShowField = (field: string) => {
    const { configuration } = formData;
    const visibility: { [key: string]: string[] } = {
      floorNo: ['Shop', 'Office'],
      totalFloors: ['Office'],
      propertyAge: ['Shop', 'Office'],
      furnishing: ['Shop', 'Office'],
      washroom: ['Shop', 'Office'],
      parking: ['Shop', 'Office'],
      ocAvailable: ['Shop', 'Office'],
      terraceGallery: ['Shop'],
      exitDirection: ['Shop', 'Office'],
      maintenancePerMonth: ['Shop', 'Office'],
      commercialType: ['Big Commercials', 'Industrial']
    };
    return !visibility[field] || visibility[field].includes(configuration || 'Shop');
  };

  const getColumnCount = (section: number) => {
    const { configuration } = formData;
    const columnConfig: { [key: string]: number[] } = {
      'Shop': [4, 6, 6],
      'Office': [5, 6, 5],
      'Big Commercials': [2, 2, 3],
      'Industrial': [2, 2, 3]
    };
    return columnConfig[configuration || 'Shop'][section - 1];
  };

  return (
    <div className="min-h-screen">
      <div className="min-h-[calc(100vh-120px)]">
        <div className="max-w-7xl mx-auto p-0.5">
          {onBack && (
            <div className="px-8 py-4 text-left">
              <button onClick={onBack} className="inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary text-sm py-1 px-3">
                <i className="fas fa-arrow-left mr-2"></i> Back to Form Selection
              </button>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-card overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-primary to-primary-dark p-4 text-white">
              <h2 className="text-lg font-bold mb-0.5">Add Commercial Resale Property</h2>
              <p className="opacity-90 text-sm">Enter comprehensive commercial property details</p>
            </div>
            <div className="flex bg-neutral-50 border-b border-neutral-200 rounded-t-lg">
              {tabLabels.map((tab, index) => (
                <button key={index} className={`flex-1 bg-transparent border-none px-4 py-3 cursor-pointer text-sm font-semibold transition-all duration-300 relative ${currentTab === index ? 'bg-white text-neutral-700 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'}`} onClick={() => handleTabChange(index)} type="button">
                  <i className={tab.icon}></i> {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="pt-6 pb-1.5 px-1.5">
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
                      
                      <div className="p-1"><input name="buildingSocietyName" value={formData.buildingSocietyName} onChange={handleInputChange} placeholder="Enter building/society name" className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" /></div>
                      <div className="p-1"><input name="sublocation" value={formData.sublocation} onChange={handleInputChange} placeholder="Enter sub-location" className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" /></div>
                      <div className="p-1"><input name="landmark" value={formData.landmark} onChange={handleInputChange} placeholder="Enter nearby landmark" className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" /></div>
                      <div className="p-1"><input name="locationStation" value={formData.locationStation} onChange={handleInputChange} placeholder="Enter location/station" className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" /></div>
                      <div className="p-1"><input name="pinCode" value={formData.pinCode} onChange={handleInputChange} placeholder="Enter PIN code" className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" /></div>
                      <div className="p-1"><input name="state" value={formData.state} onChange={handleInputChange} placeholder="Enter state" className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" /></div>
                      <div className="p-1"><input name="district" value={formData.district} onChange={handleInputChange} placeholder="Enter district" className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" /></div>
                    </div>
                  </div>
                  </div>
                )}

                {currentTab === 1 && (
                  <div className="block">
                    
                    {(formData.configuration === 'Big Commercials' || formData.configuration === 'Industrial') ? (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2 mb-6 shadow-sm border border-gray-200">
                        <div className="grid grid-cols-4 gap-1 bg-white rounded border border-gray-200 p-1">
                          <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Configuration *</div>
                          <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">{formData.configuration === 'Industrial' ? 'Industrial Type *' : 'Commercial Type *'}</div>
                          <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">{getFieldLabel('carpetArea')}</div>
                          <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">{getFieldLabel('builtUpArea')}</div>
                          
                          <div className="p-1">
                            <select name="configuration" value={formData.configuration} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white cursor-pointer">
                              <option value="">Select Configuration</option>
                              <option value="Shop">Shop</option>
                              <option value="Office">Office</option>
                              <option value="Big Commercials">Big Commercials</option>
                              <option value="Industrial">Industrial</option>
                            </select>
                          </div>
                          <div className="p-1">
                            <select name="commercialType" value={formData.commercialType} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white cursor-pointer">
                              <option value="">Select Type</option>
                              {formData.configuration === 'Industrial' ? (
                                <>
                                  <option value="Gala">Gala</option>
                                  <option value="Factory">Factory</option>
                                  <option value="Warehouse">Warehouse</option>
                                </>
                              ) : (
                                <>
                                  <option value="Shopping Mall">Shopping Mall</option>
                                  <option value="Multiplex Theatre">Multiplex Theatre</option>
                                  <option value="Hotels">Hotels</option>
                                  <option value="Resort">Resort</option>
                                  <option value="Banquate Hall">Banquate Hall</option>
                                  <option value="Restaurants">Restaurants</option>
                                </>
                              )}
                            </select>
                          </div>
                          <div className="p-1"><input name="carpetArea" value={formData.carpetArea} onChange={handleInputChange} placeholder={formData.configuration === 'Big Commercials' && formData.commercialType && formData.commercialType !== 'Banquate Hall' && formData.commercialType !== 'Restaurants' ? 'e.g.: 5000 sq.ft / 2 Acres' : getFieldLabel('carpetArea')} className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" /></div>
                          <div className="p-1"><input name="builtUpArea" value={formData.builtUpArea} onChange={handleInputChange} placeholder={formData.configuration === 'Big Commercials' && formData.commercialType && formData.commercialType !== 'Banquate Hall' && formData.commercialType !== 'Restaurants' ? 'Constructed Area in sq.ft.' : getFieldLabel('builtUpArea')} className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" /></div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2 mb-6 shadow-sm border border-gray-200">
                          <div className={`grid gap-1 bg-white rounded border border-gray-200 p-1`} style={{gridTemplateColumns: `repeat(${getColumnCount(1)}, 1fr)`}}>
                            <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Configuration *</div>
                            <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">{getFieldLabel('flatNo')}</div>
                            {shouldShowField('floorNo') && <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">{getFieldLabel('floorNo')}</div>}
                            {shouldShowField('totalFloors') && <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">{getFieldLabel('totalFloors')}</div>}
                            {shouldShowField('propertyAge') && <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">{getFieldLabel('propertyAge')}</div>}
                            
                            <div className="p-1">
                              <select name="configuration" value={formData.configuration} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white cursor-pointer">
                                <option value="">Select Configuration</option>
                                <option value="Shop">Shop</option>
                                <option value="Office">Office</option>
                                <option value="Big Commercials">Big Commercials</option>
                                <option value="Industrial">Industrial</option>
                              </select>
                            </div>
                            <div className="p-1"><input name="flatNo" value={formData.flatNo} onChange={handleInputChange} placeholder={getFieldLabel('flatNo')} className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" /></div>
                            {shouldShowField('floorNo') && <div className="p-1"><input name="floorNo" value={formData.floorNo} onChange={handleInputChange} placeholder={getFieldLabel('floorNo')} className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" /></div>}
                            {shouldShowField('totalFloors') && <div className="p-1"><input name="totalFloors" value={formData.totalFloors} onChange={handleInputChange} placeholder={getFieldLabel('totalFloors')} className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" /></div>}
                            {shouldShowField('propertyAge') && <div className="p-1"><input name="propertyAge" value={formData.propertyAge} onChange={handleInputChange} placeholder="Years" className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" /></div>}
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2 mb-6 shadow-sm border border-gray-200">
                          <div className={`grid gap-1 bg-white rounded border border-gray-200 p-1`} style={{gridTemplateColumns: `repeat(${getColumnCount(2)}, 1fr)`}}>
                            <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">{getFieldLabel('carpetArea')}</div>
                            <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">{getFieldLabel('builtUpArea')}</div>
                            {shouldShowField('furnishing') && <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Furnishing *</div>}
                            {shouldShowField('washroom') && <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Washroom *</div>}
                            {shouldShowField('parking') && <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Parking *</div>}
                            {shouldShowField('ocAvailable') && <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">OC Available *</div>}
                            
                            <div className="p-1"><input name="carpetArea" value={formData.carpetArea} onChange={handleInputChange} placeholder="Carpet Area" className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" /></div>
                            <div className="p-1"><input name="builtUpArea" value={formData.builtUpArea} onChange={handleInputChange} placeholder="Usable Area" className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" /></div>
                            {shouldShowField('furnishing') && (
                              <div className="p-1">
                                <select name="furnishing" value={formData.furnishing} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white cursor-pointer">
                                  <option value="">Select Furnishing</option>
                                  <option value="Fully Furnished">Fully Furnished</option>
                                  <option value="Semi Furnished">Semi Furnished</option>
                                  <option value="Unfurnished">Unfurnished</option>
                                </select>
                              </div>
                            )}
                            {shouldShowField('washroom') && (
                              <div className="p-1">
                                <select name="washroom" value={formData.washroom} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white cursor-pointer">
                                  <option value="">Select Option</option>
                                  <option value="Yes">Yes</option>
                                  <option value="No">No</option>
                                </select>
                              </div>
                            )}
                            {shouldShowField('parking') && (
                              <div className="p-1">
                                <div className="flex gap-1">
                                  <select name="parking" value={formData.parking} onChange={handleInputChange} className={`p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white cursor-pointer ${formData.parking === 'Available' ? 'flex-1' : 'flex-1'}`}>
                                    <option value="">Parking?</option>
                                    <option value="Available">Available</option>
                                    <option value="Not Available">Not Available</option>
                                  </select>
                                  {formData.parking === 'Available' && (
                                    <select name="parkingType" value={formData.parkingType} onChange={handleInputChange} className={`flex-1 p-2 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm cursor-pointer ${formData.parkingType ? 'border border-gray-300 bg-white' : 'border-2 border-orange-400 bg-orange-50'}`}>
                                      <option value="">Select Type</option>
                                      <option value="Open">Open</option>
                                      <option value="Covered">Covered</option>
                                    </select>
                                  )}
                                </div>
                              </div>
                            )}
                            {shouldShowField('ocAvailable') && (
                              <div className="p-1">
                                <select name="ocAvailable" value={formData.ocAvailable} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white cursor-pointer">
                                  <option value="">Select Status</option>
                                  <option value="Yes">Yes</option>
                                  <option value="No">No</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2 mb-6 shadow-sm border border-gray-200">
                      <div className={`grid gap-1 bg-white rounded border border-gray-200 p-1`} style={{gridTemplateColumns: `repeat(${getColumnCount(3)}, 1fr)`}}>
                        <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Expected Price (₹) *</div>
                        <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Negotiable *</div>
                        {shouldShowField('maintenancePerMonth') && <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Maintenance/Month (₹)</div>}
                        {shouldShowField('terraceGallery') && <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">{getFieldLabel('terraceGallery')}</div>}
                        {shouldShowField('exitDirection') && <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">{getFieldLabel('exitDirection')}</div>}
                        <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Plus Property</div>
                        
                        <div className="p-1"><input name="expectedPrice" value={formData.expectedPrice} onChange={handleInputChange} placeholder="Price in Rupees" required className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" /></div>
                        <div className="p-1">
                          <select name="negotiable" value={formData.negotiable} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white cursor-pointer">
                            <option value="">Negotiable?</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                        {shouldShowField('maintenancePerMonth') && <div className="p-1"><input name="maintenancePerMonth" value={formData.maintenancePerMonth} onChange={handleInputChange} placeholder="Monthly Maintenance" className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" /></div>}
                        {shouldShowField('terraceGallery') && (
                          <div className="p-1">
                            <select name="terraceGallery" value={formData.terraceGallery} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white cursor-pointer">
                              <option value="">Select Option</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                        )}
                        {shouldShowField('exitDirection') && (
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
                        )}
                        <div className="p-1">
                          <div className="flex gap-2">
                            <select name="plusProperty" value={formData.plusProperty} onChange={handleInputChange} className="flex-1 p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white cursor-pointer">
                              <option value="">Plus Property?</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                            {formData.plusProperty === 'Yes' && (
                              <div className="flex-1 relative z-10">
                                <select name="plusPropertyType" value={formData.plusPropertyType} onChange={handleInputChange} className={`w-full p-2 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm cursor-pointer ${formData.plusPropertyType ? 'border border-gray-300 bg-white' : 'border-2 border-orange-400 bg-orange-50'}`}>
                                  <option value="">Select Type</option>
                                  <option value="+1">+1</option>
                                  <option value="+2">+2</option>
                                  <option value="Goodluck">Goodluck</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {formData.configuration === 'Big Commercials' && (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2 mb-6 shadow-sm border border-gray-200">
                        <div className="grid grid-cols-1 gap-1 bg-white rounded border border-gray-200 p-1">
                          <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Additional Information</div>
                          <div className="p-1">
                            <input name="additionalInformation" value={formData.additionalInformation} onChange={handleInputChange} placeholder="Enter additional information" className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
    </div>
  );
};

export default CommercialResalePropertyForm;