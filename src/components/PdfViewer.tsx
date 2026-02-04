import React from "react";
import { Document, Page, pdfjs } from "react-pdf";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// IMPORTANT: set worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type Props = {
  url: string;
};

export default function PdfViewer({ url }: Props) {
  const [numPages, setNumPages] = React.useState<number>(0);
  const [pageNumber, setPageNumber] = React.useState<number>(1);
  const [scale, setScale] = React.useState<number>(1.2);

  // block right click + common shortcuts
  React.useEffect(() => {
    const preventContext = (e: MouseEvent) => e.preventDefault();

    const preventKeys = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ["s", "p", "c", "u"].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("contextmenu", preventContext, { capture: true });
    window.addEventListener("keydown", preventKeys, { capture: true });

    return () => {
      window.removeEventListener("contextmenu", preventContext, { capture: true } as any);
      window.removeEventListener("keydown", preventKeys, { capture: true } as any);
    };
  }, []);

  return (
    <div
      className="w-[90vw] h-[90vh] bg-white rounded overflow-hidden flex flex-col"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50">
        <div className="flex gap-2 items-center">
          <button
            className="px-3 py-1 bg-black text-white rounded disabled:opacity-50"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>

          <button
            className="px-3 py-1 bg-black text-white rounded disabled:opacity-50"
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
          >
            Next
          </button>

          <span className="text-sm text-gray-700">
            Page {pageNumber} / {numPages || "-"}
          </span>
        </div>

        <div className="flex gap-2 items-center">
          <button
            className="px-3 py-1 bg-gray-200 rounded"
            onClick={() => setScale((s) => Math.max(0.6, +(s - 0.2).toFixed(2)))}
          >
            -
          </button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <button
            className="px-3 py-1 bg-gray-200 rounded"
            onClick={() => setScale((s) => Math.min(3, +(s + 0.2).toFixed(2)))}
          >
            +
          </button>
        </div>
      </div>

      {/* PDF Canvas */}
      <div
        className="flex-1 overflow-auto p-4"
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        <Document
          file={{
            url: url,
            httpHeaders: {
              'Access-Control-Allow-Origin': '*',
            },
            withCredentials: false,
          }}
          options={{
            cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
            cMapPacked: true,
            standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/',
          }}
          onLoadSuccess={({ numPages }) => {
            setNumPages(numPages);
            setPageNumber(1);
          }}
          loading={<div className="text-center text-gray-600">Loading PDF...</div>}
          error={<div className="text-center text-red-600">Failed to load PDF</div>}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>
    </div>
  );
}