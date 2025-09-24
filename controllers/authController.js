// controllers/authController.js
const Pharmacy = require('../models/Pharmacy');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new pharmacy
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    const { pharmacyName, email, password } = req.body;

    try {
        // Check if user already exists
        let pharmacy = await Pharmacy.findOne({ email });
        if (pharmacy) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create a new pharmacy instance
        pharmacy = new Pharmacy({
            pharmacyName,
            email,
            password
        });

        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        pharmacy.password = await bcrypt.hash(password, salt);

        await pharmacy.save();

        res.status(201).json({ success: true, message: 'Pharmacy registered successfully' });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Authenticate a pharmacy & get token
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const pharmacy = await Pharmacy.findOne({ email });
        if (!pharmacy) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Compare entered password with stored hashed password
        const isMatch = await bcrypt.compare(password, pharmacy.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // --- NEW: Generate two tokens ---
        const accessTokenPayload = { user: { id: pharmacy.id } };
        const refreshTokenPayload = { user: { id: pharmacy.id, isRefreshToken: true } };

        const accessToken = jwt.sign(accessTokenPayload, process.env.JWT_SECRET, { expiresIn: '15m' }); // Short-lived
        const refreshToken = jwt.sign(refreshTokenPayload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' }); // Long-lived

        // Store the refresh token in the user's session
        req.session.refreshToken = refreshToken;

        res.status(200).json({ success: true, token: accessToken }); // Only send the access token

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Refresh access token using session refresh token
// @route   POST /api/auth/refresh
exports.refreshToken = (req, res) => {
    const { refreshToken } = req.session;

    if (!refreshToken) {
        return res.status(401).json({ success: false, message: 'No refresh token in session' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const accessTokenPayload = { user: { id: decoded.user.id } };
        const newAccessToken = jwt.sign(accessTokenPayload, process.env.JWT_SECRET, { expiresIn: '15m' });

        res.status(200).json({ success: true, token: newAccessToken });

    } catch (err) {
        res.status(403).json({ success: false, message: 'Invalid refresh token' });
    }
};