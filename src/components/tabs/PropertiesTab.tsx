import Card from "../../components/ui/Card";
import Tabs from "../../components/ui/Tabs";
import { PendingProperties } from ".././properties/PendingProperties";
import { ApprovedProperties } from ".././properties/ApprovedProperties";
import { RejectedProperties } from ".././properties/RejectedProperties";

interface PropertiesTabProps {
  inventory: any;
  userDataMap: any;
  user: any;
  setShowPropertyDetails: (property: any) => void;
  setRejectingProperty: (property: any) => void;
  setShowRejectModal: (show: boolean) => void;
  actionLoading: boolean;
}

export const PropertiesTab = (props: PropertiesTabProps) => {
  const { inventory } = props;

  const getFilteredProperties = () => {
    const userRole = props.user?.role;

    const sortByCreatedAt = (properties: any[]) => {
      return properties.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    };

    const sortNewPropertiesByCreatedAt = (properties: any[]) => {
      return properties.sort((a, b) => {
        const aDate = a.createdAt || a.dateUpdateCostSheet;
        const bDate = b.createdAt || b.dateUpdateCostSheet;
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      });
    };

    if (userRole === "admin") {
      return {
        pending: {
          resale: sortByCreatedAt(
            inventory.resale.filter((p: any) => !p.isApproved && !p.isRejected)
          ),
          rental: sortByCreatedAt(
            inventory.rental.filter((p: any) => !p.isApproved && !p.isRejected)
          ),
          newProperties: sortNewPropertiesByCreatedAt(
            inventory.newProperties?.filter(
              (p: any) => !p.isApproved && !p.isRejected
            ) || []
          ),
        },
        approved: {
          resale: sortByCreatedAt(
            inventory.resale.filter((p: any) => p.isApproved)
          ),
          rental: sortByCreatedAt(
            inventory.rental.filter((p: any) => p.isApproved)
          ),
          newProperties: sortNewPropertiesByCreatedAt(
            inventory.newProperties?.filter((p: any) => p.isApproved) || []
          ),
        },
        rejected: {
          resale: sortByCreatedAt(
            inventory.resale.filter((p: any) => p.isRejected || p.rejectedAt)
          ),
          rental: sortByCreatedAt(
            inventory.rental.filter((p: any) => p.isRejected || p.rejectedAt)
          ),
          newProperties: sortNewPropertiesByCreatedAt(
            inventory.newProperties?.filter((p: any) => p.isRejected) || []
          ),
        },
      };
    }

    return {
      pending: { resale: [], rental: [], newProperties: [] },
      approved: { resale: [], rental: [], newProperties: [] },
      rejected: { resale: [], rental: [], newProperties: [] },
    };
  };

  const { pending, approved, rejected } = getFilteredProperties();

  return (
    <Card>
      <Tabs
        variant="underline"
        tabs={[
          {
            id: "pending",
            label: "Pending Approval",
            content: (
              <PendingProperties
                pendingProperties={pending}
                userDataMap={props.userDataMap}
                setShowPropertyDetails={props.setShowPropertyDetails}
                setRejectingProperty={props.setRejectingProperty}
                setShowRejectModal={props.setShowRejectModal}
                actionLoading={props.actionLoading}
                user={props.user}
              />
            ),
          },
          {
            id: "approved",
            label: "Approved",
            content: (
              <ApprovedProperties
                approvedProperties={approved}
                setShowPropertyDetails={props.setShowPropertyDetails}
              />
            ),
          },
          {
            id: "rejected",
            label: "Rejected",
            content: (
              <RejectedProperties
                rejectedProperties={rejected}
                setShowPropertyDetails={props.setShowPropertyDetails}
                user={props.user}
              />
            ),
          },
        ]}
      />
    </Card>
  );
};
