const { Article, Comment, Tag } = require('../models');
const { AppError } = require('../middlewares/errorHandler');

exports.createArticle = async (req, res, next) => {
  try {
    const articleData = {
      ...req.body,
      author: req.user._id,
    };

    const article = await Article.create(articleData);
    await article.populate([{ path: 'author', select: 'username avatar' }, 'tags', 'category']);

    res.status(201).json({
      status: 'success',
      message: '文章创建成功',
      data: { article },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllArticles = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, category, tag, author, search } = req.query;
    const skip = (page - 1) * limit;

    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (author) query.author = author;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    // ========== 添加 explain() 来分析性能 ==========
    const explainResult = await Article.find(query)
      .populate([{ path: 'author', select: 'username avatar' }, 'tags', 'category'])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .explain('executionStats'); // ← 添加这一行

    console.log('===== 查询分析结果 =====');
    console.log('执行时间:', explainResult.executionStats.executionTimeMillis, 'ms');
    console.log('检查文档数:', explainResult.executionStats.totalDocsExamined);
    console.log('返回文档数:', explainResult.executionStats.nReturned);
    console.log('阶段:', explainResult.executionStats.executionStages.stage);
    console.log('使用的索引:', explainResult.executionStats.executionStages.indexName);
    console.log('========================');
    // ==================================================

    const [articles, total] = await Promise.all([
      Article.find(query)
        .populate([{ path: 'author', select: 'username avatar' }, 'tags', 'category'])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Article.countDocuments(query),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        articles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyFavorites = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      Article.find({ favorites: req.user._id })
        .populate([{ path: 'author', select: 'username avatar' }, 'tags', 'category'])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Article.countDocuments({ favorites: req.user._id }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        articles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getArticleById = async (req, res, next) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { returnDocument: 'after' },
    )
      .populate([
        { path: 'author', select: 'username avatar bio' },
        { path: 'tags' },
        { path: 'category' },
      ])
      .populate({
        path: 'comments',
        populate: [
          { path: 'author', select: 'username avatar' },
          { path: 'likes', select: 'username' },
        ],
      });

    if (!article) {
      return next(new AppError('文章不存在', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { article },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return next(new AppError('文章不存在', 404));
    }

    if (article.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('您没有权限修改此文章', 403));
    }

    const updatedArticle = await Article.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    }).populate(['author', 'tags', 'category']);

    res.status(200).json({
      status: 'success',
      message: '文章更新成功',
      data: { article: updatedArticle },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return next(new AppError('文章不存在', 404));
    }

    if (article.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('您没有权限删除此文章', 403));
    }

    await Comment.deleteMany({ article: article._id });
    await Article.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: '文章删除成功',
    });
  } catch (error) {
    next(error);
  }
};

exports.likeArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return next(new AppError('文章不存在', 404));
    }

    const userId = req.user._id;
    const isLiked = article.likes.includes(userId);

    if (isLiked) {
      article.likes = article.likes.filter(id => id.toString() !== userId.toString());
      article.likeCount = Math.max(0, article.likeCount - 1);
    } else {
      article.likes.push(userId);
      article.likeCount += 1;
    }

    await article.save();

    res.status(200).json({
      status: 'success',
      message: isLiked ? '取消点赞成功' : '点赞成功',
      data: { likeCount: article.likeCount, isLiked: !isLiked },
    });
  } catch (error) {
    next(error);
  }
};

exports.favoriteArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return next(new AppError('文章不存在', 404));
    }

    const userId = req.user._id;
    const isFavorited = article.favorites.includes(userId);

    if (isFavorited) {
      article.favorites = article.favorites.filter(id => id.toString() !== userId.toString());
      article.favoriteCount = Math.max(0, article.favoriteCount - 1);
    } else {
      article.favorites.push(userId);
      article.favoriteCount += 1;
    }

    await article.save();

    res.status(200).json({
      status: 'success',
      message: isFavorited ? '取消收藏成功' : '收藏成功',
      data: { favoriteCount: article.favoriteCount, isFavorited: !isFavorited },
    });
  } catch (error) {
    next(error);
  }
};

exports.getRelatedArticles = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return next(new AppError('文章不存在', 404));
    }

    const relatedArticles = await Article.find({
      _id: { $ne: article._id },
      status: 'published',
      $or: [{ tags: { $in: article.tags } }, { category: article.category }],
    })
      .populate([{ path: 'author', select: 'username avatar' }, 'tags', 'category'])
      .sort({ views: -1, createdAt: -1 })
      .limit(5);

    res.status(200).json({
      status: 'success',
      data: { articles: relatedArticles },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyArticles = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      Article.find({ author: req.user._id })
        .populate(['tags', 'category'])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Article.countDocuments({ author: req.user._id }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        articles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
