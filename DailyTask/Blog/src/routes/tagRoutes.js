const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const tagController = require('../controllers/tagController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

router.get('/', tagController.getAllTags);

router.get('/slug/:slug', tagController.getTagBySlug);

router.get('/:id', tagController.getTagById);

router.post('/',
  authenticate,
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('标签名称不能为空').isLength({ max: 30 })
  ],
  validate,
  tagController.createTag
);

router.post('/:id/update',
  authenticate,
  authorize('admin'),
  [
    body('name').optional().trim().notEmpty().isLength({ max: 30 })
  ],
  validate,
  tagController.updateTag
);

router.post('/:id/delete', authenticate, authorize('admin'), tagController.deleteTag);

module.exports = router;