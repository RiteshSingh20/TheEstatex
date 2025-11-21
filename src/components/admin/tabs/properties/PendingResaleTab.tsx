import Button from "../../../ui/Button";
import Input from "../../../ui/Input";

type PendingResaleTabProps = {
  search: string;
  setSearch: (v: string) => void;
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
  count: number;
  rows: React.ReactNode;
  onClear: () => void;
};

const PendingResaleTab = ({
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
  sort,
  setSort,
  count,
  rows,
  onClear,
}: PendingResaleTabProps) => {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          <div className="flex-1">
            <Input
              id="pending-resale-search"
              placeholder="Search properties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 lg:gap-3">
            <div className="relative">
              <select
                className="appearance-none bg-white/80 border border-slate-200/60 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium text-slate-700"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="1 BHK">1 BHK</option>
                <option value="2 BHK">2 BHK</option>
                <option value="3 BHK">3 BHK</option>
              </select>
            </div>
            <div className="relative">
              <select
                className="appearance-none bg-white/80 border border-slate-200/60 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium text-slate-700"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="">Sort</option>
                <option value="date-desc">Newest</option>
                <option value="date-asc">Oldest</option>
              </select>
            </div>
          </div>
          <div className="flex items-center">
            <Button variant="outline" onClick={onClear}>
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="text-sm text-neutral-500 mb-2">{count} results</div>
        {rows}
      </div>
    </div>
  );
};

export default PendingResaleTab;
