const mongoose = require('mongoose');

const prefSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  topics: [String],
  sources: [String],
  language: { type: String, default: 'en' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Preference', prefSchema);
