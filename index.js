// 1. IMPORT DEPENDENCIES
require('dotenv').config();
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
// ===================================
// --- PHARMACY PERSONNEL PORTAL API ROUTES ---
// ===================================
app.use('/api/auth', require('./routes/authRoutes')); // Handles pharmacy login/registration
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/advertisements', require('./routes/advertisementRoutes'));
app.use('/api/consultations', require('./routes/consultationRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// ===================================
// --- PATIENT-FACING APP API ROUTES ---
// ===================================
app.use('/api/patient', require('./routes/patientAuthRoutes')); // Handles patient login/registration
app.use('/api/user', require('./routes/userRoutes')); // Handles patient profile
app.use('/api/medications', require('./routes/medicationRoutes'));
app.use('/api/health-tips', require('./routes/healthTipRoutes'));
app.use('/api/reports', require('./routes/reportRoutes')); // Premium health reports
app.use('/api/ai', require('./routes/aiRoutes')); // Handles standard & premium AI for patients


// 5. START THE SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));