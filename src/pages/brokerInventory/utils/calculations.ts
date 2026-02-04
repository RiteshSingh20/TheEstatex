// Area conversion utilities
export const calculateBuiltUpArea = (carpetArea: number): number => {
  return Math.round(carpetArea * 1.2);
};

export const calculateCarpetArea = (builtUpArea: number): number => {
  return Math.round(builtUpArea / 1.2);
};

// Price calculation utilities
export const calculatePricePerUnit = (totalPrice: number, area: number): string => {
  if (area === 0) return '0';
  return (totalPrice / area).toFixed(2);
};

// Area unit conversions
export const convertAreaUnits = (value: number, fromUnit: string, toUnit: string): number => {
  const sqFtToSqM = 0.092903;
  const sqFtToAcre = 0.0000229568;
  const sqFtToGuntha = 0.000918;
  
  // Convert to sq.ft first
  let sqFt = value;
  switch (fromUnit) {
    case 'sq.m':
      sqFt = value / sqFtToSqM;
      break;
    case 'acre':
      sqFt = value / sqFtToAcre;
      break;
    case 'guntha':
      sqFt = value / sqFtToGuntha;
      break;
  }
  
  // Convert from sq.ft to target unit
  switch (toUnit) {
    case 'sq.m':
      return sqFt * sqFtToSqM;
    case 'acre':
      return sqFt * sqFtToAcre;
    case 'guntha':
      return sqFt * sqFtToGuntha;
    default:
      return sqFt;
  }
};