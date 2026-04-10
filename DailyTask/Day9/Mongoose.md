## Mongoose模式定义和模型创建

- 模式是数据库的设计蓝图或规范。它定义了数据的结构、类型和规则。
- 模型是根据蓝图编译出来的构造函数，它代表数据库的一个集合，并提供了一系列方法来操作这个集合中的数据。

### 模式定义

模式是Mongoose中数据结构的体现，它为存储在MongoDB中的文档定义了一个模具

#### 为什么需要模具

- 强制执行结构:虽然MongoDB是无模式的，但模式能为数据提供清晰的结构，保证数据的一致性和完整性
- 内置数据验证:可以更方便的定义字段是否必填、数据类型、长度限制、自定义验证规则等，有效防止无效数据存入数据库
- 定义默认值和索引:可以为字段定义默认值，并轻松创建索引以优化查询性能

### 如何定义模式

使用 `new mongoose.Schema()` 创建模式对象。在定义中，可以制定字段名、数据类型以及各种配置选项。

```javascript
const mongoose = require('mongoose');

// 1. 定义一个用户模式 (Schema)
const userSchema = new mongoose.Schema({
  username: {
    type: String, // 数据类型：字符串
    required: true, // 必填字段
    minlength: 3, // 最小长度
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
```

### 模型创建
模型是基于模式编译出来的构造函数，充当MongoDB集合之间交互的桥梁

#### 为什么需要模型
- 操作集合的接口:模型提供了执行增删改查操作的所有方法，如find(),create().updateOne(),deleteOne()等
- 编译与缓存:当你创建一个模型时，Mongoose会将模式编译成一个高效的对象，并将其注册到内部缓存中，方便在应用的其他地方复用

### 怎么创建
使用`mongoose.model('ModelName', schema)`来创建一个模型