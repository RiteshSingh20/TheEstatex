import React from "react";

interface MediaDisplayComponentProps {
  setFullViewer: React.Dispatch<
    React.SetStateAction<{
      isOpen: boolean;
      files: string[];
      currentIndex: number;
      type: "image" | "video" | "pdf";
    }>
  >;
  fullViewer: {
    isOpen: boolean;
    files: string[];
    currentIndex: number;
    type: "image" | "video" | "pdf";
  };
  navigateMedia: (direction: "prev" | "next") => void;
}

export function MediaDisplayComponent({
  setFullViewer,
  fullViewer,
  navigateMedia,
}: MediaDisplayComponentProps) {
  const currentFileUrl = fullViewer.files[fullViewer.currentIndex];

  const closeViewer = React.useCallback(() => {
    setFullViewer({
      isOpen: false,
      files: [],
      currentIndex: 0,
      type: "image",
    });
  }, [setFullViewer]);

  // Strong protection: disable right click + block common save/print shortcuts
  React.useEffect(() => {
    if (!fullViewer.isOpen) return;

    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const preventKeys = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // ESC to close
      if (key === "escape") {
        e.preventDefault();
        closeViewer();
        return;
      }

      // Block common shortcuts: Save, Print, View source, Copy
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (isCtrlOrCmd && ["s", "p", "u", "c"].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Optional: block F12 (DevTools) - not guaranteed in all browsers
      if (e.key === "F12") {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("contextmenu", preventContextMenu, {
      capture: true,
    });
    window.addEventListener("keydown", preventKeys, { capture: true });

    return () => {
      window.removeEventListener("contextmenu", preventContextMenu, {
        capture: true,
      } as any);
      window.removeEventListener("keydown", preventKeys, {
        capture: true,
      } as any);
    };
  }, [fullViewer.isOpen, closeViewer]);

  if (!fullViewer.isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 flex justify-center items-center z-[9999]"
      onClick={(e) => {
        // Optional: click outside to close
        if (e.target === e.currentTarget) closeViewer();
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Close */}
        <button
          onClick={closeViewer}
          className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl z-10"
          aria-label="Close viewer"
        >
          ✕
        </button>

        {/* Prev/Next - hide for PDF */}
        {fullViewer.files.length > 1 && fullViewer.type !== "pdf" && (
          <>
            <button
              onClick={() => navigateMedia("prev")}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12 flex items-center justify-center text-3xl z-10 transition-all"
              aria-label="Previous media"
            >
              ‹
            </button>
            <button
              onClick={() => navigateMedia("next")}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12 flex items-center justify-center text-3xl z-10 transition-all"
              aria-label="Next media"
            >
              ›
            </button>
          </>
        )}

        {/* Media Container */}
        <div
          className="w-full h-full flex items-center justify-center"
          // This is the most reliable place to block right click for PDF viewer area
          onContextMenu={(e) => e.preventDefault()}
        >
          {fullViewer.type === "pdf" ? (
            <iframe
              src={`${currentFileUrl}#toolbar=0`}
              className="w-[90vw] h-[90vh] bg-white rounded"
              title="PDF Viewer"
              onContextMenu={(e) => e.preventDefault()}
              style={{
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
              }}
            />
          ) : fullViewer.type === "video" ? (
            <video
              controls
              controlsList="nodownload noplaybackrate"
              disablePictureInPicture
              className="max-w-[90vw] max-h-[90vh]"
              src={currentFileUrl}
              onContextMenu={(e) => e.preventDefault()}
            />
          ) : (
            <img
              src={currentFileUrl}
              alt="Full size media"
              className="max-w-[90vw] max-h-[90vh] object-contain select-none"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
              style={{
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
              }}
            />
          )}
        </div>

        {/* Counter */}
        {fullViewer.files.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded">
            {fullViewer.currentIndex + 1} / {fullViewer.files.length}
          </div>
        )}
      </div>
    </div>
  );
}
