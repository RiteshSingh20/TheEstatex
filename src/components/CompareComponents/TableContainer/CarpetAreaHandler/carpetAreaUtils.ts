import { safeNumber } from "../../../../utils/number";

export function getCurrentTypology(sheet: any) {
  return sheet.flatType || sheet.typologies?.[0]?.typology || sheet.flatType;
}

export function getTypologyCarpetAreas(sheet: any, typology: string, filtersApplied: boolean = true): number[] {
  const areas: number[] = [];

  // If no typology specified, get all available carpet areas across all typologies
  const shouldFilterByTypology = filtersApplied && typology;

  // Check subTabData first (most comprehensive data)
  if (sheet.subTabData) {
    Object.values(sheet.subTabData).forEach((tabData: any) => {
      if (tabData.pricingConfigs) {
        tabData.pricingConfigs.forEach((p: any) => {
          if ((!shouldFilterByTypology || p.typology === typology) && p.reraCarpet && p.availability === "Available") {
            areas.push(safeNumber(p.reraCarpet));
          }
        });
      }
    });
  }

  // Check typologies array
  if (sheet.typologies) {
    sheet.typologies.forEach((t: any) => {
      if ((!shouldFilterByTypology || t.typology === typology) && t.reraCarpet && t.availability === "Available") {
        areas.push(safeNumber(t.reraCarpet));
      }
    });
  }

  // Fallback to pricingConfigs
  if (sheet.pricingConfigs) {
    sheet.pricingConfigs.forEach((p: any) => {
      if ((!shouldFilterByTypology || p.typology === typology) && p.reraCarpet && p.availability === "Available") {
        areas.push(safeNumber(p.reraCarpet));
      }
    });
  }

  return Array.from(new Set(areas.filter((n) => !isNaN(n) && n > 0))).sort(
    (a, b) => a - b
  );
}

export function getLowestTotalPackageCarpetArea(sheet: any, typology: string, filtersApplied: boolean = true): number | null {
  let lowestPackage = Infinity;
  let lowestCarpetArea = null;

  // Check typologies
  if (sheet.typologies) {
    sheet.typologies.forEach((t: any) => {
      if ((!filtersApplied || t.typology === typology) && t.reraCarpet && t.totalPackage) {
        const totalPackage = safeNumber(t.totalPackage);
        if (totalPackage && totalPackage < lowestPackage) {
          lowestPackage = totalPackage;
          lowestCarpetArea = safeNumber(t.reraCarpet);
        }
      }
    });
  }

  // Check pricingConfigs
  if (sheet.pricingConfigs) {
    sheet.pricingConfigs.forEach((p: any) => {
      if ((!filtersApplied || p.typology === typology) && p.reraCarpet && p.totalPackage) {
        const totalPackage = safeNumber(p.totalPackage);
        if (totalPackage && totalPackage < lowestPackage) {
          lowestPackage = totalPackage;
          lowestCarpetArea = safeNumber(p.reraCarpet);
        }
      }
    });
  }

  // Check subTabData
  if (sheet.subTabData) {
    Object.values(sheet.subTabData).forEach((tabData: any) => {
      if (tabData.pricingConfigs) {
        tabData.pricingConfigs.forEach((p: any) => {
          if ((!filtersApplied || p.typology === typology) && p.reraCarpet && p.totalPackage) {
            const totalPackage = safeNumber(p.totalPackage);
            if (totalPackage && totalPackage < lowestPackage) {
              lowestPackage = totalPackage;
              lowestCarpetArea = safeNumber(p.reraCarpet);
            }
          }
        });
      }
    });
  }

  // If no totalPackage found, return the first available carpet area
  if (!lowestCarpetArea) {
    const availableAreas = getTypologyCarpetAreas(sheet, typology, filtersApplied);
    return availableAreas.length > 0 ? availableAreas[0] : null;
  }

  return lowestCarpetArea;
}
