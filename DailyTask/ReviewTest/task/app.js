import express from 'express';
import jwt from 'jsonwebtoken';
import userRouter from './routes/user.js';
import taskRouter from './routes/task.js';

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-secret-key';

// 中间件
app.use(express.json());

// 身份验证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: '访问令牌缺失' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: '访问令牌无效' });
    }
    
    req.user = user;
    next();
  });
};

// 路由配置
app.use('/api/users', userRouter);
app.use('/api/tasks', authenticateToken, taskRouter);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('错误:', err);
  res.status(500).json({
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : '未知错误'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log('API 端点:');
  console.log('  POST /api/users/register - 用户注册');
  console.log('  POST /api/users/login - 用户登录');
  console.log('  POST /api/tasks - 创建任务');
  console.log('  GET /api/tasks - 获取所有任务');
  console.log('  GET /api/tasks/:id - 获取单个任务');
  console.log('  PUT /api/tasks/:id - 更新任务');
  console.log('  DELETE /api/tasks/:id - 删除任务');
});