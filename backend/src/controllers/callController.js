const Call = require('../models/Call');
const User = require('../models/User');

const createCall = async (req, res) => {
  try {
    const { userId1, userId2, duration, rating, feedback, action } = req.body;

    // Verify both users exist
    const user1 = await User.findById(userId1);
    const user2 = await User.findById(userId2);

    if (!user1 || !user2) {
      return res.status(404).json({
        error: 'Один или оба пользователя не найдены'
      });
    }

    // Create call record
    const call = await Call.create({
      userId1,
      userId2,
      duration,
      rating,
      feedback,
      action
    });

    res.status(201).json({
      message: 'Звонок успешно создан',
      call
    });
  } catch (error) {
    console.error('Create call error:', error);
    res.status(500).json({
      error: 'Ошибка при создании звонка',
      message: error.message
    });
  }
};

const getUserCalls = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const userId = req.user.id;

    const calls = await Call.getUserCalls(userId, parseInt(limit), parseInt(offset));

    res.json({
      calls,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: calls.length
      }
    });
  } catch (error) {
    console.error('Get user calls error:', error);
    res.status(500).json({
      error: 'Ошибка при получении звонков',
      message: error.message
    });
  }
};

const getCallStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await Call.getCallStats(userId);

    res.json({
      stats
    });
  } catch (error) {
    console.error('Get call stats error:', error);
    res.status(500).json({
      error: 'Ошибка при получении статистики',
      message: error.message
    });
  }
};

const updateCallRating = async (req, res) => {
  try {
    const { callId } = req.params;
    const { rating, feedback } = req.body;

    const updatedCall = await Call.updateRating(callId, rating, feedback);

    if (!updatedCall) {
      return res.status(404).json({
        error: 'Звонок не найден'
      });
    }

    res.json({
      message: 'Оценка успешно обновлена',
      call: updatedCall
    });
  } catch (error) {
    console.error('Update call rating error:', error);
    res.status(500).json({
      error: 'Ошибка при обновлении оценки',
      message: error.message
    });
  }
};

const getRecentMatches = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 5 } = req.query;

    const matches = await Call.getRecentMatches(userId, parseInt(limit));

    res.json({
      matches
    });
  } catch (error) {
    console.error('Get recent matches error:', error);
    res.status(500).json({
      error: 'Ошибка при получении недавних совпадений',
      message: error.message
    });
  }
};

const getLikedUsers = async (req, res) => {
  try {
    const userId = req.user.id;

    const likedUsers = await Call.getLikedUsers(userId);

    res.json({
      likedUsers
    });
  } catch (error) {
    console.error('Get liked users error:', error);
    res.status(500).json({
      error: 'Ошибка при получении понравившихся пользователей',
      message: error.message
    });
  }
};

const getCallById = async (req, res) => {
  try {
    const { callId } = req.params;
    const call = await Call.findById(callId);

    if (!call) {
      return res.status(404).json({
        error: 'Звонок не найден'
      });
    }

    // Check if user is authorized to view this call
    if (call.user_id_1 !== req.user.id && call.user_id_2 !== req.user.id) {
      return res.status(403).json({
        error: 'Нет доступа к этому звонку'
      });
    }

    res.json({
      call
    });
  } catch (error) {
    console.error('Get call by id error:', error);
    res.status(500).json({
      error: 'Ошибка при получении звонка',
      message: error.message
    });
  }
};

module.exports = {
  createCall,
  getUserCalls,
  getCallStats,
  updateCallRating,
  getRecentMatches,
  getLikedUsers,
  getCallById
}; 