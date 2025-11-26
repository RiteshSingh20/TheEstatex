// Test file to verify stamp duty matching
import { StampDutyRate } from '../pages/Compare';
import { getStampDutyRate, findStampDutyRate } from './stampDutyUtils';

// Test data
const testRates: StampDutyRate[] = [
  { id: '1', jurisdiction: 'Thane', rate: 7 },
  { id: '2', jurisdiction: 'Mumbai', rate: 6 },
  { id: '3', jurisdiction: 'Palghar', rate: 7 }
];

// Test function
export const testStampDutyMatching = () => {
  const rate1 = getStampDutyRate(testRates, 'Thane');
  const rate2 = getStampDutyRate(testRates, 'thane');
  const rate3 = getStampDutyRate(testRates, ' Thane ');
  const rate4 = getStampDutyRate(testRates, 'NonExistent');
  const { rate } = findStampDutyRate(testRates, 'Thane');
  
  return {
    thaneMatch: rate1 === 7,
    caseInsensitive: rate2 === 7,
    withSpaces: rate3 === 7,
    noMatch: rate4 === 7,
    foundRate: !!rate
  };
};

// Test function available in console
if (typeof window !== 'undefined') {
  (window as any).testStampDuty = testStampDutyMatching;
}