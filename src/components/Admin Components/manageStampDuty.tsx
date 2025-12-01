import { StampDutyRate } from "../CompareModal";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";
import { Edit, Trash2, FileText, Plus, List } from "lucide-react";

export function manageStampDuty(newRate: { jurisdiction: string; rate: string; }, setNewRate, handleAddRate: () => Promise<void>, rates: StampDutyRate[], handleDeleteRate: (id: string) => Promise<void>) {
  return <Card className="p-6 rounded-2xl shadow-md border border-neutral-200 bg-white">
    <div className="mb-6">
      <h3 className="text-2xl font-semibold text-neutral-800 flex items-center gap-2">
        <FileText className="h-6 w-6" />
        Manage Stamp Duty Rates
      </h3>
      <p className="text-sm text-neutral-500 mt-1">
        Add or update stamp duty rates based on station-wise
        jurisdiction.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* <Input
            id="stampDutyLocation"
            label="Location"
            placeholder="e.g., Mira Road"
            value={newRate.location}
            onChange={(e) =>
              setNewRate({ ...newRate, location: e.target.value })
            }
          /> */}
      <Input
        id="stampDutyJurisdiction"
        label="Jurisdiction"
        placeholder="e.g., Thane"
        value={newRate.jurisdiction}
        onChange={(e) => setNewRate({ ...newRate, jurisdiction: e.target.value })} />
      <Input
        id="stampDutyRate"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        label="Stamp Duty Rate (%)"
        placeholder="e.g., 6"
        value={newRate.rate}
        onChange={(e) => setNewRate({ ...newRate, rate: e.target.value })} />
    </div>

    <div className="flex justify-end">
      <Button
        onClick={handleAddRate}
        className="px-6 py-2 text-sm font-medium rounded-lg flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Add / Update Rate
      </Button>
    </div>

    {rates.length > 0 && (
      <div className="mt-8">
        <h4 className="text-lg font-semibold text-neutral-700 mb-3 flex items-center gap-2">
          <List className="h-5 w-5" />
          Existing Rates
        </h4>
        <ul className="space-y-2">
          {rates.map((rate) => (
            <li
              key={rate.id}
              className="flex items-center justify-between px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-sm text-neutral-700"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                <span className="font-medium">{rate.jurisdiction}</span>
                <span className="text-primary font-semibold">
                  {rate.rate}%
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setNewRate({
                    jurisdiction: rate.jurisdiction,
                    rate: String(rate.rate),
                  })}
                  className="text-blue-500 hover:text-blue-700 p-1"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteRate(rate.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )}
  </Card>;
}