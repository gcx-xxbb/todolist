/**
 * MongoDB 查询性能分析演示
 * 演示如何使用 explain() 分析查询计划，找出慢查询
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
// 1. Schema 定义（复用 Article 模型结构）
// ============================================================

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
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
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  favoriteCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// 索引定义
articleSchema.index({ title: 'text', content: 'text' });           // 全文搜索
articleSchema.index({ author: 1, createdAt: -1 });                  // 复合索引
articleSchema.index({ status: 1, createdAt: -1 });                  // 复合索引
articleSchema.index({ category: 1 });                               // 分类索引
articleSchema.index({ tags: 1 });                                   // 标签索引（多键索引）

const Article = mongoose.model('Article', articleSchema);

// ============================================================
// 2. explain() 基础用法
// ============================================================

/**
 * explain() 的三种模式
 */
async function explainModes() {
  console.log('\n========== explain() 三种模式 ==========');

  // 模式1：queryPlanner（默认）- 展示最优执行计划
  console.log('\n📊 queryPlanner 模式（默认）：');
  const queryPlanner = await Article.find({ status: 'published' })
    .explain('queryPlanner');
  console.log('winningPlan.stage:', queryPlanner.queryPlanner.winningPlan.stage);

  // 模式2：executionStats - 执行统计（最常用）
  console.log('\n📊 executionStats 模式（推荐）：');
  const executionStats = await Article.find({ status: 'published' })
    .explain('executionStats');
  console.log('executionTimeMillis:', executionStats.executionStats.executionTimeMillis, 'ms');
  console.log('totalDocsExamined:', executionStats.executionStats.totalDocsExamined);
  console.log('nReturned:', executionStats.executionStats.nReturned);

  // 模式3：allPlansExecution - 所有执行计划
  console.log('\n📊 allPlansExecution 模式（深度分析）：');
  const allPlans = await Article.find({ status: 'published' })
    .explain('allPlansExecution');
  console.log('plans:', allPlans.executionStats.executionStages);
}

// ============================================================
// 3. 分析分页查询（慢查询分析）
// ============================================================

/**
 * 模拟文章列表页的分页查询
 */
async function analyzePaginatedQuery() {
  console.log('\n========== 分析文章列表分页查询 ==========');

  const page = 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  // 分析查询
  const explainResult = await Article.find({ status: 'published' })
    .populate([{ path: 'author', select: 'username avatar' }, 'tags', 'category'])
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .explain('executionStats');

  console.log('\n📊 查询执行统计：');
  console.log('┌─────────────────────────────────────────┐');
  console.log(`│ 执行时间: ${explainResult.executionStats.executionTimeMillis} ms`);
  console.log(`│ 检查文档数: ${explainResult.executionStats.totalDocsExamined}`);
  console.log(`│ 返回文档数: ${explainResult.executionStats.nReturned}`);
  console.log('└─────────────────────────────────────────┘');

  // 解析执行阶段
  const stage = explainResult.executionStats.executionStages;
  if (stage) {
    console.log('\n📊 执行阶段分析：');
    analyzeStage(stage, 0);
  }

  // 性能评估
  evaluatePerformance(explainResult.executionStats);
}

/**
 * 分析执行阶段
 */
function analyzeStage(stage, depth = 0) {
  const indent = '  '.repeat(depth);
  console.log(`${indent}stage: ${stage.stage}`);
  if (stage.indexName) {
    console.log(`${indent}indexName: ${stage.indexName}`);
  }
  if (stage.inputStage) {
    console.log(`${indent}inputStage:`);
    analyzeStage(stage.inputStage, depth + 1);
  }
  if (stage.executionStages) {
    stage.executionStages.forEach((s, i) => {
      console.log(`${indent}exectionStages[${i}]:`);
      analyzeStage(s, depth + 1);
    });
  }
}

/**
 * 性能评估
 */
