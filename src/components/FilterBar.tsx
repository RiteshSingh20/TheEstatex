import { Search } from "lucide-react";

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  bhkFilter: string;
  setBhkFilter: (bhk: string) => void;
  reraRange: { min: string; max: string };
  setReraRange: (range: { min: string; max: string }) => void;
  availableBhkTypes: string[];
}

const FilterBar = ({
  searchTerm,
  setSearchTerm,
  bhkFilter,
  setBhkFilter,
  reraRange,
  setReraRange,
  availableBhkTypes,
}: FilterBarProps) => {
  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 ml-0">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-3 h-5 w-5 text-blue-400" />
          <input
            type="text"
            placeholder="🔍 Search by project, developer, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-2 border-blue-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-white shadow-sm"
          />
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative">
            <select
              value={bhkFilter}
              onChange={(e) => setBhkFilter(e.target.value)}
              className="appearance-none px-4 py-2.5 pr-8 border-2 border-blue-200 rounded-lg text-sm bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 shadow-sm font-medium"
            >
              <option value="">🏠 All BHK</option>
              {availableBhkTypes.map(bhk => (
                <option key={bhk} value={bhk}>{bhk}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border-2 border-blue-200 shadow-sm">
            <span className="text-xs font-medium text-blue-600">📐 Carpet Area</span>
            <input
              type="number"
              placeholder="Min"
              value={reraRange.min}
              onChange={(e) => setReraRange({ ...reraRange, min: e.target.value })}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-16 px-2 py-1 border border-blue-200 rounded text-xs focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            />
            <span className="text-blue-400 font-bold">—</span>
            <input
              type="number"
              placeholder="Max"
              value={reraRange.max}
              onChange={(e) => setReraRange({ ...reraRange, max: e.target.value })}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-16 px-2 py-1 border border-blue-200 rounded text-xs focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            />
            <span className="text-xs text-blue-500 font-medium">sq.ft</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;