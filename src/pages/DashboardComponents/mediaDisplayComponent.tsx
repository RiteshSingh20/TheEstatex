import React from "react";
import { SecurePDFViewer } from "../../components/SecurePDFViewer";
import { encryptUrl } from "../../utils/encryptUrl";

const MEDIA_PROXY_URL = import.meta.env.VITE_MEDIA_PROXY_URL || "http://localhost:8080";

function getProxyUrl(fileUrl: string): string {
  const token = encryptUrl(fileUrl);
  return `${MEDIA_PROXY_URL}?token=${encodeURIComponent(token)}`;
}

export function mediaDisplayComponent(
  setFullViewer: React.Dispatch<
    React.SetStateAction<{
      isOpen: boolean;
      files: string[];
      currentIndex: number;
      type: "image" | "video" | "pdf";
    }>
  >,
  fullViewer: {
    isOpen: boolean;
    files: string[];
    currentIndex: number;
    type: "image" | "video" | "pdf";
  },
  navigateMedia: (direction: "prev" | "next") => void
): React.ReactNode {
  const currentFileUrl = fullViewer.files[fullViewer.currentIndex];
  const proxyUrl = currentFileUrl ? getProxyUrl(currentFileUrl) : "";
  
  return (
    <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[9999]">
      <div className="relative w-full h-full flex items-center justify-center">
        <button
          onClick={() =>
            setFullViewer({
              isOpen: false,
              files: [],
              currentIndex: 0,
              type: "image",
            })
          }
          className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl z-10"
        >
          ✕
        </button>

        {fullViewer.files.length > 1 && (
          <>
            <button
              onClick={() => navigateMedia("prev")}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12 flex items-center justify-center text-3xl z-10 transition-all"
            >
              ‹
            </button>
            <button
              onClick={() => navigateMedia("next")}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12 flex items-center justify-center text-3xl z-10 transition-all"
            >
              ›
            </button>
          </>
        )}

        <div className="w-full h-full flex items-center justify-center">
          {fullViewer.type === "pdf" ? (
            <div className="w-[90vw] h-[90vh] bg-white rounded overflow-hidden">
              <SecurePDFViewer fileUrl={fullViewer.files[fullViewer.currentIndex]} />
            </div>
          ) : fullViewer.type === "video" ? (
            <video
              controls
              className="max-w-[90vw] max-h-[90vh]"
              src={proxyUrl}
            />
          ) : (
            <img
              src={proxyUrl}
              alt="Full size media"
              className="max-w-[90vw] max-h-[90vh] object-contain"
            />
          )}
        </div>

        {fullViewer.files.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded">
            {fullViewer.currentIndex + 1} / {fullViewer.files.length}
          </div>
        )}
      </div>
    </div>
  );
}
