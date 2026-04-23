const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

router.get('/article/:articleId', commentController.getCommentsByArticle);

router.post('/',
  authenticate,
  [
    body('content').trim().notEmpty().withMessage('评论内容不能为空').isLength({ max: 1000 }),
    body('article').isMongoId().withMessage('文章ID无效'),
    body('parent').optional().isMongoId()
  ],
  validate,
  commentController.createComment
);

router.post('/:id/update',
  authenticate,
  [
    body('content').trim().notEmpty().withMessage('评论内容不能为空').isLength({ max: 1000 })
  ],
  validate,
  commentController.updateComment
);

router.post('/:id/delete', authenticate, commentController.deleteComment);

router.post('/:id/like', authenticate, commentController.likeComment);

module.exports = router;