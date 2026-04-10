import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String, // 数据类型：字符串
    required: true, // 必填字段
    minlength: 1, // 最小长度
    maxlength: 20, // 最大长度
    trim: true, // 自动去除首尾空格
  },
  email: {
    type: String,
    required: true,
    unique: true, // 唯一索引，不允许重复
    lowercase: true, // 存储前自动转为小写
    match: [/^\S+@\S+\.\S+$/, '请输入有效的邮箱地址'], // 正则验证
  },
  age: {
    type: Number, // 数据类型：数字
    min: 18, // 最小值
    max: 100, // 最大值
  },
  isActive: {
    type: Boolean, // 数据类型：布尔值
    default: true, // 默认值
  },
  hobbies: [String], // 数据类型：字符串数组
  address: {
    // 数据类型：嵌套对象
    street: String,
    city: String,
  },
  createdAt: {
    type: Date, // 数据类型：日期
    default: Date.now, // 默认值为当前时间
  },
});

mongoose
  .connect('mongodb://localhost:27017/userStore')
  .then(() => {
    console.log('数据库连接成功');
  })
  .catch(() => {
    console.log('数据库连接失败');
  });

const User = mongoose.model('User', userSchema);

const user = new User({
  username: '张三',
  age: 18,
  email: 'zhangsan@example.com',
  address: {
    street: '北京',
    city: '北京',
  },
});

user.save().then(() => {
  console.log('用户保存成功');
});

User.findOne({ age: 18 }).then(user => {
  console.log(user);
});

User.updateOne({ username: '张三' }).then(() => {
  console.log('更新成功');
});

User.deleteOne({ username: '张三' }).then(() => {
  console.log('删除成功');
});

mongoose.connection.close();
