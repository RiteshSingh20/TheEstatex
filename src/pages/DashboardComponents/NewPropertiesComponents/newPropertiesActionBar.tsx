import { CheckCheck, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../../../components/ui/Button";
import { CostSheet } from "../../../components/CompareComponents/Compare";

export function newPropertiesActionBar(
  selectedCostSheets: CostSheet[],
  setSelectedCostSheets: React.Dispatch<React.SetStateAction<CostSheet[]>>,
  appliedFilters: {
    bhkType: string;
    station: string;
    minBudget: string;
    maxBudget: string;
    minCarpetArea: string;
    maxCarpetArea: string;
    subLocation: string[];
    possession: string;
    lookingForCosmo: boolean | undefined;
    BalconyorTerrace: string | undefined;
    parking: boolean | undefined;
    amenities: string[];
    petFriendly: boolean | undefined;
    furnishing: string | undefined;
    ocRed: string | undefined;
    schemes: string[];
  },
  hasFiltered: boolean,
  handleCompare: () => void,
  sendWhatsAppToInput: () => void
) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="flex items-center">
          <CheckCheck className="h-5 w-5 text-primary mr-2" />
          <span className="font-medium">
            {selectedCostSheets.length} properties selected
          </span>
        </div>
        {selectedCostSheets.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedCostSheets([])}
          >
            Clear selection
          </Button>
        )}
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (!appliedFilters.bhkType) {
              toast.error("Please select a Configuration (BHK type) first.");
              return;
            }

            if (!hasFiltered) {
              toast.error("Please apply filters before comparing.");
              return;
            }

            if (selectedCostSheets.length < 1) {
              toast.error("Please select at least one property to compare.");
              return;
            }

            if (selectedCostSheets.length > 5) {
              toast.error(
                "You can compare only up to 5 properties. Please deselect some properties."
              );
              return;
            }

            handleCompare();
          }}
        >
          Compare
        </Button>

        <Button
          variant="primary"
          size="sm"
          icon={<Share2 className="h-4 w-4 mr-1" />}
          onClick={sendWhatsAppToInput}
        >
          Share on WhatsApp
        </Button>
      </div>
    </div>
  );
}
