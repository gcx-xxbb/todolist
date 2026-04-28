/**
 * 测试数据生成脚本
 * 用于生成大量测试文章，以便进行性能测试
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
// 1. Schema 定义
// ============================================================

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' }
}, { timestamps: true });

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true },
  useCount: { type: Number, default: 0 }
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true },
  description: { type: String, default: '' },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likeCount: { type: Number, default: 0 },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  favoriteCount: { type: Number, default: 0 }
}, { timestamps: true });

// 索引
articleSchema.index({ title: 'text', content: 'text' });
articleSchema.index({ author: 1, createdAt: -1 });
articleSchema.index({ status: 1, createdAt: -1 });
articleSchema.index({ slug: 1 }, { unique: true });
articleSchema.index({ category: 1 });
articleSchema.index({ tags: 1 });

const User = mongoose.model('User', userSchema);
const Tag = mongoose.model('Tag', tagSchema);
const Category = mongoose.model('Category', categorySchema);
const Article = mongoose.model('Article', articleSchema);

// ============================================================
// 2. 辅助函数
// ============================================================

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomItems(array, min, max) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateRandomContent(wordCount = 500) {
  const words = [
    'JavaScript', 'React', 'Vue', 'Angular', 'Node.js', 'Express', 'MongoDB',
    '数据库', '前端', '后端', '全栈', 'TypeScript', 'ES6', '异步', 'Promise',
    'Vuex', 'Redux', 'Router', 'API', 'REST', 'GraphQL', 'HTTP', 'TCP',
    'Git', 'GitHub', 'Docker', 'Linux', 'Nginx', 'Apache', 'AWS', 'Azure',
    '性能优化', 'SEO', '响应式', '移动端', 'PWA', 'SSR', 'SSG', 'JAMstack',
    '测试', 'Jest', 'Mocha', 'Cypress', '单元测试', '集成测试', 'E2E测试',
    'CI/CD', 'Jenkins', 'Travis', 'GitHub Actions', '部署', '构建', '打包'
  ];

  const sentences = [
    '这是一个关于技术学习的分享。',
    '在实际项目中，我们经常会遇到各种挑战。',
    '通过深入理解原理，我们可以写出更好的代码。',
    '性能优化是前端开发中非常重要的一环。',
    '模块化设计可以提高代码的可维护性。',
    '使用设计模式可以让代码更加优雅。',
    'TypeScript 提供了强大的类型系统。',
    '函数式编程是一种很好的编程范式。',
    '响应式设计让网站更好地适应不同设备。',
    '持续集成可以提高开发效率。'
  ];

  let content = [];
  for (let i = 0; i < wordCount; i++) {
    if (i % 20 === 0) {
      content.push(randomItem(sentences));
    }
    content.push(randomItem(words));
  }
  return content.join('，') + '。';
}

function generateRandomTitle(prefix = '文章') {
  const topics = ['深入理解', '快速入门', '实战技巧', '性能优化', '最佳实践', '原理分析', '高级特性', '架构设计'];
  const subjects = ['JavaScript', 'React', 'Vue', 'Node.js', 'MongoDB', 'TypeScript', 'Webpack', 'Docker'];
  return `${randomItem(topics)} - ${randomItem(subjects)} ${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
}

// ============================================================
// 3. 数据生成函数
// ============================================================

/**
 * 生成测试用户
 */
async function generateUsers(count = 10) {
  console.log(`\n📦 生成 ${count} 个测试用户...`);

  const users = [];
  for (let i = 0; i < count; i++) {
    try {
      const user = await User.create({
        username: `test_user_${Date.now()}_${i}`,
        email: `test_${Date.now()}_${i}@example.com`,
        password: '123456',
        role: i === 0 ? 'admin' : 'user',
        bio: `这是测试用户 ${i} 的简介`
      });
      users.push(user);
    } catch (error) {
      if (error.code === 11000) {
        console.log(`  ⚠️ 用户已存在，跳过: test_user_${i}`);
      }
    }
  }

  console.log(`✅ 成功创建 ${users.length} 个用户`);
  return users;
}

/**
 * 生成测试标签
 */
async function generateTags(count = 20) {
  console.log(`\n📦 生成 ${count} 个测试标签...`);

  const tagNames = [
    'JavaScript', 'TypeScript', 'React', 'Vue', 'Node.js', 'Express',
    'MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes',
    'AWS', 'Linux', 'Nginx', 'Git', 'GitHub', 'CI/CD', 'Testing', 'DevOps',
    'GraphQL', 'REST API', 'Microservices', 'Serverless', 'PWA', 'WebSocket'
  ];

  const tags = [];
  for (let i = 0; i < Math.min(count, tagNames.length); i++) {
    try {
      const tag = await Tag.create({
        name: tagNames[i],
        slug: tagNames[i].toLowerCase().replace(/\s+/g, '-')
      });
      tags.push(tag);
    } catch (error) {
      if (error.code === 11000) {
        const existing = await Tag.findOne({ name: tagNames[i] });
        if (existing) tags.push(existing);
      }
    }
  }

  console.log(`✅ 成功创建/获取 ${tags.length} 个标签`);
  return tags;
}

/**
 * 生成测试分类
 */
async function generateCategories(count = 5) {
  console.log(`\n📦 生成 ${count} 个测试分类...`);

  const categoryNames = ['前端技术', '后端开发', '数据库', 'DevOps', '架构设计', '人工智能', '移动开发'];
  const categories = [];

  for (let i = 0; i < Math.min(count, categoryNames.length); i++) {
    try {
      const category = await Category.create({
        name: categoryNames[i],
        slug: categoryNames[i],
        description: `${categoryNames[i]}相关文章`,
        order: i
      });
      categories.push(category);
    } catch (error) {
      if (error.code === 11000) {
        const existing = await Category.findOne({ name: categoryNames[i] });
        if (existing) categories.push(existing);
      }
    }
  }

  console.log(`✅ 成功创建/获取 ${categories.length} 个分类`);
  return categories;
}

