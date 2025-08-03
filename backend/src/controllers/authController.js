const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { createRequestLogger } = require('../utils/logger');
const { 
  authAttemptsTotal, 
  userRegistrationsTotal, 
  activeUsers,
  errorsTotal,
  userReportsTotal
} = require('../utils/metrics');

const register = async (req, res) => {
  const reqLogger = createRequestLogger(req);
  
  try {
    const { email, password } = req.body;

    reqLogger.info('Registration attempt', { email });

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      reqLogger.warn('Registration failed - user already exists', { email });
      authAttemptsTotal.labels('register', 'failure').inc();
      userRegistrationsTotal.labels('failure').inc();
      return res.status(400).json({
        error: 'Пользователь с таким email уже существует'
      });
    }

    // Set default values for required fields
    const userData = {
      name: 'Пользователь', // Default name
      email,
      password,
      age: 25, // Default age
      gender: 'male', // Default gender
      interests: ['general'], // Default interest
      location: 'Не указан', // Default location
      aboutMe: '' // Default empty description
    };

    // Create new user
    const user = await User.create(userData);

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response and map database fields to frontend format
    const { password: _, about_me, looking_for, notification_settings, ...userWithoutPassword } = user;

    reqLogger.info('User registered successfully', { userId: user.id, email });
    
    // Обновляем метрики
    authAttemptsTotal.labels('register', 'success').inc();
    userRegistrationsTotal.labels('success').inc();

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user: {
        ...userWithoutPassword,
        aboutMe: about_me || '',
        lookingFor: looking_for || 'both',
        notificationSettings: notification_settings || {}
      },
      token
    });
  } catch (error) {
    reqLogger.error('Registration error', { 
      error: error.message, 
      stack: error.stack,
      email: req.body.email 
    });
    
    // Обновляем метрики ошибок
    authAttemptsTotal.labels('register', 'failure').inc();
    userRegistrationsTotal.labels('failure').inc();
    errorsTotal.labels('auth', 'high').inc();
    
    res.status(500).json({
      error: 'Ошибка при регистрации',
      message: error.message
    });
  }
};

