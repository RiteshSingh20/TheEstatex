import React, { useState } from "react";

interface Station {
  id: string;
  name: string;
  district: string;
  state: string;
  source: "costsheet" | "custom" | "resale-rental" | "new-property";
}

interface StationPricing {
  actual: number;
  offer: number;
}

interface AllStationsTableProps {
  allAvailableStations: Station[];
  newPropertyPricing: { [key: string]: StationPricing };
  editingStationId: string | null;
  editingStationName: string;
  setEditingStationName: (name: string) => void;
  setEditingStationId: (id: string | null) => void;
  onUpdatePricing: (stationId: string, pricing: StationPricing) => void;
  onEditStation: (station: Station) => void;
  onDeleteStation: (station: Station) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedState: string;
  setSelectedState: (state: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  selectedRows: string[];
  setSelectedRows: (rows: string[]) => void;
}

const AllStationsTable: React.FC<AllStationsTableProps> = ({
  allAvailableStations,
  newPropertyPricing,
  editingStationId,
  editingStationName,
  setEditingStationName,
  setEditingStationId,
  onUpdatePricing,
  onEditStation,
  onDeleteStation,
  searchTerm,
  setSearchTerm,
  selectedState,
  setSelectedState,
  selectedDistrict,
  setSelectedDistrict,
  selectedRows,
  setSelectedRows,
}) => {
  const filteredStations = allAvailableStations.filter(station => {
    const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = !selectedState || station.state === selectedState;
    const matchesDistrict = !selectedDistrict || station.district === selectedDistrict;
    return matchesSearch && matchesState && matchesDistrict;
  });
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredStations.map(s => s.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (stationId: string, checked: boolean) => {
    if (checked) {
      setSelectedRows([...selectedRows, stationId]);
    } else {
      setSelectedRows(selectedRows.filter(id => id !== stationId));
    }
  };

  const isAllSelected = filteredStations.length > 0 && selectedRows.length === filteredStations.length;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < filteredStations.length;
  
  // Get unique states and districts from available stations
  const availableStates = [...new Set(allAvailableStations.map(s => s.state).filter(Boolean))].sort();
  const availableDistricts = [...new Set(allAvailableStations.map(s => s.district).filter(Boolean))].sort();

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search stations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>
        
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors min-w-[120px]"
        >
          <option value="">All States</option>
          {availableStates.map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
        
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors min-w-[120px]"
        >
          <option value="">All Districts</option>
          {availableDistricts.map((district) => (
            <option key={district} value={district}>{district}</option>
          ))}
        </select>
        
        <button
          onClick={() => {
            setSearchTerm("");
            setSelectedState("");
            setSelectedDistrict("");
          }}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
        >
          Reset
        </button>
      </div>
      
      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="grid gap-4 px-4 py-3 bg-gray-50/50 border-b border-gray-100" style={{gridTemplateColumns: '40px 1fr 1fr 1fr 1fr 1fr'}}>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(el) => {
                if (el) el.indeterminate = isIndeterminate;
              }}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Station</div>
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Actual</div>
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Offer</div>
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</div>
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</div>
        </div>
        
        {/* Body */}
        <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
          {filteredStations.map((station) => {
            const stationKey = station.source === "custom" ? `custom_${station.name}` : station.name;
            const pricing = newPropertyPricing[stationKey] || { actual: 0, offer: 0 };
            const discount = pricing.actual > 0 && pricing.offer < pricing.actual 
              ? Math.round(((pricing.actual - pricing.offer) / pricing.actual) * 100) : 0;
            
            return (
              <div key={station.id} className="grid gap-4 px-4 py-3 hover:bg-gray-50/50 transition-colors" style={{gridTemplateColumns: '40px 1fr 1fr 1fr 1fr 1fr'}}>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(station.id)}
                    onChange={(e) => handleSelectRow(station.id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">{station.name}</div>
                  <div className="text-xs text-gray-500 truncate">{station.district}, {station.state}</div>
                </div>
                <div className="text-sm font-medium text-gray-900">₹{pricing.actual.toLocaleString()}</div>
                <div className="text-sm font-medium text-gray-900">₹{pricing.offer.toLocaleString()}</div>
                <div>
                  {discount > 0 ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {discount}% OFF
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      Regular
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditStation(station)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit station"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {station.source === "custom" && (
                    <button
                      onClick={() => onDeleteStation(station)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete station"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>{filteredStations.length} stations</span>
          </div>
          <div className="text-xs text-gray-500">
            {filteredStations.length} of {allAvailableStations.length} shown
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllStationsTable;