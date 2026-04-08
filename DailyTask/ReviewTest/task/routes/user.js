import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// 模拟用户数据库
const users = [];
const JWT_SECRET = 'your-secret-key';

// 用户注册
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码不能为空' });
  }
  
  // 检查用户是否已存在
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(400).json({ message: '用户名已存在' });
  }
  
  // 创建新用户
  const newUser = {
    id: users.length + 1,
    username,
    password // 实际应用中应该加密存储
  };
  
  users.push(newUser);
  
  res.status(201).json({ message: '注册成功' });
});

// 用户登录
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码不能为空' });
  }
  
  // 查找用户
  const user = users.find(user => user.username === username && user.password === password);
  if (!user) {
    return res.status(401).json({ message: '用户名或密码错误' });
  }
  
  // 生成token
  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  
  res.json({ token, message: '登录成功' });
});

export default router;