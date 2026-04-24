# MongoDB 索引深入学习

## 一、索引类型

### 1. 单字段索引（Single Field Index）

在文档的单个字段上创建索引。

```javascript
// 语法
db.collection.createIndex({ field: 1或-1 })

// 示例：为用户邮箱创建索引
db.users.createIndex({ email: 1 }, { unique: true })

// 验证索引
db.users.getIndexes()
```

### 2. 复合索引（Compound Index）

在多个字段上创建索引，支持索引前缀查询。

```javascript
// 语法
db.collection.createIndex({ field1: 1, field2: -1, ... })

// 示例：创建用户文章的复合索引
db.articles.createIndex({ author: 1, createdAt: -1 })

// 索引前缀：支持 { author: 1 } 和 { author: 1, createdAt: -1 } 查询
// 不支持：{ createdAt: -1 }
```

### 3. 多键索引（Multikey Index）

为数组字段创建索引。

```javascript
// 标签数组上的多键索引
db.articles.createIndex({ tags: 1 });

// 嵌套数组
db.inventory.createIndex({ 'items.color': 1 });

// MongoDB 自动创建多键索引，无需特殊选项
```

### 4. 文本索引（Text Index）

支持全文搜索。

```javascript
// 语法
db.collection.createIndex({ field: 'text' });

// 示例：为文章标题和内容创建文本索引
db.articles.createIndex({ title: 'text', content: 'text' });

// 设置权重
db.articles.createIndex({ title: 'text', content: 'text' }, { weights: { title: 10, content: 1 } });

// 删除文本索引
db.articles.dropIndex('title_text_content_text');
```

### 5. 地理空间索引（Geospatial Index）

支持地理位置查询。

```javascript
// 2dsphere 索引（球面地球）
db.places.createIndex({ location: '2dsphere' });

// 查询附近地点
db.places.find({
  location: {
    $nearSphere: {
      $geometry: { type: 'Point', coordinates: [lng, lat] },
      $maxDistance: 1000, // 米
    },
  },
});

// 2d 索引（平面）
db.places.createIndex({ location: '2d' });
```

---

## 二、explain() 查询分析

`explain()` 方法返回查询执行计划的详细信息。

```javascript
// 基本用法
db.collection.find({ field: value }).explain()

// 查看详细执行信息
db.collection.find({ field: value }).explain("executionStats")

// 关键指标说明
{
  "queryPlanner": {
    "plannerVersion": 1,
    "namespace": "blog.articles",
    "indexFilterSet": false,
    "parsedQuery": { "status": { "$eq": "published" } },
    "winningPlan": {
      "stage": "FETCH",        // 执行阶段
      "inputStage": {
        "stage": "IXSCAN",     // 索引扫描
        "indexName": "status_1" // 使用的索引
      }
    }
  },
  "executionStats": {
    "executionSuccess": true,
    "nReturned": 10,           // 返回文档数
    "executionTimeMillis": 2,  // 执行时间（毫秒）
    "totalKeysExamined": 10,   // 索引键检查数
    "totalDocsExamined": 10,   // 文档检查数
    "executionStages": {...}
  }
}
```

### 常见 stage 值

| Stage      | 说明         |
| ---------- | ------------ |
| COLLSCAN   | 全表扫描     |
| IXSCAN     | 索引扫描     |
| FETCH      | 获取完整文档 |
| SORT       | 内存排序     |
| LIMIT      | 限制返回数量 |
| PROJECTION | 字段投影     |

---

## 三、查询优化策略

### 1. 覆盖查询（Covered Query）

查询所需字段全部在索引中，无需回表查询。

```javascript
// 创建覆盖索引
db.articles.createIndex({ status: 1, title: 1, _id: 0 });

// 查询计划显示 IXSCAN + FETCH 变为 IXSCAN + PROJECTION
db.articles.find({ status: 'published' }, { title: 1, _id: 0 }).explain('executionStats');
```

### 2. 投影优化（Projection Optimization）

只返回需要的字段，减少数据传输。

