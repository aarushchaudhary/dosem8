// index.js

// 1. IMPORT DEPENDENCIES
require('dotenv').config(); // Loads environment variables from .env file
const express = require('express');
const connectDB = require('./config/database');

// 2. INITIALIZE APP & CONNECT TO DATABASE
const app = express();
connectDB();

// 3. SET UP MIDDLEWARE
// This allows your app to accept JSON in request bodies
app.use(express.json()); 
// This serves all static files (HTML, CSS, client-side JS) from the 'public' folder
app.use(express.static('public'));

// 4. DEFINE API ROUTES
// All authentication-related routes will be prefixed with /api/auth
app.use('/api/auth', require('./routes/authRoutes'));
// All dashboard-related routes will be prefixed with /api/dashboard
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
// All AI-related routes will be prefixed with /api/ai
app.use('/api/ai', require('./routes/aiRoutes'));


// 5. START THE SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));