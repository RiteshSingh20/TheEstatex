import { useState } from "react";
import Tabs from "../../../components/ui/Tabs";
import { PendingResaleTable } from "./PendingResaleTable";
import { PendingRentalTable } from "./PendingRentalTable";
import { PendingNewPropertyTable } from "./PendingNewPropertyTable";

interface PendingPropertiesProps {
  pendingProperties: any;
  userDataMap: any;
  setShowPropertyDetails: (property: any) => void;
  setRejectingProperty: (property: any) => void;
  setShowRejectModal: (show: boolean) => void;
  actionLoading: boolean;
  user: any;
}

export const PendingProperties = (props: PendingPropertiesProps) => {
  const { pendingProperties } = props;

  return (
    <div className="overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4">Pending Properties</h3>

      <Tabs
        variant="underline"
        tabs={[
          {
            id: "resale",
            label: `Resale (${pendingProperties.resale.length})`,
            content: (
              <PendingResaleTable
                properties={pendingProperties.resale}
                setShowPropertyDetails={props.setShowPropertyDetails}
                setRejectingProperty={props.setRejectingProperty}
                setShowRejectModal={props.setShowRejectModal}
                actionLoading={props.actionLoading}
              />
            ),
          },
          {
            id: "rental",
            label: `Rental (${pendingProperties.rental.length})`,
            content: (
              <PendingRentalTable
                properties={pendingProperties.rental}
                setShowPropertyDetails={props.setShowPropertyDetails}
                setRejectingProperty={props.setRejectingProperty}
                setShowRejectModal={props.setShowRejectModal}
                actionLoading={props.actionLoading}
              />
            ),
          },
          {
            id: "newProperty",
            label: `New Properties (${
              pendingProperties.newProperties?.length || 0
            })`,
            content: (
              <PendingNewPropertyTable
                properties={pendingProperties.newProperties || []}
                userDataMap={props.userDataMap}
                setShowPropertyDetails={props.setShowPropertyDetails}
                setRejectingProperty={props.setRejectingProperty}
                setShowRejectModal={props.setShowRejectModal}
                actionLoading={props.actionLoading}
                user={props.user}
              />
            ),
          },
        ]}
      />
    </div>
  );
};
