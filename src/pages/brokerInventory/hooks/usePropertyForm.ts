import { useState, useCallback } from 'react';
import { BaseFormData } from '../types/propertyTypes';

export const usePropertyForm = (initialData?: Partial<BaseFormData>) => {
  const [formData, setFormData] = useState<BaseFormData>({
    buildingSocietyName: '',
    sublocation: '',
    landmark: '',
    locationStation: '',
    pinCode: '',
    state: '',
    district: '',
    configuration: '',
    carpetArea: '',
    builtUpArea: '',
    image: null,
    video: null,
    ownerName: '',
    ownerNumber: '',
    ...initialData
  });

  const [activeTab, setActiveTab] = useState<string>('basic');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = useCallback((field: keyof BaseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Basic validation
    if (!formData.buildingSocietyName.trim()) {
      newErrors.buildingSocietyName = 'Building/Society name is required';
    }
    if (!formData.sublocation.trim()) {
      newErrors.sublocation = 'Sublocation is required';
    }
    if (!formData.configuration) {
      newErrors.configuration = 'Configuration is required';
    }
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required';
    }
    if (!formData.ownerNumber.trim()) {
      newErrors.ownerNumber = 'Owner number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      buildingSocietyName: '',
      sublocation: '',
      landmark: '',
      locationStation: '',
      pinCode: '',
      state: '',
      district: '',
      configuration: '',
      carpetArea: '',
      builtUpArea: '',
      image: null,
      video: null,
      ownerName: '',
      ownerNumber: '',
    });
    setActiveTab('basic');
    setErrors({});
  }, []);

  return {
    formData,
    activeTab,
    errors,
    setActiveTab,
    updateField,
    validateForm,
    resetForm
  };
};