const login = async (req, res) => {
  const reqLogger = createRequestLogger(req);
  
  try {
    const { email, password } = req.body;

    reqLogger.info('Login attempt', { email });

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      reqLogger.warn('Login failed - user not found', { email });
      authAttemptsTotal.labels('login', 'failure').inc();
      return res.status(401).json({
        error: 'Неверный email или пароль'
      });
    }

    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password);
    if (!isValidPassword) {
      reqLogger.warn('Login failed - invalid password', { email });
      authAttemptsTotal.labels('login', 'failure').inc();
      return res.status(401).json({
        error: 'Неверный email или пароль'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response and map database fields to frontend format
    const { password: _, about_me, looking_for, notification_settings, ...userWithoutPassword } = user;

    reqLogger.info('User logged in successfully', { userId: user.id, email });
    
    // Обновляем метрики
    authAttemptsTotal.labels('login', 'success').inc();

    res.json({
      message: 'Успешный вход',
      user: {
        ...userWithoutPassword,
        aboutMe: about_me || '',
        lookingFor: looking_for || 'both',
        notificationSettings: notification_settings || {}
      },
      token
    });
  } catch (error) {
    reqLogger.error('Login error', { 
      error: error.message, 
      stack: error.stack,
      email: req.body.email 
    });
    res.status(500).json({
      error: 'Ошибка при входе',
      message: error.message
    });
  }
};

const getProfile = async (req, res) => {
  const reqLogger = createRequestLogger(req);
  
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      reqLogger.warn('Profile not found', { userId: req.user.id });
      return res.status(404).json({
        error: 'Пользователь не найден'
      });
    }

    // Remove password from response and map database fields to frontend format
    const { password: _, about_me, looking_for, notification_settings, ...userWithoutPassword } = user;

    reqLogger.debug('Profile retrieved', { userId: req.user.id });

    res.json({
      user: {
        ...userWithoutPassword,
        aboutMe: about_me || '',
        lookingFor: looking_for || 'both',
        notificationSettings: notification_settings || {}
      }
    });
  } catch (error) {
    reqLogger.error('Get profile error', { 
      error: error.message, 
      stack: error.stack,
      userId: req.user.id 
    });
    res.status(500).json({
      error: 'Ошибка при получении профиля',
      message: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  const reqLogger = createRequestLogger(req);
  
  try {
    const updateData = req.body;
    const user = await User.update(req.user.id, updateData);

    if (!user) {
      reqLogger.warn('Profile update failed - user not found', { userId: req.user.id });
      return res.status(404).json({
        error: 'Пользователь не найден'
      });
    }

    // Map database fields to frontend format
    const { about_me, looking_for, notification_settings, ...userWithoutSpecialFields } = user;

    reqLogger.info('Profile updated successfully', { 
      userId: req.user.id,
      updatedFields: Object.keys(updateData)
    });

    res.json({
      message: 'Профиль успешно обновлен',
      user: {
        ...userWithoutSpecialFields,
        aboutMe: about_me || '',
        lookingFor: looking_for || 'both',
        notificationSettings: notification_settings || {}
      }
    });
  } catch (error) {
    reqLogger.error('Update profile error', { 
      error: error.message, 
      stack: error.stack,
      userId: req.user.id 
    });
    res.status(500).json({
      error: 'Ошибка при обновлении профиля',
      message: error.message
    });
  }
};

const updatePreferences = async (req, res) => {
  const reqLogger = createRequestLogger(req);
  
  try {
    const { lookingFor, notificationSettings } = req.body;
    const preferences = await User.updatePreferences(req.user.id, {
      lookingFor,
      notificationSettings
    });

    reqLogger.info('Preferences updated successfully', { 
      userId: req.user.id,
      lookingFor,
      hasNotificationSettings: !!notificationSettings
    });

    res.json({
      message: 'Настройки успешно обновлены',
      preferences
    });
  } catch (error) {
    reqLogger.error('Update preferences error', { 
      error: error.message, 
      stack: error.stack,
      userId: req.user.id 
    });
    res.status(500).json({
      error: 'Ошибка при обновлении настроек',
      message: error.message
    });
  }
};

const deleteAccount = async (req, res) => {
  const reqLogger = createRequestLogger(req);
  
  try {
    const deletedUser = await User.delete(req.user.id);
    
    if (!deletedUser) {
      reqLogger.warn('Account deletion failed - user not found', { userId: req.user.id });
      return res.status(404).json({
        error: 'Пользователь не найден'
      });
    }

    reqLogger.info('Account deleted successfully', { userId: req.user.id });

    res.json({
      message: 'Аккаунт успешно удален'
    });
  } catch (error) {
    reqLogger.error('Delete account error', { 
      error: error.message, 
      stack: error.stack,
      userId: req.user.id 
    });
    res.status(500).json({
      error: 'Ошибка при удалении аккаунта',
      message: error.message
    });
  }
};

const reportUser = async (req, res) => {
  const reqLogger = createRequestLogger(req);
  
  try {
    const { userId } = req.params;
    const { reason, description } = req.body;
    const reporterId = req.user.id;

    reqLogger.info('User report attempt', { 
      reporterId, 
      reportedUserId: userId, 
      reason 
    });

    // Check if user is trying to report themselves
    if (userId === reporterId) {
      reqLogger.warn('User tried to report themselves', { userId });
      return res.status(400).json({
        error: 'Нельзя пожаловаться на самого себя'
      });
    }

    // Check if reported user exists
    const reportedUser = await User.findById(userId);
    if (!reportedUser) {
      reqLogger.warn('Report failed - reported user not found', { reportedUserId: userId });
      return res.status(404).json({
        error: 'Пользователь не найден'
      });
    }

    // Check if user already reported this user
    const existingReport = await User.findReport(reporterId, userId);
    if (existingReport) {
      reqLogger.warn('User already reported this user', { 
        reporterId, 
        reportedUserId: userId 
      });
      return res.status(400).json({
        error: 'Вы уже жаловались на этого пользователя'
      });
    }

    // Create report
    const report = await User.createReport({
      reporterId,
      reportedUserId: userId,
      reason,
      description: description || ''
    });

    reqLogger.info('User report created successfully', { 
      reportId: report.id,
      reporterId, 
      reportedUserId: userId, 
      reason 
    });
    
    // Обновляем метрики
    userReportsTotal.labels(reason).inc();

    res.status(201).json({
      message: 'Жалоба успешно отправлена',
      report: {
        id: report.id,
        reason: report.reason,
        createdAt: report.created_at
      }
    });
  } catch (error) {
    reqLogger.error('Report user error', { 
      error: error.message, 
      stack: error.stack,
      reporterId: req.user.id,
      reportedUserId: req.params.userId
    });
    res.status(500).json({
      error: 'Ошибка при отправке жалобы',
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  updatePreferences,
  deleteAccount,
  reportUser
}; 