import express from 'express';
import fs from 'fs';
import path from 'path';

const __dirname = import.meta.dirname;

const filePath = path.resolve(__dirname, '../user.json');

const getData = () => {
  return fs.readFileSync(filePath, 'utf-8');
};

let userList = JSON.parse(getData());

const addUser = user => {
  userList.push(user);
  fs.writeFileSync(filePath, JSON.stringify(userList));
};

const updateUser = (id, user) => {
  userList = userList.map(item => {
    if (item.id === id) {
      return { ...user, id };
    }
    return item;
  });
  fs.writeFileSync(filePath, JSON.stringify(userList));
};

const deleteUser = id => {
  userList = userList.filter(user => user.id !== id);
  fs.writeFileSync(filePath, JSON.stringify(userList));
};

const getUserInfo = id => {
  return userList.find(item => item.id === id);
};

const userRouter = express.Router();

//获取用户列表

userRouter.get('/', (req, res) => {
  res.render('index', { userList });
});

//用户详情
userRouter.get('/:id', (req, res) => {
  const id = Number(req.params.id);

  const user = getUserInfo(id);
  if (!user) {
    res.status(201).send('用户不存在');
  } else {
    res.send(`用户${user.name} 邮箱${user.email}`);
  }
});

userRouter.post('/', (req, res) => {
  let id = userList[userList.length - 1].id;
  if (req.body) {
    userList.push({ id: ++id, ...req.body });
  }
  fs.writeFileSync(filePath, JSON.stringify(userList));
  res.send('新增成功');
});

userRouter.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  updateUser(id, req.body);
  res.send('修改用户成功');
});

userRouter.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  deleteUser(id);
  res.send('删除用户成功');
});

export default userRouter;
