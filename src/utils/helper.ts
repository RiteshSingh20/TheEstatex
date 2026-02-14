import { User, SubscriptionLocation } from "../types";

const VIEWFILES_BASE_URL = import.meta.env.PROD
  ? "https://viewfiles.in"
  : "http://localhost:4000";

// Helper function to format storey data
export const formatStorey = (storey: string): string => {
  if (!storey) return "-";
  const mapping = {
    B: "Basement",
    P: "Level Podium",
    H: "Habitable",
    Comm: "Commercial",
    Stilt: "Stilt",
    G: "Ground",
  };
  return storey.replace(
    /(\d*)(B|P|H|Comm|Stilt|G)\b/g,
    (match, num, abbr) =>
      num + " " + (mapping[abbr as keyof typeof mapping] || abbr),
  );
};

// Format currency to Indian Rupees
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

// Calculate subscription total
export const calculateSubscriptionTotal = (
  locations: SubscriptionLocation[],
): number => {
  return locations.reduce((total, location) => total + location.price, 0);
};

// Helper function to format numbers into "Lakhs" (L) - exported for use in WhatsApp text
export const formatAmount = (amount: number | string): string => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) {
    return "N/A"; // Or handle error as appropriate
  }

  // Define thresholds for Lakh and Crore
  const oneLakh = 100000;
  const oneCrore = 10000000;

  if (num >= oneCrore) {
    const crores = num / oneCrore;
    return `₹ ${crores.toFixed(2).replace(/\.00$/, "")} Cr`; // Formats to 2 decimal places, removes .00 if whole
  } else if (num >= oneLakh) {
    const lakhs = num / oneLakh;
    return `₹ ${lakhs.toFixed(2).replace(/\.00$/, "")} L`; // Formats to 2 decimal places, removes .00 if whole
  } else {
    // For amounts less than a lakh, display as is or with standard formatting
    return `₹ ${num.toLocaleString("en-IN")}`; // Formats with Indian number system commas
  }
};

// Helper function to get floor category
const getFloorCategory = (
  floorNo: string | number | undefined,
  totalFloors: string | number | undefined,
): string => {
  const floor = Number(floorNo);
  const total = Number(totalFloors);

  if (!floor || !total || floor <= 0 || total <= 0) {
    console.log("Floor category debug:", {
      floorNo,
      totalFloors,
      floor,
      total,
    });
    return "--";
  }

  const percentage = (floor / total) * 100;

  if (percentage < 40) return "Lower Floor";
  if (percentage > 65) return "Higher Floor";
  return "Middle Floor";
};

const pickMediaUrl = (value: any): string | null => {
  if (!value) return null;
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "object" && typeof value.url === "string" && value.url.trim()) {
    return value.url;
  }
  return null;
};

const pickFirstMediaUrlFromList = (list: any[]): string | null => {
  for (const item of list) {
    if (!item) continue;

    if (Array.isArray(item)) {
      const nested = pickFirstMediaUrlFromList(item);
      if (nested) return nested;
      continue;
    }

    const direct = pickMediaUrl(item);
    if (direct) return direct;
  }
  return null;
};

const getFirstImageUrl = (mediaFiles: any): string | null => {
  if (!mediaFiles || typeof mediaFiles !== "object") return null;

  const typologyImages = mediaFiles.typologyImages
    ? Object.values(mediaFiles.typologyImages)
    : [];

  return pickFirstMediaUrlFromList([
    mediaFiles.elevationImages,
    mediaFiles.amenitiesImages,
    mediaFiles.floorPlanImages,
    typologyImages,
  ]);
};

const getFirstVideoUrl = (mediaFiles: any): string | null => {
  if (!mediaFiles || typeof mediaFiles !== "object") return null;

  const typologyVideos = mediaFiles.typologyVideos
    ? Object.values(mediaFiles.typologyVideos)
    : [];

  return pickFirstMediaUrlFromList([
    mediaFiles.projectWalkthrough,
    typologyVideos,
  ]);
};

