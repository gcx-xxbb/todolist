import express from 'express';

const app = express();

app.use(express.json());

const logger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
};

const auth = (req, res, next) => {
  if (req.headers.authorization === 'test123') {
    next();
  } else {
    res.status(401).send('用户未授权');
  }
};

app.use(logger);

app.get('/', (req, res) => {
  res.send('hello express');
});

app.get('/admin', auth, (req, res) => {
  res.send('管理后台');
});

app.get('/err', (req, res, next) => {
  setTimeout(() => {
    const error = new Error('模拟错误');
    next(error);
  }, 1000);
});

app.use((req, res) => {
  res.status(404).send('404 not found');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('服务异常');
});

app.listen(3333, () => console.log('server started on port 3333'));
