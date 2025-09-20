// 1. IMPORT DEPENDENCIES
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');

// 2. INITIALIZE APP & CONNECT TO DATABASE
const app = express();
connectDB();

// 3. SET UP MIDDLEWARE
app.use(express.json()); 
app.use(express.static('public'));

// 4. DEFINE API ROUTES

// --- Pharmacy Portal Routes ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// --- Patient App Routes (New) ---
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/medications', require('./routes/medicationRoutes'));
app.use('/api/health-tips', require('./routes/healthTipRoutes'));


// 5. START THE SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));