// Generate WhatsApp sharing text for properties
export const generateWhatsAppText = (
  properties: any[],
  prefix: string,
  name: string,
  phone: string,
  user?: {
    id: string;
    isAdmin?: boolean;
    fullName?: string;
    firmName?: string;
    phone?: string;
    marketingPhoneNumber?: string;
  },
  totalResaleCount?: number,
  isCostSheet?: boolean,
  isQuickSend?: boolean,
  propertyCategory?: string,
): string => {
  if (isCostSheet && properties.length > 0) {
    // If it's Quick Send, use the new detailed format
    if (isQuickSend) {
      const property = properties[0];

      // Group configurations by flatType
      const configGroups: { [key: string]: string[] } = {};
      const allPossessions = new Set<string>();
      const allReraNumbers = new Set<string>();
      let minPrice = Infinity;
      let maxPrice = 0;

      // BHK ordering for proper sequence
      const bhkOrder = [
        "1 RK",
        "1 BHK",
        "1.5 BHK",
        "2 BHK",
        "2.5 BHK",
        "3 BHK",
        "3.5 BHK",
        "4 BHK",
        "4.5 BHK",
        "5 BHK",
        "Row House",
        "Bunglow",
        "Villa",
        "Penthouse",
      ];

      properties.forEach((p) => {
        // Handle typologies array
        if (p.typologies && Array.isArray(p.typologies)) {
          p.typologies.forEach((typology: any) => {
            if (
              typology.availability !== "Sold Out" &&
              typology.typology &&
              typology.reraCarpet
            ) {
              if (!configGroups[typology.typology])
                configGroups[typology.typology] = [];
              configGroups[typology.typology].push(typology.reraCarpet);
            }
            if (typology.developerPossession)
              allPossessions.add(typology.developerPossession);
            if (typology.mahaReraNumber)
              allReraNumbers.add(typology.mahaReraNumber);
            if (typology.totalPackage) {
              minPrice = Math.min(minPrice, Number(typology.totalPackage));
              maxPrice = Math.max(maxPrice, Number(typology.totalPackage));
            }
          });
        }

        // Handle subTabData
        if (p.subTabData) {
          Object.values(p.subTabData).forEach((tabData: any) => {
            if (
              tabData.pricingConfigs &&
              Array.isArray(tabData.pricingConfigs)
            ) {
              tabData.pricingConfigs.forEach((config: any) => {
                if (
                  config.availability !== "Sold Out" &&
                  config.typology &&
                  config.reraCarpet
                ) {
                  if (!configGroups[config.typology])
                    configGroups[config.typology] = [];
                  configGroups[config.typology].push(config.reraCarpet);
                }
                if (config.totalPackage) {
                  minPrice = Math.min(minPrice, Number(config.totalPackage));
                  maxPrice = Math.max(maxPrice, Number(config.totalPackage));
                }
              });
            }
            if (tabData.developerPossession)
              allPossessions.add(tabData.developerPossession);
            if (tabData.mahaReraNumber)
              allReraNumbers.add(tabData.mahaReraNumber);
          });
        }
      });

      let text = `We are thrilled to introduce *${property.projectName}*, a new residential project by the Developer *${property.developerName}*, located at ${property.subLocation}, ${property.location || property.station}, ${property.landmark || ""}. This expansive development spans a *${property.landParcel} Acres* land parcel and features *${property.towers} Towers* of *${formatStorey(property.storey)} Storeys*.\n\n`;

      // Sort flat types according to bhkOrder
      const sortedFlatTypes = Object.keys(configGroups).sort((a, b) => {
        const indexA = bhkOrder.indexOf(a);
        const indexB = bhkOrder.indexOf(b);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
      });

      text += `*🏠 Configuration Type: [Rera Carpet Areas] :*\n`;
      sortedFlatTypes.forEach((flatType) => {
        const uniqueAreas = [...new Set(configGroups[flatType])].sort(
          (a, b) => Number(a) - Number(b),
        );
        text += `- *${flatType}* - ${uniqueAreas.join(" | ")}\n`;
      });
      text += `\n`;

      if (minPrice !== Infinity && maxPrice > 0) {
        text += `Price Range: *${formatAmount(minPrice)}* to *${formatAmount(
          maxPrice,
        )}* All Inclusive.\n\n`;
      }

      if (
        property.locationHighlights &&
        property.locationHighlights.length > 0
      ) {
        text += `📍 Prime Connectivity (All within!)\n`;
        property.locationHighlights.forEach((highlight) => {
          text += `- ${highlight}\n`;
        });
        text += `\n`;
      }

      if (property.projectAmenities && property.projectAmenities.length > 0) {
        text += `🌳 Lifestyle Amenities\n`;
        property.projectAmenities.forEach((amenity) => {
          text += `- ${amenity}\n`;
        });
        text += `\n`;
      }

      if (
        property.apartmentAmenities &&
        property.apartmentAmenities.length > 0
      ) {
        text += `🏠 Apartment Amenities\n`;
        property.apartmentAmenities.forEach((amenity) => {
          text += `- ${amenity}\n`;
        });
        text += `\n`;
      }

      if (property.paymentSchemes && property.paymentSchemes.length > 0) {
        text += `Payment Schemes\n`;
        property.paymentSchemes.forEach((scheme: any) => {
          text += `- ${scheme.schemeName || scheme}\n`;
        });
        text += `\n`;
      }

      const monthMap: Record<string, number> = {
        Jan: 1,
        Feb: 2,
        Mar: 3,
        Apr: 4,
        May: 5,
        Jun: 6,
        Jul: 7,
        Aug: 8,
        Sep: 9,
        Oct: 10,
        Nov: 11,
        Dec: 12,
      };

      if (allPossessions.size > 0) {
        const sortedPossessions = Array.from(allPossessions).sort((a, b) => {
          const [monthA, yearA] = a.split("-");
          const [monthB, yearB] = b.split("-");

          if (yearA !== yearB) {
            return parseInt(yearA) - parseInt(yearB);
          }
          return monthMap[monthA] - monthMap[monthB];
        });

        text += `*Possession by : ${sortedPossessions.join(" | ")}*\n\n`;
      }

      const mediaFiles = property.mediaFiles || {};
      const sendingPropertiesFirestoreDocumentId =
        property?.id || property?.docId || property?.propertyId;

      const hasBrochure = Boolean(pickMediaUrl(mediaFiles.brochure));
      const hasImage = Boolean(getFirstImageUrl(mediaFiles));
      const hasVideo = Boolean(getFirstVideoUrl(mediaFiles));

      const imageUrl =
        hasImage && sendingPropertiesFirestoreDocumentId
          ? `${VIEWFILES_BASE_URL}/${encodeURIComponent(String(sendingPropertiesFirestoreDocumentId))}/img`
          : null;
      const brochureUrl =
        hasBrochure && sendingPropertiesFirestoreDocumentId
          ? `${VIEWFILES_BASE_URL}/${encodeURIComponent(String(sendingPropertiesFirestoreDocumentId))}/br`
          : null;
      const videoUrl =
        hasVideo && sendingPropertiesFirestoreDocumentId
          ? `${VIEWFILES_BASE_URL}/${encodeURIComponent(String(sendingPropertiesFirestoreDocumentId))}/vd`
          : null;

      if (imageUrl || brochureUrl || videoUrl) {
        if (imageUrl) text += `image : ${imageUrl}\n`;
        if (brochureUrl) text += `brochure : ${brochureUrl}\n`;
        if (videoUrl) text += `video : ${videoUrl}\n`;
        text += `\n`;
      }

      const firmName = user?.firmName || "us";
      text += `Thank you for considering ${firmName}.\n\nBest regards,\n${
        user?.fullName || "EstateX Team"
      }\n${user?.marketingPhoneNumber || user?.phone || ""}`;

      return text;
    }

    // If it's table selection (multiple properties), use the new format
    const totalCount = totalResaleCount || properties.length;
    
    // Deduplicate properties by project name to avoid duplicate entries
    const uniqueProperties = properties.reduce((acc, property) => {
      const existingIndex = acc.findIndex(p => p.projectName === property.projectName);
      if (existingIndex === -1) {
        acc.push(property);
      }
      return acc;
    }, [] as any[]);
    
    let text = `Hello! ${prefix ? prefix + " " : ""}*${name}*\n\n`;
    text += `As per you requirement / Budget we have ${totalCount} new properties.\n`;
    text += `Sending ${uniqueProperties.length} Selected properties.\n\n`;

    uniqueProperties.forEach((property) => {
      // Get possession from typologies or subTabData
      let possessionText = "N/A";
      if (property.reraPossession === "Ready to move") {
        possessionText = "READY TO MOVE";
      } else if (property.typologies?.[0]?.developerPossession) {
        possessionText = property.typologies[0].developerPossession;
      } else if (property.subTabData) {
        const firstTab = Object.values(property.subTabData)[0] as any;
        if (firstTab?.developerPossession) {
          possessionText = firstTab.developerPossession;
        }
      }

      // Get price from typologies or subTabData
      let priceText = "N/A";
      if (property.typologies?.[0]?.totalPackage) {
        priceText = formatAmount(property.typologies[0].totalPackage);
      } else if (property.subTabData) {
        const firstTab = Object.values(property.subTabData)[0] as any;
        if (firstTab?.pricingConfigs?.[0]?.totalPackage) {
          priceText = formatAmount(firstTab.pricingConfigs[0].totalPackage);
        }
      }

      text += `✅ ${property.projectName} - ${property.subLocation} - ${priceText} - ${possessionText}\n\n`;
    });

    const firmName = user?.firmName || "us";
    text += `Thank you for considering ${firmName}.\n\nBest regards,\n${
      user?.fullName || "EstateX Team"
    }\n${user?.marketingPhoneNumber || user?.phone || ""}`;

    return text;
  }

  const totalCount =
    totalResaleCount !== undefined ? totalResaleCount : properties.length;
  const propertyType = properties[0]?.type || "property";

  // Determine if properties are rental or resale
  const isRental =
    propertyCategory === "Rental" ||
    properties.some((p) => p.rent && !p.expectedPrice);
  const categoryText = isRental ? "rental" : "resale";

  let text = `Hello! ${
    prefix ? prefix + " " : ""
  }${name},\n\nWe have *${totalCount}* ${categoryText} properties of *${propertyType}* that match your requirements and budget.\n\nHere are the details of the *${
    properties.length
  }* selected properties:\n\n`;
  properties.forEach((property) => {
    const floorCategory = getFloorCategory(
      property.floorNo,
      property.totalFloors,
    );
    const location = property.sublocation || property.roadLocation || "N/A";

    if (property.expectedPrice) {
      // Resale property format
      const priceText = formatAmount(property.expectedPrice);
      text += `✅ ${property.society} – (${floorCategory}) – ${location} – ${priceText}\n\n`;
    } else if (property.rent) {
      // Rental property format
      const rentText = `Rent - ${property.rent} / ${property.deposit || 0}`;
      text += `✅ ${property.society} – (${floorCategory}) – ${location}, ${rentText}\n\n`;
    } else {
      // Fallback format
      text += `✅ ${property.society} – (${floorCategory}) – ${location} – N/A\n\n`;
    }
  });

  const firmName = user?.firmName || "us";
  text += `Thank you for considering ${firmName}.\n\nBest regards,\n${
    user?.fullName || "EstateX Team"
  }\n${user?.marketingPhoneNumber || user?.phone || ""}`;

  return text;
};

