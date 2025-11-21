import Card from "../../ui/Card";
import Input from "../../ui/Input";
import Button from "../../ui/Button";

type Rate = { id: string; jurisdiction: string; rate: number | string };

type Props = {
  rates: Rate[];
  newRate: { jurisdiction: string; rate: string };
  setNewRate: (v: { jurisdiction: string; rate: string }) => void;
  getStampDutyRates: () => Promise<Rate[]> | Rate[];
  setRates: (v: Rate[]) => void;
  handleDeleteRate: (id: string) => Promise<void> | void;
  dbOps?: any;
};

const StampDutyTab = ({
  rates,
  newRate,
  setNewRate,
  getStampDutyRates,
  setRates,
  handleDeleteRate,
}: Props) => {
  const addRate = async () => {
    if (!newRate.jurisdiction || !newRate.rate) return;
    try {
      const updated = await getStampDutyRates();
      setRates(updated as Rate[]);
    } catch {}
  };

  return (
    <Card className="p-6 rounded-2xl shadow-md border border-neutral-200 bg-white">
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-neutral-800">
          Manage Stamp Duty Rates
        </h3>
        <p className="text-sm text-neutral-500 mt-1">
          Add or update stamp duty rates based on station-wise jurisdiction.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Input
          id="stampDutyJurisdiction"
          label="Jurisdiction"
          placeholder="e.g., Thane"
          value={newRate.jurisdiction}
          onChange={(e) =>
            setNewRate({ ...newRate, jurisdiction: e.target.value })
          }
        />
        <Input
          id="stampDutyRate"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          label="Stamp Duty Rate (%)"
          placeholder="e.g., 6"
          value={newRate.rate}
          onChange={(e) => setNewRate({ ...newRate, rate: e.target.value })}
        />
      </div>

      <div className="flex justify-end">
        <Button
          onClick={addRate}
          className="px-6 py-2 text-sm font-medium rounded-lg"
        >
          Add / Update Rate
        </Button>
      </div>

      {rates && rates.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-medium text-neutral-800 mb-4">
            Active Rates
          </h4>
          <div className="space-y-2">
            {rates.map((rate) => (
              <div
                key={rate.id}
                className="group flex items-center justify-between p-4 bg-white rounded-lg border border-neutral-200 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">%</span>
                  </div>
                  <div>
                    <span className="font-medium text-neutral-900">{rate.jurisdiction}</span>
                    <span className="ml-2 text-lg font-bold text-blue-600">{rate.rate}%</span>
                  </div>
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setNewRate({ jurisdiction: rate.jurisdiction, rate: rate.rate.toString() });
                      document.getElementById('stampDutyJurisdiction')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className="p-1.5 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteRate(rate.id)}
                    className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default StampDutyTab;
