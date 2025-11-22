// Fixed Component Checkbox Logic - Extracted from HTML

export interface FixedComponentState {
  hasFixedComponent: boolean;
  includesFixedComponent: boolean;
}

/**
 * Toggle visibility of Fixed Component checkbox based on input values
 * Shows checkbox only when Fixed Component field has a value > 0
 */
export function toggleFixedComponentCheckbox(
  fixedComponentInputs: HTMLInputElement[],
  checkboxLabel: HTMLElement | null
): boolean {
  let hasValue = false;
  
  fixedComponentInputs.forEach(input => {
    const cleanValue = input.value.replace(/[^\\d.]/g, '').trim();
    if (cleanValue && cleanValue !== '' && parseFloat(cleanValue) > 0) {
      hasValue = true;
    }
  });
  
  if (checkboxLabel) {
    checkboxLabel.style.display = hasValue ? 'flex' : 'none';
  }
  
  return hasValue;
}

/**
 * Calculate base amount with Fixed Component logic
 * If checkbox is checked: baseAmount = (area * rate) - fixedComponent
 * If checkbox is unchecked: baseAmount = area * rate
 */
export function calculateBaseAmountWithFixedComponent(
  saleableArea: number,
  agreementValueRate: number,
  fixedComponent: number,
  includesFixedComponent: boolean
): number {
  let baseAmount: number;
  
  if (includesFixedComponent) {
    // When checkbox is checked, subtract fixed component from total
    baseAmount = (saleableArea * agreementValueRate) - fixedComponent;
  } else {
    // When checkbox is unchecked, use standard calculation
    baseAmount = saleableArea * agreementValueRate;
  }
  
  return baseAmount;
}

/**
 * Recalculate section totals when Fixed Component checkbox changes
 */
export function recalculateSectionTotals(
  section: HTMLElement,
  calculateTotalFunction: (input: HTMLInputElement) => void
): void {
  const sectionAvRateInputs = section.querySelectorAll('input[name="avRate[]"]') as NodeListOf<HTMLInputElement>;
  
  sectionAvRateInputs.forEach(input => {
    if (input.value) {
      calculateTotalFunction(input);
    }
  });
}

/**
 * Setup Fixed Component checkbox for a section
 */
export function setupFixedComponentCheckbox(
  sectionIndex: number,
  onCheckboxChange: (checkbox: HTMLInputElement) => void
): string {
  return `
    <label id="fixedComponentCheckboxLabel_${sectionIndex}" style="display: none; align-items: center; gap: 0.5rem; font-size: 0.85rem; cursor: pointer;">
      <input 
        type="checkbox" 
        id="includesFixedComponent_${sectionIndex}" 
        name="includesFixedComponent" 
        style="margin: 0;"
      >
      <span>Per Sq. Ft. Rate includes <strong>'Fixed Component'</strong></span>
    </label>
  `;
}

/**
 * Get Fixed Component state for a section
 */
export function getFixedComponentState(section: HTMLElement): FixedComponentState {
  const fixedComponentInputs = section.querySelectorAll('input[name="fixedComponents[]"]') as NodeListOf<HTMLInputElement>;
  const checkbox = section.querySelector('input[name="includesFixedComponent"]') as HTMLInputElement;
  
  let hasFixedComponent = false;
  fixedComponentInputs.forEach(input => {
    const cleanValue = input.value.replace(/[^\\d.]/g, '').trim();
    if (cleanValue && cleanValue !== '' && parseFloat(cleanValue) > 0) {
      hasFixedComponent = true;
    }
  });
  
  return {
    hasFixedComponent,
    includesFixedComponent: checkbox ? checkbox.checked : false
  };
}