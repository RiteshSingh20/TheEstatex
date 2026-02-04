import React, { useState } from 'react';
import ResalePropertyForm from './ResalePropertyForm';
import RentalPropertyForm from './RentalPropertyForm';
import CommercialResalePropertyForm from './CommercialResalePropertyForm';
import CommercialRentalPropertyForm from './CommercialRentalPropertyForm';
import PlotSalePropertyForm from './PlotSalePropertyForm';
import PlotRentalPropertyForm from './PlotRentalPropertyForm';
type PropertyType = 'Residential' | 'Commercial' | 'Plot' | '';
type FormType = 'Resale' | 'Rental' | '';

const PropertyFormSelector: React.FC = () => {
  const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyType>('');
  const [selectedFormType, setSelectedFormType] = useState<FormType>('');
  const [showForm, setShowForm] = useState<boolean>(false);

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
    if (showForm) {
      setShowForm(false);
    } else {
      setSelectedPropertyType('');
      setSelectedFormType('');
    }
  };

  // Render the selected form
  if (selectedPropertyType && selectedFormType && showForm) {
    if (selectedPropertyType === 'Residential') {
      return selectedFormType === 'Resale' ? <ResalePropertyForm onBack={handleBack} /> : <RentalPropertyForm onBack={handleBack} />;
    } else if (selectedPropertyType === 'Commercial') {
      return selectedFormType === 'Resale' ? <CommercialResalePropertyForm onBack={handleBack} /> : <CommercialRentalPropertyForm onBack={handleBack} />;
    } else if (selectedPropertyType === 'Plot') {
      return selectedFormType === 'Resale' ? <PlotSalePropertyForm onBack={handleBack} /> : <PlotRentalPropertyForm onBack={handleBack} />;
    }
    // For Commercial Rental and Plot, show placeholder for now
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center shadow-lg">
          <h1 className="text-xl font-semibold flex items-center gap-2"><i className="fas fa-cogs"></i> Property Management</h1>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1"><i className="fas fa-user-circle"></i> Admin User</span>
            <span>|</span>
            <a href="#" className="text-gray-200 hover:text-white flex items-center gap-1"><i className="fas fa-sign-out-alt"></i> Logout</a>
          </div>
        </div>

        <div className="bg-white px-6 py-3 border-b text-sm text-gray-600">
          <a href="#">Dashboard</a> / <a href="#">Properties</a> / <strong>Add {selectedPropertyType} Property</strong>
        </div>

        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedPropertyType} {selectedFormType} Form</h2>
              <p className="text-gray-600">Form for {selectedPropertyType} {selectedFormType} properties (Coming Soon)</p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="text-center p-12 bg-gray-100 rounded-lg border border-gray-200">
                <i className="fas fa-tools text-5xl text-gray-500 mb-4 block"></i>
                <h3 className="text-gray-500 mb-2 text-lg font-semibold">Under Development</h3>
                <p className="text-gray-500 mb-8">The {selectedPropertyType} {selectedFormType} form is currently under development.</p>
                <button 
                  onClick={handleBack}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg inline-flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                  <i className="fas fa-arrow-left"></i> Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center shadow-lg">
        <h1 className="text-xl font-semibold flex items-center gap-2"><i className="fas fa-cogs"></i> Property Management</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1"><i className="fas fa-user-circle"></i> Admin User</span>
          <span>|</span>
          <a href="#" className="text-gray-200 hover:text-white flex items-center gap-1"><i className="fas fa-sign-out-alt"></i> Logout</a>
        </div>
      </div>

      <div className="bg-white px-6 py-3 border-b text-sm text-gray-600">
        <a href="#">Dashboard</a> / <a href="#">Properties</a> / <strong>Add Property</strong>
      </div>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto">
            {!selectedPropertyType ? (
              // Property Type Selection
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">Select Property Type</h3>
                  <p className="text-gray-600">Choose the type of property you want to add</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div 
                    onClick={() => handlePropertyTypeSelect('Residential')}
                    className="p-6 border-2 border-blue-100 rounded-lg cursor-pointer text-center transition-all duration-200 bg-blue-50 hover:border-blue-400 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <i className="fas fa-home text-3xl text-blue-500 mb-3 block"></i>
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">Residential</h4>
                    <p className="text-gray-600 text-sm">Apartments, Houses</p>
                  </div>

                  <div 
                    onClick={() => handlePropertyTypeSelect('Commercial')}
                    className="p-6 border-2 border-orange-100 rounded-lg cursor-pointer text-center transition-all duration-200 bg-orange-50 hover:border-orange-400 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <i className="fas fa-building text-3xl text-orange-500 mb-3 block"></i>
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">Commercial</h4>
                    <p className="text-gray-600 text-sm">Offices, Shops</p>
                  </div>

                  <div 
                    onClick={() => handlePropertyTypeSelect('Plot')}
                    className="p-6 border-2 border-green-100 rounded-lg cursor-pointer text-center transition-all duration-200 bg-green-50 hover:border-green-400 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <i className="fas fa-map text-3xl text-green-500 mb-3 block"></i>
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">Plot</h4>
                    <p className="text-gray-600 text-sm">Land, Agricultural</p>
                  </div>
                </div>
              </div>
            ) : (
              // Form Type Selection (for Residential and Commercial)
              <div className="bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <button 
                    onClick={handleBack}
                    className="bg-gray-100 border border-gray-300 rounded px-3 py-2 cursor-pointer flex items-center text-gray-600 text-sm transition-all duration-200 hover:bg-gray-200 hover:border-gray-400"
                  >
                    <i className="fas fa-arrow-left mr-2"></i> Back
                  </button>
                  <div className="text-center flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">Select {selectedPropertyType} Form Type</h3>
                    <p className="text-gray-600 text-sm">Choose between resale or rental property form</p>
                  </div>
                  <div className="w-20"></div>
                </div>

                {(selectedPropertyType === 'Residential' || selectedPropertyType === 'Commercial' || selectedPropertyType === 'Plot') ? (
                  <div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div 
                        onClick={() => handleFormTypeSelect('Resale')}
                        className={`p-6 border-2 rounded-lg cursor-pointer text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                          selectedFormType === 'Resale' 
                            ? 'border-pink-600 bg-pink-50' 
                            : 'border-pink-100 bg-pink-25 hover:border-pink-600'
                        }`}
                      >
                        <i className="fas fa-tag text-3xl text-pink-600 mb-3 block"></i>
                        <h4 className="text-lg font-semibold text-gray-800 mb-1">{selectedPropertyType === 'Plot' ? 'Sale Plot' : 'Resale Property'}</h4>
                        <p className="text-gray-600 text-sm mb-2">Properties available for sale</p>
                      </div>

                      <div 
                        onClick={() => handleFormTypeSelect('Rental')}
                        className={`p-6 border-2 rounded-lg cursor-pointer text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                          selectedFormType === 'Rental' 
                            ? 'border-purple-600 bg-purple-50' 
                            : 'border-purple-100 bg-purple-25 hover:border-purple-600'
                        }`}
                      >
                        <i className="fas fa-key text-3xl text-purple-600 mb-3 block"></i>
                        <h4 className="text-lg font-semibold text-gray-800 mb-1">{selectedPropertyType === 'Plot' ? 'Rental Plot' : 'Rental Property'}</h4>
                        <p className="text-gray-600 text-sm mb-2">Properties available for rent</p>
                      </div>
                    </div>
                    
                    {selectedFormType && (
                      <div className="text-center mt-4 pt-4 border-t border-gray-200">
                        <button 
                          onClick={handleContinue}
                          className="px-8 py-3 text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none rounded-lg cursor-pointer inline-flex items-center gap-2 transition-all duration-200 shadow-lg hover:-translate-y-1 hover:shadow-xl"
                        >
                          Continue to {selectedFormType} Form
                          <i className="fas fa-arrow-right"></i>
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyFormSelector;