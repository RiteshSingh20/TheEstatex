import React, { useState, useRef, useMemo, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useSecureMedia } from "../hooks/useSecureMedia";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface SecurePDFViewerProps {
  fileUrl: string;
}

export function SecurePDFViewer({ fileUrl }: SecurePDFViewerProps) {
  const { secureUrl, loading, error } = useSecureMedia(fileUrl);
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error || !secureUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">Unable to load PDF</p>
          <a 
            href={fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Open in new tab
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-gray-100">
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <button
          onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
          disabled={pageNumber <= 1}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        <span className="text-sm">
          Page {pageNumber} of {numPages || '?'}
        </span>
        <button
          onClick={() => setPageNumber(Math.min(numPages || 1, pageNumber + 1))}
          disabled={pageNumber >= (numPages || 1)}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
      <div className="flex-1 overflow-auto flex justify-center">
        <Document
          file={secureUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          className="max-w-full"
        >
          <Page pageNumber={pageNumber} className="shadow-lg" />
        </Document>
      </div>
    </div>
  );
}
