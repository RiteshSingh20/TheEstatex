import FilterBar from "../../../FilterBar";

type PendingNewPropertyTabProps = {
  search: string;
  setSearch: (v: string) => void;
  bhk: string;
  setBhk: (v: string) => void;
  reraRange: { min: string; max: string };
  setReraRange: (r: { min: string; max: string }) => void;
  availableBhkTypes: string[];
  rows: React.ReactNode;
  count: number;
};

const PendingNewPropertyTab = ({
  search,
  setSearch,
  bhk,
  setBhk,
  reraRange,
  setReraRange,
  availableBhkTypes,
  rows,
  count,
}: PendingNewPropertyTabProps) => {
  return (
    <div className="space-y-4">
      <FilterBar
        searchTerm={search}
        setSearchTerm={setSearch}
        bhkFilter={bhk}
        setBhkFilter={setBhk}
        reraRange={reraRange}
        setReraRange={setReraRange}
        availableBhkTypes={availableBhkTypes}
      />
      <div className="overflow-x-auto">
        <div className="text-sm text-neutral-500 mb-2">{count} results</div>
        {rows}
      </div>
    </div>
  );
};

export default PendingNewPropertyTab;