// Check if user has subscription for a location
export const hasLocationSubscription = (
  user: User | null,
  location: string,
): boolean => {
  if (!user) return false;
  return user.subscriptionLocations.some(
    (loc) => loc.name.toLowerCase() === location.toLowerCase(),
  );
};

// Helper to get user's subscribed locations as array of names
export const getUserSubscribedLocations = (user: User | null): string[] => {
  if (!user) return [];
  return user.subscriptionLocations.map((loc) => loc.name);
};

// Filter properties based on criteria
export const filterProperties = (properties: any[], filters: any): any[] => {
  return properties.filter((property) => {
    // Filter by BHK type if specified
    if (filters.bhkType && property.type !== filters.bhkType) {
      return false;
    }

    // Filter by station if specified
    if (filters.station && property.station !== filters.station) {
      return false;
    }

    // Filter by budget range if specified
    if (
      filters.minBudget &&
      filters.propertyCategory === "Rental" &&
      property.rent < filters.minBudget
    ) {
      return false;
    }
    if (
      filters.maxBudget &&
      filters.propertyCategory === "Rental" &&
      property.rent > filters.maxBudget
    ) {
      return false;
    }
    if (
      filters.minBudget &&
      filters.propertyCategory === "Resale" &&
      property.expectedPrice < filters.minBudget
    ) {
      return false;
    }
    if (
      filters.maxBudget &&
      filters.propertyCategory === "Resale" &&
      property.expectedPrice > filters.maxBudget
    ) {
      return false;
    }

    // Filter by sub-location if specified
    if (filters.subLocation && property.roadLocation !== filters.subLocation) {
      return false;
    }

    // Filter by Cosmo if specified
    if (
      filters.lookingForCosmo !== undefined &&
      property.cosmo !== filters.lookingForCosmo
    ) {
      return false;
    }

    return true;
  });
};

// Example for filtering properties in Dashboard.tsx

const hasSubscriptionForLocation = (user: User | null, location: string) => {
  if (!user || !user.subscriptionLocations) return false;
  return user.subscriptionLocations.some((sub) => {
    if (!sub.subscribedAt) return false;
    const subscribedDate = new Date(sub.subscribedAt);
    const now = new Date();
    const diff = now.getTime() - subscribedDate.getTime();
    // Only count as active if within 30 days
    return (
      sub.name.trim().toLowerCase() === location.trim().toLowerCase() &&
      diff < 30 * 24 * 60 * 60 * 1000
    );
  });
};
