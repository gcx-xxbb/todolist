const { Tag, Article } = require('../models');
const { AppError } = require('../middlewares/errorHandler');

exports.createTag = async (req, res, next) => {
  try {
    const tag = await Tag.create(req.body);

    res.status(201).json({
      status: 'success',
      message: '标签创建成功',
      data: { tag }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllTags = async (req, res, next) => {
  try {
    const tags = await Tag.find().sort({ useCount: -1, name: 1 });

    const formattedTags = tags.map(tag => ({
      ...tag.toObject(),
      articleCount: tag.useCount
    }));

    res.status(200).json({
      status: 'success',
      results: formattedTags.length,
      data: { tags: formattedTags }
    });
  } catch (error) {
    next(error);
  }
};

exports.getTagById = async (req, res, next) => {
  try {
    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return next(new AppError('标签不存在', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { tag }
    });
  } catch (error) {
    next(error);
  }
};

exports.getTagBySlug = async (req, res, next) => {
  try {
    const tag = await Tag.findOne({ slug: req.params.slug });

    if (!tag) {
      return next(new AppError('标签不存在', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { tag }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTag = async (req, res, next) => {
  try {
    const tag = await Tag.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!tag) {
      return next(new AppError('标签不存在', 404));
    }

    res.status(200).json({
      status: 'success',
      message: '标签更新成功',
      data: { tag }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteTag = async (req, res, next) => {
  try {
    const tag = await Tag.findByIdAndDelete(req.params.id);

    if (!tag) {
      return next(new AppError('标签不存在', 404));
    }

    await Article.updateMany(
      { tags: tag._id },
      { $pull: { tags: tag._id } }
    );

    res.status(200).json({
      status: 'success',
      message: '标签删除成功'
    });
  } catch (error) {
    next(error);
  }
};