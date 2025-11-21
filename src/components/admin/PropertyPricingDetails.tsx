type Props = {
  details: Record<string, unknown>;
};

const PropertyPricingDetails = ({ details }: Props) => {
  return (
    <div>
      <h4 className="text-md font-semibold text-neutral-700 mb-2">
        Pricing Details
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-neutral-200 p-4 rounded-md bg-neutral-50">
        <div className="text-sm">
          <div className="text-neutral-500 font-medium">Wing/Building No.</div>
          <div className="text-neutral-800">
            {String((details as any).wingBuildingNo ?? "-")}
          </div>
        </div>
        <div className="text-sm">
          <div className="text-neutral-500 font-medium">BHK Type</div>
          <div className="text-neutral-800">
            {String((details as any).flatType ?? "-")}
          </div>
        </div>
        <div className="text-sm">
          <div className="text-neutral-500 font-medium">Saleable Area</div>
          <div className="text-neutral-800">
            {String((details as any).saleableArea ?? "-")}
          </div>
        </div>
        <div className="text-sm">
          <div className="text-neutral-500 font-medium">
            RERA Carpet / Usable Carpet
          </div>
          <div className="text-neutral-800">
            {String((details as any).reraCarpet ?? "-")}
          </div>
        </div>
        <div className="text-sm">
          <div className="text-neutral-500 font-medium">Per Sq. ft. Rate</div>
          <div className="text-neutral-800">
            {String((details as any).psfRate ?? "-")}
          </div>
        </div>
        <div className="text-sm">
          <div className="text-neutral-500 font-medium">
            Agreement Value Rate
          </div>
          <div className="text-neutral-800">
            {String((details as any).avRate ?? "-")}
          </div>
        </div>
        <div className="text-sm">
          <div className="text-neutral-500 font-medium">Floor Rise Rate</div>
          <div className="text-neutral-800">
            {String((details as any).floorRise ?? "-")}
          </div>
        </div>
        <div className="text-sm">
          <div className="text-neutral-500 font-medium">
            Registration Fee/ Charge
          </div>
          <div className="text-neutral-800">
            {String((details as any).registration ?? "-")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyPricingDetails;
