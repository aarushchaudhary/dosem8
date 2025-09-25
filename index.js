// 1. IMPORT DEPENDENCIES
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const connectDB = require('./config/database');

// 2. INITIALIZE APP & CONNECT TO DATABASE
const app = express();
connectDB();

// 3. SET UP MIDDLEWARE
app.use(express.json());

// --- UPDATED SESSION MIDDLEWARE ---
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // Prevents empty sessions for non-logged-in users
    rolling: true, // Resets the session expiration on every request
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
}));

app.use(express.static('public'));

// 4. DEFINE API ROUTES
// ===================================
// --- PHARMACY PERSONNEL PORTAL API ROUTES ---
// ===================================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/advertisements', require('./routes/advertisementRoutes'));
app.use('/api/consultations', require('./routes/consultationRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/pharmacy/health-tips', require('./routes/pharmacyHealthTipRoutes'));
app.use('/api/pharmacies', require('./routes/pharmacyRoutes'));
app.use('/api/pharmacy-reports', require('./routes/pharmacyReportRoutes'));

// ===================================
// --- PATIENT-FACING APP API ROUTES ---
// ===================================
app.use('/api/patient', require('./routes/patientAuthRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/medications', require('./routes/medicationRoutes'));
app.use('/api/health-tips', require('./routes/healthTipRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// 5. START THE SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));