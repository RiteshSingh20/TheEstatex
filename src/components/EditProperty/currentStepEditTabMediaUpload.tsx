import React, { useEffect, useState, useMemo } from "react";

interface Contact {
  name: string;
  phone: string;
}

export function currentStepEditTabMediaUpload(
  setMediaFiles: React.Dispatch<
    React.SetStateAction<{
      brochure: File | string | null;
      elevationImages: (File | string)[];
      amenitiesImages: (File | string)[];
      floorPlanImages: (File | string)[];
      projectWalkthrough: (File | string)[];
      typologyImages: Record<string, (File | string)[]>;
      typologyVideos: Record<string, File | string | null>;
    }>
  >,
  generatePdfThumbnail: (file: File) => Promise<string | null>,
  setPdfThumbnail: React.Dispatch<React.SetStateAction<string | null>>,
  mediaFiles: {
    brochure: File | string | null;
    elevationImages: (File | string)[];
    amenitiesImages: (File | string)[];
    floorPlanImages: (File | string)[];
    projectWalkthrough: (File | string)[];
    typologyImages: Record<string, (File | string)[]>;
    typologyVideos: Record<string, File | string | null>;
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
  },
  existingMedia: {
    brochure: string | null;
    elevationImages: string[];
    amenitiesImages: string[];
    floorPlanImages: string[];
    projectWalkthrough: string[];
    typologyImages: Record<string, string[]>;
    typologyVideos: Record<string, string | null>;
  },
  setExistingMedia: React.Dispatch<
    React.SetStateAction<{
      brochure: string | null;
      elevationImages: string[];
      amenitiesImages: string[];
      floorPlanImages: string[];
      projectWalkthrough: string[];
      typologyImages: Record<string, string[]>;
      typologyVideos: Record<string, string | null>;
    }>
  >,
  siteHeads?: Contact[],
  setSiteHeads?: React.Dispatch<React.SetStateAction<Contact[]>>,
  sourcingManagers?: Contact[],
  setSourcingManagers?: React.Dispatch<React.SetStateAction<Contact[]>>,
  projectMessage?: string,
  setProjectMessage?: React.Dispatch<React.SetStateAction<string>>
): React.ReactNode {
  const openPreview = (images: string[], index: number) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75';
    modal.onclick = () => modal.remove();
    
    let currentIndex = index;
    
    const updateImage = () => {
      modal.innerHTML = `
        <div class="relative" onclick="event.stopPropagation()">
          <img src="${images[currentIndex]}" alt="Preview" class="max-w-screen max-h-screen object-contain" />
          ${images.length > 1 ? `
            <button onclick="event.stopPropagation(); this.parentElement.parentElement.previousImage()" class="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onclick="event.stopPropagation(); this.parentElement.parentElement.nextImage()" class="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ` : ''}
        </div>
      `;
    };
    
    (modal as any).nextImage = () => {
      currentIndex = (currentIndex + 1) % images.length;
      updateImage();
    };
    
    (modal as any).previousImage = () => {
      currentIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
      updateImage();
    };
    
    updateImage();
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', handleEsc);
      } else if (e.key === 'ArrowLeft') {
        (modal as any).previousImage();
      } else if (e.key === 'ArrowRight') {
        (modal as any).nextImage();
      }
    };
    document.addEventListener('keydown', handleEsc);
    
    document.body.appendChild(modal);
  };
  return (
    <div className="space-y-4">
      {/* Contact Information Section */}
      {(siteHeads && setSiteHeads && sourcingManagers && setSourcingManagers) && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Site Head Section */}
            <div className="border relative">
              <div className="flex items-center p-2">
                <span className="text-blue-600 mr-1">▶</span>
                <h3 className="font-medium">Site Head</h3>
              </div>
              <div className="bg-neutral-100 p-1 border-t">
                <div className="grid grid-cols-2 gap-2 text-sm font-medium">
                  <div>Name</div>
                  <div>Phone</div>
                </div>
              </div>
              <div className="bg-white pb-8">
                {(siteHeads.length > 0 ? siteHeads : [{ name: "", phone: "" }]).map((head, index) => (
                  <div key={index} className={`p-1 ${index > 0 ? "border-t" : ""}`}>
                    <div className="grid grid-cols-2 gap-2 items-center">
                      <input
                        type="text"
                        value={head.name}
                        onChange={(e) => {
                          const newHeads = siteHeads.length > 0 ? [...siteHeads] : [{ name: "", phone: "" }];
                          newHeads[index].name = e.target.value;
                          setSiteHeads(newHeads);
                        }}
                        className="border px-1 py-1 text-sm"
                      />
                      <input
                        type="text"
                        value={head.phone || head.contact || ""}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/[^0-9]/g, "")
                            .slice(0, 10);
                          const newHeads = siteHeads.length > 0 ? [...siteHeads] : [{ name: "", phone: "" }];
                          newHeads[index].phone = value;
                          newHeads[index].contact = value;
                          setSiteHeads(newHeads);
                        }}
                        className="border px-1 py-1 text-sm"
                        maxLength={10}
                      />
                    </div>
                  </div>
                ))}
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setSiteHeads((prev) => [...prev, { name: "", phone: "" }])
                    }
                    className="w-5 h-5 bg-green-500 text-white text-xs font-bold rounded"
                  >
                    +
                  </button>
                  {siteHeads.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSiteHeads((prev) => prev.slice(0, -1))}
                      className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded"
                    >
                      -
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Sourcing Managers Section */}
            <div className="relative border">
              <div className="flex items-center p-2">
                <span className="text-blue-600 mr-1">▶</span>
                <h3 className="font-medium">Sourcing Managers</h3>
              </div>
              <div className="bg-neutral-100 p-1 border-t">
                <div className="grid grid-cols-2 gap-2 text-sm font-medium">
                  <div>Name</div>
                  <div>Phone</div>
                </div>
              </div>
              <div className="bg-white pb-10">
                {(sourcingManagers.length > 0 ? sourcingManagers : [{ name: "", phone: "" }]).map((manager, index) => (
                  <div key={index} className={`p-1 ${index > 0 ? "border-t" : ""}`}>
                    <div className="grid grid-cols-2 gap-2 items-center">
                      <input
                        type="text"
                        value={manager.name}
                        onChange={(e) => {
                          const newManagers = sourcingManagers.length > 0 ? [...sourcingManagers] : [{ name: "", phone: "" }];
                          newManagers[index].name = e.target.value;
                          setSourcingManagers(newManagers);
                        }}
                        className="border px-1 py-1 text-sm"
                      />
                      <input
                        type="text"
                        value={manager.phone || manager.contact || ""}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/[^0-9]/g, "")
                            .slice(0, 10);
                          const newManagers = sourcingManagers.length > 0 ? [...sourcingManagers] : [{ name: "", phone: "" }];
                          newManagers[index].phone = value;
                          newManagers[index].contact = value;
                          setSourcingManagers(newManagers);
                        }}
                        className="border px-1 py-1 text-sm"
                        maxLength={10}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-2 right-2 flex gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setSourcingManagers((prev) => [
                      ...prev,
                      { name: "", phone: "" },
                    ])
                  }
                  className="w-6 h-6 bg-green-500 text-white text-sm font-bold rounded"
                >
                  +
                </button>
                {sourcingManagers.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setSourcingManagers((prev) => prev.slice(0, prev.length - 1))
                    }
                    className="w-6 h-6 bg-red-500 text-white text-sm font-bold rounded"
                  >
                    −
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
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
                    {mediaFiles.brochure || existingMedia.brochure ? (
                      <div className="h-full flex items-center justify-center p-4">
                        <div className="relative cursor-pointer group" onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (existingMedia.brochure) {
                            window.open(existingMedia.brochure, '_blank');
                          }
                        }}>
                          {typeof mediaFiles.brochure !== 'string' && mediaFiles.brochure && pdfThumbnail ? (
                            <>
                              <img
                                src={pdfThumbnail}
                                alt="PDF Preview"
                                className="w-20 h-24 object-cover rounded border"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </div>
                            </>
                          ) : existingMedia.brochure ? (
                            <>
                              <div className="w-20 h-24 relative overflow-hidden bg-white rounded border">
                                <iframe src={`${existingMedia.brochure}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-full border-0 transform scale-[0.2] origin-top-left pointer-events-none" style={{width: '500%', height: '500%'}} />
                                <div className="absolute bottom-1 right-1 pointer-events-none">
                                  <svg className="w-3 h-3 text-red-600 bg-white/90 rounded p-0.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                                  </svg>
                                </div>
                              </div>
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </div>
                            </>
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
                              if (existingMedia.brochure) {
                                setExistingMedia((prev) => ({
                                  ...prev,
                                  brochure: null,
                                }));
                              } else {
                                setMediaFiles((prev) => ({
                                  ...prev,
                                  brochure: null,
                                }));
                                setPdfThumbnail(null);
                              }
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
                    {(existingMedia.elevationImages.length > 0 || mediaFiles.elevationImages.length > 0) ? (
                      <div className="grid grid-cols-5 gap-1 h-full">
                        {existingMedia.elevationImages.slice(0, 10).map((url, index) => (
                          <div key={`existing-${index}`} className="relative group cursor-pointer" onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openPreview(existingMedia.elevationImages, index);
                          }}>
                            <img
                              src={url}
                              alt={`Elevation ${index + 1}`}
                              className="w-full h-14 object-cover rounded aspect-square"
                              onError={(e) => {
                                console.error("Image failed to load:", e);
                                e.currentTarget.style.display = "none";
                              }}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setExistingMedia((prev) => ({
                                  ...prev,
                                  elevationImages: prev.elevationImages.filter((_, i) => i !== index),
                                }));
                              }}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center hover:bg-red-600 z-10"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {mediaFiles.elevationImages.slice(0, 10).map((file, index) => {
                          return (
                            <FilePreview
                              key={`new-${index}`}
                              file={file}
                              alt={`Elevation ${index + 1}`}
                              onRemove={() => {
                                setMediaFiles((prev) => ({
                                  ...prev,
                                  elevationImages: prev.elevationImages.filter((_, i) => i !== index),
                                }));
                              }}
                            />
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
                    {(existingMedia.amenitiesImages.length > 0 || mediaFiles.amenitiesImages.length > 0) ? (
                      <div className="grid grid-cols-5 gap-1 h-full">
                        {existingMedia.amenitiesImages.slice(0, 10).map((url, index) => (
                          <div key={`existing-${index}`} className="relative group cursor-pointer" onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openPreview(existingMedia.amenitiesImages, index);
                          }}>
                            <img
                              src={url}
                              alt={`Amenity ${index + 1}`}
                              className="w-full h-14 object-cover rounded aspect-square"
                              onError={(e) => {
                                console.error("Image failed to load:", e);
                                e.currentTarget.style.display = "none";
                              }}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setExistingMedia((prev) => ({
                                  ...prev,
                                  amenitiesImages: prev.amenitiesImages.filter((_, i) => i !== index),
                                }));
                              }}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center hover:bg-red-600 z-10"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {mediaFiles.amenitiesImages.slice(0, 10).map((file, index) => {
                          return (
                            <FilePreview
                              key={`new-${index}`}
                              file={file}
                              alt={`Amenity ${index + 1}`}
                              onRemove={() => {
                                setMediaFiles((prev) => ({
                                  ...prev,
                                  amenitiesImages: prev.amenitiesImages.filter((_, i) => i !== index),
                                }));
                              }}
                            />
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
                    {(existingMedia.floorPlanImages.length > 0 || mediaFiles.floorPlanImages.length > 0) ? (
                      <div className="grid grid-cols-5 gap-1 h-full">
                        {existingMedia.floorPlanImages.slice(0, 10).map((url, index) => (
                          <div key={`existing-${index}`} className="relative group cursor-pointer" onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openPreview(existingMedia.floorPlanImages, index);
                          }}>
                            <img
                              src={url}
                              alt={`Floor plan ${index + 1}`}
                              className="w-full h-14 object-cover rounded aspect-square"
                              onError={(e) => {
                                console.error("Image failed to load:", e);
                                e.currentTarget.style.display = "none";
                              }}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setExistingMedia((prev) => ({
                                  ...prev,
                                  floorPlanImages: prev.floorPlanImages.filter((_, i) => i !== index),
                                }));
                              }}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center hover:bg-red-600 z-10"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {mediaFiles.floorPlanImages.slice(0, 10).map((file, index) => {
                          return (
                            <FilePreview
                              key={`new-${index}`}
                              file={file}
                              alt={`Floor plan ${index + 1}`}
                              onRemove={() => {
                                setMediaFiles((prev) => ({
                                  ...prev,
                                  floorPlanImages: prev.floorPlanImages.filter((_, i) => i !== index),
                                }));
                              }}
                            />
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
                    {(existingMedia.projectWalkthrough.length > 0 || mediaFiles.projectWalkthrough.length > 0) ? (
                      <div className="flex gap-4 h-full items-center justify-center">
                        {existingMedia.projectWalkthrough.map((url, index) => (
                          <div key={`existing-${index}`} className="relative cursor-pointer group" onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(url, '_blank');
                          }}>
                            <video
                              src={url}
                              className="w-24 h-24 object-cover rounded border aspect-square"
                              controls={false}
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
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setExistingMedia((prev) => ({
                                  ...prev,
                                  projectWalkthrough: prev.projectWalkthrough.filter((_, i) => i !== index),
                                }));
                              }}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center hover:bg-red-600 z-20"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {mediaFiles.projectWalkthrough.map((file, index) => {
                          return (
                            <VideoPreview
                              key={`new-${index}`}
                              file={file}
                              onRemove={() => {
                                setMediaFiles((prev) => ({
                                  ...prev,
                                  projectWalkthrough: prev.projectWalkthrough.filter((_, i) => i !== index),
                                }));
                              }}
                            />
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

          {/* Typology Section */}
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
                                {(existingMedia.typologyImages[typology]?.length || 0) + (mediaFiles.typologyImages[typology]?.length || 0)}
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
                                {((existingMedia.typologyImages[typology]?.length || 0) + (mediaFiles.typologyImages[typology]?.length || 0)) > 0 ? (
                                  <div className="grid grid-cols-8 gap-1 h-full">
                                    {(existingMedia.typologyImages[typology] || []).slice(0, 8).map((url, index) => (
                                      <div key={`existing-${index}`} className="relative group cursor-pointer" onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        openPreview(existingMedia.typologyImages[typology] || [], index);
                                      }}>
                                        <img
                                          src={url}
                                          alt={`${typology} ${index + 1}`}
                                          className="w-full h-12 object-cover rounded aspect-square"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                          </svg>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setExistingMedia((prev) => ({
                                              ...prev,
                                              typologyImages: {
                                                ...prev.typologyImages,
                                                [typology]: (prev.typologyImages[typology] || []).filter((_, i) => i !== index),
                                              },
                                            }));
                                          }}
                                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3 h-3 text-xs flex items-center justify-center hover:bg-red-600 z-10"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                    {(mediaFiles.typologyImages[typology] || []).slice(0, 8).map((file, index) => {
                                      return (
                                        <TypologyFilePreview
                                          key={`new-${index}`}
                                          file={file}
                                          alt={`${typology} ${index + 1}`}
                                          onRemove={() => {
                                            setMediaFiles((prev) => ({
                                              ...prev,
                                              typologyImages: {
                                                ...prev.typologyImages,
                                                [typology]: (prev.typologyImages[typology] || []).filter((_, i) => i !== index),
                                              },
                                            }));
                                          }}
                                        />
                                      );
                                    })}
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
                                {(existingMedia.typologyVideos[typology] || mediaFiles.typologyVideos[typology])
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
                                {(existingMedia.typologyVideos[typology] || mediaFiles.typologyVideos[typology]) ? (
                                  <div className="flex items-center justify-center h-full">
                                    <TypologyVideoPreview
                                      file={existingMedia.typologyVideos[typology] || mediaFiles.typologyVideos[typology]!}
                                      onRemove={() => {
                                        if (existingMedia.typologyVideos[typology]) {
                                          setExistingMedia((prev) => ({
                                            ...prev,
                                            typologyVideos: {
                                              ...prev.typologyVideos,
                                              [typology]: null,
                                            },
                                          }));
                                        } else {
                                          setMediaFiles((prev) => ({
                                            ...prev,
                                            typologyVideos: {
                                              ...prev.typologyVideos,
                                              [typology]: null,
                                            },
                                          }));
                                        }
                                      }}
                                      onClick={() => {
                                        const videoUrl = typeof existingMedia.typologyVideos[typology] === 'string' 
                                          ? existingMedia.typologyVideos[typology] 
                                          : URL.createObjectURL(mediaFiles.typologyVideos[typology] as File);
                                        window.open(videoUrl, '_blank');
                                      }}
                                    />
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

// Helper component for file preview with proper blob URL management
const FilePreview: React.FC<{
  file: File | string;
  alt: string;
  onRemove: () => void;
}> = ({ file, alt, onRemove }) => {
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    if (typeof file === 'string') {
      setImageUrl(file);
    } else {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  return (
    <div className="relative">
      <img
        src={imageUrl}
        alt={alt}
        className="w-full h-14 object-cover rounded aspect-square"
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
          onRemove();
        }}
        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center hover:bg-red-600"
      >
        ×
      </button>
    </div>
  );
};

// Helper component for video preview with proper blob URL management
const VideoPreview: React.FC<{
  file: File | string;
  onRemove: () => void;
}> = ({ file, onRemove }) => {
  const [videoUrl, setVideoUrl] = useState<string>("");

  useEffect(() => {
    if (typeof file === 'string') {
      setVideoUrl(file);
    } else {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  return (
    <div className="relative">
      <video
        src={videoUrl}
        className="w-24 h-24 object-cover rounded border aspect-square"
        controls={false}
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
          onRemove();
        }}
        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center hover:bg-red-600"
      >
        ×
      </button>
    </div>
  );
};

// Specialized component for typology file preview with smaller dimensions
const TypologyFilePreview: React.FC<{
  file: File | string;
  alt: string;
  onRemove: () => void;
}> = ({ file, alt, onRemove }) => {
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    if (typeof file === 'string') {
      setImageUrl(file);
    } else {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  return (
    <div className="relative">
      <img
        src={imageUrl}
        alt={alt}
        className="w-full h-12 object-cover rounded aspect-square"
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
          onRemove();
        }}
        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3 h-3 text-xs flex items-center justify-center hover:bg-red-600"
      >
        ×
      </button>
    </div>
  );
};

// Specialized component for typology video preview with smaller dimensions
const TypologyVideoPreview: React.FC<{
  file: File | string;
  onRemove: () => void;
  onClick?: () => void;
}> = ({ file, onRemove, onClick }) => {
  const [videoUrl, setVideoUrl] = useState<string>("");

  useEffect(() => {
    if (typeof file === 'string') {
      setVideoUrl(file);
    } else {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  return (
    <div className="relative cursor-pointer" onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick?.() || window.open(videoUrl, '_blank');
    }}>
      <video
        src={videoUrl}
        className="w-16 h-16 object-cover rounded border aspect-square"
        controls={false}
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
          onRemove();
        }}
        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3 h-3 text-xs flex items-center justify-center hover:bg-red-600"
      >
        ×
      </button>
    </div>
  );
};