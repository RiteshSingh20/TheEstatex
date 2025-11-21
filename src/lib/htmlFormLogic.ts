// EXACT SAME LOGIC AS HTML FILE - All functions from backend-ui-form-new.htm
import { calculatePricingTotal, formatIndianCurrency, parseIndianCurrency } from './propertyFormLogic';

// Format currency - EXACT SAME AS HTML
export function formatCurrency(input: HTMLInputElement | string): string {
  const value = typeof input === 'string' ? input : input.value;
  if (!value) return '';
  let cleanValue = value.replace(/[^\d.]/g, '');
  if (cleanValue) {
    const number = parseFloat(cleanValue);
    if (!isNaN(number)) {
      return '₹' + number.toLocaleString('en-IN');
    }
  }
  return '';
}

// Calculate total function - EXACT SAME LOGIC AS HTML calculateTotal function
export function calculateTotal(input: HTMLInputElement): void {
  const row = input.closest('.table-grid');
  if (!row) return;
  
  const cells = row.querySelectorAll('.table-data-cell');
  const colCount = 11;
  const inputCell = input.closest('.table-data-cell');
  const inputIndex = Array.from(cells).indexOf(inputCell as Element);
  const rowIndex = Math.floor(inputIndex / colCount);
  const startIndex = rowIndex * colCount;
  
  const saleableArea = parseFloat((cells[startIndex + 1].querySelector('input') as HTMLInputElement)?.value?.replace(/[^\d.]/g, '') || '0');
  const psfRate = parseFloat((cells[startIndex + 3].querySelector('input') as HTMLInputElement)?.value?.replace(/[^\d.]/g, '') || '0');
  const avRate = parseFloat((cells[startIndex + 4].querySelector('input') as HTMLInputElement)?.value?.replace(/[^\d.]/g, '') || '0');
  const fixedComponent = parseFloat((cells[startIndex + 5].querySelector('input') as HTMLInputElement)?.value?.replace(/[^\d.]/g, '') || '0');
  const possessionCharges = parseFloat((cells[startIndex + 6].querySelector('input') as HTMLInputElement)?.value?.replace(/[^\d.]/g, '') || '0');
  
  // Find the section-specific Fixed Component checkbox
  const section = input.closest('.section-group');
  const sectionFixedCheckbox = section?.querySelector('input[name="includesFixedComponent"]') as HTMLInputElement;
  const includesFixedComponent = sectionFixedCheckbox ? sectionFixedCheckbox.checked : false;
  
  // Get project status
  const projectStatusSelect = section?.querySelector('select[name="projectStatus[]"]') as HTMLSelectElement;
  const projectStatus = projectStatusSelect ? projectStatusSelect.value : '';
  
  // Get typology
  const typologySelect = cells[startIndex].querySelector('select[name="typology[]"]') as HTMLSelectElement;
  const typology = typologySelect ? typologySelect.value : '';
  
  // Get legal charges
  const legalChargesInput = document.getElementById('registrationFees') as HTMLInputElement;
  const legalCharges = legalChargesInput && legalChargesInput.value ? 
    parseFloat(legalChargesInput.value.replace(/[^\d.]/g, '')) || 0 : 0;
  
  // Calculate using the same logic as HTML
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
  
  const totalInput = cells[startIndex + 7].querySelector('input') as HTMLInputElement;
  if (totalInput) {
    totalInput.value = '₹' + total.toLocaleString('en-IN');
  }
}

