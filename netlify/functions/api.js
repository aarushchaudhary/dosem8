// 1. IMPORT DEPENDENCIES
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const serverless = require('serverless-http');
const connectDB = require('../../config/database'); // Adjusted path

// 2. INITIALIZE APP & CONNECT TO DATABASE
const app = express();
connectDB(); // Establish the database connection

// 3. SET UP MIDDLEWARE
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
}));

// 4. DEFINE API ROUTES
// Note: We use a router to prefix all routes with /api
const router = express.Router();

// --- PHARMACY PERSONNEL PORTAL API ROUTES ---
router.use('/auth', require('../../routes/authRoutes'));
router.use('/dashboard', require('../../routes/dashboardRoutes'));
router.use('/advertisements', require('../../routes/advertisementRoutes'));
router.use('/consultations', require('../../routes/consultationRoutes'));
router.use('/notifications', require('../../routes/notificationRoutes'));
router.use('/pharmacy/health-tips', require('../../routes/pharmacyHealthTipRoutes'));
router.use('/pharmacies', require('../../routes/pharmacyRoutes'));
router.use('/pharmacy-reports', require('../../routes/pharmacyReportRoutes'));

// --- PATIENT-FACING APP API ROUTES ---
router.use('/patient', require('../../routes/patientAuthRoutes'));
router.use('/user', require('../../routes/userRoutes'));
router.use('/medications', require('../../routes/medicationRoutes'));
router.use('/health-tips', require('../../routes/healthTipRoutes'));
router.use('/reports', require('../../routes/reportRoutes'));
router.use('/ai', require('../../routes/aiRoutes'));

// Mount the router on the /api path
app.use('/api', router);


// 5. EXPORT THE HANDLER FOR NETLIFY
// We no longer use app.listen()
module.exports.handler = serverless(app);