// src/utils/calculations.ts
export const formatIndianCurrency = (value: string | number): string => {
  if (!value) return '';
  
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.]/g, '')) || 0 : value;
  
  if (numValue === 0) return '';
  
  // Format as Indian currency with proper rupee symbol
  return `₹${numValue.toLocaleString('en-IN')}`;
};

export const parseIndianCurrency = (value: string): string => {
  if (!value) return '';
  
  // Remove all non-digit characters except decimal point
  const numericValue = value.replace(/[^\d.]/g, '');
  
  // Remove multiple decimal points
  const cleanValue = numericValue.replace(/(\..*)\./g, '$1');
  
  return cleanValue;
};

// Enhanced total package calculation (mirrors backend-ui-form-new.htm calculateTotal)
export const calculateTotalPackage = (
  saleableArea: number,
  psfRate: number,
  avRate: number,
  fixedComponent: number,
  possessionCharges: number,
  legalCharges: number,
  projectStatus: string,
  typology: string,
  psfIncludesFixedComponent: boolean
): number => {
  // Guard
  if (!saleableArea || !avRate) return 0;

  // Typology-specific rules
  const isJodi = (typology || '').toLowerCase().includes('jodi');

  // 1) Base Amount
  // If PSF includes fixed component, subtract it once from base
  const baseAmount = psfIncludesFixedComponent
    ? saleableArea * avRate - (fixedComponent || 0)
    : saleableArea * avRate;

  // 2) Stamp Duty: 7% of base
  const stampDuty = baseAmount * 0.07;

  // 3) GST: only if not OC Received
  let gst = 0;
  if (projectStatus !== 'OC Received') {
    const gstRate = baseAmount > 4500000 ? 0.05 : 0.01;
    gst = baseAmount * gstRate;
  }

  // 4) Registration Fee
  let registrationFee = 0;
  if (baseAmount > 0) {
    if (baseAmount < 3000000) {
      registrationFee = Math.max(100, baseAmount * 0.01);
      if (isJodi) registrationFee *= 2; // double for jodi units below 30L
    } else {
      registrationFee = isJodi ? 60000 : 30000; // flat above/equal 30L
    }
  }

  // 5) Per Sq Ft Difference
  const perSqFtDifference = saleableArea * ((psfRate || 0) - (avRate || 0));

  // 6) Final Total
  const total =
    baseAmount +
    gst +
    stampDuty +
    registrationFee +
    (possessionCharges || 0) +
    (fixedComponent || 0) +
    perSqFtDifference +
    (legalCharges || 0);

  return Math.round(total);
};