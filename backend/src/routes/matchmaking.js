const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { 
  matchmakingValidation, 
  paginationValidation 
} = require('../middleware/validation');
const {
  joinQueue,
  leaveQueue,
  findMatch,
  getQueueStatus,
  getOnlineUsers
} = require('../controllers/matchmakingController');

// All routes require authentication
router.use(auth);

// Matchmaking
router.post('/join-queue', matchmakingValidation, joinQueue);
router.post('/leave-queue', leaveQueue);
router.post('/find-match', matchmakingValidation, findMatch);
router.get('/queue-status', getQueueStatus);
router.get('/online-users', paginationValidation, getOnlineUsers);

module.exports = router; 