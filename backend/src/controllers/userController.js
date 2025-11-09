const User = require('../models/User');
const Article = require('../models/Article');

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) { next(err); }
};

exports.getUser = async (req, res, next) => {
  try {
    const u = await User.findById(req.params.id).select('-password');
    if (!u) return res.status(404).json({ message: 'User not found' });
    res.json(u);
  } catch (err) { next(err); }
};

exports.updateUser = async (req, res, next) => {
  try {
    const updates = {};
    ['username','email'].forEach(k => { if (req.body[k]) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) { next(err); }
};

// bookmarks
exports.addBookmark = async (req, res, next) => {
  try {
    const user = req.user;
    const { articleId } = req.params;
    if (!user.bookmarks.includes(articleId)) {
      user.bookmarks.push(articleId);
      await user.save();
    }
    res.json(user.bookmarks);
  } catch (err) { next(err); }
};

exports.getBookmarks = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('bookmarks');
    res.json(user.bookmarks || []);
  } catch (err) { next(err); }
};
