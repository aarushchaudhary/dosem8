// controllers/userController.js
const User = require('../models/User');

// @desc    Get the profile for the logged-in user
// @route   GET /api/user/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
    try {
        // req.user.id is attached to the request by the auth middleware
        // We use .select('-password') to exclude the password hash from the response
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, data: user });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update the profile for the logged-in user
// @route   PUT /api/user/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
    // Destructure fields that are safe to update from the request body
    const { name, profileInfo, settings } = req.body;

    const updatedFields = {
        name,
        profileInfo,
        settings
    };

    try {
        // Find the user by ID and update their information
        // { new: true } ensures the updated document is returned
        const user = await User.findByIdAndUpdate(
            req.user.id,
            updatedFields,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, data: user });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};