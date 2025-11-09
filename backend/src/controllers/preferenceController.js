const Preference = require('../models/Preference');

exports.updatePreferences = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const data = req.body;
    const pref = await Preference.findOneAndUpdate({ user: userId }, { ...data, updatedAt: Date.now() }, { new: true, upsert: true });
    res.json(pref);
  } catch (err) { next(err); }
};

exports.getPreferences = async (req, res, next) => {
  try {
    const pref = await Preference.findOne({ user: req.params.id });
    res.json(pref);
  } catch (err) { next(err); }
};
