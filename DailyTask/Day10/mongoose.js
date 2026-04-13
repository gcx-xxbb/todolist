import mongoose from 'mongoose';

const options = {
  maxPoolSize: 20,
  minPoolSize: 10,
  waitQueueTimeoutMS: 5000,
  socketTimeoutMS: 10000,
};

mongoose.connect('mongodb://localhost:27017/productStore', options).then(() => {
  console.log('数据库连接成功');
});

mongoose.connection.close().then(() => {
  console.log('数据库关闭');
});
