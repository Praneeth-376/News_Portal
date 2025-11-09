const Article = require('../models/Article');
const Comment = require('../models/Comment');
const { summarizeText } = require('../utils/tokenUtils'); // we'll put summarize here for simplicity

exports.createArticle = async (req, res, next) => {
  try {
    const { title, content, author, source, categories, tags, url, imageUrl } = req.body;
    const summary = (content && content.length > 200) ? content.slice(0,200) + '...' : content;
    const article = new Article({ title, content, summary, author, source, categories, tags, url, imageUrl });
    await article.save();
    res.status(201).json(article);
  } catch (err) { next(err); }
};

exports.getArticles = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, q, category, tag } = req.query;
    const filter = {};
    if (q) filter.$or = [{ title: new RegExp(q,'i') }, { content: new RegExp(q,'i') }];
    if (category) filter.categories = category;
    if (tag) filter.tags = tag;
    const articles = await Article.find(filter)
      .sort({ publishedAt: -1 })
      .skip((page-1)*limit).limit(Number(limit));
    res.json(articles);
  } catch (err) { next(err); }
};

exports.getArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json(article);
  } catch (err) { next(err); }
};

exports.updateArticle = async (req, res, next) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(article);
  } catch (err) { next(err); }
};

exports.deleteArticle = async (req, res, next) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

// comments
exports.addComment = async (req, res, next) => {
  try {
    const comment = new Comment({ article: req.params.id, user: req.user._id, text: req.body.text, parent: req.body.parent });
    await comment.save();
    res.status(201).json(comment);
  } catch (err) { next(err); }
};

exports.getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ article: req.params.id }).populate('user', 'username').sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) { next(err); }
};

// react (like/dislike)
exports.react = async (req, res, next) => {
  try {
    const { type } = req.body;
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Not found' });
    const userId = req.user._id;
    article.likes = article.likes.filter(id => !id.equals(userId));
    article.dislikes = article.dislikes.filter(id => !id.equals(userId));
    if (type === 'like') article.likes.push(userId);
    if (type === 'dislike') article.dislikes.push(userId);
    await article.save();
    res.json({ likes: article.likes.length, dislikes: article.dislikes.length });
  } catch (err) { next(err); }
};
