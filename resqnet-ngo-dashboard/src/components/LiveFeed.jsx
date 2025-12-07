import React from 'react';

const LiveFeed = ({ reports }) => {
  // Safety check: if reports is null/undefined, make it an empty array
  const safeReports = reports || [];

  return (
    <div>
      <h3>Incoming Distress Signals</h3>
      {safeReports.length === 0 ? (
        <p>No active reports.</p>
      ) : (
        <ul>
          {safeReports.map((report, index) => (
            <li key={index} style={{ marginBottom: '10px', padding: '10px', background: 'white', borderRadius: '5px' }}>
              <strong>{report.type || 'SOS'}</strong>
              <br />
              <small>{report.status || 'Pending'}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LiveFeed;