function evaluatePerformance(stats) {
  console.log('\n📊 性能评估：');
  const time = stats.executionTimeMillis;
  const examined = stats.totalDocsExamined;
  const returned = stats.nReturned;
  const ratio = examined / (returned || 1);

  // 时间评估
  if (time < 10) {
    console.log('⏱️  执行时间: ✅ 优秀 (<10ms)');
  } else if (time < 100) {
    console.log('⏱️  执行时间: ⚠️ 良好 (10-100ms)');
  } else {
    console.log('⏱️  执行时间: ❌ 慢查询 (>100ms)');
  }

  // 扫描效率评估
  if (ratio < 2) {
    console.log('🔍 扫描效率: ✅ 优秀 (检查/返回 比值接近1)');
  } else if (ratio < 10) {
    console.log('🔍 扫描效率: ⚠️ 一般');
  } else {
    console.log('🔍 扫描效率: ❌ 差 (可能需要优化索引)');
  }

  // 建议
  console.log('\n💡 优化建议：');
  if (time > 100) {
    console.log('  - 考虑添加或优化索引');
    console.log('  - 检查是否使用了索引 (IXSCAN) 而不是全表扫描 (COLLSCAN)');
  }
  if (ratio > 10) {
    console.log('  - 检查查询条件是否使用了索引');
    console.log('  - 考虑创建覆盖索引');
  }
}

// ============================================================
// 4. 对比分析：使用索引 vs 不使用索引
// ============================================================

/**
 * 对比有索引和无索引的查询性能
 */
async function compareWithWithoutIndex() {
  console.log('\n========== 索引使用对比分析 ==========');

  // 查询1：使用索引的查询（按 author 查）
  console.log('\n📊 查询1：按 author 查询（已有索引）');
  const explainWithIndex = await Article.find({ author: mongoose.Types.ObjectId() })
    .explain('executionStats');
  console.log(`  - 执行时间: ${explainWithIndex.executionStats.executionTimeMillis} ms`);
  console.log(`  - 阶段: ${explainWithIndex.executionStats.executionStages?.stage || 'N/A'}`);
  console.log(`  - 索引: ${explainWithIndex.executionStats.executionStages?.indexName || 'N/A'}`);

  // 查询2：正则查询（可能不使用索引）
  console.log('\n📊 查询2：正则模糊匹配（可能无索引）');
  const explainWithoutIndex = await Article.find({
    title: { $regex: '关键词', $options: 'i' }
  })
    .explain('executionStats');
  console.log(`  - 执行时间: ${explainWithoutIndex.executionStats.executionTimeMillis} ms`);
  console.log(`  - 阶段: ${explainWithoutIndex.executionStats.executionStages?.stage || 'N/A'}`);
  console.log(`  - 索引: ${explainWithoutIndex.executionStats.executionStages?.indexName || 'N/A'}`);

  // 查询3：分页+排序（优化后的查询）
  console.log('\n📊 查询3：分页+排序（复合索引）');
  const explainPaginated = await Article.find({ status: 'published' })
    .sort({ createdAt: -1 })
    .skip(0)
    .limit(10)
    .explain('executionStats');
  console.log(`  - 执行时间: ${explainPaginated.executionStats.executionTimeMillis} ms`);
  console.log(`  - 阶段: ${explainPaginated.executionStats.executionStages?.stage || 'N/A'}`);
  console.log(`  - 索引: ${explainPaginated.executionStats.executionStages?.indexName || 'N/A'}`);
}

// ============================================================
// 5. 任务实现：找出慢查询
// ============================================================

/**
 * 任务：分析文章列表页的慢查询
 */
async function task_FindSlowQueries() {
  console.log('\n========== 任务：找出文章列表页慢查询 ==========');

  // 模拟不同的查询场景
  const scenarios = [
    { name: '基础列表查询', query: {}, page: 1, limit: 10 },
    { name: '按分类筛选', query: { category: mongoose.Types.ObjectId() }, page: 1, limit: 10 },
    { name: '按状态筛选+排序', query: { status: 'published' }, page: 1, limit: 10 },
    { name: '全文搜索', query: { $text: { $search: 'react' } }, page: 1, limit: 10 },
    { name: '多条件组合', query: { status: 'published', tags: [mongoose.Types.ObjectId()] }, page: 2, limit: 20 }
  ];

  for (const scenario of scenarios) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📋 场景: ${scenario.name}`);
    console.log(`   查询条件: ${JSON.stringify(scenario.query)}`);
    console.log(`   分页: page=${scenario.page}, limit=${scenario.limit}`);

    const skip = (scenario.page - 1) * scenario.limit;

    const startTime = Date.now();
    const explainResult = await Article.find(scenario.query)
      .populate([{ path: 'author', select: 'username avatar' }, 'tags', 'category'])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(scenario.limit)
      .explain('executionStats');
    const endTime = Date.now();

    const stats = explainResult.executionStats;
    console.log('\n📊 执行结果：');
    console.log(`   ⏱️  执行时间: ${stats.executionTimeMillis} ms`);
    console.log(`   📄 检查文档: ${stats.totalDocsExamined}`);
    console.log(`   📄 返回文档: ${stats.nReturned}`);
    console.log(`   📊 效率比: ${(stats.totalDocsExamined / (stats.nReturned || 1)).toFixed(2)}`);

    // 阶段信息
    const stage = stats.executionStages;
    if (stage) {
      console.log(`   🔍 执行阶段: ${stage.stage}`);
      if (stage.indexName) {
        console.log(`   🔑 使用索引: ${stage.indexName}`);
      }
    }

    // 慢查询标记
    if (stats.executionTimeMillis > 100) {
      console.log('   ❌ ⚠️ 慢查询警告！');
    }
  }
}

/**
 * 任务：使用 explain() 分析查询计划
 */
async function task_AnalyzeQueryPlan() {
  console.log('\n========== 任务：使用 explain() 分析查询计划 ==========');

  // 复杂查询示例
  const query = {
    status: 'published',
    $or: [
      { title: { $regex: 'react', $options: 'i' } },
      { content: { $regex: 'react', $options: 'i' } }
    ]
  };

  console.log('\n📋 分析查询：');
  console.log('查询条件:', JSON.stringify(query, null, 2));

  const explainResult = await Article.find(query)
    .populate(['author', 'tags', 'category'])
    .sort({ views: -1, createdAt: -1 })
    .limit(10)
    .explain('verbose');

  console.log('\n📊 详细执行计划：');
  console.log(JSON.stringify(explainResult, null, 2));
}

// ============================================================
// 6. 性能优化建议
// ============================================================

/**
 * 根据 explain() 结果提供优化建议
 */
function getOptimizationSuggestions(stats) {
  const suggestions = [];
  const stage = stats.executionStages?.stage;

  // 检查是否全表扫描
  if (stage === 'COLLSCAN') {
    suggestions.push('❌ 检测到全表扫描 (COLLSCAN)，建议创建索引');
  }

  // 检查执行时间
  if (stats.executionTimeMillis > 100) {
    suggestions.push('⚠️ 执行时间过长，考虑优化查询或添加索引');
  }

  // 检查扫描效率
  const ratio = stats.totalDocsExamined / (stats.nReturned || 1);
  if (ratio > 100) {
    suggestions.push('❌ 扫描效率极低，添加合适的索引');
  } else if (ratio > 10) {
    suggestions.push('⚠️ 扫描效率较低，检查索引是否合适');
  }

  // 检查是否需要排序
  if (stats.executionStages?.sort) {
    suggestions.push('💡 检测到排序操作，确保排序字段有索引');
  }

  return suggestions;
}

// ============================================================
// 主函数
// ============================================================

async function main() {
  await connectDB();

  try {
    // 基础演示
    await explainModes();

    // 分析分页查询
    await analyzePaginatedQuery();

    // 对比分析
    await compareWithWithoutIndex();

    // 执行任务
    await task_FindSlowQueries();
    await task_AnalyzeQueryPlan();

    console.log('\n========== 分析完成 ==========');
  } catch (error) {
    console.error('❌ 执行出错:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('✅ 数据库连接已关闭');
  }
}

// 运行
main();
