import express from 'express';
import connectDB from './config/db.js';
import productApi from './api/productApi.js';

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 连接数据库
connectDB();

// API路由
app.use('/api', productApi);

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({ message: '服务运行正常' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

export default app;