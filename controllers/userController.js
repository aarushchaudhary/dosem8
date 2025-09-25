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
    // Destructure fields from the request body
    const { name, profileInfo } = req.body;

    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update fields if they were provided
        if (name) user.name = name;
        if (profileInfo) {
            user.profileInfo = { ...user.profileInfo, ...profileInfo };
        }

        const updatedUser = await user.save();

        res.status(200).json({ success: true, data: updatedUser });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
