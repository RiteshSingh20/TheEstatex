import React, { useState } from 'react';
import MarketingMessage from './MarketingMessage';
import { FormDataType } from '../pages/CostSheetFormProps';

interface Contact {
  name: string;
  phone: string;
}

interface MediaFiles {
  brochure: File | string | null;
  elevationImages: (File | string)[];
  amenitiesImages: (File | string)[];
  floorPlanImages: (File | string)[];
  projectWalkthrough: (File | string)[];
  typologyImages: Record<string, (File | string)[]>;
  typologyVideos: Record<string, File | string | null>;
}

interface ExistingMedia {
  brochure: string | null;
  elevationImages: string[];
  amenitiesImages: string[];
  floorPlanImages: string[];
  projectWalkthrough: string[];
  typologyImages: Record<string, string[]>;
  typologyVideos: Record<string, string | null>;
}

interface ContactsCollateralsProps {
  siteHeads?: Contact[];
  setSiteHeads?: React.Dispatch<React.SetStateAction<Contact[]>>;
  sourcingManagers?: Contact[];
  setSourcingManagers?: React.Dispatch<React.SetStateAction<Contact[]>>;
  mediaFiles?: MediaFiles;
  setMediaFiles?: React.Dispatch<React.SetStateAction<MediaFiles>>;
  existingMedia?: ExistingMedia;
  typologies?: string[];
  formData?: FormDataType;
  subTabData?: Record<string, any>;
  paymentSchemes?: Array<{ schemeName: string; description: string }>;
  highlights?: string[];
  projectAmenities?: string[];
  apartmentAmenities?: string[];
}

