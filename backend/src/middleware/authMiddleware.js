const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('./errorMiddleware');

const authenticate = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Access denied. No token provided.', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Invalid token.', 401));
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Access denied. Insufficient permissions.', 403));
    }
    next();
  };
};

module.exports = { authenticate, authorize };