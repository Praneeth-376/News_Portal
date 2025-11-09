const jwt = require('jsonwebtoken');

exports.generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// a small summarizer helper if needed elsewhere
exports.simpleSummarize = (text, len = 200) => {
  if (!text) return '';
  return (text.length <= len) ? text : text.slice(0, len) + '...';
};
