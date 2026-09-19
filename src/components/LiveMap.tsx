import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";

const workerIcon = L.divIcon({
  className: "",
  html: `<span style="display:grid;place-items:center;width:34px;height:34px;border-radius:9999px;background:#2563EB;color:#fff;font:600 13px/1 'DM Sans',sans-serif;box-shadow:0 0 0 5px rgba(37,99,235,.22),0 6px 16px rgba(15,23,42,.35)">W</span>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const homeIcon = L.divIcon({
  className: "",
  html: `<span style="display:grid;place-items:center;width:30px;height:30px;border-radius:9999px;background:#10B981;color:#fff;font:600 12px/1 'DM Sans',sans-serif;box-shadow:0 0 0 5px rgba(16,185,129,.2),0 6px 16px rgba(15,23,42,.3)">H</span>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

function FitBounds({
  from,
  to,
}: {
  from: [number, number];
  to: [number, number];
}) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds([from, to]);
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 16 });
  }, [map, from[0], from[1], to[0], to[1]]);
  return null;
}

export default function LiveMap({
  from,
  to,
}: {
  from: [number, number];
  to: [number, number];
}) {
  return (
    <MapContainer
      center={[(from[0] + to[0]) / 2, (from[1] + to[1]) / 2]}
      zoom={15}
      scrollWheelZoom={false}
      zoomControl={false}
      attributionControl
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <Polyline
        positions={[from, to]}
        pathOptions={{
          color: "#2563EB",
          weight: 4,
          opacity: 0.9,
          dashArray: "1 9",
          lineCap: "round",
        }}
      />
      <Marker position={from} icon={workerIcon} />
      <Marker position={to} icon={homeIcon} />
      <FitBounds from={from} to={to} />
    </MapContainer>
  );
}
