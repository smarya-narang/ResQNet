import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

// --- FIX LEAFLET ICONS (Standard Fix) ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- COMPONENT: Move Map to User ---
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
}

function App() {
  const [activeTab, setActiveTab] = useState('incidents');
  const [errorMsg, setErrorMsg] = useState(null);

  // 1. WEATHER STATE
  const [weather, setWeather] = useState({ 
    temp: '--', 
    condition: 'Loading...', 
    alert: null 
  }); 

  // 2. LOCATION STATE
  const [userLocation, setUserLocation] = useState({ lat: 26.9124, lng: 75.7873 });
  const [locationFound, setLocationFound] = useState(false);

  // 3. REPORTS STATE
  const [reports, setReports] = useState([]);
  
  // 4. RESOURCES STATE
  const [resources, setResources] = useState([
    { id: 1, name: 'Ambulance Alpha', type: 'Vehicle', status: 'Available' },
    { id: 2, name: 'Dr. Sharma', type: 'Personnel', status: 'Busy' },
  ]);

  // --- INITIALIZE DATA ON LOAD ---
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // A. SET MAP LOCATION
        setUserLocation({ lat, lng });
        setLocationFound(true);

        // B. FETCH REAL WEATHER
        const API_KEY = ""; // Your Key
        try {
          const wRes = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${API_KEY}`
          );
          const wData = await wRes.json();
          if (wData.cod === 200) {
            setWeather({
              temp: `${Math.round(wData.main.temp)}°C`,
              condition: wData.weather[0].main, 
              alert: null 
            });
          }
        } catch (error) {
          console.error("Weather API Error:", error);
          setWeather({ temp: '--', condition: 'Offline', alert: null });
        }

        // C. FETCH REPORTS FROM BACKEND (PORT 5001)
        try {
          console.log("Connecting to Backend...");
          const response = await fetch('http://localhost:5001/api/reports');
          
          if (!response.ok) {
            throw new Error("Backend connection failed");
          }

          const dbData = await response.json();
          console.log("DB Data:", dbData);

          if (dbData.length > 0) {
            setReports(dbData);
            setErrorMsg(null);
          } else {
            // If DB is empty, show a system ready message
            setReports([{ 
              id: 999, lat: lat + 0.002, lng: lng + 0.002, 
              type: 'System Online', status: 'Active', 
              description: 'Database connected. Waiting for reports.' 
            }]);
          }
        } catch (err) {
          console.error("BACKEND FAILED:", err);
          setErrorMsg("Using Simulation Data (Backend Offline)");
          // FALLBACK DATA so the app works for demo even if DB fails
          setReports([
             { id: 1, lat: lat + 0.01, lng: lng + 0.01, type: 'Simulated Fire', status: 'Pending', description: 'Demo Report: Server Offline' },
             { id: 2, lat: lat - 0.01, lng: lng - 0.01, type: 'Simulated Medical', status: 'Resolved', description: 'Demo Report: Server Offline' }
          ]);
        }

      }, (error) => console.error("GPS Error:", error));
    }
  }, []);

  // --- HANDLERS ---
  const toggleDisasterMode = () => {
    setWeather({ temp: '24°C', condition: 'Heavy Rain', alert: 'Red Alert: Flash Flood' });
    const newIncident = { 
      id: Date.now(), lat: userLocation.lat + 0.005, lng: userLocation.lng + 0.005, 
      type: 'Flood SOS', status: 'Pending', description: 'Water level rising rapidly!' 
    };
    setReports(prev => [newIncident, ...prev]);
    alert("⚠️ SIMULATION ACTIVATED: Red Alert Issued!");
  };

  const handleAddResource = () => {
    const newId = resources.length + 1;
    setResources([...resources, { id: newId, name: `Volunteer #${newId}`, type: 'Personnel', status: 'Available' }]);
  };

  const handleStatusChange = (id, newStatus) => {
    setReports(reports.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return '#d32f2f';
      case 'Active': return '#f57c00';
      case 'Resolved': return '#388e3c';
      default: return 'grey';
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', margin: 0, padding: 0, fontFamily: 'Segoe UI, sans-serif' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '400px', background: '#f8f9fa', borderRight: '1px solid #ccc', display: 'flex', flexDirection: 'column', zIndex: 1000, boxShadow: '2px 0 5px rgba(0,0,0,0.1)' }}>
        
        <div style={{ padding: '20px', background: '#fff', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ color: '#d32f2f', margin: 0 }}>ResQNet NGO</h2>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.75em', textTransform: 'uppercase', letterSpacing: '1px' }}>Tactical Command Center</p>
          </div>
          <button onClick={toggleDisasterMode} style={{ fontSize: '0.7em', padding: '5px 10px', background: '#ffcdd2', color: '#b71c1c', border: '1px solid #e57373', borderRadius: '4px', cursor: 'pointer' }}>
            🔴 SIMULATE
          </button>
        </div>

        {/* WEATHER WIDGET */}
        <div style={{ background: weather.alert ? '#b71c1c' : '#263238', color: 'white', padding: '15px', transition: 'background 0.5s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9em', opacity: 0.9 }}>📍 Local Forecast</span>
                <strong>{weather.temp}</strong>
            </div>
            <div style={{ marginTop: '5px', fontSize: '1.2em', fontWeight: 'bold' }}>
                {weather.condition}
            </div>
            {weather.alert && (
                <div style={{ marginTop: '10px', background: 'white', color: '#b71c1c', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em', fontWeight: 'bold', display: 'inline-block' }}>
                    ⚠️ {weather.alert}
                </div>
            )}
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', background: 'white', borderBottom: '1px solid #ccc' }}>
          <button onClick={() => setActiveTab('incidents')} style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'incidents' ? '#e3f2fd' : 'white', cursor: 'pointer', fontWeight: 'bold', color: activeTab === 'incidents' ? '#1976d2' : '#555', borderBottom: activeTab === 'incidents' ? '3px solid #1976d2' : 'none' }}>🚨 Incidents</button>
          <button onClick={() => setActiveTab('resources')} style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'resources' ? '#e3f2fd' : 'white', cursor: 'pointer', fontWeight: 'bold', color: activeTab === 'resources' ? '#1976d2' : '#555', borderBottom: activeTab === 'resources' ? '3px solid #1976d2' : 'none' }}>📦 Resources</button>
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#f4f6f8' }}>
          
          {/* BACKEND STATUS WARNING */}
          {errorMsg && (
            <div style={{ padding: '10px', marginBottom: '15px', background: '#fff3cd', color: '#856404', borderRadius: '4px', fontSize: '0.8em', border: '1px solid #ffeeba' }}>
              <strong>Note:</strong> {errorMsg}
            </div>
          )}

          {activeTab === 'incidents' && (
            <>
              {reports.map((r, index) => (
                <div key={r.id || index} style={{ marginBottom: '15px', padding: '15px', background: 'white', borderRadius: '8px', borderLeft: `5px solid ${getStatusColor(r.status)}`, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{fontSize: '1.1em'}}>{r.type}</strong>
                    <span style={{ fontSize: '0.8em', background: '#eee', padding: '2px 8px', borderRadius: '10px', color: '#555' }}>{r.status}</span>
                  </div>
                  <p style={{ fontSize: '0.9em', color: '#666', margin: '8px 0' }}>{r.description || 'No description'}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {r.status === 'Pending' && <button onClick={() => handleStatusChange(r.id, 'Active')} style={{ flex:1, background: '#1976d2', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}>Dispatch Team</button>}
                    {r.status === 'Active' && <button onClick={() => handleStatusChange(r.id, 'Resolved')} style={{ flex:1, background: '#388e3c', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}>Mark Resolved</button>}
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === 'resources' && (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <thead style={{ background: '#eceff1', color: '#37474f' }}>
                  <tr><th style={{ padding: '12px', textAlign: 'left' }}>Asset</th><th style={{ padding: '12px', textAlign: 'left' }}>Status</th></tr>
                </thead>
                <tbody>
                  {resources.map(res => (
                    <tr key={res.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>
                        <strong>{res.name}</strong><br/>
                        <span style={{ fontSize: '0.8em', color: '#888' }}>{res.type}</span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ color: res.status === 'Available' ? 'green' : 'orange', fontWeight: 'bold', fontSize: '0.9em' }}>{res.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={handleAddResource} style={{ marginTop: '20px', width: '100%', padding: '12px', background: '#455a64', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+ Add Resource</button>
            </>
          )}
        </div>
      </div>

      {/* MAP AREA */}
      <div style={{ flex: 1 }}>
        <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          <RecenterMap lat={userLocation.lat} lng={userLocation.lng} />

          {locationFound && (
             <Marker position={[userLocation.lat, userLocation.lng]}>
               <Popup>🔵 <strong>NGO HQ</strong><br/>You are here</Popup>
             </Marker>
          )}

          {reports.map((r, index) => (
             (r.lat && r.lng) ? (
              <Marker key={r.id || index} position={[r.lat, r.lng]}>
                <Popup>
                  <strong>{r.type}</strong><br/>Status: {r.status}
                </Popup>
              </Marker>
            ) : null
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default App;