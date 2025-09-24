// controllers/patientAuthController.js
const User = require('../models/User'); // <-- Uses the User model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new patient
// @route   POST /api/patient/register
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'A user with this email already exists' });
        }

        // Create a new user instance
        user = new User({
            name,
            email,
            password
        });

        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        res.status(201).json({ success: true, message: 'Patient registered successfully' });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Authenticate a patient & get token
// @route   POST /api/patient/login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Compare entered password with stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // User is valid, create a JWT payload
        const payload = {
            user: {
                id: user.id
            }
        };

        // Sign the token
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