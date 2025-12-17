import { safeNumber } from "../../../../utils/number";

export function getCurrentTypology(sheet: any) {
  return sheet.flatType || sheet.typologies?.[0]?.typology || sheet.flatType;
}

export function getTypologyCarpetAreas(sheet: any, typology: string): number[] {
  const areas: number[] = [];

  if (sheet.typologies) {
    sheet.typologies.forEach((t: any) => {
      if (t.typology === typology && t.reraCarpet) {
        areas.push(safeNumber(t.reraCarpet));
      }
    });
  }

  if (sheet.pricingConfigs) {
    sheet.pricingConfigs.forEach((p: any) => {
      if (p.typology === typology && p.reraCarpet) {
        areas.push(safeNumber(p.reraCarpet));
      }
    });
  }

  if (sheet.flatType === typology && sheet.reraCarpet) {
    areas.push(safeNumber(sheet.reraCarpet));
  }

  return Array.from(new Set(areas.filter((n) => !isNaN(n) && n > 0))).sort(
    (a, b) => a - b
  );
}
