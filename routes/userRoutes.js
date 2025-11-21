const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Update user profile
router.put('/profile', async (req, res) => {
  const { email, name, photoURL } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { email },
      { name, photoURL, email },
      { new: true, upsert: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
