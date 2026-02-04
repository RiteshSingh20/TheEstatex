import React, { useState, useEffect, useMemo } from "react";
import { CostSheet } from "../../components/CompareComponents/Compare";
import { SecureImage } from "../../components/SecureImage";
import { SecureVideo } from "../../components/SecureVideo";
import { SecurePDFViewer } from "../../components/SecurePDFViewer";
import { useBatchSecureMedia } from "../../hooks/useBatchSecureMedia";

// PDF Thumbnail Component
const PDFThumbnail: React.FC<{ fileUrl: string }> = ({ fileUrl }) => {
  return (
    <div className="aspect-square relative overflow-hidden bg-white border">
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="w-12 h-12 text-red-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
          <p className="text-xs text-gray-600 font-medium">PDF Document</p>
        </div>
      </div>
    </div>
  );
};

interface MediaPreviewGridModalProps {
  mediaModal: {
    isOpen: boolean;
    title: string;
    files: string[];
    type: "image" | "video" | "pdf";
  };
  setMediaModal: React.Dispatch<
    React.SetStateAction<{
      isOpen: boolean;
      title: string;
      files: string[];
      type: "image" | "video" | "pdf";
    }>
  >;
  openFullViewer: (
    files: string[],
    index: number,
    type: "image" | "video" | "pdf"
  ) => void;
  selectedProjectData: CostSheet | null;
  filteredNewProperties: CostSheet[];
  getMediaSections: (
    mediaFiles: any
  ) => { name: string; files: any; type: string }[];
  getFileName: (url: string) => string;
  currentProjectSheet?: CostSheet | null;
}

export const MediaPreviewGridModal: React.FC<MediaPreviewGridModalProps> = ({
  mediaModal,
  setMediaModal,
  openFullViewer,
  selectedProjectData,
  filteredNewProperties,
  getMediaSections,
  getFileName,
  currentProjectSheet,
}) => {
  if (!mediaModal.isOpen) return null;

  const currentSheet = currentProjectSheet || selectedProjectData;

  // Get all media URLs for batch loading
  const allMediaUrls = useMemo(() => {
    if (!currentSheet?.mediaFiles) return [];
    
    const sections = getMediaSections(currentSheet.mediaFiles);
    const urls: string[] = [];
    
    sections.forEach(section => {
      section.files.forEach((file: any) => {
        const fileUrl = typeof file === 'string' ? file : file.url;
        if (fileUrl) urls.push(fileUrl);
      });
    });
    
    return urls;
  }, [currentSheet?.mediaFiles, getMediaSections]);

  // Use batch loading for all media
  const { secureUrls, loading: batchLoading, loadedCount, totalCount } = useBatchSecureMedia(allMediaUrls);

  const filteredSections = !currentSheet?.mediaFiles
    ? []
    : mediaModal.type === "pdf"
    ? getMediaSections(currentSheet.mediaFiles).filter(
        (section) => section.type === "pdf"
      )
    : mediaModal.type === "image"
    ? getMediaSections(currentSheet.mediaFiles).filter(
        (section) => section.type === "image"
      )
    : mediaModal.type === "video"
    ? getMediaSections(currentSheet.mediaFiles).filter(
        (section) => section.type === "video"
      )
    : getMediaSections(currentSheet.mediaFiles);

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold">
              {mediaModal.title}
              {currentSheet?.projectName && ` - ${currentSheet.projectName}`}
            </h3>
            {batchLoading && (
              <p className="text-sm text-gray-600 mt-1">
                Loading media... {loadedCount}/{totalCount}
              </p>
            )}
          </div>
          <button
            onClick={() =>
              setMediaModal({
                isOpen: false,
                title: "",
                files: [],
                type: "image",
              })
            }
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div
          className="flex-1 overflow-y-auto p-4"
          style={{
            maxHeight: "calc(90vh - 80px)",
            willChange: "scroll-position",
          }}
        >
          {mediaModal.type === "pdf" && mediaModal.files.length > 0 ? (
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                  Brochure
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {mediaModal.files.map((file, index) => (
                    <div
                      key={index}
                      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() =>
                        openFullViewer(mediaModal.files, index, "pdf")
                      }
                    >
                      <PDFThumbnail fileUrl={file} />
                      <div className="p-1">
                        <p
                          className="text-xs text-gray-600 truncate"
                          title={getFileName(file)}
                        >
                          {getFileName(file)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : !currentSheet?.mediaFiles ? (
            <div className="text-center text-gray-500 py-8">
              No media files available
            </div>
          ) : (
            <div className="space-y-6">
              {filteredSections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <h4 className="text-md font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                    {section.name}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {section.files.map((file, index) => {
                      const fileUrl = typeof file === 'string' ? file : file.url;
                      const secureUrl = secureUrls[fileUrl] || fileUrl;
                      const isPdf =
                        fileUrl.toLowerCase().includes(".pdf") ||
                        fileUrl.includes("pdf");
                      const isVideo =
                        fileUrl.toLowerCase().includes(".mp4") ||
                        fileUrl.toLowerCase().includes(".mov") ||
                        fileUrl.includes("video");

                      return (
                        <div
                          key={index}
                          className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() =>
                            openFullViewer(
                              section.files,
                              index,
                              isPdf ? "pdf" : isVideo ? "video" : "image"
                            )
                          }
                        >
                          {isPdf ? (
                            <PDFThumbnail fileUrl={secureUrl} />
                          ) : isVideo ? (
                            <div className="aspect-square relative overflow-hidden">
                            <SecureVideo
                              src={secureUrl}
                              className="w-full h-full object-cover"
                              muted
                            />
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <svg
                                  className="w-8 h-8 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                          ) : (
                            <SecureImage
                              src={secureUrl}
                              alt={`${section.name} ${index + 1}`}
                              className="w-full aspect-square object-cover"
                            />
                          )}
                          <div className="p-1">
                            <p
                              className="text-xs text-gray-600 truncate"
                              title={getFileName(file)}
                            >
                              {getFileName(file)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
