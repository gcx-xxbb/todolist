/**
 * MongoDB 索引操作演示
 * 演示如何为 Article 和 User 模型创建和管理索引
 */

const mongoose = require('mongoose');

// 连接数据库
const MONGODB_URI = 'mongodb://localhost:27017/blog';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 连接成功');
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error.message);
    process.exit(1);
  }
}

// ============================================================
// 1. 定义 Schema（演示用）
// ============================================================

// Article Schema
const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '标题不能为空'],
    trim: true,
    maxlength: [200, '标题最多200个字符']
  },
  slug: {
    type: String,
    unique: true,
    required: [true, 'Slug不能为空'],
    trim: true
  },
  content: {
    type: String,
    required: [true, '内容不能为空']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '用户名不能为空'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, '邮箱不能为空'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, '密码不能为空']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, { timestamps: true });

// 创建模型
const Article = mongoose.model('Article', articleSchema);
const User = mongoose.model('User', userSchema);

// ============================================================
// 2. 索引创建方法
// ============================================================

/**
 * 方法1：在 Schema 定义中创建索引（推荐）
 *
 * 在字段选项中添加 index: true 或 unique: true
 */
function createIndexesInSchema() {
  const schemaWithIndexes = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, unique: true },        // 唯一索引
    createdAt: { type: Date, index: true },     // 普通索引
    email: { type: String, unique: true }       // 唯一索引
  });
}

/**
 * 方法2：使用 Schema.index() 创建索引（推荐）
 *
 * 在模型创建后调用
 */
async function createIndexesWithSchemaIndex() {
  // Article 模型的索引
  articleSchema.index({ slug: 1 }, { unique: true });           // 唯一索引：slug
  articleSchema.index({ createdAt: -1 });                        // 降序索引：createdAt
  articleSchema.index({ author: 1, createdAt: -1 });            // 复合索引
  articleSchema.index({ status: 1, createdAt: -1 });            // 复合索引

  // User 模型的索引
  userSchema.index({ email: 1 }, { unique: true });             // 唯一索引：email
  userSchema.index({ username: 1 }, { unique: true });          // 唯一索引：username

  console.log('✅ 索引定义已添加到 Schema');
}

/**
 * 方法3：使用 db.collection.createIndex()（MongoDB 原生方法）
 *
 * 直接操作数据库
 */
async function createIndexesWithNativeMethod() {
  const db = mongoose.connection.db;

  // 为 Article 创建索引
  await db.collection('articles').createIndex(
    { slug: 1 },
    { unique: true, name: 'slug_unique' }
  );
  console.log('✅ Article slug 唯一索引创建成功');

  await db.collection('articles').createIndex(
    { createdAt: -1 },
    { name: 'createdAt_desc' }
  );
  console.log('✅ Article createdAt 降序索引创建成功');

  // 为 User 创建索引
  await db.collection('users').createIndex(
    { email: 1 },
    { unique: true, name: 'email_unique' }
  );
  console.log('✅ User email 唯一索引创建成功');
}

// ============================================================
// 3. 索引管理操作
// ============================================================

/**
 * 查看集合的所有索引
 */
async function listIndexes() {
  console.log('\n========== 查看 Article 索引 ==========');
  const articleIndexes = await Article.collection.getIndexes();
  console.log(JSON.stringify(articleIndexes, null, 2));

  console.log('\n========== 查看 User 索引 ==========');
  const userIndexes = await User.collection.getIndexes();
  console.log(JSON.stringify(userIndexes, null, 2));
}

/**
 * 删除指定索引
 */
async function dropIndex(collectionName, indexName) {
  try {
    await mongoose.connection.db.collection(collectionName).dropIndex(indexName);
    console.log(`✅ 索引 ${indexName} 删除成功`);
  } catch (error) {
    if (error.message.includes('not found')) {
      console.log(`⚠️ 索引 ${indexName} 不存在`);
    } else {
      throw error;
    }
  }
}

/**
 * 删除所有索引（除了 _id）
 */
