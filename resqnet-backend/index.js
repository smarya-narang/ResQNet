const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();

// 1. SECURITY: Allow your React app to talk to this server
app.use(cors({ origin: "*" })); 
app.use(express.json());

// 2. DATABASE CONFIGURATION
// ⚠️ IMPORTANT: Change 'password' to your actual PostgreSQL password!
const pool = new Pool({
  user: 'aayushichhabra',
  host: 'localhost',
  database: 'ptycpfbevlsjgjghrpyj',
  password: 'aayushichhabra', 
  port: 5432,
});

// 3. API ROUTE: GET REPORTS
app.get('/api/reports', async (req, res) => {
  try {
    console.log("Received request for reports...");
    // Selects the latest 50 reports
    const result = await pool.query('SELECT * FROM reports ORDER BY created_at DESC LIMIT 50');
    console.log(`Found ${result.rows.length} reports in DB`);
    res.json(result.rows);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).send("Server Error");
  }
});

// 4. START SERVER (PORT 5001 to avoid Mac AirPlay conflict)
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`✅ RESQNET Backend is running on http://localhost:5001`);
});