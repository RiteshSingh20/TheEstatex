type Props = {
  details: Record<string, unknown>;
};

const PropertyOtherCharges = ({ details }: Props) => {
  const fixedComponent = details.fixedComponent as string | number | undefined;
  const possessionCharges = details.possessionCharges as
    | string
    | number
    | undefined;
  const parkingCharge = details.parkingCharge as string | number | undefined;
  const totalPackage = details.totalPackage as string | number | undefined;
  const paymentScheme = details.paymentScheme as unknown;

  return (
    <div>
      <h4 className="text-md font-semibold text-neutral-700 mb-2">
        Other charges & Payment Plans
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-neutral-200 p-4 rounded-md bg-neutral-50">
        <div className="text-sm">
          <div className="text-neutral-500 font-medium">Fixed Component</div>
          <div className="text-neutral-800">
            {String(fixedComponent ?? "-")}
          </div>
        </div>
        <div className="text-sm">
          <div className="text-neutral-500 font-medium">Possession Charges</div>
          <div className="text-neutral-800">
            {String(possessionCharges ?? "-")}
          </div>
        </div>
        <div className="text-sm">
          <div className="text-neutral-500 font-medium">Parking Charges</div>
          <div className="text-neutral-800">{String(parkingCharge ?? "-")}</div>
        </div>
        <div className="text-sm">
          <div className="text-neutral-500 font-medium">Total Package</div>
          <div className="text-neutral-800">{String(totalPackage ?? "-")}</div>
        </div>
        <div className="text-sm col-span-2">
          <div className="text-neutral-500 font-medium">Payment Schemes</div>
          <div className="text-neutral-800">
            {Array.isArray(paymentScheme)
              ? (paymentScheme as unknown[]).join(", ")
              : "-"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyOtherCharges;