async function dropAllIndexes(collectionName) {
  await mongoose.connection.db.collection(collectionName).dropIndexes();
  console.log(`✅ ${collectionName} 的所有非 _id 索引已删除`);
}

/**
 * 查看索引大小
 */
async function getIndexSizes() {
  const stats = await Article.collection.stats();
  console.log('\n========== Article 索引大小 ==========');
  console.log('索引名称 -> 大小 (bytes)');
  Object.entries(stats.indexSizes).forEach(([name, size]) => {
    console.log(`  ${name}: ${(size / 1024).toFixed(2)} KB`);
  });
}

// ============================================================
// 4. 任务实现
// ============================================================

/**
 * 任务1：为 Article 创建索引
 * - slug 字段创建唯一索引
 * - createdAt 字段创建降序索引
 */
async function task1_CreateArticleIndexes() {
  console.log('\n========== 任务1：创建 Article 索引 ==========');

  try {
    // 方法：在 Schema 定义中使用 index 选项
    // 在实际模型 Article.js 中，slug 已经是 unique: true
    // createdAt 由 timestamps: true 自动创建

    // 如果需要手动创建，执行以下代码：
    await Article.collection.createIndex(
      { slug: 1 },
      { unique: true, name: 'slug_unique', background: true }
    );
    console.log('✅ Article.slug 唯一索引已创建');

    await Article.collection.createIndex(
      { createdAt: -1 },
      { name: 'createdAt_desc', background: true }
    );
    console.log('✅ Article.createdAt 降序索引已创建');

    console.log('\n当前 Article 所有索引：');
    const indexes = await Article.collection.getIndexes();
    indexes.forEach((idx, name) => {
      console.log(`  - ${name}: ${JSON.stringify(idx.key)}`);
    });
  } catch (error) {
    if (error.code === 85 || error.code === 86) {
      console.log('⚠️ 索引已存在，跳过创建');
    } else {
      throw error;
    }
  }
}

/**
 * 任务2：为 User 创建 email 唯一索引
 */
async function task2_CreateUserEmailIndex() {
  console.log('\n========== 任务2：创建 User.email 唯一索引 ==========');

  try {
    await User.collection.createIndex(
      { email: 1 },
      { unique: true, name: 'email_unique', background: true }
    );
    console.log('✅ User.email 唯一索引已创建');

    console.log('\n当前 User 所有索引：');
    const indexes = await User.collection.getIndexes();
    indexes.forEach((idx, name) => {
      console.log(`  - ${name}: ${JSON.stringify(idx.key)}`);
    });
  } catch (error) {
    if (error.code === 85 || error.code === 86) {
      console.log('⚠️ 索引已存在，跳过创建');
    } else {
      throw error;
    }
  }
}

// ============================================================
// 5. 索引验证测试
// ============================================================

/**
 * 测试唯一索引：尝试插入重复 slug
 */
async function testUniqueIndex() {
  console.log('\n========== 测试唯一索引 ==========');

  const testUser = await User.create({
    username: 'test_user_' + Date.now(),
    email: 'test_' + Date.now() + '@example.com',
    password: '123456'
  });

  // 尝试插入重复 email
  try {
    await User.create({
      username: 'another_user',
      email: testUser.email,  // 使用相同的 email
      password: '123456'
    });
    console.log('❌ 错误：应该抛出唯一约束异常');
  } catch (error) {
    if (error.code === 11000) {
      console.log('✅ 唯一索引生效：重复 email 被拒绝');
    } else {
      throw error;
    }
  }

  // 清理测试数据
  await User.findByIdAndDelete(testUser._id);
  console.log('✅ 测试数据已清理');
}

// ============================================================
// 主函数
// ============================================================

async function main() {
  await connectDB();

  try {
    // 执行任务
    await task1_CreateArticleIndexes();
    await task2_CreateUserEmailIndex();

    // 验证
    await listIndexes();
    await getIndexSizes();

    // 测试
    await testUniqueIndex();

    console.log('\n========== 所有任务完成 ==========');
  } catch (error) {
    console.error('❌ 执行出错:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('✅ 数据库连接已关闭');
  }
}

// 运行
main();
