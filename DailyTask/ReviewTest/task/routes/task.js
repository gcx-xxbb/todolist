import express from 'express';

const router = express.Router();

// 模拟任务数据库
const tasks = [];

// 创建任务
router.post('/', (req, res) => {
  const { title, description, status = '待办' } = req.body;
  
  if (!title) {
    return res.status(400).json({ message: '任务标题不能为空' });
  }
  
  // 验证状态值
  const validStatuses = ['待办', '进行中', '已完成'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: '无效的任务状态' });
  }
  
  // 创建新任务
  const newTask = {
    id: tasks.length + 1,
    title,
    description,
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  tasks.push(newTask);
  
  res.status(201).json(newTask);
});

// 获取所有任务
router.get('/', (req, res) => {
  res.json(tasks);
});

// 获取单个任务
router.get('/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(task => task.id === taskId);
  
  if (!task) {
    return res.status(404).json({ message: '任务不存在' });
  }
  
  res.json(task);
});

// 更新任务
router.put('/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(task => task.id === taskId);
  
  if (!task) {
    return res.status(404).json({ message: '任务不存在' });
  }
  
  const { title, description, status } = req.body;
  
  // 验证状态值
  if (status) {
    const validStatuses = ['待办', '进行中', '已完成'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: '无效的任务状态' });
    }
  }
  
  // 更新任务
  if (title) task.title = title;
  if (description) task.description = description;
  if (status) task.status = status;
  task.updatedAt = new Date().toISOString();
  
  res.json(task);
});

// 删除任务
router.delete('/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  
  if (taskIndex === -1) {
    return res.status(404).json({ message: '任务不存在' });
  }
  
  tasks.splice(taskIndex, 1);
  
  res.json({ message: '任务删除成功' });
});

export default router;