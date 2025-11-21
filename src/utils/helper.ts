import { User, SubscriptionLocation } from "../types";

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
  locations: SubscriptionLocation[]
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
  totalFloors: string | number | undefined
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
  propertyCategory?: string
): string => {
  if (isCostSheet && properties.length > 0) {
    // If it's Quick Send, use the existing detailed format
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
        if (p.flatType && p.reraCarpet) {
          if (!configGroups[p.flatType]) configGroups[p.flatType] = [];
          configGroups[p.flatType].push(p.reraCarpet);
        }
        if (p.possession) allPossessions.add(p.possession);
        if (p.mahaReraNumber) allReraNumbers.add(p.mahaReraNumber);
        if (p.totalPackage) {
          minPrice = Math.min(minPrice, Number(p.totalPackage));
          maxPrice = Math.max(maxPrice, Number(p.totalPackage));
        }
      });

      let text = `Dear ${prefix ? prefix + " " : ""}${name},\n\n`;

      const projectTypeText = property.mahaReraNumber
        ? "is RERA Registered project"
        : property.type
        ? `is ${property.type} project`
        : "project";
      text += `The resedential property *${property.projectName}* ${projectTypeText}, Developing by *${property.developerName}*, Located at ${property.subLocation} in ${property.station}. The total land parcel of the project is *${property.landParcel} Acre*.\n\n`;

      // Sort flat types according to bhkOrder
      const sortedFlatTypes = Object.keys(configGroups).sort((a, b) => {
        const indexA = bhkOrder.indexOf(a);
        const indexB = bhkOrder.indexOf(b);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
      });
      const flatTypes = sortedFlatTypes.join(" | ");
      text += `The project contains ${property.towers} Tower of ${property.storey} Storey building, having *${flatTypes}* Apartments,\n\n`;

      text += `*🏠 Configuration Type: [Rera Carpet Areas] :*\n`;
      sortedFlatTypes.forEach((flatType) => {
        const uniqueAreas = [...new Set(configGroups[flatType])].sort(
          (a, b) => Number(a) - Number(b)
        );
        text += `- *${flatType}* - ${uniqueAreas.join(" | ")}\n`;
      });
      text += `\n`;

      if (minPrice !== Infinity && maxPrice > 0) {
        text += `Price range : *${formatAmount(minPrice)}* to *${formatAmount(
          maxPrice
        )}* All Inclusive.\n\n`;
      }

      if (
        property.locationHighlights &&
        property.locationHighlights.length > 0
      ) {
        text += `*✨ Highlights :*\n`;
        property.locationHighlights.forEach((highlight) => {
          text += `- ${highlight}\n`;
        });
        text += `\n`;
      }

      if (property.projectAmenities && property.projectAmenities.length > 0) {
        text += `*🎉 Project Amenities :*\n`;
        property.projectAmenities.forEach((amenity) => {
          text += `- ${amenity}\n`;
        });
        text += `\n`;
      }

      if (
        property.apartmentAmenities &&
        property.apartmentAmenities.length > 0
      ) {
        text += `*🏠 Apartment Amenities :*\n`;
        property.apartmentAmenities.forEach((amenity) => {
          text += `- ${amenity}\n`;
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

      if (allReraNumbers.size > 0) {
        text += `Maha RERA number : *${Array.from(allReraNumbers).join(
          " | "
        )}*\n\n`;
      }

      const firmName = user?.firmName || "us";
      text += `Thank you for considering ${firmName}.\n\nBest regards,\n${
        user?.fullName || "EstateX Team"
      }\n${user?.marketingPhoneNumber || user?.phone || ""}`;

      return text;
    }

    // If it's table selection (multiple properties), use the new format
    const totalCount = totalResaleCount || properties.length;
    let text = `Hello! ${prefix ? prefix + " " : ""}*${name}*\n\n`;
    text += `As per you requirement / Budget we have ${totalCount} new properties.\n`;
    text += `Sending ${properties.length} Selected properties.\n\n`;

    properties.forEach((property) => {
      const possessionText =
        property.possession === "Ready to Move"
          ? "READY TO MOVE"
          : property.possession || "N/A";
      text += `✅ ${property.projectName} - ${
        property.subLocation
      } - ${formatAmount(property.totalPackage)} - ${possessionText}\n\n`;
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
      property.totalFloors
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
  location: string
): boolean => {
  if (!user) return false;
  return user.subscriptionLocations.some(
    (loc) => loc.name.toLowerCase() === location.toLowerCase()
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
