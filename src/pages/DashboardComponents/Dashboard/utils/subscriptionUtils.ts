import { stations } from "../../../../utils/stations";

export const processSubscriptionLocations = (locations: any[]) => {
  return locations
    .map((loc) => {
      // If it's already a full station name with East/West, use it directly
      if (
        typeof loc === "string" &&
        (loc.includes(" East") || loc.includes(" West"))
      ) {
        return loc;
      }
      // If it's a base station name without East/West, return both variants
      if (typeof loc === "string" && isNaN(Number(loc))) {
        return [loc + " East", loc + " West"];
      }
      // Otherwise, find by ID and return both East/West variants
      const stationName = stations.find(
        (s) => s.id === String(loc)
      )?.name;
      return stationName
        ? [stationName + " East", stationName + " West"]
        : [];
    })
    .flat()
    .filter((name) => name);
};

export const checkSubscriptionAccess = (
  user: any,
  propertyCategory: string,
  rrStationNames: string[],
  ndStationNames: string[]
) => {
  if (!user) return false;
  
  if (
    user.role === "admin" ||
    user.role === "manager" ||
    user.role === "executive" ||
    user.freeTrialActivated
  ) {
    return true;
  }

  if (propertyCategory === "New") {
    return ndStationNames.length > 0;
  } else {
    return rrStationNames.length > 0;
  }
};