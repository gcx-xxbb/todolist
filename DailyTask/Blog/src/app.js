require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const logger = require('./middlewares/logger');
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const { userRoutes, articleRoutes, commentRoutes, categoryRoutes, tagRoutes } = require('./routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '服务器运行正常',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);

app.use(notFound);

app.use(errorHandler);

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodb.uri);
    logger.info('MongoDB 数据库连接成功');
  } catch (error) {
    logger.error('MongoDB 数据库连接失败:', error);
    process.exit(1);
  }
};

const startServer = async () => {
  await connectDB();

  app.listen(config.port, () => {
    logger.info(`服务器运行在 http://localhost:${config.port}`);
    logger.info(`环境: ${config.env}`);
  });
};

process.on('unhandledRejection', (err) => {
  logger.error('未处理的 Promise 拒绝:', err);
});

process.on('uncaughtException', (err) => {
  logger.error('未捕获的异常:', err);
  process.exit(1);
});

if (require.main === module) {
  startServer();
}

module.exports = app;