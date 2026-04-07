import express from 'express';
import userRouter from './routes/user.js';
import ArticleRouter from './routes/article.js';
import path from 'path';

const __dirname = import.meta.dirname;

const app = express();

app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const checkUserInfo = (req, res, next) => {
  if (!req.headers.userinfo) {
    res.status(401).send('用户未登录');
		return
  }
  const userInfo = req.headers.userinfo;
  try {
    const user = JSON.parse(userInfo);
    function validateUserQuick(user) {
      const { username, email, password } = user;
      const errors = [];

      // 验证用户名
      if (
        !username ||
        typeof username !== 'string' ||
        username.trim().length < 3 ||
        username.trim().length > 20
      ) {
        errors.push('用户名必须为3-20个字符');
      }

      // 验证邮箱
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email.trim())) {
        errors.push('邮箱格式不正确');
      }

      // 验证密码
      if (!password || password.length < 6) {
        errors.push('密码至少需要6位');
      }

      return errors.length === 0 ? null : errors;
    }
    if (validateUserQuick(user)) {
      res.status(401).send('用户信息不全');
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
};

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

app.use('/user', userRouter);
app.use('/art', checkUserInfo, ArticleRouter);
app.use(errorHandler);

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
