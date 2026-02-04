import { useEffect, useState, useRef } from 'react';
import { PropertyBloc } from '../bloc/propertyBloc';
import { PropertyState, initialPropertyState } from '../bloc/propertyState';
import { PropertyEvent } from '../bloc/propertyEvent';
import { useAuth } from '../../../utils/authContext';

// Singleton instance
let propertyBlocInstance: PropertyBloc | null = null;

export const usePropertyBloc = () => {
  const [state, setState] = useState<PropertyState>(initialPropertyState);
  const blocRef = useRef<PropertyBloc | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Create or reuse singleton instance
    if (!propertyBlocInstance) {
      propertyBlocInstance = new PropertyBloc();
    }
    
    blocRef.current = propertyBlocInstance;
    
    // Set user in bloc
    if (user) {
      blocRef.current.setUser(user);
    }

    // Subscribe to state changes
    const unsubscribe = blocRef.current.subscribe((newState) => {
      setState(newState);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const add = (event: PropertyEvent) => {
    if (blocRef.current) {
      blocRef.current.add(event);
    }
  };

  const submitProperty = (
    formData: any, 
    images: FileList | null, 
    video: FileList | null,
    propertyType: 'Residential' | 'Commercial' | 'Plot',
    transactionType: 'Resale' | 'Rental' | 'Sale'
  ) => {
    console.log('usePropertyBloc submitProperty called');
    console.log('Video parameter:', video);
    console.log('Video exists in hook:', !!video);
    
    add({
      type: 'SUBMIT_PROPERTY',
      payload: {
        formData,
        images: images || undefined,
        video: video || undefined,
        propertyType,
        transactionType
      }
    });
  };

  const updateProperty = (
    propertyId: string,
    formData: any,
    images?: FileList,
    video?: File
  ) => {
    add({
      type: 'UPDATE_PROPERTY',
      payload: {
        propertyId,
        formData,
        images,
        video
      }
    });
  };

  const loadProperties = (filters?: any) => {
    add({
      type: 'LOAD_PROPERTIES',
      payload: { filters }
    });
  };

  const deleteProperty = (propertyId: string) => {
    add({
      type: 'DELETE_PROPERTY',
      payload: { propertyId }
    });
  };

  const resetForm = () => {
    add({ type: 'RESET_FORM' });
  };

  const clearError = () => {
    add({ type: 'CLEAR_ERROR' });
  };

  return {
    state,
    submitProperty,
    updateProperty,
    loadProperties,
    deleteProperty,
    resetForm,
    clearError,
    add
  };
};