## Mongoose 中间件

Mongoose中间件允许node在数据库操作的特定生命周期阶段，插入并执行自定义逻辑。

- Pre钩子：前置 数据预处理 验证
- 操作执行：数据库增删改查
- Post钩子：后置 日志记录 触发后续任务

### 中间件的四大类型

Mongoose中间件严格对应不同的操作类型，理解`this`指向哪里是中间件的关键
| 类型 | 触发场景 | `this` 指向 | 常用钩子方法 |
| :--- | :--- | :--- | :--- |
| Document 中间件 | 针对单个文档的操作（实例方法） | 当前文档实例 (可以直接修改字段) | `init`, `validate`, `save`, `remove` |
| Query 中间件 | 针对查询条件的操作（如 `find`, `update`） | Query 对象 (可以修改查询条件) | `find`, `findOne`, `updateOne`, `deleteOne` |
| Model 中间件 | 针对模型的操作 | Model 构造函数 | `insertMany` |
| Aggregate 中间件 | 针对聚合管道的操作 | Aggregate 对象 | `aggregate` |

#### 核心钩子：Pre和Post

1. Pre
   在操作执行之前运行
   - 用途：数据清洗、权限校验、修改查询条件、密码加密
   - 控制流
   - 如果是同步逻辑直接执行
   - 如果是异步逻辑，必须调用`next()`或者返回一个`Promise`(或使用`async/await`)
   - 如果抛出错误或`next(error)`，后续操作会被终止
2. Post
   在操作执行之后运行
   - 用途：记录日志、发送通知、清除缓存、格式化返回数据。
   - 控制流：
   - 通常用于事后诸葛亮操作
   - 在`post`钩子中修改文档不会触发数据库的再次保存(除非显示调用`save()`方法)
   - `post`钩子可以访问到操作的结果(如查询到的文档或更新的结果)

#### 常见场景与代码实战

<strong>Document 中间件 ———— 用户注册与密码加密</strong>
这是最经典的`save`钩子用法。我们希望在保存用户到数据库前，自动把明文密码变成哈希值。

```js
const userSchema = new Mongoose.Schema({
  username: String,
  password: String,
});

//Pre-save 钩子
userSchema.pre('save', async function (next) {
  //1.判断密码是否被修改过(避免更新其他字段时重复加密)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    //2.模拟异步加密操作
    // const hashed = await bcrypt.hash(this.password, 10)
    console.log('🔒 正在加密密码...');
    this.password = 'encrypted_' + this.password; //模拟加密结果
    next(); //3. 继续执行保存
  } catch (err) {
    next(err); //4.发生错误，中断保存
  }
});

//post-save钩子
userSchema.post('save', function (doc, next) {
  console.log(`✅ 用户 ${doc.username} 已成功保存到数据库`);
  next();
});
```

<strong>Document 中间件 ———— 自动过滤软删除数据</strong>
很多公司使用软删除(即数据库里有个`isDeleted`字段，但不真删)。可以使用Query中间件，让所有查询自动加上'只查未删除数据'的条件。

```js
const productSchema = new Mongoose.Schema({
  name: String,
  isDeleted: { type: Boolean, default: false },
});

//Pre-find钩子
productSchema.pre('find', function (next) {
  this.where({ isDeleted: false });
  console.log('自动过滤已删除的商品');
  next();
});
```

<strong>中间件 ———— 数据脱敏</strong>
查询出数据之后 在返回给前端之前，把敏感信息(如身份证，密码)去掉

```js
userSchema.post('find', function (docs, next) {
  docs.forEach(doc => {
    doc.password = undefined;
  });
  next();
});
```

### 钩子执行顺序

当调用`doc.save()`时，内部流程大致如下

1. `pre('save')` 钩子
2. 验证(Validation)
3. `post('validate')` 钩子
4. `post('save')` 钩子
5. 数据库写入
6. `post('save')` 钩子

### 避坑指南

1. 箭头函数陷阱：
   - 不要在中间件中使用箭头函数`()=>{}`
   - 原因：箭头函数不会绑定`this`,导致无法访问当前文档或查询对象。
2. 异步处理
   - 在`pre`钩子中，如果做异步操作(如查库、请求api),必须调用`next()`或者`return Promise`。否则Mongoose会认为已经执行完毕，直接进行下一步，导致数据不一致。
3. 区分Document和Query
   - `remobe()`既有Document钩子也有Query钩子
   - `doc.remove()`触发Document钩子
   - `Model.remove()`触发Query钩子
   - 如果需要兼容两者，需要分别定义。
4. hook必须在model定义之前定义 不然会注册失败