```javascript
// 只返回必要字段
db.articles.find(
  { status: 'published' },
  { title: 1, createdAt: 1, author: 1 }, // 明确指定字段
);

// 避免返回整个文档
db.articles.findOne({ _id: id }, { content: 0 }); // 排除大字段
```

### 3. 排序优化（Sort Optimization）

利用索引避免内存排序。

```javascript
// 创建支持排序的索引
db.articles.createIndex({ status: 1, createdAt: -1 });

// 查询 + 排序
db.articles.find({ status: 'published' }).sort({ createdAt: -1 }).explain();

// 提示使用特定索引
db.articles
  .find({ status: 'published' })
  .sort({ createdAt: -1 })
  .hint({ status: 1, createdAt: -1 });
```

---

## 四、实战技巧

### 1. 选择性索引

高选择性字段优先索引。

```javascript
// 好的索引：选择性高
db.orders.createIndex({ orderId: 1 }, { unique: true });

// 差的索引：低选择性
db.logs.createIndex({ level: 1 }); // 99%都是 "info"
```

### 2. 前缀原则

复合索引支持前缀查询。

```javascript
// 索引：{ a: 1, b: 1, c: 1 }

// 支持的查询
db.collection.find({ a: value }); // 前缀
db.collection.find({ a: value, b: value }); // 前缀
db.collection.find({ a: value, b: value, c: value });

// 不支持
db.collection.find({ b: value, c: value }); // 非前缀
```

### 3. 索引覆盖排序

```javascript
// 创建索引
db.articles.createIndex({ category: 1, views: -1 });

// 利用索引排序
db.articles.find({ category: '前端' }).sort({ views: -1 });

// 不需要额外排序的查询
db.articles.find({ category: '前端', views: { $gt: 100 } }).sort({ views: -1 });
```

### 4. 部分索引（Partial Index）

只索引满足条件的文档。

```javascript
// 只索引已发布的文章
db.articles.createIndex({ createdAt: -1 }, { partialFilterExpression: { status: 'published' } });
```

### 5. 稀疏索引（Sparse Index）

只索引存在该字段的文档。

```javascript
// 只索引有 phone 字段的文档
db.users.createIndex({ phone: 1 }, { sparse: true });
```

---

## 五、索引管理

```javascript
// 查看集合索引
db.collection.getIndexes();

// 查看索引大小
db.collection.stats().indexSizes;

// 删除索引
db.collection.dropIndex('indexName');

// 删除所有索引（除 _id）
db.collection.dropIndexes();

// 重建索引
db.collection.reIndex();

// 强制使用索引
db.collection.find({ field: value }).hint({ field: 1 });
```

---

## 七、SQL vs MongoDB 概念对照

| SQL 概念 | MongoDB 概念 | 说明 |
| :----------------- | :---------------- | :----------------------------------------------------- |
| 表 (Table) | 集合 (Collection) | 集合中的文档结构可以不同，而表的行结构必须相同。 |
| 行 (Row) | 文档 (Document) | MongoDB 的基本数据单元，是一个 BSON 对象。 |
| 列 (Column) | 字段 (Field) | 文档中的键值对，值可以是任意类型，包括其他文档或数组。 |
| 主键 (Primary Key) | _id | 每个文档都拥有一个唯一的 _id 字段。 |
| 索引 (Index) | 索引 (Index) | MongoDB 支持多种类型的索引以提升查询性能。 |
| JOIN | 嵌套文档 / 聚合 | MongoDB 使用嵌套文档代替 JOIN，或通过聚合框架实现。 |

## 八、性能调优 checklist

| 检查项          | 说明                          |
| --------------- | ----------------------------- |
| explain() 检查  | 确保使用 IXSCAN 而非 COLLSCAN |
| selectivity     | 高选择性字段优先              |
| covered query   | 避免 FETCH 阶段               |
| sort with index | 避免内存排序 SORT 阶段        |
| index prefix    | 合理设计复合索引顺序          |
| partial index   | 减少索引大小                  |
| remove unused   | 删除不使用索引                |
