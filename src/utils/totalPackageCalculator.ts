// Universal totalPackage calculator with consistent formatting
export const calculateUniversalTotalPackage = (
  config: any,
  tabData: any,
  formData: any,
  parseIndianCurrency: (value: string) => string,
  formatIndianCurrency: (value: string | number) => string
): number => {
  const saleableArea = parseFloat(config.saleableArea) || 0;
  const psfRate = parseFloat(parseIndianCurrency(config.psfRate || "")) || 0;
  const avRate = parseFloat(parseIndianCurrency(config.avRate || "")) || 0;
  const fixedComponent = parseFloat(parseIndianCurrency(config.fixedComponent || "")) || 0;
  const possessionCharges = parseFloat(parseIndianCurrency(config.possessionCharges || "")) || 0;
  const legalCharges = parseFloat(parseIndianCurrency(formData?.registration || "")) || 0;
  const parkingCharges = parseFloat(parseIndianCurrency(tabData?.parkingCharges || config.parkingCharges || "")) || 0;
  const typology = config.typology || "";
  const mandatoryTypologies = tabData?.mandatoryParkingTypologies || [];
  const isMandatoryParking = mandatoryTypologies.includes(typology);

  if (saleableArea && avRate) {
    const includesFixedComponent = tabData?.psfIncludesFixedComponent || false;
    const projectStatus = tabData?.projectStatus || "";
    
    let baseAmount;
    if (includesFixedComponent) {
      baseAmount = (saleableArea * avRate) - fixedComponent;
    } else {
      baseAmount = saleableArea * avRate;
    }
    
    // Add parking charges to baseAmount if mandatory and rates are same
    if (isMandatoryParking && psfRate === avRate) {
      baseAmount += parkingCharges;
    }
    
    // Use SD Rate from config or tabData if available, otherwise default to 7%
    const stampDutyRate = (parseFloat(config?.sdRate || tabData?.sdRate) || 7) / 100;
    const stampDuty = Math.ceil((baseAmount * stampDutyRate) / 100) * 100;
    
    let gst = 0;
    if (projectStatus !== 'OC Received') {
      const gstRate = baseAmount > 4500000 ? 0.05 : 0.01;
      gst = Math.ceil(baseAmount * gstRate);
    }
    
    const isJodi = typology.toLowerCase().includes('jodi');
    let registrationFee = 0;
    if (baseAmount > 0) {
      if (isJodi) {
        if (baseAmount <= 6000000) {
          registrationFee = Math.max(100, baseAmount * 0.01);
        } else {
          registrationFee = 60000;
        }
      } else {
        if (baseAmount < 3000000) {
          registrationFee = Math.max(100, baseAmount * 0.01);
        } else {
          registrationFee = 30000;
        }
      }
    }
    
    const perSqFtDifference = saleableArea * (psfRate - avRate);
    
    // Add parking charges directly to total if mandatory but rates are different
    let additionalParkingCharges = 0;
    if (isMandatoryParking && psfRate !== avRate) {
      additionalParkingCharges = parkingCharges;
    }
    
    const total = baseAmount + gst + stampDuty + registrationFee + possessionCharges + fixedComponent + perSqFtDifference + legalCharges + additionalParkingCharges;
    
    return Math.round(total);
  }
  return 0;
};

