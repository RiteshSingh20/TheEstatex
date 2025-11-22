// Shared logic for property form: formatting, parsing and calculations
// EXACT SAME LOGIC AS backend-ui-form-new.htm
export function formatIndianCurrency(value: string | number) {
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "string" ? parseFloat(String(value).replace(/[^0-9.]/g, "")) : value;
  if (isNaN(num)) return "";
  return `₹${num.toLocaleString("en-IN")}`;
}

export function parseIndianCurrency(value: string) {
  if (!value) return "";
  return String(value).replace(/[^0-9.]/g, "");
}

/**
 * Calculate total package for a pricing row - EXACT SAME LOGIC AS HTML FILE.
 * This matches the calculateTotal function from backend-ui-form-new.htm
 */
export function calculatePricingTotal(options: {
  saleableArea?: number;
  reraCarpet?: number;
  psfRate?: number;
  avRate?: number;
  fixedComponent?: number;
  possessionCharges?: number;
  legalCharges?: number;
  includesFixedComponent?: boolean;
  stampDutyRate?: number;
  projectStatus?: string;
  typology?: string;
}): number {
  const saleableArea = options.saleableArea || 0;
  const psfRate = options.psfRate || 0;
  const avRate = options.avRate || 0;
  const fixedComponent = options.fixedComponent || 0;
  const possessionCharges = options.possessionCharges || 0;
  const legalCharges = options.legalCharges || 0;
  const includesFixedComponent = options.includesFixedComponent || false;
  const projectStatus = options.projectStatus || '';
  const typology = options.typology || '';
  
  // 1. Base Amount calculation - EXACT SAME AS HTML
  let baseAmount;
  if (includesFixedComponent) {
    baseAmount = (saleableArea * avRate) - fixedComponent;
  } else {
    baseAmount = saleableArea * avRate;
  }
  
  // 2. Stamp Duty (7% of base amount) - EXACT SAME AS HTML
  const stampDuty = baseAmount * 0.07;
  
  // 3. GST calculation based on project status - EXACT SAME AS HTML
  let gst = 0;
  if (projectStatus !== 'OC Received') {
    const gstRate = baseAmount > 4500000 ? 0.05 : 0.01;
    gst = baseAmount * gstRate;
  }
  
  // 4. Registration Fee calculation - EXACT SAME AS HTML
  const isJodi = typology.toLowerCase().includes('jodi');
  let registrationFee = 0;
  if (baseAmount > 0) {
    if (baseAmount < 3000000) {
      registrationFee = Math.max(100, baseAmount * 0.01);
      if (isJodi) registrationFee *= 2;
    } else {
      registrationFee = isJodi ? 60000 : 30000;
    }
  }
  
  // 8. Per Sq Ft Difference - EXACT SAME AS HTML
  const perSqFtDifference = saleableArea * (psfRate - avRate);
  
  // Final Total Calculation - EXACT SAME AS HTML
  const total = baseAmount + gst + stampDuty + registrationFee + possessionCharges + fixedComponent + perSqFtDifference + legalCharges;
  
  return isFinite(total) ? total : 0;
}

/**
 * Generate project status text based on project types and statuses - EXACT SAME LOGIC AS HTML
 */
export function generateProjectStatusText(projectTypes: string[], projectStatuses: string[]): string {
  let projectStatusText = 'RERA Registered';
  if (projectStatuses.length > 0) {
    const uniqueStatuses = [...new Set(projectStatuses)];
    projectStatusText = uniqueStatuses.join(' | ');
  } else if (projectTypes.length > 0) {
    const uniqueTypes = [...new Set(projectTypes)];
    const hasNew = uniqueTypes.includes('New');
    
    if (hasNew) {
      projectStatusText = 'RERA Registered';
    } else {
      projectStatusText = uniqueTypes.join(' | ');
    }
  }
  return projectStatusText;
}

/**
 * Collect and format typology prices with availability tracking - EXACT SAME LOGIC AS HTML
 */
export function collectTypologyPrices(subTabData: Record<string, any>): {
  typologyPrices: Record<string, number[]>;
  allPrices: number[];
} {
  const typologyPrices: Record<string, number[]> = {};
  
  Object.values(subTabData || {}).forEach((tab: any) => {
    (tab.pricingConfigs || []).forEach((config: any) => {
      if (config.typology && config.totalPackage && (!config.availability || config.availability === 'Available')) {
        const price = parseFloat(String(config.totalPackage).replace(/[^\d.]/g, ''));
        if (price) {
          if (!typologyPrices[config.typology]) {
            typologyPrices[config.typology] = [];
          }
          typologyPrices[config.typology].push(price);
        }
      }
    });
  });
  
  const allPrices: number[] = [];
  Object.values(typologyPrices).forEach(prices => {
    allPrices.push(...prices);
  });
  
  return { typologyPrices, allPrices };
}

/**
 * Format price range text - EXACT SAME LOGIC AS HTML
 */
export function formatPriceRange(allPrices: number[], availableTypologies: string[]): string {
  if (allPrices.length === 0) return '';
  
  const overallMinPrice = Math.min(...allPrices);
  const overallMaxPrice = Math.max(...allPrices);
  
  // Check if single available typology with single price
  if (availableTypologies.length === 1 && allPrices.length === 1) {
    if (overallMinPrice < 10000000) {
      return `\nPrice : *₹${(overallMinPrice/100000).toFixed(2)} L* All Inclusive.`;
    } else {
      return `\nPrice : *₹${(overallMinPrice/10000000).toFixed(2)} Cr* All Inclusive.`;
    }
  } else {
    // Multiple prices or typologies - show range
    if (overallMaxPrice < 10000000) {
      return `\nPrice range : *₹${(overallMinPrice/100000).toFixed(2)} L* to *₹${(overallMaxPrice/100000).toFixed(2)} L* All Inclusive.`;
    } else if (overallMinPrice < 10000000) {
      return `\nPrice range : *₹${(overallMinPrice/100000).toFixed(2)} L* to *₹${(overallMaxPrice/10000000).toFixed(2)} Cr* All Inclusive.`;
    } else {
      return `\nPrice range : *₹${(overallMinPrice/10000000).toFixed(2)} Cr* to *₹${(overallMaxPrice/10000000).toFixed(2)} Cr* All Inclusive.`;
    }
  }
}

