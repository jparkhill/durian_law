const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Create default admin user
router.post('/create-admin', async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@mycase.local' });
    if (existingAdmin) {
      return res.json({ message: 'Admin user already exists' });
    }

    // Create admin user
    const admin = new User({
      email: 'admin@mycase.local',
      password: 'admin123',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin'
    });

    await admin.save();
    
    res.json({ 
      message: 'Admin user created successfully',
      email: 'admin@mycase.local',
      password: 'admin123'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create admin user' });
  }
});

module.exports = router;