const ContactsCollaterals: React.FC<ContactsCollateralsProps> = ({
  siteHeads = [{ name: '', phone: '' }],
  setSiteHeads = () => {},
  sourcingManagers = [{ name: '', phone: '' }],
  setSourcingManagers = () => {},
  mediaFiles = {
    brochure: null,
    elevationImages: [],
    amenitiesImages: [],
    floorPlanImages: [],
    projectWalkthrough: [],
    typologyImages: {},
    typologyVideos: {}
  },
  setMediaFiles = () => {},
  existingMedia = {
    brochure: null,
    elevationImages: [],
    amenitiesImages: [],
    floorPlanImages: [],
    projectWalkthrough: [],
    typologyImages: {},
    typologyVideos: {}
  },
  typologies = [],
  formData,
  subTabData = {},
  paymentSchemes = [],
  highlights = [],
  projectAmenities = [],
  apartmentAmenities = []
}) => {
  console.log('ContactsCollaterals - mediaFiles:', mediaFiles);
  console.log('ContactsCollaterals - existingMedia:', existingMedia);
  console.log('ContactsCollaterals - typologies:', typologies);
  
  // Merge existing media with new uploads for display using useMemo to prevent infinite re-renders
  const displayMedia = React.useMemo(() => {
    try {
      return {
        brochure: mediaFiles?.brochure || existingMedia?.brochure || null,
        elevationImages: [...(existingMedia?.elevationImages || []), ...(mediaFiles?.elevationImages || [])],
        amenitiesImages: [...(existingMedia?.amenitiesImages || []), ...(mediaFiles?.amenitiesImages || [])],
        floorPlanImages: [...(existingMedia?.floorPlanImages || []), ...(mediaFiles?.floorPlanImages || [])],
        projectWalkthrough: [...(existingMedia?.projectWalkthrough || []), ...(mediaFiles?.projectWalkthrough || [])],
        typologyImages: {
          ...(existingMedia?.typologyImages || {}),
          ...(mediaFiles?.typologyImages || {})
        },
        typologyVideos: {
          ...(existingMedia?.typologyVideos || {}),
          ...(mediaFiles?.typologyVideos || {})
        }
      };
    } catch (error) {
      console.error('Error merging media:', error);
      return {
        brochure: null,
        elevationImages: [],
        amenitiesImages: [],
        floorPlanImages: [],
        projectWalkthrough: [],
        typologyImages: {},
        typologyVideos: {}
      };
    }
  }, [mediaFiles, existingMedia]);
  const [pdfThumbnail, setPdfThumbnail] = useState<string | null>(null);
  const [videoThumbnails, setVideoThumbnails] = useState<Record<string, string>>({});
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'uploading' | 'success'>>({});

  const generateVideoThumbnail = (file: File, key?: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type === 'application/pdf') {
        // For PDF files, create a canvas to render first page
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const url = URL.createObjectURL(file);
        
        // Simple PDF thumbnail - just return a data URL for now
        canvas.width = 120;
        canvas.height = 160;
        if (ctx) {
          ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#374151';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('PDF', canvas.width / 2, canvas.height / 2);
        }
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
        if (key) setVideoThumbnails(prev => ({ ...prev, [key]: thumbnail }));
        resolve(thumbnail);
        return;
      }
      
      // Original video thumbnail logic
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.src = URL.createObjectURL(file);
      video.currentTime = 1;
      
      video.onloadeddata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx?.drawImage(video, 0, 0);
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
        if (key) setVideoThumbnails(prev => ({ ...prev, [key]: thumbnail }));
        URL.revokeObjectURL(video.src);
        resolve(thumbnail);
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Failed to generate thumbnail'));
      };
    });
  };

  const generateVideoThumbnailLegacy = (file: File, key: string) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    video.src = URL.createObjectURL(file);
    video.currentTime = 1; // Capture frame at 1 second
    
    video.onloadeddata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx?.drawImage(video, 0, 0);
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
      setVideoThumbnails(prev => ({ ...prev, [key]: thumbnail }));
      URL.revokeObjectURL(video.src);
    };
  };

  const addContact = (type: 'siteHeads' | 'sourcingManagers') => {
    console.log(`Adding new ${type} contact`);
    if (type === 'siteHeads' && setSiteHeads) {
      setSiteHeads(prev => [...prev, { name: '', phone: '' }]);
    } else if (type === 'sourcingManagers' && setSourcingManagers) {
      setSourcingManagers(prev => [...prev, { name: '', phone: '' }]);
    }
  };

  const removeContact = (type: 'siteHeads' | 'sourcingManagers', index: number) => {
    console.log(`Removing ${type} contact at index ${index}`);
    if (type === 'siteHeads' && siteHeads.length > 1 && setSiteHeads) {
      setSiteHeads(prev => prev.filter((_, i) => i !== index));
    } else if (type === 'sourcingManagers' && sourcingManagers.length > 1 && setSourcingManagers) {
      setSourcingManagers(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateContact = (type: 'siteHeads' | 'sourcingManagers', index: number, field: 'name' | 'phone', value: string) => {
    console.log(`Updating ${type} contact ${index} ${field}:`, value);
    if (type === 'siteHeads' && setSiteHeads) {
      setSiteHeads(prev => prev.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      ));
    } else if (type === 'sourcingManagers' && setSourcingManagers) {
      setSourcingManagers(prev => prev.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      ));
    }
  };

  const handleBrochureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    console.log('Brochure file selected:', file);
    if (file) {
      setUploadStatus(prev => ({ ...prev, brochure: 'uploading' }));
      
      setTimeout(async () => {
        setUploadStatus(prev => ({ ...prev, brochure: 'success' }));
        console.log('Brochure file details:', {
          name: file.name,
          size: file.size,
          type: file.type
        });
        setMediaFiles && setMediaFiles(prev => ({ ...prev, brochure: file }));
        
        if (file.type === 'application/pdf') {
          console.log('Generating PDF thumbnail');
          try {
            const thumbnail = await generateVideoThumbnail(file);
            setPdfThumbnail(thumbnail);
          } catch (error) {
            console.error('Failed to generate PDF thumbnail:', error);
            setPdfThumbnail(null);
          }
        } else {
          setPdfThumbnail(null);
        }
      }, 1000);
    }
    e.target.value = '';
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: keyof MediaFiles) => {
    const files = Array.from(e.target.files || []);
    console.log(`${type} images selected:`, files.length, 'files');
    
    if (files.length > 0) {
      const statusKey = type === 'elevationImages' ? 'elevation' : type === 'amenitiesImages' ? 'amenities' : type === 'floorPlanImages' ? 'floorplan' : 'walkthrough';
      setUploadStatus(prev => ({ ...prev, [statusKey]: 'uploading' }));
      
      setTimeout(() => {
        setUploadStatus(prev => ({ ...prev, [statusKey]: 'success' }));
        
        files.forEach((file, index) => {
          console.log(`${type} image ${index + 1}:`, {
            name: file.name,
            size: file.size,
            type: file.type
          });
        });

        const maxFiles = type === 'projectWalkthrough' ? 2 : 10;
        const limitedFiles = files.slice(0, maxFiles);

        setMediaFiles && setMediaFiles(prev => ({
          ...prev,
          [type]: [...(prev[type] as File[]), ...limitedFiles].slice(0, maxFiles)
        }));
      }, 1500);
    }
    e.target.value = '';
  };

  const handleTypologyImageUpload = (e: React.ChangeEvent<HTMLInputElement>, typology: string) => {
    const files = Array.from(e.target.files || []).slice(0, 10);
    console.log(`Typology ${typology} images selected:`, files.length, 'files');
    
    setMediaFiles && setMediaFiles(prev => ({
      ...prev,
      typologyImages: {
        ...prev.typologyImages,
        [typology]: [...(prev.typologyImages[typology] || []), ...files].slice(0, 10)
      }
    }));
    e.target.value = '';
  };

  const handleTypologyVideoUpload = (e: React.ChangeEvent<HTMLInputElement>, typology: string) => {
    const file = e.target.files?.[0] || null;
    console.log(`Typology ${typology} video selected:`, file);
    
    setMediaFiles && setMediaFiles(prev => ({
      ...prev,
      typologyVideos: {
        ...prev.typologyVideos,
        [typology]: file
      }
    }));
    e.target.value = '';
  };

  const removeMediaFile = (type: keyof MediaFiles, index?: number, typology?: string) => {
    console.log(`Removing ${type} file`, index !== undefined ? `at index ${index}` : '', typology ? `for typology ${typology}` : '');
    
    if (!setMediaFiles) return;
    
    if (type === 'brochure') {
      setMediaFiles(prev => ({ ...prev, brochure: null }));
      setPdfThumbnail(null);
    } else if (typology && (type === 'typologyImages' || type === 'typologyVideos')) {
      if (type === 'typologyImages' && index !== undefined) {
        setMediaFiles(prev => ({
          ...prev,
          typologyImages: {
            ...prev.typologyImages,
            [typology]: prev.typologyImages[typology]?.filter((_, i) => i !== index) || []
          }
        }));
      } else if (type === 'typologyVideos') {
        setMediaFiles(prev => ({
          ...prev,
          typologyVideos: {
            ...prev.typologyVideos,
            [typology]: null
          }
        }));
      }
    } else if (index !== undefined) {
      setMediaFiles(prev => ({
        ...prev,
        [type]: (prev[type] as File[]).filter((_, i) => i !== index)
      }));
    }
  };



  try {
    return (
      <div className="bg-white p-4">
      {/* Contact Information Section */}
      <div className="section-title mb-4">Contact Information</div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Site Head */}
        <div className="border rounded-lg">
          <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">▶</span>
              <span className="font-medium">Site Head</span>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-2 mb-2 text-sm font-medium text-gray-600">
              <div>Name</div>
              <div>Phone</div>
            </div>
            {siteHeads.map((head, index) => (
              <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  value={head.name}
                  onChange={(e) => updateContact('siteHeads', index, 'name', e.target.value)}
                  className="border px-2 py-1 text-sm rounded"
                  placeholder="Enter name"
                />
                <input
                  type="tel"
                  value={head.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                    updateContact('siteHeads', index, 'phone', value);
                  }}
                  className="border px-2 py-1 text-sm rounded"
                  placeholder="Enter phone"
                  maxLength={10}
                />
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => addContact('siteHeads')}
                className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
              >
                + Add
              </button>
              {siteHeads.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeContact('siteHeads', siteHeads.length - 1)}
                  className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                >
                  - Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sourcing Managers */}
        <div className="border rounded-lg">
          <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">▶</span>
              <span className="font-medium">Sourcing Managers</span>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-2 mb-2 text-sm font-medium text-gray-600">
              <div>Name</div>
              <div>Phone</div>
            </div>
            {sourcingManagers.map((manager, index) => (
              <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  value={manager.name}
                  onChange={(e) => updateContact('sourcingManagers', index, 'name', e.target.value)}
                  className="border px-2 py-1 text-sm rounded"
                  placeholder="Enter name"
                />
                <input
                  type="tel"
                  value={manager.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                    updateContact('sourcingManagers', index, 'phone', value);
                  }}
                  className="border px-2 py-1 text-sm rounded"
                  placeholder="Enter phone"
                  maxLength={10}
                />
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => addContact('sourcingManagers')}
                className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
              >
                + Add
              </button>
              {sourcingManagers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeContact('sourcingManagers', sourcingManagers.length - 1)}
                  className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                >
                  - Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Collaterals & Media Section */}
      <div className="section-title mb-4">Collaterals & Media</div>

      {/* Brochure Upload */}
      <div className="border rounded-lg mb-4">
        <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">▶</span>
            <span className="font-medium">Upload Brochure</span>
          </div>
          <label htmlFor="brochure-upload" className="text-blue-500 text-sm cursor-pointer">
            Brochure
          </label>
        </div>
        <div className="p-4">
          <input
            id="brochure-upload"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleBrochureUpload}
            className="hidden"
          />
          <label htmlFor="brochure-upload" className="block w-full">
            <div className="aspect-square w-32 mx-auto border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center">
              {uploadStatus['brochure'] === 'uploading' ? (
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-sm text-blue-600">Uploading...</p>
                </div>
              ) : displayMedia.brochure ? (
                <div className="relative w-full h-full">
                  <div className="w-full h-full flex items-center justify-center">
                    {typeof displayMedia.brochure !== 'string' && displayMedia.brochure.type === 'application/pdf' && pdfThumbnail ? (
                      <img src={pdfThumbnail} alt="PDF Preview" className="w-full h-full object-cover rounded" />
                    ) : (
                      <div className="w-full h-full bg-green-500 rounded flex flex-col items-center justify-center text-white">
                        <div className="text-2xl mb-2">📄</div>
                        <div className="text-xs font-bold">{typeof displayMedia.brochure === 'string' || (displayMedia.brochure && displayMedia.brochure.type === 'application/pdf') ? 'PDF' : 'DOC'}</div>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeMediaFile('brochure');
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl">📄</span>
                  </div>
                  <span className="text-gray-500 font-medium text-sm">Upload brochure</span>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX</p>
                </div>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Image Uploads Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Elevation Images */}
        <div className="border rounded-lg">
          <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">Elevation Images (Max 10)</span>
              {displayMedia.elevationImages.length > 0 && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {displayMedia.elevationImages.length} uploaded
                </span>
              )}
            </div>
            {uploadStatus['elevation'] === 'success' && (
              <span className="text-green-600 text-sm">✓ Upload complete</span>
            )}
          </div>
          <div className="p-4">
            <div className="mb-3">
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e, 'elevationImages')}
                    className="hidden"
                  />
                  {uploadStatus['elevation'] === 'uploading' ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-blue-600 text-sm">Uploading...</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-2xl mb-2 block">🖼️</span>
                      <span className="text-gray-600 text-sm">Click to select elevation images</span>
                    </div>
                  )}
                </div>
              </label>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {displayMedia.elevationImages.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                    <img
                      src={typeof file === 'string' ? file : URL.createObjectURL(file)}
                      alt={`Elevation ${index + 1}`}
                      className="w-full h-full object-cover"
                      onLoad={() => console.log(`Elevation image ${index + 1} loaded successfully`)}
                      onError={() => console.error(`Failed to load elevation image ${index + 1}`)}
                    />
                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                      {typeof file === 'string' ? 'DB' : (file.size / (1024 * 1024)).toFixed(1) + 'MB'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMediaFile('elevationImages', index)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg">
                    <p className="text-white text-xs truncate">{typeof file === 'string' ? 'Existing Image' : file.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Amenities Images */}
        <div className="border rounded-lg">
          <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">Amenities Images (Max 10)</span>
              {displayMedia.amenitiesImages.length > 0 && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {displayMedia.amenitiesImages.length} uploaded
                </span>
              )}
            </div>
            {uploadStatus['amenities'] === 'success' && (
              <span className="text-green-600 text-sm">✓ Upload complete</span>
            )}
          </div>
          <div className="p-4">
            <div className="mb-3">
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e, 'amenitiesImages')}
                    className="hidden"
                  />
                  {uploadStatus['amenities'] === 'uploading' ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-blue-600 text-sm">Uploading...</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-2xl mb-2 block">🏊</span>
                      <span className="text-gray-600 text-sm">Click to select amenities images</span>
                    </div>
                  )}
                </div>
              </label>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {displayMedia.amenitiesImages.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                    <img
                      src={typeof file === 'string' ? file : URL.createObjectURL(file)}
                      alt={`Amenity ${index + 1}`}
                      className="w-full h-full object-cover"
                      onLoad={() => console.log(`Amenity image ${index + 1} loaded successfully`)}
                      onError={() => console.error(`Failed to load amenity image ${index + 1}`)}
                    />
                    <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                      ✓
                    </div>
                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                      {typeof file === 'string' ? 'DB' : (file.size / (1024 * 1024)).toFixed(1) + 'MB'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMediaFile('amenitiesImages', index)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg">
                    <p className="text-white text-xs truncate">{typeof file === 'string' ? 'Existing Image' : file.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floor Plan Images */}
        <div className="border rounded-lg">
          <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">Floor Plan Images (Max 10)</span>
              {displayMedia.floorPlanImages.length > 0 && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {displayMedia.floorPlanImages.length} uploaded
                </span>
              )}
            </div>
            {uploadStatus['floorplan'] === 'success' && (
              <span className="text-green-600 text-sm">✓ Upload complete</span>
            )}
          </div>
          <div className="p-4">
            <div className="mb-3">
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e, 'floorPlanImages')}
                    className="hidden"
                  />
                  {uploadStatus['floorplan'] === 'uploading' ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-blue-600 text-sm">Uploading...</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-2xl mb-2 block">📐</span>
                      <span className="text-gray-600 text-sm">Click to select floor plan images</span>
                    </div>
                  )}
                </div>
              </label>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {displayMedia.floorPlanImages.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                    <img
                      src={typeof file === 'string' ? file : URL.createObjectURL(file)}
                      alt={`Floor Plan ${index + 1}`}
                      className="w-full h-full object-cover"
                      onLoad={() => console.log(`Floor plan image ${index + 1} loaded successfully`)}
                      onError={() => console.error(`Failed to load floor plan image ${index + 1}`)}
                    />
                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                      {typeof file === 'string' ? 'DB' : (file.size / (1024 * 1024)).toFixed(1) + 'MB'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMediaFile('floorPlanImages', index)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg">
                    <p className="text-white text-xs truncate">{typeof file === 'string' ? 'Existing Image' : file.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Walkthrough Videos */}
        <div className="border rounded-lg">
          <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">Project Walkthrough (Max 2)</span>
              {displayMedia.projectWalkthrough.length > 0 && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {displayMedia.projectWalkthrough.length} uploaded
                </span>
              )}
            </div>
            {uploadStatus['walkthrough'] === 'success' && (
              <span className="text-green-600 text-sm">✓ Upload complete</span>
            )}
          </div>
          <div className="p-4">
            <div className="mb-3">
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={(e) => handleImageUpload(e, 'projectWalkthrough')}
                    className="hidden"
                  />
                  {uploadStatus['walkthrough'] === 'uploading' ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-blue-600 text-sm">Uploading...</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-2xl mb-2 block">🎥</span>
                      <span className="text-gray-600 text-sm">Click to select walkthrough videos</span>
                    </div>
                  )}
                </div>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {displayMedia.projectWalkthrough.map((file, index) => {
                const videoKey = `walkthrough-${index}`;
                if (typeof file !== 'string' && !videoThumbnails[videoKey]) {
                  generateVideoThumbnailLegacy(file, videoKey);
                }
                return (
                  <div key={index} className="relative group">
                    <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                      {videoThumbnails[videoKey] ? (
                        <img
                          src={videoThumbnails[videoKey]}
                          alt={`Video ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={typeof file === 'string' ? file : URL.createObjectURL(file)}
                          className="w-full h-full object-cover"
                          muted
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                        <div className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                          <span className="text-sm">▶</span>
                        </div>
                      </div>
                      <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                        {typeof file === 'string' ? 'DB' : (file.size / (1024 * 1024)).toFixed(1) + 'MB'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMediaFile('projectWalkthrough', index)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg">
                      <p className="text-white text-xs truncate">{typeof file === 'string' ? 'Existing Video' : file.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Typology Images & Videos */}
      {typologies.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Typology Images */}
          <div className="border rounded-lg">
            <div className="p-4 bg-gray-50 border-b">
              <span className="font-medium">Typology Images (Max 10 per typology)</span>
            </div>
            <div className="p-4 space-y-4">
              {typologies.map(typology => (
                <div key={typology}>
                  <h4 className="font-medium mb-2">{typology}</h4>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleTypologyImageUpload(e, typology)}
                    className="mb-2 text-sm"
                  />
                  <div className="grid grid-cols-4 gap-3">
                    {(displayMedia.typologyImages[typology] || []).map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                          <img
                            src={typeof file === 'string' ? file : URL.createObjectURL(file)}
                            alt={`${typology} ${index + 1}`}
                            className="w-full h-full object-cover"
                            onLoad={() => console.log(`${typology} image ${index + 1} loaded successfully`)}
                            onError={() => console.error(`Failed to load ${typology} image ${index + 1}`)}
                          />
                          <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                            ✓
                          </div>
                          <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                            {typeof file === 'string' ? 'DB' : (file.size / (1024 * 1024)).toFixed(1) + 'MB'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMediaFile('typologyImages', index, typology)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg">
                          <p className="text-white text-xs truncate">{typeof file === 'string' ? 'Existing Image' : file.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typology Videos */}
          <div className="border rounded-lg">
            <div className="p-4 bg-gray-50 border-b">
              <span className="font-medium">Typology Videos (Max 1 per typology)</span>
            </div>
            <div className="p-4 space-y-4">
              {typologies.map(typology => (
                <div key={typology}>
                  <h4 className="font-medium mb-2">{typology}</h4>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleTypologyVideoUpload(e, typology)}
                    className="mb-2 text-sm"
                  />
                  {displayMedia.typologyVideos[typology] && (() => {
                    const videoKey = `typology-${typology}`;
                    const file = displayMedia.typologyVideos[typology]!;
                    if (typeof file !== 'string' && !videoThumbnails[videoKey]) {
                      generateVideoThumbnailLegacy(file, videoKey);
                    }
                    return (
                      <div className="relative group w-32">
                        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                          {videoThumbnails[videoKey] ? (
                            <img
                              src={videoThumbnails[videoKey]}
                              alt={`${typology} video`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video
                              src={typeof file === 'string' ? file : URL.createObjectURL(file)}
                              className="w-full h-full object-cover"
                              muted
                            />
                          )}
                          <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                            ✓
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                            <div className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                              <span className="text-sm">▶</span>
                            </div>
                          </div>
                          <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                            {typeof file === 'string' ? 'DB' : (file.size / (1024 * 1024)).toFixed(1) + 'MB'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMediaFile('typologyVideos', undefined, typology)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg">
                          <p className="text-white text-xs truncate">{typeof file === 'string' ? 'Existing Video' : file.name}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Marketing Message Section - EXACT SAME LOGIC AS HTML */}
      {formData && (
        <MarketingMessage
          formData={formData}
          subTabData={subTabData}
          paymentSchemes={paymentSchemes}
          highlights={highlights}
          projectAmenities={projectAmenities}
          apartmentAmenities={apartmentAmenities}
        />
      )}

      </div>
    );
  } catch (error) {
    console.error('ContactsCollaterals render error:', error);
    return (
      <div className="bg-white p-4">
        <div className="text-red-500 p-4 border border-red-200 rounded">
          Error loading media. Please refresh the page.
        </div>
      </div>
    );
  }
};

export default ContactsCollaterals;