// Universal function to fix totalPackage in any data structure
export const fixTotalPackageInData = (
  data: any,
  formData: any,
  parseIndianCurrency: (value: string) => string,
  formatIndianCurrency: (value: string | number) => string
): any => {
  if (!data) return data;

  // Handle arrays (like typologies)
  if (Array.isArray(data)) {
    return data.map(item => fixTotalPackageInData(item, formData, parseIndianCurrency, formatIndianCurrency));
  }

  // Handle objects
  if (typeof data === 'object') {
    const fixedData = { ...data };

    // Special handling for form data with both subTabData and typologies
    if (fixedData.subTabData && fixedData.typologies) {
      // Calculate consistent totalPackage for both using the same logic
      const masterCalculation = new Map();
      
      // First pass: Calculate all totalPackages using subTabData context
      Object.keys(fixedData.subTabData).forEach(tabId => {
        const tabData = fixedData.subTabData[tabId];
        if (tabData?.pricingConfigs) {
          tabData.pricingConfigs = tabData.pricingConfigs.map((config: any) => {
            const key = `${config.typology}-${config.saleableArea}-${config.avRate}`;
            const calculatedTotal = calculateUniversalTotalPackage(
              config,
              tabData,
              formData,
              parseIndianCurrency,
              formatIndianCurrency
            );
            masterCalculation.set(key, calculatedTotal);
            return { ...config, totalPackage: calculatedTotal };
          });
        }
      });
      
      // Second pass: Apply same calculations to typologies
      fixedData.typologies = fixedData.typologies.map((typology: any) => {
        const key = `${typology.typology}-${typology.saleableArea}-${typology.avRate}`;
        const calculatedTotal = masterCalculation.get(key) || calculateUniversalTotalPackage(
          typology,
          typology,
          formData,
          parseIndianCurrency,
          formatIndianCurrency
        );
        return { ...typology, totalPackage: calculatedTotal };
      });
    }
    // Handle standalone subTabData (new property forms)
    else if (fixedData.subTabData) {
      Object.keys(fixedData.subTabData).forEach(tabId => {
        const tabData = fixedData.subTabData[tabId];
        if (tabData?.pricingConfigs) {
          tabData.pricingConfigs = tabData.pricingConfigs.map((config: any) => {
            const calculatedTotal = calculateUniversalTotalPackage(
              config,
              tabData,
              formData,
              parseIndianCurrency,
              formatIndianCurrency
            );
            return { ...config, totalPackage: calculatedTotal };
          });
        }
      });
    }
    // Handle standalone typologies array
    else if (Array.isArray(fixedData.typologies)) {
      fixedData.typologies = fixedData.typologies.map((typology: any) => {
        const calculatedTotal = calculateUniversalTotalPackage(
          typology,
          typology,
          formData,
          parseIndianCurrency,
          formatIndianCurrency
        );
        return { ...typology, totalPackage: calculatedTotal };
      });
    }
    // If this is a standalone pricing config with unformatted totalPackage, fix it
    else if (fixedData.saleableArea && fixedData.avRate && fixedData.typology && 
             fixedData.totalPackage && !fixedData.totalPackage.includes('₹')) {
      fixedData.totalPackage = calculateUniversalTotalPackage(
        fixedData,
        fixedData,
        formData,
        parseIndianCurrency,
        formatIndianCurrency
      );
    }

    // Recursively fix nested objects
    Object.keys(fixedData).forEach(key => {
      if (typeof fixedData[key] === 'object') {
        fixedData[key] = fixTotalPackageInData(fixedData[key], formData, parseIndianCurrency, formatIndianCurrency);
      }
    });

    return fixedData;
  }

  return data;
};

// Override JSON.stringify to fix totalPackage before serialization
export const interceptFormSubmission = () => {
  const originalStringify = JSON.stringify;
  
  (window as any).JSON.stringify = function(value: any, replacer?: any, space?: any) {
    if (value?.subTabData && value?.typologies) {
      // Copy totalPackage from subTabData to typologies
      value.typologies = value.typologies.map((typology: any) => {
        const matchingTab = Object.values(value.subTabData).find((tab: any) => 
          tab?.pricingConfigs?.find((config: any) => 
            config.typology === typology.typology &&
            config.saleableArea === typology.saleableArea
          )
        );
        
        if (matchingTab) {
          const config = (matchingTab as any).pricingConfigs.find((config: any) => 
            config.typology === typology.typology &&
            config.saleableArea === typology.saleableArea
          );
          if (config?.totalPackage) {
            return { ...typology, totalPackage: config.totalPackage };
          }
        }
        return typology;
      });
    }
    
    return originalStringify.call(this, value, replacer, space);
  };
};