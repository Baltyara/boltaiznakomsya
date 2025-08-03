const express = require('express');
const router = express.Router();
const { auth, optionalAuth } = require('../middleware/auth');
const { 
  updateProfileValidation, 
  preferencesValidation,
  paginationValidation,
  userIdValidation,
  reportUserValidation
} = require('../middleware/validation');
const {
  getProfile,
  updateProfile,
  updatePreferences,
  deleteAccount,
  reportUser
} = require('../controllers/authController');

// Protected routes
router.use(auth);

router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, updateProfile);
router.put('/preferences', preferencesValidation, updatePreferences);
router.delete('/account', deleteAccount);

// User reporting
router.post('/:userId/report', userIdValidation, reportUserValidation, reportUser);

module.exports = router; 