/**
 * Generate a marketing message string from form data and typology/sub-tab data.
 * EXACT SAME LOGIC AS HTML FILE - Enhanced with proper price handling and availability tracking
 */
export function generateMarketingMessage(params: {
  formData: Record<string, any>;
  subTabData: Record<string, any>;
  paymentSchemes?: Array<{ schemeName: string; description: string }>;
  highlights?: string[];
  projectAmenities?: string[];
  apartmentAmenities?: string[];
}): string {
  try {
    const { formData, subTabData, paymentSchemes = [], highlights = [], projectAmenities = [], apartmentAmenities = [] } = params;

    const basicInfo = {
      projectName: formData.projectName || "[Project Name]",
      developerName: formData.developerName || "[Developer Name]",
      location: formData.location || "[Location]",
      subLocation: formData.subLocation || "[Sub Location]",
      landmark: formData.landmark || "[Landmark]",
      landParcel: formData.landParcel || "[Land Parcel]",
      numTowers: formData.numTowers || "[Number of Towers]",
      storey: formData.storey || "[Storey]",
    };

    // Collect typology data with availability tracking - EXACT SAME AS HTML
    const typologyData: Record<string, { areas: string[]; available: string[] }> = {};
    Object.values(subTabData || {}).forEach((tab: any) => {
      (tab.pricingConfigs || []).forEach((cfg: any) => {
        if (!cfg || !cfg.typology) return;
        if (!typologyData[cfg.typology]) typologyData[cfg.typology] = { areas: [], available: [] };
        typologyData[cfg.typology].areas.push(String(cfg.reraCarpet || cfg.saleableArea || "").trim());
        typologyData[cfg.typology].available.push(cfg.availability || "Available");
      });
    });

    const uniqueTypologies = Object.keys(typologyData);

    // Collect project types and statuses - EXACT SAME AS HTML
    const projectTypes: string[] = [];
    const projectStatuses: string[] = [];
    Object.values(subTabData || {}).forEach((tab: any) => {
      if (tab.type) projectTypes.push(tab.type);
      if (tab.projectStatus) projectStatuses.push(tab.projectStatus);
    });

    // Generate project status text - EXACT SAME AS HTML
    const projectStatusText = generateProjectStatusText(projectTypes, projectStatuses);

    // Collect typology prices with availability tracking - EXACT SAME AS HTML
    const { typologyPrices, allPrices } = collectTypologyPrices(subTabData);
    const availableTypologies = Object.keys(typologyPrices).filter(typology => {
      return typologyPrices[typology].length > 0;
    });

    // Generate configuration areas text with availability tracking - EXACT SAME AS HTML
    let configText = '';
    uniqueTypologies.forEach(typology => {
      const data = typologyData[typology];
      const availableAreas: string[] = [];
      
      data.areas.forEach((area, index) => {
        if (data.available[index] === 'Available') {
          availableAreas.push(area);
        }
      });
      
      if (availableAreas.length > 0) {
        configText += `- *${typology}* - ${availableAreas.join(' | ')}\n`;
      } else {
        configText += `- *${typology}* - *Sold Out*\n`;
      }
    });

    // Generate structured marketing message - EXACT SAME AS HTML
    const towerText = parseInt(String(basicInfo.numTowers)) === 1 ? 'Tower' : 'Towers';
    let message = `The residential property *${basicInfo.projectName}* is ${projectStatusText} project, developing by *${basicInfo.developerName}*, Located at ${basicInfo.subLocation} in ${basicInfo.location}, ${basicInfo.landmark}. The total land parcel of the project is *${basicInfo.landParcel} Acres*.

"The project contains ${basicInfo.numTowers} ${towerText} of ${basicInfo.storey} Storey building, having *${uniqueTypologies.join(' | ')}* Apartments,

*🏠 Configuration Type: [Rera Carpet Areas]:*
${configText}`;

    // Add price information - EXACT SAME LOGIC AS HTML
    const priceText = formatPriceRange(allPrices, availableTypologies);
    if (priceText) {
      message += priceText;
    }

    message += ``;

    // Add conditional content sections - EXACT SAME AS HTML
    if (paymentSchemes.length > 0) {
      const schemeHeader = paymentSchemes.length === 1 ? '*💸 Payment Scheme:*' : '*💸 Payment Schemes:*';
      const schemeList = paymentSchemes.map(scheme => `- ${scheme.schemeName} - ${scheme.description}`).join('\n');
      message += `\n\n${schemeHeader}\n${schemeList}`;
    }
    
    if (highlights.length > 0) {
      message += `\n\n*✨ Highlights:*\n${highlights.map(h => `- ${h}`).join('\n')}`;
    }
    
    if (projectAmenities.length > 0) {
      message += `\n\n*🎉 Project Amenities:*\n${projectAmenities.map(a => `- ${a}`).join('\n')}`;
    }
    
    if (apartmentAmenities.length > 0) {
      message += `\n\n*🏠 Apartment Amenities:*\n${apartmentAmenities.map(a => `- ${a}`).join('\n')}`;
    }

    return message;
  } catch (err) {
    return '';
  }
}
