const express = require('express');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  const userInfo = {
    name: '张三',
    age: '18',
    sex: '男',
    hobbies: ['吃饭', '睡觉', '打豆豆'],
  };
  res.render('index', { user:userInfo });
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
