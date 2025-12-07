import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons in React
import L from 'leaflet';
// You'll need to import marker images here or use a CDN

const DisasterMap = ({ reports }) => {
  // Center map on a default location (e.g., your target district)
  const defaultPosition = [28.6139, 77.2090]; // Example: New Delhi

  return (
    <MapContainer center={defaultPosition} zoom={13} style={{ height: "100%", width: "100%" }}>
      {/* Using OpenStreetMap as per Source 14 */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Render Markers for Distress Reports */}
      {reports.map((report) => (
        <Marker key={report.id} position={[report.lat, report.lng]}>
          <Popup>
            <strong>Type: {report.type}</strong><br />
            Status: {report.status} <br />
            {/* Link to media as per Source 38 */}
            <a href={report.mediaLink}>View Media</a>
          </Popup>
        </Marker>
      ))}
      
      {/* Note: For clustering[cite: 65], you would wrap Markers in a 
          <MarkerClusterGroup> component from 'react-leaflet-cluster' */}
    </MapContainer>
  );
};

export default DisasterMap;