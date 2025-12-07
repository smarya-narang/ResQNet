import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import DisasterMap from '../components/DisasterMap';

// WE ARE DISABLING THESE FOR NOW TO STOP THE CRASH
// import LiveFeed from '../components/LiveFeed';
// import WeatherWidget from '../components/WeatherWidget';

// Connect to Port 5001
const socket = io('http://localhost:5001', { 
  transports: ['websocket', 'polling'] 
}); 

const Dashboard = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/reports');
        setReports(res.data);
      } catch (err) {
        console.error("Backend Error:", err);
      }
    };
    fetchReports();

    socket.on('new_report', (data) => {
      setReports(prev => [data, ...prev]);
    });
    
    return () => socket.off('new_report');
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      
      {/* Sidebar */}
      <div style={{ width: '350px', background: '#f8f9fa', padding: '20px', borderRight: '2px solid #ddd' }}>
        <h2 style={{ color: '#d32f2f' }}>ResQNet NGO</h2>
        <div style={{ padding: '10px', background: '#ffebee', color: '#c62828', borderRadius: '5px' }}>
          <strong>⚠️ DEBUG MODE</strong><br/>
          Widgets are disabled to fix the crash.
        </div>
        
        <h3>Reports Loaded: {reports.length}</h3>
        {/* <WeatherWidget /> */}
        {/* <LiveFeed reports={reports} /> */}
      </div>

      {/* Map Area */}
      <div style={{ flex: 1 }}>
        <DisasterMap reports={reports} />
      </div>
      
    </div>
  );
};

export default Dashboard;