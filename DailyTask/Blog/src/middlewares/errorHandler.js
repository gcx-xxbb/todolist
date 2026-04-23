const logger = require('./logger');
const config = require('../config');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error({
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  if (err.name === 'CastError') {
    err.message = '资源不存在';
    err.statusCode = 404;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err.message = `${field}已存在`;
    err.statusCode = 400;
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    err.message = messages.join(', ');
    err.statusCode = 400;
  }

  if (err.name === 'JsonWebTokenError') {
    err.message = '无效的令牌，请重新登录';
    err.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    err.message = '令牌已过期，请重新登录';
    err.statusCode = 401;
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(config.env === 'development' && { stack: err.stack })
  });
};

const notFound = (req, res, next) => {
  const err = new AppError(`无法找到 ${req.originalUrl} 这个路径`, 404);
  next(err);
};

module.exports = { AppError, errorHandler, notFound };