const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

router.get('/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['draft', 'published']),
    query('search').optional().trim()
  ],
  validate,
  articleController.getAllArticles
);

router.get('/my', authenticate, articleController.getMyArticles);

router.get('/favorites', authenticate, articleController.getMyFavorites);

router.get('/:id', articleController.getArticleById);

router.post('/',
  authenticate,
  [
    body('title').trim().notEmpty().withMessage('标题不能为空').isLength({ max: 200 }),
    body('content').notEmpty().withMessage('内容不能为空'),
    body('status').optional().isIn(['draft', 'published']),
    body('tags').optional().isArray(),
    body('category').optional().isMongoId()
  ],
  validate,
  articleController.createArticle
);

router.post('/:id/update',
  authenticate,
  [
    body('title').optional().trim().isLength({ max: 200 }),
    body('content').optional().notEmpty(),
    body('status').optional().isIn(['draft', 'published']),
    body('tags').optional().isArray(),
    body('category').optional().isMongoId()
  ],
  validate,
  articleController.updateArticle
);

router.post('/:id/delete', authenticate, articleController.deleteArticle);

router.post('/:id/like', authenticate, articleController.likeArticle);

router.post('/:id/favorite', authenticate, articleController.favoriteArticle);

router.get('/:id/related', articleController.getRelatedArticles);

module.exports = router;