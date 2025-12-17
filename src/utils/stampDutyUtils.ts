import { StampDutyRate } from "../components/CompareComponents/Compare";

/**
 * Enhanced stamp duty rate lookup with debugging
 */
export const findStampDutyRate = (
  stampRates: StampDutyRate[],
  district?: string,
  station?: string,
  debug = false
): { rate: StampDutyRate | null; debugInfo: string[] } => {
  const debugInfo: string[] = [];

  if (!stampRates || stampRates.length === 0) {
    debugInfo.push("❌ No stamp duty rates available");
    return { rate: null, debugInfo };
  }

  if (!district && !station) {
    debugInfo.push("❌ No district or station provided");
    return { rate: null, debugInfo };
  }

  const searchTerm = (district || station || "").trim().toLowerCase();
  debugInfo.push(`🔍 Searching for: "${searchTerm}"`);

  // Try multiple matching strategies
  let matchedRate = null;

  // Strategy 1: Exact jurisdiction match
  matchedRate = stampRates.find((rate) => {
    const jurisdiction = String(rate.jurisdiction || "")
      .trim()
      .toLowerCase();
    const match = jurisdiction === searchTerm;
    if (debug) {
      debugInfo.push(
        `Check "${rate.jurisdiction}" → "${jurisdiction}" === "${searchTerm}" = ${match}`
      );
    }
    return match;
  });

  if (matchedRate) {
    debugInfo.push(
      `✅ FOUND: ${matchedRate.jurisdiction} (${matchedRate.rate}%)`
    );
    return { rate: matchedRate, debugInfo };
  }

  // Strategy 2: Contains match (fallback)
  matchedRate = stampRates.find((rate) => {
    const jurisdiction = String(rate.jurisdiction || "")
      .trim()
      .toLowerCase();
    return (
      jurisdiction.includes(searchTerm) || searchTerm.includes(jurisdiction)
    );
  });

  if (matchedRate) {
    debugInfo.push(
      `✅ PARTIAL MATCH: ${matchedRate.jurisdiction} (${matchedRate.rate}%)`
    );
    return { rate: matchedRate, debugInfo };
  }

  debugInfo.push(`❌ NO MATCH for "${searchTerm}"`);
  debugInfo.push("Available jurisdictions:");
  stampRates.forEach((rate) => {
    debugInfo.push(`  - "${rate.jurisdiction}" (${rate.rate}%)`);
  });

  return { rate: null, debugInfo };
};

/**
 * Get stamp duty rate with fallback to default
 */
export const getStampDutyRate = (
  stampRates: StampDutyRate[],
  district?: string,
  station?: string,
  defaultRate = 7
): number => {
  const { rate } = findStampDutyRate(stampRates, district, station);
  return rate ? rate.rate : defaultRate;
};

/**
 * Log stamp duty lookup debug information
 */
export const debugStampDutyLookup = (
  stampRates: StampDutyRate[],
  district?: string,
  station?: string
): void => {
  const { debugInfo } = findStampDutyRate(stampRates, district, station, true);
  console.group("🏛️ Stamp Duty Rate Lookup Debug");
  debugInfo.forEach((info) => console.log(info));
  console.groupEnd();
};
