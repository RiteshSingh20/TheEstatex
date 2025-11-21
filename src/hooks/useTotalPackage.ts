// src/hooks/useTotalPackage.ts
import { calculateTotalPackage, parseIndianCurrency, formatIndianCurrency } from "../utils/calculations";

export type PricingRowInput = {
  saleableArea: number | string;
  psfRate: number | string; // Per Sq. Ft. Rate (psfBase)
  avRate: number | string;  // Agreement Value Rate (avRate)
  fixedComponent: number | string;
  possessionCharges: number | string;
  typology: string;
};

export type PricingContext = {
  projectStatus: string; // e.g., 'Under Construction' | 'Ready to Move' | 'OC Received' | ''
  psfIncludesFixedComponent: boolean; // section level checkbox
  legalCharges: number | string; // from Charges tab (registrationFees)
};

export type TotalResult = {
  totalNumber: number; // rounded total
  totalFormatted: string; // formatted as INR with no decimals, empty if 0
};

// Safely coerce string/number to number using same rules as the HTML logic
const toNumber = (v: number | string | undefined | null): number => {
  if (v === undefined || v === null) return 0;
  if (typeof v === "number") return isFinite(v) ? v : 0;
  // If string may contain currency prefix/commas
  const clean = parseIndianCurrency(String(v));
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

export const computeTotal = (
  row: PricingRowInput,
  ctx: PricingContext
): TotalResult => {
  const saleableArea = toNumber(row.saleableArea);
  const psfRate = toNumber(row.psfRate);
  const avRate = toNumber(row.avRate);
  const fixedComponent = toNumber(row.fixedComponent);
  const possessionCharges = toNumber(row.possessionCharges);
  const legalCharges = toNumber(ctx.legalCharges);
  const projectStatus = ctx.projectStatus || "";
  const typology = row.typology || "";

  const totalNumber = calculateTotalPackage(
    saleableArea,
    psfRate,
    avRate,
    fixedComponent,
    possessionCharges,
    legalCharges,
    projectStatus,
    typology,
    ctx.psfIncludesFixedComponent
  );

  const totalFormatted = totalNumber > 0 ? formatIndianCurrency(totalNumber) : "";

  return { totalNumber, totalFormatted };
};

// Convenience helper for bulk recompute across rows
export const computeTotalsForRows = (
  rows: PricingRowInput[],
  ctx: PricingContext
): TotalResult[] => rows.map((r) => computeTotal(r, ctx));
