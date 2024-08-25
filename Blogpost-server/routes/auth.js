const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');


router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const user = new User({ name, email, password });
        await user.save();

        const token = jwt.sign({ userId: user._id, name: user.name }, process.env.JWT_SECRET);
        res.status(201).json({ token });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        console.log(user)
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ userId: user._id, name: user.name }, process.env.JWT_SECRET);
        res.json({ token ,user});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
    const { name, email, profilePic, bio, contact } = req.body;

    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.name = name || user.name;
        user.email = email || user.email;
        user.profilePic = profilePic || user.profilePic;
        user.bio = bio || user.bio;
        user.contact = contact || user.contact;

        await user.save();
        res.json({ message: 'Profile updated successfully', user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
