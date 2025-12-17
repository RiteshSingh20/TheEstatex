import React from "react";
import { CostSheet } from "../../components/CompareComponents/Compare";

export function mediaPreviewGridModal(
  mediaModal: {
    isOpen: boolean;
    title: string;
    files: string[];
    type: "image" | "video" | "pdf";
  },
  setMediaModal: React.Dispatch<
    React.SetStateAction<{
      isOpen: boolean;
      title: string;
      files: string[];
      type: "image" | "video" | "pdf";
    }>
  >,
  openFullViewer: (
    files: string[],
    index: number,
    type: "image" | "video" | "pdf"
  ) => void,
  selectedProjectData: CostSheet | null,
  filteredNewProperties: CostSheet[],
  getMediaSections: (
    mediaFiles: any
  ) => { name: string; files: any; type: string }[],
  getFileName: (url: string) => string
): React.ReactNode {
  const currentSheet =
    selectedProjectData ||
    filteredNewProperties.find(
      (sheet) =>
        sheet.mediaFiles?.brochure ||
        sheet.mediaFiles?.elevationImages?.length > 0 ||
        sheet.mediaFiles?.projectWalkthrough?.length > 0
    );

  const filteredSections = !currentSheet?.mediaFiles
    ? []
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
          <h3 className="text-lg font-semibold">
            {mediaModal.title}
            {currentSheet?.projectName && ` - ${currentSheet.projectName}`}
          </h3>
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
                      <div className="aspect-square relative overflow-hidden bg-white">
                        <iframe
                          src={`${file}#toolbar=0&navpanes=0&scrollbar=0`}
                          className="w-full h-full border-0 transform scale-[0.2] origin-top-left pointer-events-none"
                          style={{ width: "500%", height: "500%" }}
                        />
                        <div className="absolute bottom-1 right-1 pointer-events-none">
                          <svg
                            className="w-4 h-4 text-red-600 bg-white/90 rounded p-0.5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                          </svg>
                        </div>
                      </div>
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
                      const isPdf =
                        file.toLowerCase().includes(".pdf") ||
                        file.includes("pdf");
                      const isVideo =
                        file.toLowerCase().includes(".mp4") ||
                        file.toLowerCase().includes(".mov") ||
                        file.includes("video");

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
                            <div className="aspect-square relative overflow-hidden bg-white">
                              <iframe
                                src={`${file}#toolbar=0&navpanes=0&scrollbar=0`}
                                className="w-full h-full border-0 transform scale-[0.2] origin-top-left pointer-events-none"
                                style={{ width: "500%", height: "500%" }}
                              />
                              <div className="absolute bottom-1 right-1 pointer-events-none">
                                <svg
                                  className="w-4 h-4 text-red-600 bg-white/90 rounded p-0.5"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                                </svg>
                              </div>
                            </div>
                          ) : isVideo ? (
                            <div className="aspect-square relative overflow-hidden">
                              <video
                                src={file}
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
                            <img
                              src={file}
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