// Toggle fixed component checkbox - EXACT SAME AS HTML
export function toggleFixedComponentCheckbox(inputElement?: HTMLInputElement): void {
  const section = inputElement ? inputElement.closest('.section-group') : null;
  
  if (section) {
    const sectionFixedInputs = section.querySelectorAll('input[name="fixedComponents[]"]');
    const sectionCheckboxLabel = section.querySelector('[id^="fixedComponentCheckboxLabel"]');
    
    let hasValue = false;
    sectionFixedInputs.forEach((input: HTMLInputElement) => {
      const cleanValue = input.value.replace(/[^\d.]/g, '').trim();
      if (cleanValue && cleanValue !== '' && parseFloat(cleanValue) > 0) {
        hasValue = true;
      }
    });
    
    if (sectionCheckboxLabel) {
      (sectionCheckboxLabel as HTMLElement).style.display = hasValue ? 'flex' : 'none';
    }
  } else {
    document.querySelectorAll('.section-group').forEach(section => {
      const sectionFixedInputs = section.querySelectorAll('input[name="fixedComponents[]"]');
      const sectionCheckboxLabel = section.querySelector('[id^="fixedComponentCheckboxLabel"]');
      
      let hasValue = false;
      sectionFixedInputs.forEach((input: HTMLInputElement) => {
        const cleanValue = input.value.replace(/[^\d.]/g, '').trim();
        if (cleanValue && cleanValue !== '' && parseFloat(cleanValue) > 0) {
          hasValue = true;
        }
      });
      
      if (sectionCheckboxLabel) {
        (sectionCheckboxLabel as HTMLElement).style.display = hasValue ? 'flex' : 'none';
      }
    });
  }
}

// Recalculate section totals - EXACT SAME AS HTML
export function recalculateSectionTotals(checkbox: HTMLInputElement): void {
  const section = checkbox.closest('.section-group');
  if (section) {
    const sectionAvRateInputs = section.querySelectorAll('input[name="avRate[]"]');
    sectionAvRateInputs.forEach((input: HTMLInputElement) => {
      if (input.value) {
        calculateTotal(input);
      }
    });
  }
}

// Handle project type change - EXACT SAME AS HTML
export function handleProjectTypeChange(typeSelect: HTMLSelectElement): void {
  const row = typeSelect.closest('.table-grid');
  if (!row) return;
  
  const projectStatusSelect = row.querySelector('select[name="projectStatus[]"]') as HTMLSelectElement;
  const reraPossessionInput = row.querySelector('input[name="reraPossession[]"]') as HTMLInputElement;
  const reraNumberInput = row.querySelector('input[name="reraNumber[]"]') as HTMLInputElement;
  const reraUrlInput = row.querySelector('input[name="reraUrl[]"]') as HTMLInputElement;
  
  if (typeSelect.value === 'Pre-Launch') {
    if (projectStatusSelect) {
      projectStatusSelect.disabled = true;
      projectStatusSelect.style.backgroundColor = '#f8f9fa';
      projectStatusSelect.value = '';
    }
    
    if (reraPossessionInput) {
      reraPossessionInput.disabled = true;
      reraPossessionInput.style.backgroundColor = '#f8f9fa';
      reraPossessionInput.value = '';
    }
    
    if (reraNumberInput) {
      reraNumberInput.disabled = true;
      reraNumberInput.style.backgroundColor = '#f8f9fa';
      reraNumberInput.value = '';
    }
    
    if (reraUrlInput) {
      reraUrlInput.disabled = true;
      reraUrlInput.style.backgroundColor = '#f8f9fa';
      reraUrlInput.value = '';
    }
  } else {
    if (projectStatusSelect) {
      projectStatusSelect.disabled = false;
      projectStatusSelect.style.backgroundColor = '#ffffff';
    }
    
    if (reraPossessionInput) {
      reraPossessionInput.disabled = false;
      reraPossessionInput.style.backgroundColor = '#ffffff';
    }
    
    if (reraNumberInput) {
      reraNumberInput.disabled = false;
      reraNumberInput.style.backgroundColor = '#ffffff';
    }
    
    if (reraUrlInput) {
      reraUrlInput.disabled = false;
      reraUrlInput.style.backgroundColor = '#ffffff';
    }
  }
}