/**
 * 生成测试文章
 */
async function generateArticles(count = 100, users, tags, categories) {
  console.log(`\n📦 生成 ${count} 篇测试文章...`);

  const articles = [];
  const batchSize = 50;

  for (let i = 0; i < count; i += batchSize) {
    const batch = [];
    const currentBatchSize = Math.min(batchSize, count - i);

    for (let j = 0; j < currentBatchSize; j++) {
      const idx = i + j + 1;
      const title = generateRandomTitle() + `-${idx}`;
      const slug = `article-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`;

      batch.push({
        title,
        slug,
        content: generateRandomContent(300),
        author: randomItem(users)._id,
        status: Math.random() > 0.2 ? 'published' : 'draft',
        category: randomItem(categories)._id,
        tags: randomItems(tags, 1, 5).map(t => t._id),
        views: Math.floor(Math.random() * 1000),
        likeCount: Math.floor(Math.random() * 100),
        favoriteCount: Math.floor(Math.random() * 50)
      });
    }

    try {
      const created = await Article.insertMany(batch, { ordered: false });
      articles.push(...created);
      console.log(`  ✅ 已生成 ${Math.min(i + batchSize, count)} / ${count} 篇文章`);
    } catch (error) {
      if (error.writeErrors) {
        const successCount = error.insertedDocs?.length || 0;
        console.log(`  ⚠️ 部分插入失败，成功 ${successCount} 篇`);
        articles.push(...(error.insertedDocs || []));
      }
    }
  }

  console.log(`✅ 总共生成 ${articles.length} 篇文章`);
  return articles;
}

// ============================================================
// 4. 清理函数
// ============================================================

async function cleanupData() {
  console.log('\n🗑️  清理测试数据...');

  try {
    await Article.deleteMany({ title: { $regex: /文章|test_user/ } });
    console.log('  ✅ 文章已清理');

    await User.deleteMany({ username: { $regex: /test_user/ } });
    console.log('  ✅ 用户已清理');

    // 不清理标签和分类，因为它们可能被正常使用
    console.log('  ⚠️ 标签和分类保留');
  } catch (error) {
    console.error('  ❌ 清理失败:', error.message);
  }
}

// ============================================================
// 5. 数据统计
// ============================================================

async function showStats() {
  console.log('\n📊 数据库统计：');

  const userCount = await User.countDocuments();
  const tagCount = await Tag.countDocuments();
  const categoryCount = await Category.countDocuments();
  const articleCount = await Article.countDocuments();
  const publishedCount = await Article.countDocuments({ status: 'published' });
  const draftCount = await Article.countDocuments({ status: 'draft' });

  console.log('┌─────────────────────────────────┐');
  console.log('│ 集合         │ 数量              │');
  console.log('├─────────────────────────────────┤');
  console.log(`│ 用户         │ ${userCount.toString().padEnd(17)}│`);
  console.log(`│ 标签         │ ${tagCount.toString().padEnd(17)}│`);
  console.log(`│ 分类         │ ${categoryCount.toString().padEnd(17)}│`);
  console.log(`│ 文章(全部)   │ ${articleCount.toString().padEnd(17)}│`);
  console.log(`│ 文章(已发布) │ ${publishedCount.toString().padEnd(17)}│`);
  console.log(`│ 文章(草稿)   │ ${draftCount.toString().padEnd(17)}│`);
  console.log('└─────────────────────────────────┘');
}

// ============================================================
// 6. 主函数
// ============================================================

async function main() {
  const args = process.argv.slice(2);
  const action = args[0] || 'generate';

  await connectDB();

  try {
    switch (action) {
      case 'generate':
        console.log('\n========== 生成测试数据 ==========');
        const users = await generateUsers(10);
        const tags = await generateTags(20);
        const categories = await generateCategories(5);

        const articleCount = parseInt(args[1]) || 100;
        await generateArticles(articleCount, users, tags, categories);

        await showStats();
        console.log('\n✅ 测试数据生成完成！');
        break;

      case 'cleanup':
        console.log('\n========== 清理测试数据 ==========');
        await cleanupData();
        await showStats();
        console.log('\n✅ 清理完成！');
        break;

      case 'stats':
        console.log('\n========== 查看数据统计 ==========');
        await showStats();
        break;

      case 'rebuild':
        console.log('\n========== 重建测试数据 ==========');
        await cleanupData();
        const users2 = await generateUsers(10);
        const tags2 = await generateTags(20);
        const categories2 = await generateCategories(5);
        const articleCount2 = parseInt(args[1]) || 100;
        await generateArticles(articleCount2, users2, tags2, categories2);
        await showStats();
        console.log('\n✅ 重建完成！');
        break;

      default:
        console.log(`
用法: node 03_seed_data.js <action> [article_count]

action:
  generate  - 生成测试数据（默认）
  cleanup   - 清理测试数据
  stats     - 查看数据统计
  rebuild   - 清理并重新生成

示例:
  node 03_seed_data.js generate 100   # 生成100篇文章
  node 03_seed_data.js cleanup        # 清理数据
  node 03_seed_data.js stats          # 查看统计
        `);
    }
  } catch (error) {
    console.error('\n❌ 执行出错:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ 数据库连接已关闭');
  }
}

main();
