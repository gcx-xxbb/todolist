import express from 'express';
const router = express.Router();

const checkLogin = (req, res, next) => {
  if (req.query.userId) {
    console.log(`用户${req.query.userId}已登录`);

    next();
  } else {
    res.status(401).send('用户未登录');
  }
};

router.post('/login', (req, res) => {
  res.send('登录成功');
});

router.get('/profile', checkLogin, (req, res) => {
  res.send(`用户${req.query.userId}的资料`);
});

export default router;
