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

        // User is valid, create a JWT payload
        const payload = {
            user: {
                id: pharmacy.id
            }
        };

        // Sign the token
        // Make sure to add JWT_SECRET to your .env file
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '8h' }, // Token expires in 8 hours (extended from 1 hour)
            (err, token) => {
                if (err) throw err;
                res.status(200).json({ success: true, token });
            }
        );

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};