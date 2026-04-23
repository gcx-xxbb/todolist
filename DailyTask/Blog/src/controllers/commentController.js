const { Comment, Article } = require('../models');
const { AppError } = require('../middlewares/errorHandler');

exports.createComment = async (req, res, next) => {
  try {
    const { content, article: articleId, parent } = req.body;

    const article = await Article.findById(articleId);
    if (!article) {
      return next(new AppError('文章不存在', 404));
    }

    const comment = await Comment.create({
      content,
      article: articleId,
      author: req.user._id,
      parent: parent || null
    });

    await comment.populate([
      { path: 'author', select: 'username avatar' }
    ]);

    res.status(201).json({
      status: 'success',
      message: '评论创建成功',
      data: { comment }
    });
  } catch (error) {
    next(error);
  }
};

exports.getCommentsByArticle = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find({ article: req.params.articleId, isDeleted: false, parent: null })
        .populate([
          { path: 'author', select: 'username avatar' },
          { path: 'likes', select: 'username' }
        ])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Comment.countDocuments({ article: req.params.articleId, isDeleted: false, parent: null })
    ]);

    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({
          article: req.params.articleId,
          parent: comment._id,
          isDeleted: false
        })
          .populate([
            { path: 'author', select: 'username avatar' },
            { path: 'likes', select: 'username' }
          ])
          .sort({ createdAt: 1 });

        return {
          ...comment.toObject(),
          replies
        };
      })
    );

    res.status(200).json({
      status: 'success',
      data: {
        comments: commentsWithReplies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return next(new AppError('评论不存在', 404));
    }

    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('您没有权限修改此评论', 403));
    }

    comment.content = req.body.content || comment.content;
    await comment.save();

    await comment.populate([
      { path: 'author', select: 'username avatar' }
    ]);

    res.status(200).json({
      status: 'success',
      message: '评论更新成功',
      data: { comment }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return next(new AppError('评论不存在', 404));
    }

    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('您没有权限删除此评论', 403));
    }

    comment.isDeleted = true;
    await comment.save();

    await Comment.deleteMany({ parent: comment._id });

    res.status(200).json({
      status: 'success',
      message: '评论删除成功'
    });
  } catch (error) {
    next(error);
  }
};

exports.likeComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return next(new AppError('评论不存在', 404));
    }

    const userId = req.user._id;
    const isLiked = comment.likes.includes(userId);

    if (isLiked) {
      comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
      comment.likeCount = Math.max(0, comment.likeCount - 1);
    } else {
      comment.likes.push(userId);
      comment.likeCount += 1;
    }

    await comment.save();

    res.status(200).json({
      status: 'success',
      message: isLiked ? '取消点赞成功' : '点赞成功',
      data: { likeCount: comment.likeCount, isLiked: !isLiked }
    });
  } catch (error) {
    next(error);
  }
};