// src/utils/geoUtils.ts
export const getNearbyAreas = async (
  lat: number,
  lng: number
): Promise<string[]> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!data.address) return [];

    const areas = [
      data.address.neighbourhood,
      data.address.suburb,
      data.address.village,
      data.address.quarter,
      data.address.road,
    ].filter(Boolean); // Remove undefined values

    return [...new Set(areas)] as string[];
  } catch (error) {
    console.error("Error fetching nearby areas:", error);
    return [];
  }
};
