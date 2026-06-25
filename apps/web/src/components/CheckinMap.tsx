"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Checkin {
  id: number;
  medico_nome: string;
  data_hora: string;
  latitude: number | null;
  longitude: number | null;
  distancia_hospital: number | null;
  is_valido: number;
  is_no_prazo: number;
  setor: string | null;
}

interface CheckinMapProps {
  checkins: Checkin[];
}

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Hospital location (example: São Paulo)
const HOSPITAL_LOCATION: [number, number] = [-23.5505, -46.6333];
const VALID_DISTANCE = 500; // meters

function FitCheckinBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) return;

    if (positions.length === 1) {
      map.setView(positions[0], 16);
      return;
    }

    map.fitBounds(positions, { padding: [40, 40], maxZoom: 16 });
  }, [map, positions]);

  return null;
}

export default function CheckinMap({ checkins }: CheckinMapProps) {
  const checkinsWithLocation = checkins.filter(
    (c) => c.latitude !== null && c.longitude !== null
  );
  const checkinPositions = checkinsWithLocation.map(
    (checkin) => [Number(checkin.latitude), Number(checkin.longitude)] as [number, number],
  );
  const initialCenter = checkinPositions[0] || HOSPITAL_LOCATION;

  // Create custom icons based on validation
  const createIcon = (isValid: number, isOnTime: number) => {
    const color = isValid === 1 ? (isOnTime === 1 ? "green" : "orange") : "red";
    return L.divIcon({
      className: "custom-marker",
      html: `
        <div style="
          background-color: ${color};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  return (
    <div className="h-[600px] rounded-lg overflow-hidden border">
      <MapContainer
        center={initialCenter}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <FitCheckinBounds positions={checkinPositions} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Hospital marker */}
        <Marker position={HOSPITAL_LOCATION}>
          <Popup>
            <div className="font-semibold">Hospital Central</div>
            <div className="text-sm text-muted-foreground">Localização de referência</div>
          </Popup>
        </Marker>

        {/* Valid distance circle */}
        <Circle
          center={HOSPITAL_LOCATION}
          radius={VALID_DISTANCE}
          pathOptions={{
            color: "blue",
            fillColor: "blue",
            fillOpacity: 0.1,
            weight: 2,
            dashArray: "5, 5",
          }}
        />

        {/* Check-in markers */}
        {checkinsWithLocation.map((checkin) => (
          <Marker
            key={checkin.id}
            position={[checkin.latitude!, checkin.longitude!]}
            icon={createIcon(checkin.is_valido, checkin.is_no_prazo)}
          >
            <Popup>
              <div className="space-y-1">
                <div className="font-semibold">{checkin.medico_nome}</div>
                <div className="text-sm">
                  {new Date(checkin.data_hora).toLocaleString("pt-BR")}
                </div>
                {checkin.setor && (
                  <div className="text-sm text-muted-foreground">{checkin.setor}</div>
                )}
                {checkin.distancia_hospital && (
                  <div className="text-sm">
                    Distância: {checkin.distancia_hospital.toFixed(0)}m
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      checkin.is_valido === 1
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {checkin.is_valido === 1 ? "Válido" : "Inválido"}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      checkin.is_no_prazo === 1
                        ? "bg-blue-100 text-blue-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {checkin.is_no_prazo === 1 ? "No prazo" : "Atrasado"}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
