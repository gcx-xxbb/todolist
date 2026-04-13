import mongoose from 'mongoose';

const options = {
  maxPoolSize: 20,
  minPoolSize: 10,
  waitQueueTimeoutMS: 5000,
  socketTimeoutMS: 10000,
  autoIndex: true,
};

const connectDB = async () => {
  try {
    const conn = mongoose.connect('mongodb://localhost:27017/productStore', options);
    console.log(`数据库已连接：${conn}`);
  } catch (e) {
    console.error('X数据库连接失败', e);
    process.exit(1);
  }
};

export default connectDB;
