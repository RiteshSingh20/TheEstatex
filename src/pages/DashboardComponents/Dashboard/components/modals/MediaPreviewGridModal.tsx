import React, { useEffect, useState } from "react";
import { X, Download, ExternalLink } from "lucide-react";
import { getSecureMediaUrl } from "../../../../../utils/secureMedia";
import PDFThumbnail from "../PDFThumbnail";

type MediaFileEntry =
  | string
  | {
      url: string;
      name?: string;
      isUnitPlan?: boolean;
    };

interface MediaPreviewGridModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  mediaSections: Array<{
    name: string;
    files: MediaFileEntry[];
    type: "image" | "video" | "pdf";
  }>;
  onFileClick: (  
    files: string[],
    index: number,
    type: "image" | "video" | "pdf"
  ) => void;
}

const MediaPreviewGridModal: React.FC<MediaPreviewGridModalProps> = ({
  isOpen,
  onClose,
  title,
  mediaSections,
  onFileClick,
}) => {
  const [secureMediaSections, setSecureMediaSections] = useState(mediaSections);
  const [loading, setLoading] = useState(false);

  const getFileUrl = (file: MediaFileEntry): string => {
    if (!file) return "";
    if (typeof file === "string") return file;
    if (typeof file === "object" && typeof file.url === "string") return file.url;
    return "";
  };

  const extractFileNameFromUrl = (url: string): string => {
    try {
      if (!url) return "Media File";
      if (url.includes("firebase") || url.includes("googleapis.com")) {
        const decodedUrl = decodeURIComponent(url);
        const pathMatch = decodedUrl.match(/\/([^/]+)\?/);
        if (pathMatch && pathMatch[1]) {
          const parts = pathMatch[1].split("/");
          const filename = parts[parts.length - 1];
          if (filename && !filename.match(/^\d+$/) && filename.includes(".")) {
            return filename;
          }
        }
      }
      const urlParts = url.split("/");
      const filename = urlParts[urlParts.length - 1].split("?")[0];
      const decodedFilename = decodeURIComponent(filename);
      if (
        decodedFilename &&
        decodedFilename.includes(".") &&
        !decodedFilename.match(/^\d+$/)
      ) {
        return decodedFilename;
      }
      return "Media File";
    } catch {
      return "Media File";
    }
  };

  useEffect(() => {
    if (!isOpen || mediaSections.length === 0) return;

    const loadSecureUrls = async () => {
      setLoading(true);
      try {
        const updatedSections = await Promise.all(
          mediaSections.map(async (section) => {
            const secureFiles = await Promise.all(
              section.files.map(async (file) => {
                const originalUrl = getFileUrl(file);
                if (!originalUrl) return file;

                const secureUrl = await getSecureMediaUrl(originalUrl);
                const fileName =
                  typeof file === "object" && file?.name
                    ? String(file.name)
                    : extractFileNameFromUrl(originalUrl);

                return {
                  ...(typeof file === "object" ? file : {}),
                  url: secureUrl,
                  name: fileName,
                };
              })
            );
            return { ...section, files: secureFiles };
          })
        );
        setSecureMediaSections(updatedSections);
      } catch (error) {
        console.error("Error loading secure URLs:", error);
        setSecureMediaSections(mediaSections);
      } finally {
        setLoading(false);
      }
    };

    loadSecureUrls();
  }, [isOpen, mediaSections]);

  if (!isOpen) return null;

  const getFileName = (file: MediaFileEntry): string => {
    try {
      if (typeof file === "object" && file?.name) {
        return String(file.name);
      }
      const url = getFileUrl(file);
      if (!url) return "Media File";
      return extractFileNameFromUrl(url);
    } catch {
      return "Media File";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading media...</span>
            </div>
          ) : (
            secureMediaSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-6">
                <h4 className="text-md font-medium mb-3 text-gray-700">
                  {section.name}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {section.files.map((file, fileIndex) => (
                    <div
                      key={fileIndex}
                      className="relative group cursor-pointer border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      onClick={() =>
                        onFileClick(
                          section.files
                            .map((entry) => getFileUrl(entry))
                            .filter(Boolean),
                          fileIndex,
                          section.type
                        )
                      }
                    >
                      {section.type === "image" ? (
                        <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                          <img
                            src={getFileUrl(file)}
                            alt={getFileName(file)}
                            className="w-full h-full object-cover opacity-0 transition-opacity duration-300"
                            loading="lazy"
                            onLoad={(e) => {
                              e.currentTarget.style.opacity = '1';
                              const loader = e.currentTarget.previousElementSibling as HTMLElement;
                              if (loader) loader.style.display = 'none';
                            }}
                            onError={(e) => {
                              const loader = e.currentTarget.previousElementSibling as HTMLElement;
                              if (loader) loader.style.display = 'none';
                              e.currentTarget.style.opacity = '1';
                            }}
                          />
                        </div>
                      ) : section.type === "video" ? (
                        <div className="aspect-square bg-gray-900 flex items-center justify-center relative">
                          <div className="absolute inset-0 flex items-center justify-center z-10">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                          <video
                            src={getFileUrl(file)}
                            className="w-full h-full object-cover opacity-0 transition-opacity duration-300"
                            muted
                            onLoadedData={(e) => {
                              e.currentTarget.style.opacity = '1';
                              const loader = e.currentTarget.previousElementSibling as HTMLElement;
                              if (loader) loader.style.display = 'none';
                            }}
                            onError={(e) => {
                              const loader = e.currentTarget.previousElementSibling as HTMLElement;
                              if (loader) loader.style.display = 'none';
                              e.currentTarget.style.opacity = '1';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-12 h-12 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                              <div className="w-0 h-0 border-l-4 border-l-gray-800 border-y-2 border-y-transparent ml-1"></div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                          <embed
                            src={getFileUrl(file)}
                            type="application/pdf"
                            className="w-full h-full object-cover opacity-0 transition-opacity duration-300"
                            onLoad={(e) => {
                              e.currentTarget.style.opacity = '1';
                              const loader = e.currentTarget.previousElementSibling as HTMLElement;
                              if (loader) loader.style.display = 'none';
                            }}
                            onError={(e) => {
                              const loader = e.currentTarget.previousElementSibling as HTMLElement;
                              if (loader) loader.style.display = 'none';
                              (e.currentTarget as HTMLElement).style.opacity = '1';
                            }}
                          />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200"></div>

                      <div className="p-2">
                        <p className="text-xs text-gray-600 truncate">
                          {getFileName(file)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaPreviewGridModal;
