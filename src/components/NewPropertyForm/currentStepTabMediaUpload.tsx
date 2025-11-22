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
  subTabData: Record<string, any>,
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
  generateVideoThumbnail: (file: File) => Promise<string | null>,
  videoPreviews: Record<string, string>,
  setVideoPreviews: React.Dispatch<React.SetStateAction<Record<string, string>>>
): React.ReactNode {
  // Extract typologies without useMemo to avoid hook order issues
  let selectedTypologies: string[] = [];
  try {
    const vals = Object.values(subTabData || {}).flatMap((tab: any) =>
      (tab?.pricingConfigs || [])
        .map((c: any) => c?.typology)
        .filter(Boolean)
    );
    selectedTypologies = Array.from(new Set(vals));
  } catch (e) {
    selectedTypologies = [];
  }

  return (
    <div className="bg-white p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Brochure */}
        <div className="border rounded-lg">
          <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">▶</span>
              <span className="font-medium">Upload Brochure</span>
            </div>
            <label htmlFor="brochure-upload-new" className="text-blue-500 text-sm cursor-pointer">
              Brochure
            </label>
          </div>
          <div className="p-4">
            <input
              id="brochure-upload-new"
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0] || null;
                if (file) {
                  setMediaFiles((prev) => ({ ...prev, brochure: file }));
                  if (file.type === "application/pdf") {
                    const thumb = await generatePdfThumbnail(file);
                    setPdfThumbnail(thumb);
                  } else {
                    setPdfThumbnail(null);
                  }
                }
                if (e.target) (e.target as HTMLInputElement).value = "";
              }}
              className="hidden"
            />

            <label htmlFor="brochure-upload-new" className="block w-full">
              <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                {existingMedia?.brochure || mediaFiles.brochure ? (
                  <div className="h-full flex items-center justify-center p-4">
                    <div className="relative">
                      {mediaFiles.brochure && pdfThumbnail ? (
                        <img src={pdfThumbnail} alt="PDF Preview" className="w-20 h-24 object-cover rounded border" />
                      ) : existingMedia?.brochure ? (
                        <a href={existingMedia.brochure} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                          View Brochure
                        </a>
                      ) : mediaFiles.brochure ? (
                        <a
                          href={URL.createObjectURL(mediaFiles.brochure)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Brochure
                        </a>
                      ) : null}

                      {existingMedia?.brochure ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setExistingMedia((p) => ({ ...p, brochure: null }));
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      ) : mediaFiles.brochure ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setMediaFiles((p) => ({ ...p, brochure: null }));
                            setPdfThumbnail(null);
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      ) : null}
                    </div>
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
            <label htmlFor="elevation-upload-new" className="text-blue-500 text-sm cursor-pointer">
              Elevation
            </label>
          </div>
          <div className="p-4">
            <input
              id="elevation-upload-new"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []).slice(0, 10);
                setMediaFiles((prev) => ({
                  ...prev,
                  elevationImages: [...prev.elevationImages, ...files].slice(0, 10),
                }));
                if (e.target) (e.target as HTMLInputElement).value = "";
              }}
              className="hidden"
            />

            <label htmlFor="elevation-upload-new" className="block w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
              <div className="h-full p-2">
                {(existingMedia?.elevationImages?.length > 0 || mediaFiles.elevationImages.length > 0) ? (
                  <div className="grid grid-cols-5 gap-1 h-full">
                    {(existingMedia?.elevationImages || []).slice(0, 10).map((url, i) => (
                      <div key={`existing-elev-${i}`} className="relative">
                        <img
                          src={url}
                          alt={`Elevation ${i + 1}`}
                          className="w-full h-14 object-cover rounded"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setExistingMedia((p) => ({
                              ...p,
                              elevationImages: p.elevationImages.filter((_, idx) => idx !== i),
                            }));
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {mediaFiles.elevationImages.slice(0, 10).map((file, index) => {
                      const imageUrl = URL.createObjectURL(file);
                      return (
                        <div key={`new-elev-${index}`} className="relative">
                          <img
                            src={imageUrl}
                            alt={`Elevation ${index + 1}`}
                            className="w-full h-14 object-cover rounded"
                            onLoad={() => URL.revokeObjectURL(imageUrl)}
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setMediaFiles((p) => ({
                                ...p,
                                elevationImages: p.elevationImages.filter((_, i) => i !== index),
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
      </div>

      {/* Amenities & Floor plans row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {/* Amenities */}
        <div className="border rounded-lg">
          <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">▶</span>
              <span className="font-medium">Amenities Images (Max 10)</span>
            </div>
            <label htmlFor="amenities-upload-new" className="text-blue-500 text-sm cursor-pointer">Amenities</label>
          </div>
          <div className="p-4">
            <input
              id="amenities-upload-new"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []).slice(0, 10);
                setMediaFiles((prev) => ({
                  ...prev,
                  amenitiesImages: [...prev.amenitiesImages, ...files].slice(0, 10),
                }));
                if (e.target) (e.target as HTMLInputElement).value = "";
              }}
              className="hidden"
            />
            <label htmlFor="amenities-upload-new" className="block w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
              <div className="h-full p-2">
                {(existingMedia?.amenitiesImages?.length > 0 || mediaFiles.amenitiesImages.length > 0) ? (
                  <div className="grid grid-cols-5 gap-1 h-full">
                    {(existingMedia?.amenitiesImages || []).slice(0, 10).map((url, i) => (
                      <div key={`existing-amen-${i}`} className="relative">
                        <img src={url} alt={`Amenity ${i + 1}`} className="w-full h-14 object-cover rounded" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setExistingMedia((p) => ({
                              ...p,
                              amenitiesImages: p.amenitiesImages.filter((_, idx) => idx !== i),
                            }));
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {mediaFiles.amenitiesImages.slice(0, 10).map((file, index) => {
                      const imageUrl = URL.createObjectURL(file);
                      return (
                        <div key={`new-amen-${index}`} className="relative">
                          <img src={imageUrl} alt={`Amenity ${index + 1}`} className="w-full h-14 object-cover rounded" onLoad={() => URL.revokeObjectURL(imageUrl)} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setMediaFiles((p) => ({
                                ...p,
                                amenitiesImages: p.amenitiesImages.filter((_, i) => i !== index),
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
                  <div className="h-full flex items-center justify-center"><span className="text-gray-400">Click to upload amenities images</span></div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Floor Plans */}
        <div className="border rounded-lg">
          <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">▶</span>
              <span className="font-medium">Floor Plan Images (Max 10)</span>
            </div>
            <label htmlFor="floorplan-upload-new" className="text-blue-500 text-sm cursor-pointer">Floor Plans</label>
          </div>
          <div className="p-4">
            <input
              id="floorplan-upload-new"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []).slice(0, 10);
                setMediaFiles((prev) => ({
                  ...prev,
                  floorPlanImages: [...prev.floorPlanImages, ...files].slice(0, 10),
                }));
                if (e.target) (e.target as HTMLInputElement).value = "";
              }}
              className="hidden"
            />
            <label htmlFor="floorplan-upload-new" className="block w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
              <div className="h-full p-2">
                {(existingMedia?.floorPlanImages?.length > 0 || mediaFiles.floorPlanImages.length > 0) ? (
                  <div className="grid grid-cols-5 gap-1 h-full">
                    {(existingMedia?.floorPlanImages || []).slice(0, 10).map((url, i) => (
                      <div key={`existing-floor-${i}`} className="relative">
                        <img src={url} alt={`Floor ${i + 1}`} className="w-full h-14 object-cover rounded" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setExistingMedia((p) => ({
                              ...p,
                              floorPlanImages: p.floorPlanImages.filter((_, idx) => idx !== i),
                            }));
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {mediaFiles.floorPlanImages.slice(0, 10).map((file, index) => {
                      const imageUrl = URL.createObjectURL(file);
                      return (
                        <div key={`new-floor-${index}`} className="relative">
                          <img src={imageUrl} alt={`Floor ${index + 1}`} className="w-full h-14 object-cover rounded" onLoad={() => URL.revokeObjectURL(imageUrl)} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setMediaFiles((p) => ({
                                ...p,
                                floorPlanImages: p.floorPlanImages.filter((_, i) => i !== index),
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
                  <div className="h-full flex items-center justify-center"><span className="text-gray-400">Click to upload floor plan images</span></div>
                )}
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Project Walkthrough Videos */}
      <div className="border rounded-lg lg:col-span-2 mt-6">
        <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">▶</span>
            <span className="font-medium">Project Walkthrough (Max 2)</span>
          </div>
          <label htmlFor="video-upload-new" className="text-blue-500 text-sm cursor-pointer">Videos</label>
        </div>
        <div className="p-4">
          <input
            id="video-upload-new"
            type="file"
            accept="video/*"
            multiple
            onChange={async (e) => {
              const files = Array.from(e.target.files || []).slice(0, 2);
              setMediaFiles((prev) => ({
                ...prev,
                projectWalkthrough: [...prev.projectWalkthrough, ...files].slice(0, 2),
              }));

              // Generate thumbnails for new videos
              const newPreviews: Record<string, string> = {};
              for (const file of files) {
                const thumbnail = await generateVideoThumbnail(file);
                if (thumbnail) {
                  newPreviews[file.name] = thumbnail;
                }
              }
              setVideoPreviews((prev) => ({ ...prev, ...newPreviews }));

              if (e.target) (e.target as HTMLInputElement).value = "";
            }}
            className="hidden"
          />
          <label htmlFor="video-upload-new" className="block w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
            <div className="h-full p-2">
              {(existingMedia?.projectWalkthrough?.length > 0 || mediaFiles.projectWalkthrough.length > 0) ? (
                <div className="flex gap-4 h-full items-center justify-center">
                  {(existingMedia?.projectWalkthrough || []).map((url, i) => (
                    <div key={`existing-video-${i}`} className="relative">
                      <img
                        src={url}
                        alt={`Video thumbnail ${i + 1}`}
                        className="max-w-32 max-h-24 object-contain rounded border"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                      </div>
                      <button type="button" onClick={(e) => { e.preventDefault(); setExistingMedia((p) => ({ ...p, projectWalkthrough: p.projectWalkthrough.filter((_, idx) => idx !== i) })); }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center hover:bg-red-600">×</button>
                    </div>
                  ))}

                  {mediaFiles.projectWalkthrough.map((file, index) => {
                    const thumbnail = videoPreviews[file.name];
                    return (
                      <div key={`new-video-${index}`} className="relative">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={`Video thumbnail ${index + 1}`}
                            className="max-w-32 max-h-24 object-contain rounded border"
                          />
                        ) : (
                          <div className="max-w-32 max-h-24 bg-gray-200 rounded border flex items-center justify-center">
                            <span className="text-xs text-gray-500">Loading...</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                        </div>
                        <button type="button" onClick={(e) => { e.preventDefault(); setMediaFiles((p) => ({ ...p, projectWalkthrough: p.projectWalkthrough.filter((_, i) => i !== index) })); }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center hover:bg-red-600">×</button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center"><span className="text-gray-400">Click to upload walkthrough videos</span></div>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Typology specific media */}
      {selectedTypologies.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Typology Media</h4>
          <div className="space-y-4">
            {selectedTypologies.map((typ) => (
              <div key={`typ-${typ}`} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{typ}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Typology Images</label>
                    <input
                      id={`typology-image-${typ}`}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []).slice(0, 6);
                        setMediaFiles((prev) => ({
                          ...prev,
                          typologyImages: {
                            ...prev.typologyImages,
                            [typ]: [...(prev.typologyImages[typ] || []), ...files].slice(0, 6),
                          },
                        }));
                        if (e.target) (e.target as HTMLInputElement).value = "";
                      }}
                      className="border p-2 rounded hidden"
                    />
                    <label htmlFor={`typology-image-${typ}`} className="block w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400" />

                    <div className="mt-2 flex gap-2 overflow-x-auto">
                      {(existingMedia?.typologyImages?.[typ] || []).map((url, i) => (
                        <div key={`exist-typ-${typ}-${i}`} className="relative w-24 h-16">
                          <img src={url} className="w-full h-full object-cover rounded" alt={`${typ}-${i}`} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                          <button type="button" onClick={(e) => { e.preventDefault(); setExistingMedia((p) => ({ ...p, typologyImages: { ...p.typologyImages, [typ]: (p.typologyImages[typ] || []).filter((_, idx) => idx !== i) } })); }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">×</button>
                        </div>
                      ))}

                      {(mediaFiles.typologyImages[typ] || []).map((file, idx) => {
                        const url = URL.createObjectURL(file);
                        return (
                          <div key={`new-typ-${typ}-${idx}`} className="relative w-24 h-16">
                            <img src={url} className="w-full h-full object-cover rounded" alt={`${typ}-new-${idx}`} onLoad={() => URL.revokeObjectURL(url)} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                            <button type="button" onClick={(e) => { e.preventDefault(); setMediaFiles((p) => ({ ...p, typologyImages: { ...p.typologyImages, [typ]: (p.typologyImages[typ] || []).filter((_, i) => i !== idx) } })); }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">×</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Typology Video (optional)</label>
                    <input
                      id={`typology-video-${typ}`}
                      type="file"
                      accept="video/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0] || null;
                        setMediaFiles((prev) => ({
                          ...prev,
                          typologyVideos: { ...prev.typologyVideos, [typ]: file },
                        }));

                        // Generate thumbnail for new video
                        if (file) {
                          const thumbnail = await generateVideoThumbnail(file);
                          if (thumbnail) {
                            setVideoPreviews((prev) => ({ ...prev, [file.name]: thumbnail }));
                          }
                        }

                        if (e.target) (e.target as HTMLInputElement).value = "";
                      }}
                      className="border p-2 rounded hidden"
                    />
                    <label htmlFor={`typology-video-${typ}`} className="block w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400" />

                    <div className="mt-2">
                      {existingMedia?.typologyVideos?.[typ] ? (
                        <div className="flex items-center gap-2">
                          <a href={existingMedia.typologyVideos[typ] || undefined} target="_blank" rel="noreferrer" className="text-blue-600 underline">View Video</a>
                          <button type="button" onClick={(e) => { e.preventDefault(); setExistingMedia((p) => ({ ...p, typologyVideos: { ...p.typologyVideos, [typ]: null } })); }} className="text-red-500">Remove</button>
                        </div>
                      ) : mediaFiles.typologyVideos?.[typ] ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Video selected</span>
                          <button type="button" onClick={(e) => { e.preventDefault(); setMediaFiles((p) => ({ ...p, typologyVideos: { ...p.typologyVideos, [typ]: null } })); }} className="text-red-500">Remove</button>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-sm">No video</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
