import express from 'express';

const userRouter = express.Router();

let users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin',
  },
  {
    id: 2,
    username: 'user',
    password: 'user',
  },
];

userRouter.get('/', (req, res) => {
  res.json(users);
});

userRouter.get('/:id', (req, res) => {
  const user = users.find(user => user.id === parseInt(req.params.id));
  if (!user) {
    res.status(404).send('用户不存在');
  } else {
    res.json(user);
  }
});

userRouter.post('/', (req, res) => {
  const newUser = {
    id: ++users.length,
    username: req.body.username,
    password: req.body.password,
  };
  users.push(newUser);
  res.status(201).send('新用户创建成功');
});

userRouter.delete('/:id', (req, res) => {
  const id = req.params.id;
  const index = users.findIndex(user => user.id === parseInt(id));
  if (index === -1) {
    res.status(404).send('用户不存在');
  } else {
    users.splice(index, 1);
    res.status(204).send('用户删除成功');
  }
});

export default userRouter;