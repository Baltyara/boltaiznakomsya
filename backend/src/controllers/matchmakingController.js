const User = require('../models/User');
const redis = require('../config/redis');

const joinQueue = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lookingFor, ageRange, interests } = req.body;

    // Update user's online status
    await User.update(userId, { isOnline: true });

    // Store user in matchmaking queue
    const queueData = {
      userId,
      lookingFor,
      ageRange,
      interests,
      joinedAt: new Date().toISOString()
    };

    await redis.hSet('matchmaking_queue', userId, JSON.stringify(queueData));

    res.json({
      message: 'Вы добавлены в очередь поиска',
      queueData
    });
  } catch (error) {
    console.error('Join queue error:', error);
    res.status(500).json({
      error: 'Ошибка при добавлении в очередь',
      message: error.message
    });
  }
};

const leaveQueue = async (req, res) => {
  try {
    const userId = req.user.id;

    // Remove user from queue
    await redis.hDel('matchmaking_queue', userId);

    // Update user's online status
    await User.update(userId, { isOnline: false });

    res.json({
      message: 'Вы покинули очередь поиска'
    });
  } catch (error) {
    console.error('Leave queue error:', error);
    res.status(500).json({
      error: 'Ошибка при выходе из очереди',
      message: error.message
    });
  }
};

const findMatch = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lookingFor, ageRange, interests } = req.body;

    // Get all users in queue
    const queueData = await redis.hGetAll('matchmaking_queue');
    const potentialMatches = [];

    for (const [queuedUserId, userData] of Object.entries(queueData)) {
      if (queuedUserId === userId) continue;

      const parsedData = JSON.parse(userData);
      
      // Check if users are compatible
      if (isCompatibleMatch(
        { lookingFor, ageRange, interests },
        parsedData
      )) {
        const user = await User.findById(queuedUserId);
        if (user) {
          potentialMatches.push({
            ...user,
            compatibility: calculateCompatibility(interests, parsedData.interests)
          });
        }
      }
    }

    // Sort by compatibility and return best matches
    potentialMatches.sort((a, b) => b.compatibility - a.compatibility);

    res.json({
      matches: potentialMatches.slice(0, 5),
      totalFound: potentialMatches.length
    });
  } catch (error) {
    console.error('Find match error:', error);
    res.status(500).json({
      error: 'Ошибка при поиске совпадений',
      message: error.message
    });
  }
};

const getQueueStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user is in queue
    const queueData = await redis.hGet('matchmaking_queue', userId);
    
    if (!queueData) {
      return res.json({
        inQueue: false,
        message: 'Вы не в очереди'
      });
    }

    const parsedData = JSON.parse(queueData);
    const queueSize = await redis.hLen('matchmaking_queue');

    res.json({
      inQueue: true,
      queueData: parsedData,
      queueSize,
      waitTime: Date.now() - new Date(parsedData.joinedAt).getTime()
    });
  } catch (error) {
    console.error('Get queue status error:', error);
    res.status(500).json({
      error: 'Ошибка при получении статуса очереди',
      message: error.message
    });
  }
};

const getOnlineUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const onlineUsers = await User.getMatchmakingUsers(userId, {
      lookingFor: req.user.looking_for,
      interests: req.user.interests,
      ageRange: { min: 18, max: 60 }
    });

    res.json({
      onlineUsers: onlineUsers.slice(0, parseInt(limit)),
      totalOnline: onlineUsers.length
    });
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({
      error: 'Ошибка при получении онлайн пользователей',
      message: error.message
    });
  }
};

// Helper functions
const isCompatibleMatch = (user1, user2) => {
  // Check gender preferences
  if (user1.lookingFor !== 'both' && user1.lookingFor !== user2.gender) {
    return false;
  }
  if (user2.lookingFor !== 'both' && user2.lookingFor !== user1.gender) {
    return false;
  }

  // Check age range
  if (user1.ageRange) {
    const user2Age = user2.age || 25; // Default age if not provided
    if (user2Age < user1.ageRange.min || user2Age > user1.ageRange.max) {
      return false;
    }
  }

  return true;
};

const calculateCompatibility = (interests1, interests2) => {
  if (!interests1 || !interests2) return 0;
  
  const commonInterests = interests1.filter(interest => 
    interests2.includes(interest)
  );
  
  const totalInterests = Math.max(interests1.length, interests2.length);
  return totalInterests > 0 ? (commonInterests.length / totalInterests) * 100 : 0;
};

module.exports = {
  joinQueue,
  leaveQueue,
  findMatch,
  getQueueStatus,
  getOnlineUsers
}; 