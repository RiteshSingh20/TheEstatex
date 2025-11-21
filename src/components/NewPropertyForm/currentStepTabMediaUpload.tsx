import React from "react";

export function currentStepTabMediaUpload(
  setMediaFiles: React.Dispatch<
    React.SetStateAction<{
      brochure: File | null;
      elevationImages: File[];
      amenitiesImages: File[];
      floorPlanImages: File[];
      projectWalkthrough: File[];
      typologyImages: Record<string, File[]>;
      typologyVideos: Record<string, File | null>;
    }>
  >,
  generatePdfThumbnail: (file: File) => Promise<string | null>,
  setPdfThumbnail: React.Dispatch<React.SetStateAction<string | null>>,
  mediaFiles: {
    brochure: File | null;
    elevationImages: File[];
    amenitiesImages: File[];
    floorPlanImages: File[];
    projectWalkthrough: File[];
    typologyImages: Record<string, File[]>;
    typologyVideos: Record<string, File | null>;
  },
  pdfThumbnail: string | null,
  subTabData: {
    0: {
      wingBuildingNo: string;
      projectStatus: string;
      type: string;
      developerPossession: string;
      reraPossession: string;
      mahaReraNumber: string;
      mahaReraLink: string;
      pricingConfigs: {
        typology: string;
        saleableArea: string;
        reraCarpet: string;
        psfRate: string;
        avRate: string;
        fixedComponent: string;
        possessionCharges: string;
        totalPackage: string;
        negotiationScope: string;
        availability: string;
        unitPlan: null;
      }[];
    };
  }
): React.ReactNode {
  return (
    <div className="space-y-4">
      <div className="relative border">
        <div className="flex items-center p-2">
          <span className="text-blue-600 mr-1">▶</span>
          <h3 className="font-medium">Collaterals & Media</h3>
        </div>

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
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setMediaFiles((prev) => ({
                        ...prev,
                        brochure: file,
                      }));

                      if (file.type === "application/pdf") {
                        const thumbnail = await generatePdfThumbnail(file);
                        setPdfThumbnail(thumbnail);
                      } else {
                        setPdfThumbnail(null);
                      }
                    }
                    e.target.value = "";
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
                      <div className="h-full flex items-center justify-center p-4">
                        <div className="relative">
                          {pdfThumbnail ? (
                            <img
                              src={pdfThumbnail}
                              alt="PDF Preview"
                              className="w-20 h-24 object-cover rounded border"
                            />
                          ) : (
                            <div className="w-20 h-24 bg-red-100 rounded border flex items-center justify-center">
                              <svg
                                className="w-8 h-8 text-red-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setMediaFiles((prev) => ({
                                ...prev,
                                brochure: null,
                              }));
                              setPdfThumbnail(null);
                            }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">
                        Click to upload brochure
                      </span>
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
                <label
                  htmlFor="elevation-upload"
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
                      elevationImages: [
                        ...prev.elevationImages,
                        ...files,
                      ].slice(0, 10),
                    }));
                    e.target.value = "";
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
                        {mediaFiles.elevationImages
                          .slice(0, 10)
                          .map((file, index) => {
                            const imageUrl = URL.createObjectURL(file);
                            return (
                              <div key={index} className="relative">
                                <img
                                  src={imageUrl}
                                  alt={`Elevation ${index + 1}`}
                                  className="w-full h-14 object-cover rounded"
                                  onLoad={() => URL.revokeObjectURL(imageUrl)}
                                  onError={(e) => {
                                    console.error("Image failed to load:", e);
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setMediaFiles((prev) => ({
                                      ...prev,
                                      elevationImages:
                                        prev.elevationImages.filter(
                                          (_, i) => i !== index
                                        ),
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
                        <span className="text-gray-400">
                          Click to upload elevation images
                        </span>
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
                <label
                  htmlFor="amenities-upload"
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
                      amenitiesImages: [
                        ...prev.amenitiesImages,
                        ...files,
                      ].slice(0, 10),
                    }));
                    e.target.value = "";
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
                        {mediaFiles.amenitiesImages
                          .slice(0, 10)
                          .map((file, index) => {
                            const imageUrl = URL.createObjectURL(file);
                            return (
                              <div key={index} className="relative">
                                <img
                                  src={imageUrl}
                                  alt={`Amenity ${index + 1}`}
                                  className="w-full h-14 object-cover rounded"
                                  onLoad={() => URL.revokeObjectURL(imageUrl)}
                                  onError={(e) => {
                                    console.error("Image failed to load:", e);
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setMediaFiles((prev) => ({
                                      ...prev,
                                      amenitiesImages:
                                        prev.amenitiesImages.filter(
                                          (_, i) => i !== index
                                        ),
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
                        <span className="text-gray-400">
                          Click to upload amenities images
                        </span>
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
                  <span className="font-medium">
                    Floor Plan Images (Max 10)
                  </span>
                </div>
                <label
                  htmlFor="floorplan-upload"
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
                      floorPlanImages: [
                        ...prev.floorPlanImages,
                        ...files,
                      ].slice(0, 10),
                    }));
                    e.target.value = "";
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
                        {mediaFiles.floorPlanImages
                          .slice(0, 10)
                          .map((file, index) => {
                            const imageUrl = URL.createObjectURL(file);
                            return (
                              <div key={index} className="relative">
                                <img
                                  src={imageUrl}
                                  alt={`Floor plan ${index + 1}`}
                                  className="w-full h-14 object-cover rounded"
                                  onLoad={() => URL.revokeObjectURL(imageUrl)}
                                  onError={(e) => {
                                    console.error("Image failed to load:", e);
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setMediaFiles((prev) => ({
                                      ...prev,
                                      floorPlanImages:
                                        prev.floorPlanImages.filter(
                                          (_, i) => i !== index
                                        ),
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
                        <span className="text-gray-400">
                          Click to upload floor plan images
                        </span>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Project Walkthrough */}
            <div className="border rounded-lg lg:col-span-2 mt-6">
              <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">▶</span>
                  <span className="font-medium">
                    Project Walkthrough (Max 2)
                  </span>
                </div>
                <label
                  htmlFor="video-upload"
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
                      projectWalkthrough: [
                        ...prev.projectWalkthrough,
                        ...files,
                      ].slice(0, 2),
                    }));
                    e.target.value = "";
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
                      <div className="flex gap-4 h-full items-center justify-center">
                        {mediaFiles.projectWalkthrough.map((file, index) => {
                          const videoUrl = URL.createObjectURL(file);
                          return (
                            <div key={index} className="relative">
                              <video
                                src={videoUrl}
                                className="max-w-32 max-h-24 object-contain rounded border"
                                controls={false}
                                onLoadedData={() =>
                                  URL.revokeObjectURL(videoUrl)
                                }
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center">
                                <svg
                                  className="w-6 h-6 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                </svg>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setMediaFiles((prev) => ({
                                    ...prev,
                                    projectWalkthrough:
                                      prev.projectWalkthrough.filter(
                                        (_, i) => i !== index
                                      ),
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
                        <span className="text-gray-400">
                          Click to upload walkthrough videos
                        </span>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Typology Section - moved outside main grid to span full width */}
          <div className="bg-white p-4 mt-4">
            <div className="grid grid-cols-2 gap-4 w-full">
              {/* Typology Images */}
              <div className="border rounded-lg">
                <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">▶</span>
                    <span className="font-medium">
                      Typology Images (Max 10 per typology)
                    </span>
                  </div>
                  <div className="text-blue-500 text-sm flex items-center gap-1">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      style={{ transform: "rotate(45deg)" }}
                    >
                      <path d="M16.5,6V17.5A4,4 0 0,1 12.5,21.5A4,4 0 0,1 8.5,17.5V5A2.5,2.5 0 0,1 11,2.5A2.5,2.5 0 0,1 13.5,5V15.5A1,1 0 0,1 12.5,16.5A1,1 0 0,1 11.5,15.5V6H10V15.5A2.5,2.5 0 0,0 12.5,18A2.5,2.5 0 0,0 15,15.5V5A4,4 0 0,0 11,1A4,4 0 0,0 7,5V17.5A5.5,5.5 0 0,0 12.5,23A5.5,5.5 0 0,0 18,17.5V6H16.5Z" />
                    </svg>
                    Typology Images
                  </div>
                </div>
                <div className="p-4">
                  {(() => {
                    const selectedTypologies = Array.from(
                      new Set(
                        Object.values(subTabData).flatMap(
                          (tab: any) =>
                            tab.pricingConfigs
                              ?.map((config: any) => config.typology)
                              .filter(Boolean) || []
                        )
                      )
                    );

                    if (selectedTypologies.length === 0) {
                      return (
                        <div className="h-32 flex items-center justify-center border-2 border-dashed border-yellow-300 bg-yellow-50 rounded-lg">
                          <div className="flex items-center gap-2 text-yellow-700">
                            <span className="text-center font-medium">
                              ⚠️ Please select typologies in Pricing &amp;
                              Buildings tab to upload typology images
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {selectedTypologies.map((typology) => (
                          <div key={typology} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">
                                {typology}
                              </span>
                              <span className="text-xs text-gray-500">
                                {mediaFiles.typologyImages[typology]?.length ||
                                  0}
                                /10
                              </span>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => {
                                const files = Array.from(
                                  e.target.files || []
                                ).slice(0, 10);
                                setMediaFiles((prev) => ({
                                  ...prev,
                                  typologyImages: {
                                    ...prev.typologyImages,
                                    [typology]: [
                                      ...(prev.typologyImages[typology] || []),
                                      ...files,
                                    ].slice(0, 10),
                                  },
                                }));
                                e.target.value = "";
                              }}
                              className="hidden"
                              id={`typology-images-${typology}`}
                            />
                            <label
                              htmlFor={`typology-images-${typology}`}
                              className="block w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
                            >
                              <div className="h-full p-2">
                                {mediaFiles.typologyImages[typology]?.length >
                                0 ? (
                                  <div className="grid grid-cols-8 gap-1 h-full">
                                    {mediaFiles.typologyImages[typology]
                                      .slice(0, 8)
                                      .map((file, index) => {
                                        const imageUrl =
                                          URL.createObjectURL(file);
                                        return (
                                          <div key={index} className="relative">
                                            <img
                                              src={imageUrl}
                                              alt={`${typology} ${index + 1}`}
                                              className="w-full h-12 object-cover rounded"
                                              onLoad={() =>
                                                URL.revokeObjectURL(imageUrl)
                                              }
                                            />
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setMediaFiles((prev) => ({
                                                  ...prev,
                                                  typologyImages: {
                                                    ...prev.typologyImages,
                                                    [typology]:
                                                      prev.typologyImages[
                                                        typology
                                                      ]?.filter(
                                                        (_, i) => i !== index
                                                      ) || [],
                                                  },
                                                }));
                                              }}
                                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3 h-3 text-xs flex items-center justify-center hover:bg-red-600"
                                            >
                                              ×
                                            </button>
                                          </div>
                                        );
                                      })}
                                    {mediaFiles.typologyImages[typology]
                                      .length > 8 && (
                                      <div className="bg-gray-100 rounded flex items-center justify-center text-xs text-gray-600">
                                        +
                                        {mediaFiles.typologyImages[typology]
                                          .length - 8}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="h-full flex items-center justify-center">
                                    <span className="text-gray-400 text-sm">
                                      Click to upload {typology} images
                                    </span>
                                  </div>
                                )}
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Typology Videos */}
              <div className="border rounded-lg">
                <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">▶</span>
                    <span className="font-medium">
                      Typology Videos (Max 1 per typology)
                    </span>
                  </div>
                  <div className="text-blue-500 text-sm flex items-center gap-1">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      style={{ transform: "rotate(45deg)" }}
                    >
                      <path d="M16.5,6V17.5A4,4 0 0,1 12.5,21.5A4,4 0 0,1 8.5,17.5V5A2.5,2.5 0 0,1 11,2.5A2.5,2.5 0 0,1 13.5,5V15.5A1,1 0 0,1 12.5,16.5A1,1 0 0,1 11.5,15.5V6H10V15.5A2.5,2.5 0 0,0 12.5,18A2.5,2.5 0 0,0 15,15.5V5A4,4 0 0,0 11,1A4,4 0 0,0 7,5V17.5A5.5,5.5 0 0,0 12.5,23A5.5,5.5 0 0,0 18,17.5V6H16.5Z" />
                    </svg>
                    Typology Videos
                  </div>
                </div>
                <div className="p-4">
                  {(() => {
                    const selectedTypologies = Array.from(
                      new Set(
                        Object.values(subTabData).flatMap(
                          (tab: any) =>
                            tab.pricingConfigs
                              ?.map((config: any) => config.typology)
                              .filter(Boolean) || []
                        )
                      )
                    );

                    if (selectedTypologies.length === 0) {
                      return (
                        <div className="h-32 flex items-center justify-center border-2 border-dashed border-yellow-300 bg-yellow-50 rounded-lg">
                          <div className="flex items-center gap-2 text-yellow-700">
                            <span className="text-center font-medium">
                              ⚠️ Please select typologies in Pricing & Buildings
                              tab to upload typology videos
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {selectedTypologies.map((typology) => (
                          <div key={typology} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">
                                {typology}
                              </span>
                              <span className="text-xs text-gray-500">
                                {mediaFiles.typologyVideos[typology]
                                  ? "1/1"
                                  : "0/1"}
                              </span>
                            </div>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setMediaFiles((prev) => ({
                                    ...prev,
                                    typologyVideos: {
                                      ...prev.typologyVideos,
                                      [typology]: file,
                                    },
                                  }));
                                }
                                e.target.value = "";
                              }}
                              className="hidden"
                              id={`typology-video-${typology}`}
                            />
                            <label
                              htmlFor={`typology-video-${typology}`}
                              className="block w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
                            >
                              <div className="h-full p-2">
                                {mediaFiles.typologyVideos[typology] ? (
                                  <div className="flex items-center justify-center h-full">
                                    <div className="relative">
                                      <video
                                        src={URL.createObjectURL(
                                          mediaFiles.typologyVideos[typology]!
                                        )}
                                        className="max-w-24 max-h-16 object-contain rounded border"
                                        controls={false}
                                        onLoadedData={(e) =>
                                          URL.revokeObjectURL(
                                            (e.target as HTMLVideoElement).src
                                          )
                                        }
                                      />
                                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center">
                                        <svg
                                          className="w-4 h-4 text-white"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                        </svg>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setMediaFiles((prev) => ({
                                            ...prev,
                                            typologyVideos: {
                                              ...prev.typologyVideos,
                                              [typology]: null,
                                            },
                                          }));
                                        }}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3 h-3 text-xs flex items-center justify-center hover:bg-red-600"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-full flex items-center justify-center">
                                    <span className="text-gray-400 text-sm">
                                      Click to upload {typology} video
                                    </span>
                                  </div>
                                )}
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
