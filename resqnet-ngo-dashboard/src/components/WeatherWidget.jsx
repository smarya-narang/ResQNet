import React, { useState, useEffect } from 'react';

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    // 1. We use a timer to simulate an API call (prevents instant loop issues)
    const timer = setTimeout(() => {
      setWeather({ 
        temp: '28°C', 
        condition: 'Heavy Rain Alert', 
        warning: 'Red Alert' 
      });
    }, 1000);

    // 2. CLEANUP: Stops the timer if the component closes
    return () => clearTimeout(timer);
    
  }, []); // <--- CRITICAL: This empty array [] makes it run only ONCE.

  if (!weather) return <div style={{ padding: '10px' }}>Loading Weather...</div>;

  return (
    <div style={{ padding: '15px', background: '#e3f2fd', borderRadius: '8px', marginBottom: '10px' }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#0277bd' }}>Tactical Forecast</h4>
      
      {weather.warning && (
        <div style={{ 
          background: '#d32f2f', 
          color: 'white', 
          padding: '5px 10px', 
          borderRadius: '4px', 
          fontWeight: 'bold',
          marginBottom: '10px',
          fontSize: '0.9em'
        }}>
          ⚠️ {weather.warning}
        </div>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9em' }}>
        <span><strong>Condition:</strong> {weather.condition}</span>
        <span><strong>Temp:</strong> {weather.temp}</span>
      </div>
    </div>
  );
};

export default WeatherWidget;