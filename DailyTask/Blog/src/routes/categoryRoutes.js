const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

router.get('/', categoryController.getAllCategories);

router.get('/tree', categoryController.getCategoryTree);

router.get('/:id', categoryController.getCategoryById);

router.post('/',
  authenticate,
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('分类名称不能为空').isLength({ max: 50 }),
    body('description').optional().trim().isLength({ max: 200 }),
    body('parent').optional().isMongoId(),
    body('order').optional().isInt({ min: 0 })
  ],
  validate,
  categoryController.createCategory
);

router.post('/:id/update',
  authenticate,
  authorize('admin'),
  [
    body('name').optional().trim().isLength({ max: 50 }),
    body('description').optional().trim().isLength({ max: 200 }),
    body('parent').optional().isMongoId(),
    body('order').optional().isInt({ min: 0 })
  ],
  validate,
  categoryController.updateCategory
);

router.post('/:id/delete', authenticate, authorize('admin'), categoryController.deleteCategory);

module.exports = router;