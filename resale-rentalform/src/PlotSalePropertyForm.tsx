import React, { useState, ChangeEvent } from 'react';

interface PlotSalePropertyFormProps {
  onBack?: () => void;
}

interface FormData {
  // Basic Details
  plotNumber: string;
  sublocation: string;
  landmark: string;
  location: string;
  pincode: string;
  state: string;
  district: string;
  
  // Plot Details
  plotArea: string;
  plotAreaUnit: string;
  plotType: string;
  roadWidth: string;
  cornerPlot: string;
  boundaryWall: string;
  
  // Pricing
  totalPrice: string;
  pricePerSqft: string;
  negotiable: string;
  plusProperty: string;
  plusPropertyType: string;
  
  // Contacts & Media
  ownerName: string;
  ownerNumber: string;
  image: FileList | null;
  video: File | null;
}

const PlotSalePropertyForm: React.FC<PlotSalePropertyFormProps> = ({ onBack }) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    plotNumber: '',
    sublocation: '',
    landmark: '',
    location: '',
    pincode: '',
    state: '',
    district: '',
    plotArea: '',
    plotAreaUnit: 'sq.ft',
    plotType: '',
    roadWidth: '',
    cornerPlot: '',
    boundaryWall: '',
    totalPrice: '',
    pricePerSqft: '',
    negotiable: '',
    plusProperty: '',
    plusPropertyType: '',
    ownerName: '',
    ownerNumber: '',
    image: null,
    video: null
  });

  const tabLabels = [
    { label: 'Basic Details', icon: 'fas fa-info-circle' },
    { label: 'Plot Details', icon: 'fas fa-home' },
    { label: 'Contacts & Collaterals', icon: 'fas fa-address-book' }
  ];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Auto-calculate price per unit in real-time
      if (name === 'totalPrice' || name === 'plotArea' || name === 'plotAreaUnit') {
        const price = parseFloat(newData.totalPrice);
        const area = parseFloat(newData.plotArea);
        
        if (price && area) {
          newData.pricePerSqft = (price / area).toFixed(2);
        } else {
          newData.pricePerSqft = '';
        }
      }
      
      return newData;
    });
  };

  const removeFile = (index: number, type: 'image' | 'video') => {
    if (type === 'image' && formData.image) {
      const dt = new DataTransfer();
      Array.from(formData.image).forEach((file, i) => {
        if (i !== index) dt.items.add(file);
      });
      setFormData(prev => ({ ...prev, image: dt.files }));
      updateImagePreviews(dt.files);
    } else if (type === 'video') {
      setFormData(prev => ({ ...prev, video: null }));
      const previewContainer = document.getElementById('videoPreview');
      if (previewContainer) previewContainer.innerHTML = '';
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
      setFormData(prev => ({ ...prev, video: files[0] }));
      
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

  const handleNext = () => {
    if (currentTab < tabLabels.length - 1) {
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
      <div className="bg-slate-700 text-white px-8 py-4 flex justify-between items-center shadow-lg">
        <h1 className="text-xl font-semibold"><i className="fas fa-cogs"></i> Plot Sale Management</h1>
        <div className="flex items-center gap-4">
          <span><i className="fas fa-user-circle"></i> Admin User</span>
          <span>|</span>
          <a href="#" className="text-gray-200 no-underline"><i className="fas fa-sign-out-alt"></i> Logout</a>
        </div>
      </div>

      <div className="bg-white px-8 py-4 border-b border-gray-200 text-sm text-gray-600">
        <a href="#" className="text-blue-500 no-underline">Dashboard</a> / <a href="#" className="text-blue-500 no-underline">Properties</a> / <strong>Add Plot Sale</strong>
      </div>

      {onBack && (
        <div className="px-8 py-4 text-left">
          <button 
            onClick={onBack}
            className="px-3 py-2 bg-gradient-to-r from-gray-400 to-gray-300 text-white border border-gray-500 rounded cursor-pointer text-xs font-semibold transition-all duration-200 inline-flex items-center gap-1 shadow-sm hover:from-gray-500 hover:to-gray-400 hover:-translate-y-0.5 hover:shadow-md"
          >
            <i className="fas fa-arrow-left"></i> Back to Form Selection
          </button>
        </div>
      )}

      <div className="min-h-[calc(100vh-120px)]">
        <div className="max-w-7xl mx-auto p-0.5">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-lg mb-1 text-white">
            <h2 className="text-lg font-bold mb-0.5">Add Plot Sale</h2>
            <p className="opacity-90 text-sm">Enter comprehensive plot details and pricing information</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="flex bg-gray-50 border-b border-gray-200 rounded-t-lg">
              {tabLabels.map((tab, index) => (
                <button
                  key={index}
                  className={`flex-1 bg-transparent border-none px-4 py-3 cursor-pointer text-sm font-semibold transition-all duration-300 relative ${currentTab === index ? 'bg-white text-slate-700 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                  onClick={() => handleTabChange(index)}
                  type="button"
                >
                  <i className={tab.icon}></i> {tab.label}
                </button>
              ))}
            </div>

            <form>
              <div className="pt-6 pb-1.5 px-1.5">
                {/* Basic Details Tab */}
                {currentTab === 0 && (
                  <div className="block">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2 mb-6 shadow-sm border border-gray-200">
                      <div className="font-bold text-gray-800 mb-1 text-sm flex items-center before:content-['▶'] before:text-blue-600 before:mr-2 before:text-xs">Plot Information</div>
                      <div className="grid grid-cols-7 gap-1 bg-white rounded border border-gray-200 p-1" style={{gridTemplateColumns: '1fr 1fr 1.5fr 1fr 0.6fr 1fr 1fr'}}>
                        <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Plot Number</div>
                        <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Sub-Location</div>
                        <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Landmark</div>
                        <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Location / Station</div>
                        <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">PIN Code</div>
                        <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">State</div>
                        <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">District</div>
                        
                        <div className="p-1">
                          <input name="plotNumber" value={formData.plotNumber} onChange={handleInputChange} placeholder="Enter plot number" className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" />
                        </div>
                        <div className="p-1">
                          <input name="sublocation" value={formData.sublocation} onChange={handleInputChange} placeholder="Enter sub-location" className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" />
                        </div>
                        <div className="p-1">
                          <input name="landmark" value={formData.landmark} onChange={handleInputChange} placeholder="Enter nearby landmark" className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" />
                        </div>
                        <div className="p-1">
                          <input name="location" value={formData.location} onChange={handleInputChange} placeholder="Enter location/station" className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" />
                        </div>
                        <div className="p-1">
                          <input name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="PIN" className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" />
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

                {/* Plot Details Tab */}
                {currentTab === 1 && (
                  <div className="block">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2 mb-6 shadow-sm border border-gray-200">
                      <div className="font-bold text-gray-800 mb-1 text-sm flex items-center before:content-['▶'] before:text-blue-600 before:mr-2 before:text-xs">Plot Specifications</div>
                      <div className="grid grid-cols-5 gap-1 bg-white rounded border border-gray-200 p-1">
                        <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Plot Area</div>
                        <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Plot Type</div>
                        <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Road Width (ft)</div>
                        <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Corner Plot</div>
                        <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Boundary Wall</div>
                        
                        <div className="p-1">
                          <div className="flex gap-1 w-full">
                            <input name="plotArea" value={formData.plotArea} onChange={handleInputChange} placeholder="Area" className="p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" style={{width: `${Math.max(130, Math.min(120, formData.plotArea.length * 8 + 30))}px`, flexShrink: 0}} />
                            <select name="plotAreaUnit" value={formData.plotAreaUnit} onChange={handleInputChange} className="flex-1 min-w-0 p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white cursor-pointer">
                              <option value="sq.ft">sq.ft</option>
                              <option value="sq.m">sq.m</option>
                              <option value="acre">acre</option>
                              <option value="guntha">guntha</option>
                            </select>
                          </div>
                        </div>
                        <div className="p-1">
                          <select name="plotType" value={formData.plotType} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white cursor-pointer">
                            <option value="">Select Type</option>
                            <option value="Residential">Residential</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Industrial">Industrial</option>
                            <option value="Agricultural">Agricultural</option>
                            <option value="NA Plot">NA Plot</option>
                          </select>
                        </div>
                        <div className="p-1">
                          <input name="roadWidth" value={formData.roadWidth} onChange={handleInputChange} placeholder="Width in ft" className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" />
                        </div>
                        <div className="p-1">
                          <select name="cornerPlot" value={formData.cornerPlot} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white cursor-pointer">
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                        <div className="p-1">
                          <select name="boundaryWall" value={formData.boundaryWall} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white cursor-pointer">
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                            <option value="Partial">Partial</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2 mb-6 shadow-sm border border-gray-200">
                      <div className="font-bold text-gray-800 mb-1 text-sm flex items-center before:content-['▶'] before:text-blue-600 before:mr-2 before:text-xs">Pricing Information</div>
                      <div className="grid grid-cols-4 gap-1 bg-white rounded border border-gray-200 p-1">
                        <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Total Price (₹)</div>
                        <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Price per {formData.plotAreaUnit} (₹)</div>
                        <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Negotiable</div>
                        <div className="bg-gray-100 px-2 py-2 font-semibold text-sm text-slate-700 text-center rounded-sm">Plus Property</div>
                        
                        <div className="p-1">
                          <input name="totalPrice" value={formData.totalPrice} onChange={handleInputChange} placeholder="Enter total price" className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white" />
                        </div>
                        <div className="p-1">
                          <input name="pricePerSqft" value={formData.pricePerSqft} onChange={handleInputChange} placeholder="Auto-calculated" className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-gray-100" readOnly />
                        </div>
                        <div className="p-1">
                          <select name="negotiable" value={formData.negotiable} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white cursor-pointer">
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                        <div className="p-1">
                          <div className="flex gap-1">
                            <select name="plusProperty" value={formData.plusProperty} onChange={handleInputChange} className="flex-1 p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm bg-white cursor-pointer">
                              <option value="">Plus Property?</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                            {formData.plusProperty === 'Yes' && (
                              <select name="plusPropertyType" value={formData.plusPropertyType} onChange={handleInputChange} className={`flex-1 p-2 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-sm cursor-pointer ${formData.plusPropertyType ? 'border border-gray-300 bg-white' : 'border-2 border-orange-400 bg-orange-50'}`}>
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

              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between items-center">
                <div>
                  <button
                    type="button"
                    className="px-3 py-2 bg-gradient-to-r from-gray-400 to-gray-300 text-white border border-gray-500 rounded cursor-pointer text-xs font-semibold transition-all duration-200 inline-flex items-center gap-1 shadow-sm hover:from-gray-500 hover:to-gray-400 hover:-translate-y-0.5 hover:shadow-md"
                    onClick={handlePrevious}
                    style={{display: currentTab === 0 ? 'none' : 'inline-flex'}}
                  >
                    <i className="fas fa-arrow-left"></i> Previous
                  </button>
                </div>
                <div className="ml-auto">
                  <button
                    type="button"
                    className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-400 text-white border border-blue-600 rounded cursor-pointer text-xs font-semibold transition-all duration-200 inline-flex items-center gap-1 shadow-sm hover:from-blue-600 hover:to-blue-500 hover:-translate-y-0.5 hover:shadow-md"
                    onClick={currentTab === tabLabels.length - 1 ? undefined : handleNext}
                  >
                    {currentTab === tabLabels.length - 1 ? (
                      <>
                        <i className="fas fa-save"></i> Save Plot
                      </>
                    ) : (
                      <>
                        Next <i className="fas fa-arrow-right"></i>
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

export default PlotSalePropertyForm;