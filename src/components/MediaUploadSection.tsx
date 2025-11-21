import React, { useState } from 'react';

interface MediaFiles {
  brochure: File | null;
  elevationImages: File[];
  amenitiesImages: File[];
  floorPlanImages: File[];
  projectWalkthrough: File[];
}

const MediaUploadSection: React.FC = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFiles>({
    brochure: null,
    elevationImages: [],
    amenitiesImages: [],
    floorPlanImages: [],
    projectWalkthrough: []
  });

  return (
    <div className="bg-white p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Brochure */}
        <div className="border rounded-lg">
          <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">▶</span>
              <span className="font-medium">Upload Brochure</span>
            </div>
            <label
              htmlFor="brochure-upload"
              className="text-blue-500 text-sm flex items-center gap-1 cursor-pointer"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ transform: "rotate(45deg)" }}
              >
                <path d="M16.5,6V17.5A4,4 0 0,1 12.5,21.5A4,4 0 0,1 8.5,17.5V5A2.5,2.5 0 0,1 11,2.5A2.5,2.5 0 0,1 13.5,5V15.5A1,1 0 0,1 12.5,16.5A1,1 0 0,1 11.5,15.5V6H10V15.5A2.5,2.5 0 0,0 12.5,18A2.5,2.5 0 0,0 15,15.5V5A4,4 0 0,0 11,1A4,4 0 0,0 7,5V17.5A5.5,5.5 0 0,0 12.5,23A5.5,5.5 0 0,0 18,17.5V6H16.5Z" />
              </svg>
              Brochure
            </label>
          </div>
          <div className="p-4">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file)
                  setMediaFiles((prev) => ({
                    ...prev,
                    brochure: file,
                  }));
              }}
              className="hidden"
              id="brochure-upload"
            />
            <label
              htmlFor="brochure-upload"
              className="block w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
            >
              <div className="h-full flex items-center justify-center">
                {mediaFiles.brochure ? (
                  <div className="text-center p-4 w-full">
                    <div className="w-16 h-16 mx-auto mb-2 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600 block truncate px-2">
                      {mediaFiles.brochure.name}
                    </span>
                    <span className="text-xs text-gray-400 block mt-1">
                      {(mediaFiles.brochure.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMediaFiles((prev) => ({ ...prev, brochure: null }));
                      }}
                      className="mt-2 text-red-500 hover:text-red-700 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-400">Click to upload brochure</span>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Elevation Images */}
        <div className="border rounded-lg">
          <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">▶</span>
              <span className="font-medium">Elevation Images (Max 10)</span>
            </div>
            <label htmlFor="elevation-upload" className="text-blue-500 text-sm flex items-center gap-1 cursor-pointer">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ transform: "rotate(45deg)" }}
              >
                <path d="M16.5,6V17.5A4,4 0 0,1 12.5,21.5A4,4 0 0,1 8.5,17.5V5A2.5,2.5 0 0,1 11,2.5A2.5,2.5 0 0,1 13.5,5V15.5A1,1 0 0,1 12.5,16.5A1,1 0 0,1 11.5,15.5V6H10V15.5A2.5,2.5 0 0,0 12.5,18A2.5,2.5 0 0,0 15,15.5V5A4,4 0 0,0 11,1A4,4 0 0,0 7,5V17.5A5.5,5.5 0 0,0 12.5,23A5.5,5.5 0 0,0 18,17.5V6H16.5Z" />
              </svg>
              Elevation
            </label>
          </div>
          <div className="p-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []).slice(0, 10);
                setMediaFiles((prev) => ({
                  ...prev,
                  elevationImages: [...prev.elevationImages, ...files].slice(0, 10),
                }));
              }}
              className="hidden"
              id="elevation-upload"
            />
            <label
              htmlFor="elevation-upload"
              className="block w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
            >
              <div className="h-full p-2">
                {mediaFiles.elevationImages.length > 0 ? (
                  <div className="grid grid-cols-5 gap-1 h-full">
                    {mediaFiles.elevationImages.slice(0, 10).map((file, index) => {
                      const imageUrl = URL.createObjectURL(file);
                      return (
                        <div key={index} className="relative">
                          <img
                            src={imageUrl}
                            alt={`Elevation ${index + 1}`}
                            className="w-full h-14 object-cover rounded"
                            onLoad={() => URL.revokeObjectURL(imageUrl)}
                            onError={(e) => {
                              console.error('Image failed to load:', e);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setMediaFiles((prev) => ({
                                ...prev,
                                elevationImages: prev.elevationImages.filter((_, i) => i !== index),
                              }));
                            }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <span className="text-gray-400">Click to upload elevation images</span>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Amenities Images */}
        <div className="border rounded-lg">
          <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">▶</span>
              <span className="font-medium">Amenities Images (Max 10)</span>
            </div>
            <label htmlFor="amenities-upload" className="text-blue-500 text-sm flex items-center gap-1 cursor-pointer">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ transform: "rotate(45deg)" }}
              >
                <path d="M16.5,6V17.5A4,4 0 0,1 12.5,21.5A4,4 0 0,1 8.5,17.5V5A2.5,2.5 0 0,1 11,2.5A2.5,2.5 0 0,1 13.5,5V15.5A1,1 0 0,1 12.5,16.5A1,1 0 0,1 11.5,15.5V6H10V15.5A2.5,2.5 0 0,0 12.5,18A2.5,2.5 0 0,0 15,15.5V5A4,4 0 0,0 11,1A4,4 0 0,0 7,5V17.5A5.5,5.5 0 0,0 12.5,23A5.5,5.5 0 0,0 18,17.5V6H16.5Z" />
              </svg>
              Amenities
            </label>
          </div>
          <div className="p-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []).slice(0, 10);
                setMediaFiles((prev) => ({
                  ...prev,
                  amenitiesImages: [...prev.amenitiesImages, ...files].slice(0, 10),
                }));
              }}
              className="hidden"
              id="amenities-upload"
            />
            <label
              htmlFor="amenities-upload"
              className="block w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
            >
              <div className="h-full p-2">
                {mediaFiles.amenitiesImages.length > 0 ? (
                  <div className="grid grid-cols-5 gap-1 h-full">
                    {mediaFiles.amenitiesImages.slice(0, 10).map((file, index) => {
                      const imageUrl = URL.createObjectURL(file);
                      return (
                        <div key={index} className="relative">
                          <img
                            src={imageUrl}
                            alt={`Amenity ${index + 1}`}
                            className="w-full h-14 object-cover rounded"
                            onLoad={() => URL.revokeObjectURL(imageUrl)}
                            onError={(e) => {
                              console.error('Image failed to load:', e);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setMediaFiles((prev) => ({
                                ...prev,
                                amenitiesImages: prev.amenitiesImages.filter((_, i) => i !== index),
                              }));
                            }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <span className="text-gray-400">Click to upload amenities images</span>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Floor Plan Images */}
        <div className="border rounded-lg">
          <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">▶</span>
              <span className="font-medium">Floor Plan Images (Max 10)</span>
            </div>
            <label htmlFor="floorplan-upload" className="text-blue-500 text-sm flex items-center gap-1 cursor-pointer">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ transform: "rotate(45deg)" }}
              >
                <path d="M16.5,6V17.5A4,4 0 0,1 12.5,21.5A4,4 0 0,1 8.5,17.5V5A2.5,2.5 0 0,1 11,2.5A2.5,2.5 0 0,1 13.5,5V15.5A1,1 0 0,1 12.5,16.5A1,1 0 0,1 11.5,15.5V6H10V15.5A2.5,2.5 0 0,0 12.5,18A2.5,2.5 0 0,0 15,15.5V5A4,4 0 0,0 11,1A4,4 0 0,0 7,5V17.5A5.5,5.5 0 0,0 12.5,23A5.5,5.5 0 0,0 18,17.5V6H16.5Z" />
              </svg>
              Floor Plans
            </label>
          </div>
          <div className="p-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []).slice(0, 10);
                setMediaFiles((prev) => ({
                  ...prev,
                  floorPlanImages: [...prev.floorPlanImages, ...files].slice(0, 10),
                }));
              }}
              className="hidden"
              id="floorplan-upload"
            />
            <label
              htmlFor="floorplan-upload"
              className="block w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
            >
              <div className="h-full p-2">
                {mediaFiles.floorPlanImages.length > 0 ? (
                  <div className="grid grid-cols-5 gap-1 h-full">
                    {mediaFiles.floorPlanImages.slice(0, 10).map((file, index) => {
                      const imageUrl = URL.createObjectURL(file);
                      return (
                        <div key={index} className="relative">
                          <img
                            src={imageUrl}
                            alt={`Floor plan ${index + 1}`}
                            className="w-full h-14 object-cover rounded"
                            onLoad={() => URL.revokeObjectURL(imageUrl)}
                            onError={(e) => {
                              console.error('Image failed to load:', e);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setMediaFiles((prev) => ({
                                ...prev,
                                floorPlanImages: prev.floorPlanImages.filter((_, i) => i !== index),
                              }));
                            }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <span className="text-gray-400">Click to upload floor plan images</span>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Project Walkthrough */}
        <div className="border rounded-lg lg:col-span-2">
          <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">▶</span>
              <span className="font-medium">Project Walkthrough (Max 2)</span>
            </div>
            <label htmlFor="video-upload" className="text-blue-500 text-sm flex items-center gap-1 cursor-pointer">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ transform: "rotate(45deg)" }}
              >
                <path d="M16.5,6V17.5A4,4 0 0,1 12.5,21.5A4,4 0 0,1 8.5,17.5V5A2.5,2.5 0 0,1 11,2.5A2.5,2.5 0 0,1 13.5,5V15.5A1,1 0 0,1 12.5,16.5A1,1 0 0,1 11.5,15.5V6H10V15.5A2.5,2.5 0 0,0 12.5,18A2.5,2.5 0 0,0 15,15.5V5A4,4 0 0,0 11,1A4,4 0 0,0 7,5V17.5A5.5,5.5 0 0,0 12.5,23A5.5,5.5 0 0,0 18,17.5V6H16.5Z" />
              </svg>
              Videos
            </label>
          </div>
          <div className="p-4">
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []).slice(0, 2);
                setMediaFiles((prev) => ({
                  ...prev,
                  projectWalkthrough: [...prev.projectWalkthrough, ...files].slice(0, 2),
                }));
              }}
              className="hidden"
              id="video-upload"
            />
            <label
              htmlFor="video-upload"
              className="block w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
            >
              <div className="h-full p-2">
                {mediaFiles.projectWalkthrough.length > 0 ? (
                  <div className="flex gap-4 h-full">
                    {mediaFiles.projectWalkthrough.map((file, index) => {
                      const videoUrl = URL.createObjectURL(file);
                      return (
                        <div key={index} className="flex-1 relative">
                          <video
                            src={videoUrl}
                            className="w-full h-full object-cover rounded"
                            controls={false}
                            onLoadedData={() => URL.revokeObjectURL(videoUrl)}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                            </svg>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setMediaFiles((prev) => ({
                                ...prev,
                                projectWalkthrough: prev.projectWalkthrough.filter((_, i) => i !== index),
                              }));
                            }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                          >
                            ×
                          </button>
                          <span className="absolute bottom-1 left-1 text-xs text-white bg-black bg-opacity-50 px-1 rounded">
                            {file.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <span className="text-gray-400">Click to upload walkthrough videos</span>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaUploadSection;