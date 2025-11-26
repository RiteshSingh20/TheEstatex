import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { StampDutyRate } from '../pages/Compare';

interface StampDutyDebuggerProps {
  district?: string;
  onClose: () => void;
}

const StampDutyDebugger: React.FC<StampDutyDebuggerProps> = ({ district, onClose }) => {
  const [stampRates, setStampRates] = useState<StampDutyRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [testDistrict, setTestDistrict] = useState(district || 'Thane');

  useEffect(() => {
    const fetchStampDutyRates = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'stampDutyRates'));
        const rates: StampDutyRate[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<StampDutyRate, 'id'>),
        }));
        setStampRates(rates);
      } catch (error) {
        console.error('Failed to fetch stamp duty rates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStampDutyRates();
  }, []);

  const findMatchingRate = (districtName: string) => {
    const normalizedDistrict = districtName.trim().toLowerCase();
    
    return stampRates.find((rate) => {
      const jurisdiction = (rate.jurisdiction || '').trim().toLowerCase();
      const location = (rate.location || '').trim().toLowerCase();
      
      return jurisdiction === normalizedDistrict || location === normalizedDistrict;
    });
  };

  const matchingRate = findMatchingRate(testDistrict);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="text-center">Loading stamp duty data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Stamp Duty Rate Debugger</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Test District:</label>
          <input
            type="text"
            value={testDistrict}
            onChange={(e) => setTestDistrict(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full max-w-xs"
            placeholder="Enter district name"
          />
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Matching Result for "{testDistrict}":</h3>
          {matchingRate ? (
            <div className="text-green-600">
              ✅ Found match: {matchingRate.jurisdiction} - {matchingRate.rate}%
              <br />
              <small>ID: {matchingRate.id}</small>
            </div>
          ) : (
            <div className="text-red-600">
              ❌ No match found for "{testDistrict}"
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold mb-3">All Available Stamp Duty Rates ({stampRates.length}):</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-3 py-2 text-left">ID</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Jurisdiction</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Location</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Rate (%)</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Match Test</th>
                </tr>
              </thead>
              <tbody>
                {stampRates.map((rate) => {
                  const isMatch = findMatchingRate(testDistrict)?.id === rate.id;
                  return (
                    <tr key={rate.id} className={isMatch ? 'bg-green-100' : ''}>
                      <td className="border border-gray-300 px-3 py-2 text-sm">{rate.id}</td>
                      <td className="border border-gray-300 px-3 py-2">
                        {rate.jurisdiction || 'N/A'}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {rate.location || 'N/A'}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">{rate.rate}%</td>
                      <td className="border border-gray-300 px-3 py-2">
                        {isMatch ? '✅ Match' : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded">
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <ul className="text-sm space-y-1">
            <li>• Search term: "{testDistrict}" (normalized: "{testDistrict.trim().toLowerCase()}")</li>
            <li>• Total rates in database: {stampRates.length}</li>
            <li>• Matching logic: Compares with both jurisdiction and location fields (case-insensitive)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StampDutyDebugger;