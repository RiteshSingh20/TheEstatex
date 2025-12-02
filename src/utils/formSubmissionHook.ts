import { calculateUniversalTotalPackage, fixTotalPackageInData } from './totalPackageCalculator';

// Pre-submission data processor
export const processFormDataBeforeSubmission = (formData: any) => {
  const parseIndianCurrency = (val: string) => val.replace(/[^\d.]/g, '');
  const formatIndianCurrency = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Process the data to ensure consistent totalPackage calculations
  const processedData = fixTotalPackageInData(formData, formData, parseIndianCurrency, formatIndianCurrency);
  
  console.log('Original form data:', formData);
  console.log('Processed form data:', processedData);
  
  return processedData;
};

// Global form submission wrapper
export const wrapFormSubmission = () => {
  // Store original form submission methods
  const originalSubmit = HTMLFormElement.prototype.submit;
  
  // Override form submit
  HTMLFormElement.prototype.submit = function() {
    console.log('Form submission intercepted');
    
    // Try to find and process form data
    const formData = new FormData(this);
    const formObject: any = {};
    
    formData.forEach((value, key) => {
      try {
        formObject[key] = JSON.parse(value as string);
      } catch {
        formObject[key] = value;
      }
    });
    
    if (formObject.subTabData || formObject.typologies) {
      const processedData = processFormDataBeforeSubmission(formObject);
      
      // Update form with processed data
      Object.keys(processedData).forEach(key => {
        const input = this.querySelector(`[name="${key}"]`) as HTMLInputElement;
        if (input) {
          input.value = typeof processedData[key] === 'object' 
            ? JSON.stringify(processedData[key]) 
            : processedData[key];
        }
      });
    }
    
    return originalSubmit.call(this);
  };
};