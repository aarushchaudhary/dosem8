// 1. IMPORT DEPENDENCIES
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const serverless = require('serverless-http');
const connectDB = require('../../config/database'); // Adjusted path
const MongoStore = require('connect-mongo'); // Import MongoStore for persistent sessions

// 2. INITIALIZE APP & CONNECT TO DATABASE
const app = express();
connectDB(); // Establish the database connection

// 3. SET UP MIDDLEWARE
app.use(express.json());

// --- UPDATED SESSION MIDDLEWARE ---
// This now stores sessions in MongoDB, making them persistent for serverless functions.
// This is the key fix for the infinite refresh loop on Netlify.
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // Don't create session until something is stored
    rolling: true, // Reset the session maxAge on every request
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions' // Optional: name for the sessions collection
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Set to true in production (HTTPS)
        httpOnly: true, // Prevents client-side JS from accessing the cookie
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

// Mount the router on the /api path, which Netlify will handle
app.use('/api', router);


// 5. EXPORT THE HANDLER FOR NETLIFY
// This wraps the Express app so it can be used by Netlify Functions
module.exports.handler = serverless(app);
