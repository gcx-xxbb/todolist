const { Category, Article } = require('../models');
const { AppError } = require('../middlewares/errorHandler');

exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);

    res.status(201).json({
      status: 'success',
      message: '分类创建成功',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find()
      .populate('parent', 'name')
      .sort({ order: 1, createdAt: -1 });

    const formattedCategories = await Promise.all(categories.map(async cat => ({
      ...cat.toObject(),
      articleCount: await Article.countDocuments({ category: cat._id }),
    })));

    res.status(200).json({
      status: 'success',
      results: formattedCategories.length,
      data: { categories: formattedCategories },
    });
  } catch (error) {
    next(error);
  }
};

exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).populate('parent', 'name');

    if (!category) {
      return next(new AppError('分类不存在', 404));
    }

    const articleCount = await Article.countDocuments({ category: category._id });

    res.status(200).json({
      status: 'success',
      data: {
        category: {
          ...category.toObject(),
          articleCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return next(new AppError('分类不存在', 404));
    }

    res.status(200).json({
      status: 'success',
      message: '分类更新成功',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

exports.getCategoryTree = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ order: 1, createdAt: -1 });

    const tree = buildCategoryTree(categories);

    res.status(200).json({
      status: 'success',
      data: { categories: tree }
    });
  } catch (error) {
    next(error);
  }
};

function buildCategoryTree(categories, parentId = null) {
  return categories
    .filter(cat => cat.parent?._id?.toString() === parentId || cat.parent?.toString() === parentId || (!parentId && !cat.parent))
    .map(cat => ({
      ...cat.toObject(),
      children: buildCategoryTree(categories, cat._id.toString())
    }));
}

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(new AppError('分类不存在', 404));
    }

    const hasChildren = await Category.findOne({ parent: category._id });
    if (hasChildren) {
      return next(new AppError('请先删除子分类', 400));
    }

    const hasArticles = await Article.findOne({ category: category._id });
    if (hasArticles) {
      await Article.updateMany({ category: category._id }, { $unset: { category: 1 } });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: '分类删除成功',
    });
  } catch (error) {
    next(error);
  }
};
