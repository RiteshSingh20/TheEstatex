// src/types/LocationPicker.tsx
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState } from "react";
import { LatLng } from "leaflet";

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

interface LocationPickerProps {
  onLocationSelected: (location: LatLng) => void;
  initialPosition?: LatLng;
}

// Add this component as a child of MapContainer
const MapEvents = ({
  setPosition,
  onLocationSelected,
}: {
  setPosition: (pos: LatLng) => void;
  onLocationSelected: (pos: LatLng) => void;
}) => {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelected(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });
  return null;
};

const LocationPicker = ({
  onLocationSelected,
  initialPosition,
}: LocationPickerProps) => {
  const [position, setPosition] = useState<LatLng | null>(
    initialPosition || null
  );

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden border border-neutral-300">
      <MapContainer
        center={position || [19.076, 72.8777]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents
          setPosition={setPosition}
          onLocationSelected={onLocationSelected}
        />
        {position && <Marker position={position} />}

        {/* 1km radius circle */}
        {position && (
          <Circle
            center={position}
            radius={1000}
            pathOptions={{ color: "blue", fillOpacity: 0.1 }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default LocationPicker;
