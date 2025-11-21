import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from '../utils/authContext';
import { Settings, Save, MapPin, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

interface ContactInfo {
  address: string;
  phone: string;
  email: string;
}

const ContactSettings: React.FC = () => {
  const { user } = useAuth();
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    address: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'contact'), (doc) => {
      if (doc.exists()) {
        setContactInfo(doc.data() as ContactInfo);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'contact'), contactInfo);
      toast.success('Contact information updated successfully!');
    } catch (error) {
      console.error('Error updating contact info:', error);
      toast.error('Failed to update contact information');
    } finally {
      setLoading(false);
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only administrators can access contact settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Contact Settings</h1>
            <p className="text-gray-600">Manage your organization's contact information</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Address Field */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                  Business Address
                </label>
                <textarea
                  value={contactInfo.address}
                  onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows={3}
                  placeholder="Enter your complete business address"
                  required
                />
              </div>
              
              {/* Phone Field */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <Phone className="h-5 w-5 text-blue-600 mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., +91 9876543210"
                  required
                />
              </div>
              
              {/* Email Field */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <Mail className="h-5 w-5 text-blue-600 mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., info@company.com"
                  required
                />
              </div>
              
              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>Update Contact Information</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          {/* Info Card */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Changes will be reflected immediately across the website footer and all contact sections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSettings;