import express from 'express';

const app = express();

app.use(express.json());

app.get('/getData', (req, res, next) => {
  setTimeout(() => {
    next(new Error('模拟错误'));
  }, 1000);
});

const errorHandler = (err, req, res, next) => {
  if (res.headerSend) {
    return next(err);
  }

  //通用错误日志处理
  console.error('===============错误==============');
  console.error(`❌ 发生错误: ${err.message}`);
  console.error(`📍 来源路由: ${req.method} ${req.originalUrl}`);
  console.error(`📝 代码堆栈:\n${err.stack}`);
  console.error('=================================');

  //状态码处理
  const status = err.status || err.statusCode || 500;

  //环境隔离
  //开发环境：返回详细错误信息
  if (process.env.NODE_ENV === 'development') {
    res.status(status).json({
      success: false,
      message: err.message,
      stack: err.stack,
      path: req.originalUrl,
    });
  } else {
    res.status(status).json({
      success: false,
      message: status === 500 ? '系统繁忙，请稍后再试' : err.message,
      path: req.originalUrl,
    });
  }
};

app.use(errorHandler);

app.listen('3001', () => console.log('server is running at 3001'));
