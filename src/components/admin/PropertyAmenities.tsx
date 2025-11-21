type Props = {
  details: Record<string, unknown>;
};

const PropertyAmenities = ({ details }: Props) => {
  const apartmentAmenities = details.apartmentAmenities as unknown;
  const projectAmenities = details.projectAmenities as unknown;
  const locationHighlights = details.locationHighlights as unknown;

  const renderList = (value: unknown) => {
    return Array.isArray(value) ? (value as unknown[]).join(", ") : "-";
  };

  return (
    <div>
      <h4 className="text-md font-semibold text-neutral-700 mb-2">Amenities</h4>
      <div className="grid grid-cols-1 gap-4 border border-neutral-200 p-4 rounded-md bg-neutral-50">
        <div className="text-sm">
          <div className="text-neutral-500 font-medium mb-2">
            Apartment Amenities
          </div>
          <div className="text-neutral-800">
            {renderList(apartmentAmenities)}
          </div>
        </div>
        <div className="text-sm">
          <div className="text-neutral-500 font-medium mb-2">
            Project Amenities
          </div>
          <div className="text-neutral-800">{renderList(projectAmenities)}</div>
        </div>
        <div className="text-sm">
          <div className="text-neutral-500 font-medium mb-2">
            Location Highlights
          </div>
          <div className="text-neutral-800">
            {renderList(locationHighlights)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyAmenities;
