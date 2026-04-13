## Mongoose深入

### 连接字符串

连接字符串是连接数据库的“地址”，它本身包含了很多重要配置参数。基本格式如下：

```text
mongodb://[username:password@]host1[:port1][,host2[:port2],...]/[database][?options]
```

对于MongoDB Atals等云服务，通常使用`mongodb+srv://`协议，它会自动发现集群中的所有节点。

#### 常用URL参数

这些参数直接附着在连接字符串的末尾，用`?`开始，多个参数使用`&`连接。
| 参数 | 说明 | 示例 |
| :--- | :--- | :--- |
| `authSource` | 指定用于身份验证的数据库。通常用户信息存储在 `admin` 数据库中。 | `?authSource=admin` |
| `replicaSet` | 指定要连接的副本集名称，用于实现高可用。 | `?replicaSet=rs0` |
| `ssl` | 是否启用 SSL/TLS 加密连接，生产环境强烈建议开启。 | `?ssl=true` |
| `connectTimeoutMS` | 建立连接的超时时间（毫秒）。超过此时间仍未连接成功则报错。 | `?connectTimeoutMS=10000` |
| `socketTimeoutMS` | 套接字操作的超时时间（毫秒）。用于防止长时间无响应的操作阻塞连接。 | `?socketTimeoutMS=30000` |
| `maxPoolSize` | 连接池最大大小。定义了 Mongoose 可以保持的最大并发连接数，默认为 100。 | `?maxPoolSize=50` |
| `minPoolSize` | 连接池最小大小。连接池会维持的最少连接数，避免频繁创建和销毁连接。 | `?minPoolSize=10` |
| `readPreference` | 读取偏好。例如 `secondaryPreferred` 表示优先从副本集的从节点读取数据，以分担主节点压力。 | `?readPreference=secondaryPreferred` |

#### 生产环境连接字符串示例：

```js
const uri =
  'mongodb://user:pass@host1:27017,host2:27017/mydb' +
  '?replicaSet = rs0' +
  '&authSource=admin' +
  '&readPreference = secondaryPreferred' +
  '&maxPoolSize = 50' +
  '&minPoolSize = 10' +
  '&ssl = true';
```

### 配置对象

除了URI参数，`mongoose.connect()`方法还接受一个配置对象作为第二个参数。这个对象中的选项会覆盖或补充URI中的设置，并且包含了一些Mongoose特有的配置。

#### 核心配置选项

| 选项             | 说明                                                                                                                                                             | 推荐值                 |
| :--------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------- |
| `autoIndex`      | 是否在连接后自动为 Schema 中定义的索引执行 `createIndex`。开发环境为 `true` 很方便，但在生产环境应设为 `false`，因为创建索引是耗时操作，会影响性能。             | `false` (生产环境)     |
| `bufferCommands` | 是否在连接建立前缓冲 Mongoose 的操作。默认为 `true`，这意味着在连接成功前执行 `save()` 等操作不会立即报错，而是被挂起。设为 `false` 可以让你更快地发现连接问题。 | `false` (为了快速失败) |
| `dbName`         | 指定要连接的数据库名称。这个选项会覆盖连接字符串中指定的数据库名。                                                                                               | 根据需要设置           |
| `poolSize`       | (已弃用) 这是 `maxPoolSize` 的旧称，功能相同。建议使用 `maxPoolSize`。                                                                                           | -                      |
| `user` / `pass`  | Mongoose 特有的选项，用于指定认证的用户名和密码，等同于在 URI 中设置。                                                                                           | -                      |

#### 生产级连接实践

在实际项目中，我们通常会将连接配置封装在一个独立的模块中，并处理环境变量和连接缓存，以避免在热重载(如Next.js开发环境)时创建多个连接。
示例代码：

```js
//db.js
import mongoose from 'mongoose';

//从环境变量中获取URI，这是管理敏感信息的最佳实践
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp';

//使用一个全局缓存对象来存储连接实例和promise
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  //如果已经连接，直接返回
  if (cached.conn) {
    return cached.conn;
  }

  //如果没有正在进行的连接，就创建一个新的
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, //禁用缓冲
      maxPoolSize: 10, //设置连接池大小
      autoIndex: false, //生产环境禁用自动索引
    };
  }

  cached.promise = mongoose.connect(MONGODB_URI, opts).then(mongoose => {
    return mongoose;
  });

  try {
    cached.conn = await cached.promise;
    console.log('MongoDB 连接成功');
  } catch (e) {
    //如果连接失败，清空promise，以便下次重试
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
```

#### 总结

1. 连接字符串是基础，包含了网络、认证和集群相关的核心参数。
2. 配置对象提供了更细颗粒度的控制，特别是`autoIndex`和`bufferCommands`这类Mongoose特有的选项，对开发和生产环境的行为有重大影响。
3. 连接池是性能优化的核心，通过`maxPoolSize`和`minPoolSize`等参数合理配置，可以有效应对高并发场景。
4. 封装和缓存是工程化实践，将连接逻辑独立出来并妥善处理，是构建稳定应用的重要一环。

### 进阶查询条件

#### 1.比较操作符

用于比较字段值的大小，常用于数字或日期字段。
| 操作符 | 含义 | 示例 |
| :--- | :--- | :--- |
| `$gt` | 大于 (Greater Than) | `Model.find({ age: { $gt: 18 } })` |
| `$gte` | 大于等于 (Greater Than or Equal) | `Model.find({ score: { $gte: 60 } })` |
| `$lt` | 小于 (Less Than) | `Model.find({ price: { $lt: 100 } })` |
| `$lte` | 小于等于 (Less Than or Equal) | `Model.find({ createdAt: { $lte: new Date() } })` |
| `$ne` | 不等于 (Not Equal) | `Model.find({ status: { $ne: 'deleted' } })` |
| `$in` | 在...之中 | `Model.find({ category: { $in: ['A', 'B'] } })` |

#### 2.逻辑操作符

用于组合多个查询条件

- `$and`:所有条件都要满足
- `$or`:任意满足一个条件即可
- `$not`:不满足指定条件

```js
//查找年龄大于等于18岁或状态为active的用户
User.find({
  $or: [{ age: { $gte: 18 } }, { status: 'active' }],
});
//查找名称不以A开头的用户
User.find({ name: { $not: /^A/ } });
```

#### 3.正则表达式

用于字符串中的模糊查询

```js
//查找姓名中包含'john'的用户(不区分大小写)
User.find({ name: /john/i });
//等同于使用$regex和$options
User.find({ name: { $regex: 'john', $options: 'i' } });

//查找以'Mr.'开头的姓名
User.find({ name: /^Mr\./ });
```

#### 4.字段投影

用于指定返回哪些字段，可以有效减少网络传输和数据量。

```js
//只返回name和email字段(_id字段默认返回)
User.find({ status: 'active' }, 'name email');

//或者使用.select()方法，更链式化
User.find({ status: 'active' }).select('name email -_id'); //-表示排除 这里表示排除_id字段
```

### 排序

排序是数据展示中不可或缺的一环,Mongoose提供了简洁的`sort()`方法

- 升序:使用`1`或`asc`
- 降序:使用`-1`或`desc`

```js
//单字段排序：按创建时间进行排序
User.find().sort({ createdAt: -1 });

//多字段排序:先按年龄升序，再按姓名降序
User.find().sort({ age: 1, name: -1 });
```

性能提示:对大型数据集进行排序时，最好在排序字段上建立索引，否则排序操作会非常慢,因为它需要在内存中进行。

### 分页

分页是处理大量数据时的标准做法。Mongoose主要提供了两种分页策略。

#### 1. 基于Skip/Limit的分页(经典方法)

这是最直观、最常用的分页方式，适用于需要跳转到任意页码的场景(如管理后台)
核心公式：

- 跳过数量(skip) = `(当前页码 - 1) * 每页数量(limit)`
- 限制数量(limit) = `每页数量`

```js
const page = 3;	//当前第3页
const pageSize = 10;//每页10条

const users = await User.find().skip((page-1)*pageSize)
.limit(pageSize);
.sort({ createdAt: -1 })//一般分页会结合排序
```

性能瓶颈：`skip()`操作在数据量巨大时性能很差。比如`skip(10000)`意味着数据库需要扫描并跳过前10000条记录，才能返回需要的数据，这会导致查询延迟急剧增加。

#### 2. 基于游标/锚点 的分页

这种方法也被称为'无限滚动'分页，它不使用`skip()`,而是利用上一页最后一条数据的某个唯一字段(如`_id`或`createdAt`)作为锚点来查询下一页

<strong>优点:</strong>性能极高且稳定，无论翻到第几页，查询速度都一样快，因为它可以利用索引来直接定位。
<strong>缺点:</strong>无法直接跳转到指定页码。

#### 组合使用和性能优化

在实际使用中，查询、分页和排序一般是组合使用的

```js
const result = await Product.find({ price: { $lte: 500 } }) //1.查询条件
  .sort({ sales: -1, createdAt: -1 }) //2.排序
  .skip((page - 1) * pageSize) //3.跳过
  .limit(pageSize); //4.限制
```

#### 性能优化指引

1. 使用索引：在常用查询条件字段、排序字段和用作分页锚点的字段上创建索引，是提升性能最有效的手段。
2. 使用`lean()`：如果只是读取数据而不需要修改,使用`.lean()`方法。它会返回纯JavaScript对象，而不是完整的Mongoose文档，可以显著减少内存占用并提高查询速度。

```js
const users = await User.find().lean();
```

3. 避免深度分页：对于基于`skip`的分页，尽量避免让用户跳转到非常靠后的页码(如第10000页),因为这会对数据库造成巨大压力,可以考虑限制最大访问页码。
