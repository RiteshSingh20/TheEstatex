import { db } from "../../../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { getPricingData, Station } from "./PricingService";

interface CachedStations {
  data: Station[];
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const stationCache = new Map<string, CachedStations>();

// Normalize station names by removing East/West suffixes
const normalizeStationName = (name: string): string => {
  return name.replace(/\s+(East|West)$/i, "").trim();
};

// Get normalized key for comparison
const getStationKey = (name: string): string => {
  return normalizeStationName(name).toLowerCase();
};

// Fetch unique stations from resale & rental properties
export const fetchResaleRentalStations = async (): Promise<Station[]> => {
  const cacheKey = "resale-rental";
  const cached = stationCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const userIds = usersSnapshot.docs.map((doc) => doc.id);

    const stationMap = new Map<string, Station>();
    const CHUNK_SIZE = 10;

    for (let i = 0; i < userIds.length; i += CHUNK_SIZE) {
      const chunk = userIds.slice(i, i + CHUNK_SIZE);

      const chunkPromises = chunk.map(async (userId) => {
        try {
          // Fetch from both resale and rental properties
          const resalePropertiesRef = collection(db, `users/${userId}/resaleProperties`);
          const rentalPropertiesRef = collection(db, `users/${userId}/rentalProperties`);
          
          const [resaleSnapshot, rentalSnapshot] = await Promise.all([
            getDocs(resalePropertiesRef),
            getDocs(rentalPropertiesRef)
          ]);

          // Process resale properties
          resaleSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            if (data.station) {
              const normalizedName = normalizeStationName(data.station);
              const stationKey = getStationKey(data.station);

              if (!stationMap.has(stationKey)) {
                stationMap.set(stationKey, {
                  id: stationKey,
                  name: normalizedName,
                  district: data.district || "",
                  state: data.state || "",
                  source: "resale-rental",
                });
              }
            }
          });

          // Process rental properties
          rentalSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            if (data.station) {
              const normalizedName = normalizeStationName(data.station);
              const stationKey = getStationKey(data.station);

              if (!stationMap.has(stationKey)) {
                stationMap.set(stationKey, {
                  id: stationKey,
                  name: normalizedName,
                  district: data.district || "",
                  state: data.state || "",
                  source: "resale-rental",
                });
              }
            }
          });
        } catch (error) {
          console.error(`Error fetching properties for user ${userId}:`, error);
        }
      });

      await Promise.all(chunkPromises);
    }

    // Add custom stations from pricing data
    try {
      const pricingData = await getPricingData();
      Object.entries(pricingData.resaleRental || {}).forEach(([key, pricing]) => {
        if (key.startsWith('custom_')) {
          const stationName = key.replace('custom_', '');
          const normalizedKey = getStationKey(stationName);
          
          if (!stationMap.has(normalizedKey)) {
            stationMap.set(normalizedKey, {
              id: normalizedKey,
              name: stationName,
              district: (pricing as any).district || "",
              state: (pricing as any).state || "",
              source: "custom",
            });
          }
        }
      });
    } catch (error) {
      console.error("Error fetching custom resale rental stations:", error);
    }

    const stations = Array.from(stationMap.values());
    stationCache.set(cacheKey, { data: stations, timestamp: Date.now() });
    return stations;
  } catch (error) {
    console.error("Error fetching resale & rental stations:", error);
    return [];
  }
};

// Fetch unique stations from new properties
export const fetchNewPropertyStations = async (): Promise<Station[]> => {
  const cacheKey = "new-property";
  const cached = stationCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const costSheetsSnapshot = await getDocs(collection(db, "TestingCostSheets"));
    const stationMap = new Map<string, Station>();

    costSheetsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.location) {
        const normalizedName = normalizeStationName(data.location);
        const stationKey = getStationKey(data.location);

        if (!stationMap.has(stationKey)) {
          stationMap.set(stationKey, {
            id: stationKey,
            name: normalizedName,
            district: data.district || "",
            state: data.state || "",
            source: "new-property",
          });
        }
      }
    });

    // Add custom stations from pricing data
    try {
      const pricingData = await getPricingData();
      Object.entries(pricingData.newProperty || {}).forEach(([key, pricing]) => {
        if (key.startsWith('custom_')) {
          const stationName = key.replace('custom_', '');
          const normalizedKey = getStationKey(stationName);
          
          if (!stationMap.has(normalizedKey)) {
            stationMap.set(normalizedKey, {
              id: normalizedKey,
              name: stationName,
              district: (pricing as any).district || "",
              state: (pricing as any).state || "",
              source: "custom",
            });
          }
        }
      });
    } catch (error) {
      console.error("Error fetching custom new property stations:", error);
    }

    const stations = Array.from(stationMap.values());
    stationCache.set(cacheKey, { data: stations, timestamp: Date.now() });
    return stations;
  } catch (error) {
    console.error("Error fetching new property stations:", error);
    return [];
  }
};

// Fetch custom stations from pricing database
export const fetchCustomStations = async (): Promise<Station[]> => {
  const cacheKey = "custom";
  const cached = stationCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const pricingData = await getPricingData();
    const stations = Object.values(pricingData.customStations);

    stationCache.set(cacheKey, { data: stations, timestamp: Date.now() });
    return stations;
  } catch (error) {
    console.error("Error fetching custom stations:", error);
    return [];
  }
};

// Clear cache
export const clearStationCache = () => {
  stationCache.clear();
};
