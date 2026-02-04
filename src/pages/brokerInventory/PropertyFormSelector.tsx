import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ResalePropertyForm from './forms/ResalePropertyForm';
import RentalPropertyForm from './forms/RentalPropertyForm';
import CommercialResalePropertyForm from './forms/CommercialResalePropertyForm';
import CommercialRentalPropertyForm from './forms/CommercialRentalPropertyForm';
import PlotSalePropertyForm from './forms/PlotSalePropertyForm';
import PlotRentalPropertyForm from './forms/PlotRentalPropertyForm';

type PropertyType = 'Residential' | 'Commercial' | 'Plot' | '';
type FormType = 'Resale' | 'Rental' | '';

interface LocationState {
  editProperty?: any;
  formType?: 'resale' | 'rental';
  returnTab?: string;
  returnSubTab?: string;
}

const PropertyFormSelector: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyType>('');
  const [selectedFormType, setSelectedFormType] = useState<FormType>('');
  const [showForm, setShowForm] = useState<boolean>(false);

  // Handle navigation from Inventory page for editing
  useEffect(() => {
    if (state?.editProperty && state?.formType) {
      setSelectedPropertyType('Residential'); // Default to residential for now
      setSelectedFormType(state.formType === 'resale' ? 'Resale' : 'Rental');
      setShowForm(true);
    }
  }, [state]);

  const handlePropertyTypeSelect = (type: PropertyType) => {
    setSelectedPropertyType(type);
    setSelectedFormType(''); // Reset form type when property type changes
    setShowForm(false); // Reset form display
  };

  const handleFormTypeSelect = (type: FormType) => {
    setSelectedFormType(type);
  };

  const handleContinue = () => {
    if (selectedFormType) {
      setShowForm(true);
    }
  };

  const handleBack = () => {
    // If editing a property, navigate back to inventory with preserved tab state
    if (state?.editProperty) {
      const returnTab = state.returnTab || 'residential';
      const returnSubTab = state.returnSubTab || 'resale';
      navigate('/inventory', { 
        state: { 
          activeTab: returnTab, 
          activeSubTab: returnSubTab 
        } 
      });
    } else if (showForm) {
      setShowForm(false);
    } else {
      setSelectedPropertyType('');
      setSelectedFormType('');
    }
  };

  // Render the selected form
  if (selectedPropertyType && selectedFormType && showForm) {
    if (selectedPropertyType === 'Residential') {
      return selectedFormType === 'Resale' ? 
        <ResalePropertyForm onBack={handleBack} editProperty={state?.editProperty} /> : 
        <RentalPropertyForm onBack={handleBack} editProperty={state?.editProperty} />;
    } else if (selectedPropertyType === 'Commercial') {
      return selectedFormType === 'Resale' ? 
        <CommercialResalePropertyForm onBack={handleBack} editProperty={state?.editProperty} /> : 
        <CommercialRentalPropertyForm onBack={handleBack} editProperty={state?.editProperty} />;
    } else if (selectedPropertyType === 'Plot') {
      return selectedFormType === 'Resale' ? 
        <PlotSalePropertyForm onBack={handleBack} editProperty={state?.editProperty} /> : 
        <PlotRentalPropertyForm onBack={handleBack} editProperty={state?.editProperty} />;
    }
    // For Commercial Rental and Plot, show placeholder for now
  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="container mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">{selectedPropertyType} {selectedFormType} Form</h2>
          <p className="text-neutral-600">Form for {selectedPropertyType} {selectedFormType} properties (Coming Soon)</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-card overflow-hidden">
            <div className="p-12 text-center">
              <i className="fas fa-tools text-5xl text-neutral-400 mb-4 block"></i>
              <h3 className="text-neutral-600 mb-2 text-lg font-semibold">Under Development</h3>
              <p className="text-neutral-500 mb-8">The {selectedPropertyType} {selectedFormType} form is currently under development.</p>
              <button 
                onClick={handleBack}
                className="inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-accent text-white hover:bg-accent-dark focus:ring-accent text-base py-2 px-4"
              >
                <i className="fas fa-arrow-left mr-2"></i> Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-4 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <button 
            onClick={() => navigate('/inventory')}
            className="inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 focus:ring-neutral-500 text-sm py-2 px-4"
          >
            <i className="fas fa-arrow-left mr-2"></i> Back to Inventory
          </button>
        </div>
        <div>
          {!selectedPropertyType ? (
            // Property Type Selection
            <div className="bg-white rounded-lg shadow-card overflow-hidden">
              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-neutral-800 mb-2">Select Property Type</h3>
                  <p className="text-neutral-600">Choose the type of property you want to add</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div 
                    onClick={() => handlePropertyTypeSelect('Residential')}
                    className="p-6 border-2 border-primary/20 rounded-lg cursor-pointer text-center transition-all duration-200 bg-primary/5 hover:border-primary hover:-translate-y-1 hover:shadow-lg"
                  >
                    <i className="fas fa-home text-3xl text-primary mb-3 block"></i>
                    <h4 className="text-lg font-semibold text-neutral-800 mb-1">Residential</h4>
                    <p className="text-neutral-600 text-sm">Apartments, Houses</p>
                  </div>

                  <div 
                    onClick={() => handlePropertyTypeSelect('Commercial')}
                    className="p-6 border-2 border-accent/20 rounded-lg cursor-pointer text-center transition-all duration-200 bg-accent/5 hover:border-accent hover:-translate-y-1 hover:shadow-lg"
                  >
                    <i className="fas fa-building text-3xl text-accent mb-3 block"></i>
                    <h4 className="text-lg font-semibold text-neutral-800 mb-1">Commercial</h4>
                    <p className="text-neutral-600 text-sm">Offices, Shops</p>
                  </div>

                  <div 
                    onClick={() => handlePropertyTypeSelect('Plot')}
                    className="p-6 border-2 border-success/20 rounded-lg cursor-pointer text-center transition-all duration-200 bg-success/5 hover:border-success hover:-translate-y-1 hover:shadow-lg"
                  >
                    <i className="fas fa-map text-3xl text-success mb-3 block"></i>
                    <h4 className="text-lg font-semibold text-neutral-800 mb-1">Plot</h4>
                    <p className="text-neutral-600 text-sm">Land, Agricultural</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Form Type Selection (for Residential and Commercial)
            <div className="bg-white rounded-lg shadow-card overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <button 
                    onClick={handleBack}
                    className="inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary text-sm py-2 px-3"
                  >
                    <i className="fas fa-chevron-left mr-2"></i> Previous
                  </button>
                  <div className="text-center flex-1">
                    <h3 className="text-xl font-semibold text-neutral-800 mb-1">Select {selectedPropertyType} Form Type</h3>
                    <p className="text-neutral-600 text-sm">Choose between resale or rental property form</p>
                  </div>
                  <div className="w-20"></div>
                </div>

                {(selectedPropertyType === 'Residential' || selectedPropertyType === 'Commercial' || selectedPropertyType === 'Plot') ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div 
                        onClick={() => handleFormTypeSelect('Resale')}
                        className={`p-6 border-2 rounded-lg cursor-pointer text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                          selectedFormType === 'Resale' 
                            ? 'border-primary bg-primary/10' 
                            : 'border-primary/20 bg-primary/5 hover:border-primary'
                        }`}
                      >
                        <i className="fas fa-tag text-3xl text-primary mb-3 block"></i>
                        <h4 className="text-lg font-semibold text-neutral-800 mb-1">{selectedPropertyType === 'Plot' ? 'Sale Plot' : 'Resale Property'}</h4>
                        <p className="text-neutral-600 text-sm mb-2">Properties available for sale</p>
                      </div>

                      <div 
                        onClick={() => handleFormTypeSelect('Rental')}
                        className={`p-6 border-2 rounded-lg cursor-pointer text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                          selectedFormType === 'Rental' 
                            ? 'border-accent bg-accent/10' 
                            : 'border-accent/20 bg-accent/5 hover:border-accent'
                        }`}
                      >
                        <i className="fas fa-key text-3xl text-accent mb-3 block"></i>
                        <h4 className="text-lg font-semibold text-neutral-800 mb-1">{selectedPropertyType === 'Plot' ? 'Rental Plot' : 'Rental Property'}</h4>
                        <p className="text-neutral-600 text-sm mb-2">Properties available for rent</p>
                      </div>
                    </div>
                    
                    {selectedFormType && (
                      <div className="text-center mt-4 pt-4 border-t border-neutral-200">
                        <button 
                          onClick={handleContinue}
                          className="inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-accent text-white hover:bg-accent-dark focus:ring-accent text-base py-2 px-4"
                        >
                          Continue to {selectedFormType} Form
                          <i className="fas fa-arrow-right ml-2"></i>
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyFormSelector;