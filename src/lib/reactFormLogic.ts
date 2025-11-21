// React-specific wrapper for HTML form logic
import { calculatePricingTotal, formatIndianCurrency, parseIndianCurrency } from './propertyFormLogic';

// Calculate total package for React components - EXACT SAME LOGIC AS HTML
export function calculateTotalPackageReact(
  config: {
    typology: string;
    saleableArea: string;
    reraCarpet: string;
    psfRate: string;
    avRate: string;
    fixedComponent: string;
    possessionCharges: string;
    totalPackage: string;
    negotiationScope: string;
    availability: string;
    unitPlan: any;
  },
  subTabData: any,
  formData: any,
  tabId: number
): string {
  const saleableArea = parseFloat(config.saleableArea) || 0;
  const psfRate = parseFloat(parseIndianCurrency(config.psfRate || "")) || 0;
  const avRate = parseFloat(parseIndianCurrency(config.avRate || "")) || 0;
  const fixedComponent = parseFloat(parseIndianCurrency(config.fixedComponent || "")) || 0;
  const possessionCharges = parseFloat(parseIndianCurrency(config.possessionCharges || "")) || 0;
  const legalCharges = parseFloat(parseIndianCurrency(formData.registration || "")) || 0;
  
  const currentSubTabData = subTabData[tabId];
  if (!currentSubTabData) return "";
  
  const includesFixedComponent = currentSubTabData.psfIncludesFixedComponent || false;
  const projectStatus = currentSubTabData.projectStatus || "";
  const typology = config.typology || "";
  
  // Use EXACT SAME calculation logic as HTML
  const total = calculatePricingTotal({
    saleableArea,
    psfRate,
    avRate,
    fixedComponent,
    possessionCharges,
    legalCharges,
    includesFixedComponent,
    projectStatus,
    typology
  });
  
  return total > 0 ? formatIndianCurrency(Math.round(total)) : "";
}

// Recalculate pricing configs for React components - EXACT SAME LOGIC AS HTML
export function recalculatePricingConfigs(
  pricingConfigs: any[],
  subTabData: any,
  formData: any,
  tabId: number
): any[] {
  return pricingConfigs.map(config => ({
    ...config,
    totalPackage: calculateTotalPackageReact(config, subTabData, formData, tabId)
  }));
}