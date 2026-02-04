import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFThumbnailProps {
  url: string;
  className?: string;
}

const PDFThumbnail: React.FC<PDFThumbnailProps> = ({ url, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const generateThumbnail = async () => {
      if (!canvasRef.current) return;

      try {
        setLoading(true);
        setError(false);

        const loadingTask = pdfjsLib.getDocument({
          url: url,
          httpHeaders: {
            'Accept': 'application/pdf',
          },
          withCredentials: false,
        });
        
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (!context) return;

        const viewport = page.getViewport({ scale: 0.3 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        setLoading(false);
      } catch (err) {
        console.error('PDF thumbnail error:', err);
        setError(true);
        setLoading(false);
      }
    };

    generateThumbnail();
  }, [url]);

  if (error) {
    return (
      <div className={`aspect-square bg-red-50 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 text-red-600 mx-auto mb-2">📄</div>
          <span className="text-xs text-red-600">PDF</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`aspect-square bg-gray-100 flex items-center justify-center ${className}`}>
      {loading && (
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      )}
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover ${loading ? 'hidden' : ''}`}
      />
    </div>
  );
};

export default PDFThumbnail;