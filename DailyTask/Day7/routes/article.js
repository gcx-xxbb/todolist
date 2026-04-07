import express from 'express';

const ArticleRouter = express.Router();

ArticleRouter.get('/', (req, res) => {
  res.send('文章列表');
});

export default ArticleRouter;
