import express from 'express';
import path from 'path';

const app = express();

const options = {
  maxAge: '1d',
  etag: true,
  dotfiles: 'ignore',
};

const __dirname = import.meta.dirname

app.use(express.static(path.join(__dirname, 'public'), options));

app.listen(3333, () => console.log('server is running at http://localhost:3333'));

app.use((err, req, res, next) => {
  console.log(err);
  res.sned(500).json({ code: 500, message: '服务器错误' });
});
