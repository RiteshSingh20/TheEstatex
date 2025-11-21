import { Tab } from "../types";
import { PropertiesTab } from ".././components/tabs/PropertiesTab";
import { UsersTab } from ".././components/tabs/UsersTab";
import { PricingTab } from ".././components/tabs/PricingTab";
import { StampDutyTab } from ".././components/tabs/StampDutyTab";
import CostSheetForm from "../pages/CostSheetForm";

interface AdminTabsProps {
  user: any;
  permissions: any;
  users: any[];
  inventory: any;
  userDataMap: any;
  showUserModal: boolean;
  setShowUserModal: (show: boolean) => void;
  userDetails: any;
  setUserDetails: (user: any) => void;
  showPropertyDetails: any;
  setShowPropertyDetails: (property: any) => void;
  showRejectModal: boolean;
  setShowRejectModal: (show: boolean) => void;
  rejectingProperty: any;
  setRejectingProperty: (property: any) => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  actionLoading: boolean;
  setActionLoading: (loading: boolean) => void;
  fetchUserSubscriptions: (userId: string) => void;
  userSubscriptions: any[];
  loadingSubscriptions: boolean;
}

export const getTabs = (props: AdminTabsProps): Tab[] => {
  const baseTabs = [];

  if (props.permissions.canApproveNewProperty() || props.permissions.canApproveResaleRental()) {
    baseTabs.push({
      id: "properties",
      label: "Properties",
      content: <PropertiesTab {...props} />
    });
  }

  if (props.permissions.canCreateNewProperty()) {
    baseTabs.push({
      id: "costsheet",
      label: "New Property",
      content: <CostSheetForm />
    });
  }

  if (props.permissions.canViewUsers()) {
    baseTabs.push({
      id: "users",
      label: "Users",
      content: <UsersTab {...props} />
    });
  }

  if (props.permissions.canManagePricing()) {
    baseTabs.push({
      id: "pricing",
      label: "Pricing",
      content: <PricingTab {...props} />
    });
  }

  if (props.permissions.canManageStampDuty()) {
    baseTabs.push({
      id: "stampDuty",
      label: "Stamp Duty",
      content: <StampDutyTab {...props} />
    });
  }

  return baseTabs;
};