import React, { useState, useRef, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { encryptUrl } from "../utils/encryptUrl";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface SecurePDFViewerProps {
  fileUrl: string;
}

const MEDIA_PROXY_URL =
  import.meta.env.VITE_MEDIA_PROXY_URL || "http://localhost:8080";

export function SecurePDFViewer({ fileUrl }: SecurePDFViewerProps) {
  const proxyUrl = useMemo(() => {
    const token = encryptUrl(fileUrl);
    return `${MEDIA_PROXY_URL}?token=${encodeURIComponent(token)}`;
  }, [fileUrl]);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setIsLoaded(true);
  }

  return (
    <div
      className="flex h-full w-full bg-gray-800"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Sidebar with page thumbnails */}
      <div className="w-48 bg-gray-900 overflow-y-auto flex-shrink-0">
        <div className="p-2 space-y-2">
          {isLoaded && (
            <Document file={proxyUrl} loading="">
              {Array.from(new Array(numPages), (_, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setPageNumber(index + 1);
                    pageRefs.current[index]?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                  className={`cursor-pointer border-2 ${
                    pageNumber === index + 1
                      ? "border-blue-500"
                      : "border-transparent"
                  } hover:border-blue-300 transition-colors`}
                >
                  <Page
                    pageNumber={index + 1}
                    width={160}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                  <p className="text-white text-xs text-center mt-1">
                    {index + 1}
                  </p>
                </div>
              ))}
            </Document>
          )}
        </div>
      </div>

      {/* Main PDF viewer */}
      <div className="flex-1 overflow-auto bg-gray-700">
        <div className="flex flex-col items-center py-4 space-y-4">
          <Document
            file={proxyUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold text-white">
                    Loading Document
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Please wait while we prepare your document...
                  </p>
                  <div className="flex items-center justify-center space-x-2 mt-4">
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            }
          >
            {Array.from(new Array(numPages), (_, index) => (
              <div
                key={index}
                ref={(el) => (pageRefs.current[index] = el)}
                className="bg-white shadow-lg"
              >
                <Page
                  pageNumber={index + 1}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  width={Math.min(window.innerWidth * 0.65, 1000)}
                />
              </div>
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
}
