import React from "react";
import { CheckCheck, Share2 } from "lucide-react";
import Button from "../../../../../components/ui/Button";

interface ResaleProperty {
  id: string;
  docId: string;
  isApproved?: boolean;
  userListingState?: string;
  listingState?: string;
  userId?: string;
  society?: string | number;
  sublocation?: string;
  roadLocation?: string;
  expectedPrice?: number;
  floorNo?: string | number;
  flatNo?: string | number;
  contactName?: string;
  ownerName?: string;
  userFullName?: string;
  ownerNumber?: string;
  userMarketingPhoneNumber?: string;
  contactNumber?: string;
  type?: string;
  station?: string;
  cosmo?: boolean;
  rent?: number;
  deposit?: number;
  possession?: string;
  terrace?: boolean;
  directBroker?: string;
}

interface ResaleRentalActionBarProps {
  selectedProperties: ResaleProperty[];
  setSelectedProperties: React.Dispatch<React.SetStateAction<ResaleProperty[]>>;
  sendWhatsAppToInput: () => void;
}

const ResaleRentalActionBar: React.FC<ResaleRentalActionBarProps> = ({
  selectedProperties,
  setSelectedProperties,
  sendWhatsAppToInput,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="flex items-center">
          <CheckCheck className="h-5 w-5 text-primary mr-2" />
          <span className="font-medium">
            {selectedProperties.length} properties selected
          </span>
        </div>
        {selectedProperties.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedProperties([])}
          >
            Clear selection
          </Button>
        )}
      </div>
      <div className="flex space-x-2">
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
};

export default ResaleRentalActionBar;