// Handle project status change - EXACT SAME AS HTML
export function handleProjectStatusChange(statusSelect: HTMLSelectElement): void {
  const row = statusSelect.closest('.table-grid');
  if (!row) return;
  
  const devPossessionInput = row.querySelector('input[name="devPossession[]"]') as HTMLInputElement;
  const reraPossessionInput = row.querySelector('input[name="reraPossession[]"]') as HTMLInputElement;
  const status = statusSelect.value;
  
  if (status === 'OC Received' || status === 'Ready to Move') {
    if (devPossessionInput) {
      devPossessionInput.disabled = true;
      devPossessionInput.style.backgroundColor = '#f8f9fa';
      devPossessionInput.removeAttribute('required');
    }
    if (reraPossessionInput) {
      reraPossessionInput.disabled = true;
      reraPossessionInput.style.backgroundColor = '#f8f9fa';
      reraPossessionInput.removeAttribute('required');
    }
  } else {
    if (devPossessionInput) {
      devPossessionInput.disabled = false;
      devPossessionInput.style.backgroundColor = '#ffffff';
    }
    if (reraPossessionInput) {
      reraPossessionInput.disabled = false;
      reraPossessionInput.style.backgroundColor = '#ffffff';
    }
  }
  
  // Recalculate totals for GST changes
  const section = statusSelect.closest('.section-group');
  if (section) {
    const avRateInputs = section.querySelectorAll('input[name="avRate[]"]');
    avRateInputs.forEach((input: HTMLInputElement) => {
      if (input.value) {
        calculateTotal(input);
      }
    });
  }
}

// Validate RERA fields - EXACT SAME AS HTML
export function validateReraFields(reraInput: HTMLInputElement): void {
  const row = reraInput.closest('.table-grid');
  if (!row) return;
  
  const devPossessionInput = row.querySelector('input[name="devPossession[]"]') as HTMLInputElement;
  const reraPossessionInput = row.querySelector('input[name="reraPossession[]"]') as HTMLInputElement;
  const reraUrlInput = row.querySelector('input[name="reraUrl[]"]') as HTMLInputElement;
  
  if (reraInput.value.trim()) {
    if (devPossessionInput) {
      devPossessionInput.setAttribute('required', 'true');
    }
    if (reraPossessionInput) {
      reraPossessionInput.setAttribute('required', 'true');
    }
    if (reraUrlInput) {
      reraUrlInput.setAttribute('required', 'true');
    }
  } else {
    if (devPossessionInput) {
      devPossessionInput.removeAttribute('required');
    }
    if (reraPossessionInput) {
      reraPossessionInput.removeAttribute('required');
    }
    if (reraUrlInput) {
      reraUrlInput.removeAttribute('required');
    }
  }
}

// Update tab label - EXACT SAME AS HTML
export function updateTabLabel(input: HTMLInputElement, sectionIndex: number): void {
  const tabBtn = document.querySelector(`.sub-tab-btn[data-section="${sectionIndex}"]`) as HTMLElement;
  if (tabBtn && input.value.trim()) {
    tabBtn.textContent = input.value.trim();
  } else if (tabBtn) {
    tabBtn.textContent = `RERA-${String(sectionIndex + 1).padStart(3, '0')}`;
  }
}

// Toggle parking charges - EXACT SAME AS HTML
export function toggleParkingCharges(checkbox: HTMLInputElement): void {
  const parkingChargesInput = document.getElementById('parkingCharges') as HTMLInputElement;
  const parkingLabel = document.querySelector('label[for="parkingCharges"]') as HTMLLabelElement;
  
  if (!parkingChargesInput || !parkingLabel) return;
  
  if (checkbox.checked) {
    parkingLabel.textContent = 'Number of Parking Included';
    parkingChargesInput.type = 'number';
    parkingChargesInput.removeAttribute('oninput');
    parkingChargesInput.placeholder = 'e.g., 1, 2, 3';
    parkingChargesInput.value = '';
  } else {
    parkingLabel.textContent = 'Parking Charges';
    parkingChargesInput.type = 'text';
    parkingChargesInput.setAttribute('oninput', 'formatCurrency(this)');
    parkingChargesInput.placeholder = '';
    parkingChargesInput.value = '';
  }
}

// Recalculate all totals - EXACT SAME AS HTML
export function recalculateAllTotals(): void {
  document.querySelectorAll('input[name="avRate[]"]').forEach((input: HTMLInputElement) => {
    if (input.value) {
      calculateTotal(input);
    }
  });
}