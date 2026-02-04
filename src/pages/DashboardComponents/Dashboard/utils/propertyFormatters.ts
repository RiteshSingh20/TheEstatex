export const formatPriceDisplay = (value: string): string => {
  const num = parseInt(value.replace(/[^0-9]/g, ""));
  if (isNaN(num) || num === 0) return "";

  if (num >= 10000000) {
    // 1 crore or more
    const crores = num / 10000000;
    return crores % 1 === 0 ? `₹${crores} Cr` : `₹${crores.toFixed(1)} Cr`;
  } else if (num >= 100000) {
    // 1 lakh or more
    const lakhs = num / 100000;
    return lakhs % 1 === 0 ? `₹${lakhs} Lac` : `₹${lakhs.toFixed(1)} Lac`;
  } else if (num >= 1000) {
    // 1 thousand or more
    const thousands = num / 1000;
    return thousands % 1 === 0
      ? `₹${thousands} K`
      : `₹${thousands.toFixed(1)} K`;
  }
  return "";
};

export const getFloorCategory = (
  floorNo: string | number | undefined,
  totalFloors: string | number | undefined
): string => {
  const floor = Number(floorNo);
  const total = Number(totalFloors);

  if (!floor || !total || floor <= 0 || total <= 0) return "--";

  const percentage = (floor / total) * 100;

  if (percentage < 40) return "Lower Floor";
  if (percentage > 65) return "Higher Floor";
  return "Middle Floor";
};

export const getFileName = (url: string): string => {
  try {
    // For Firebase storage URLs, extract the original filename
    if (url.includes("firebase") || url.includes("googleapis.com")) {
      // Look for the filename in the URL path after the last %2F (encoded /)
      const decodedUrl = decodeURIComponent(url);
      const pathMatch = decodedUrl.match(/\/([^/]+)\?/);
      if (pathMatch && pathMatch[1]) {
        // If it contains a path like costSheets/123456/filename.jpg, get just the filename
        const parts = pathMatch[1].split("/");
        const filename = parts[parts.length - 1];
        // Skip database-generated names and folder paths
        if (filename && !filename.match(/^\d+$/) && filename.includes(".")) {
          return filename;
        }
      }

      // Alternative: look for filename in the token or alt parameter
      const altMatch = url.match(/[?&]alt=([^&]+)/);
      if (altMatch) {
        const altValue = decodeURIComponent(altMatch[1]);
        if (altValue !== "media" && altValue.includes(".")) {
          return altValue;
        }
      }
    }

    // Fallback: extract from URL path
    const urlParts = url.split("/");
    const filename = urlParts[urlParts.length - 1].split("?")[0];
    const decodedFilename = decodeURIComponent(filename);

    // Return filename if it looks like a real file (has extension)
    if (
      decodedFilename &&
      decodedFilename.includes(".") &&
      !decodedFilename.match(/^\d+$/)
    ) {
      return decodedFilename;
    }

    // Default fallback
    return "Media File";
  } catch {
    return "Media File";
  }
};