# 博客系统 API 接口文档

## 基础信息

- **基础URL**: `http://localhost:3000/api`
- **认证方式**: Bearer Token (JWT)
- **请求格式**: JSON
- **响应格式**: JSON
- **HTTP方法规范**: 仅使用 **POST** 和 **GET** 两种方法

---

## 接口规范说明

| 操作类型 | HTTP方法 | 路由格式 |
|----------|----------|----------|
| 查询/获取 | GET | `/resource` 或 `/resource/:id` |
| 创建 | POST | `/resource` |
| 更新 | POST | `/resource/:id/update` |
| 删除 | POST | `/resource/:id/delete` |

---

## 认证说明

除公开接口外，所有需要认证的接口都需要在请求头中携带 Token：

```
Authorization: Bearer <your_jwt_token>
```

---

## 用户接口 (Users)

### 1. 用户注册

**请求**
```http
POST /api/users/register
Content-Type: application/json

{
  "username": "zhangsan",
  "email": "zhangsan@example.com",
  "password": "123456"
}
```

**响应**
```json
{
  "status": "success",
  "message": "注册成功",
  "data": {
    "user": {
      "_id": "...",
      "username": "zhangsan",
      "email": "zhangsan@example.com",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 2. 用户登录

**请求**
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "zhangsan@example.com",
  "password": "123456"
}
```

### 3. 获取当前用户信息

**请求**
```http
GET /api/users/me
Authorization: Bearer <token>
```

### 4. 更新当前用户信息

**请求**
```http
POST /api/users/me/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "zhangsan_new",
  "bio": "这是我的简介"
}
```

### 5. 修改密码

**请求**
```http
POST /api/users/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "123456",
  "newPassword": "654321"
}
```

### 6. 获取所有用户

**请求**
```http
GET /api/users
Authorization: Bearer <token>
```

### 7. 获取指定用户

**请求**
```http
GET /api/users/:id
```

### 8. 删除用户（仅管理员）

**请求**
```http
POST /api/users/:id/delete
Authorization: Bearer <token>
```

---

## 文章接口 (Articles)

### 1. 创建文章

**请求**
```http
POST /api/articles
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "我的第一篇文章",
  "content": "这是文章内容...",
  "status": "published",
  "tags": ["tag_id_1", "tag_id_2"],
  "category": "category_id"
}
```

### 2. 获取文章列表

**请求**
```http
GET /api/articles?page=1&limit=10&status=published&category=xxx&tag=xxx&search=keyword
```

### 3. 获取指定文章

**请求**
```http
GET /api/articles/:id
```

### 4. 获取我的文章

**请求**
```http
GET /api/articles/my
Authorization: Bearer <token>
```

### 5. 更新文章

**请求**
```http
POST /api/articles/:id/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "更新的标题",
  "content": "更新的内容..."
}
```

### 6. 删除文章

**请求**
```http
POST /api/articles/:id/delete
Authorization: Bearer <token>
```

### 7. 点赞文章

**请求**
```http
POST /api/articles/:id/like
Authorization: Bearer <token>
```

---

## 评论接口 (Comments)

### 1. 添加评论

**请求**
```http
POST /api/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "这是我的评论",
  "article": "article_id",
  "parent": "parent_comment_id"  // 可选，用于回复
}
```

### 2. 获取文章的评论

**请求**
```http
GET /api/comments/article/:articleId?page=1&limit=20
```

### 3. 更新评论

**请求**
```http
POST /api/comments/:id/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "更新的评论内容"
}
```

### 4. 删除评论

**请求**
```http
POST /api/comments/:id/delete
Authorization: Bearer <token>
```

### 5. 点赞评论

**请求**
```http
POST /api/comments/:id/like
Authorization: Bearer <token>
```

---

## 分类接口 (Categories)

### 1. 创建分类（仅管理员）

**请求**
```http
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "技术",
  "description": "技术相关文章",
  "order": 1
}
```

### 2. 获取所有分类

**请求**
```http
GET /api/categories
```

### 3. 获取指定分类

**请求**
```http
GET /api/categories/:id
```

### 4. 更新分类（仅管理员）

**请求**
```http
POST /api/categories/:id/update
Authorization: Bearer <token>
```

### 5. 删除分类（仅管理员）

**请求**
```http
POST /api/categories/:id/delete
Authorization: Bearer <token>
```

---

## 标签接口 (Tags)

### 1. 创建标签（仅管理员）

**请求**
```http
POST /api/tags
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "JavaScript"
}
```

### 2. 获取所有标签

**请求**
```http
GET /api/tags
```

### 3. 根据Slug获取标签

**请求**
```http
GET /api/tags/slug/:slug
```

### 4. 获取指定标签

**请求**
```http
GET /api/tags/:id
```

### 5. 更新标签（仅管理员）

**请求**
```http
POST /api/tags/:id/update
Authorization: Bearer <token>
```

### 6. 删除标签（仅管理员）

**请求**
```http
POST /api/tags/:id/delete
Authorization: Bearer <token>
```

---

## 通用响应格式

### 成功响应
```json
{
  "status": "success",
  "message": "操作成功",
  "data": { ... }
}
```

### 错误响应
```json
{
  "status": "fail",
  "message": "错误描述"
}
```

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（需要登录） |
| 403 | 禁止访问（权限不足） |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 接口汇总表

| 模块 | 操作 | HTTP方法 | 路由 |
|------|------|----------|------|
| **用户** | 注册 | POST | /api/users/register |
| **用户** | 登录 | POST | /api/users/login |
| **用户** | 获取当前用户 | GET | /api/users/me |
| **用户** | 更新当前用户 | POST | /api/users/me/update |
| **用户** | 修改密码 | POST | /api/users/change-password |
| **用户** | 获取所有用户 | GET | /api/users |
| **用户** | 获取指定用户 | GET | /api/users/:id |
| **用户** | 删除用户 | POST | /api/users/:id/delete |
| **文章** | 创建文章 | POST | /api/articles |
| **文章** | 获取文章列表 | GET | /api/articles |
| **文章** | 获取我的文章 | GET | /api/articles/my |
| **文章** | 获取指定文章 | GET | /api/articles/:id |
| **文章** | 更新文章 | POST | /api/articles/:id/update |
| **文章** | 删除文章 | POST | /api/articles/:id/delete |
| **文章** | 点赞文章 | POST | /api/articles/:id/like |
| **评论** | 添加评论 | POST | /api/comments |
| **评论** | 获取文章评论 | GET | /api/comments/article/:articleId |
| **评论** | 更新评论 | POST | /api/comments/:id/update |
| **评论** | 删除评论 | POST | /api/comments/:id/delete |
| **评论** | 点赞评论 | POST | /api/comments/:id/like |
| **分类** | 创建分类 | POST | /api/categories |
| **分类** | 获取所有分类 | GET | /api/categories |
| **分类** | 获取指定分类 | GET | /api/categories/:id |
| **分类** | 更新分类 | POST | /api/categories/:id/update |
| **分类** | 删除分类 | POST | /api/categories/:id/delete |
| **标签** | 创建标签 | POST | /api/tags |
| **标签** | 获取所有标签 | GET | /api/tags |
| **标签** | 按Slug获取标签 | GET | /api/tags/slug/:slug |
| **标签** | 获取指定标签 | GET | /api/tags/:id |
| **标签** | 更新标签 | POST | /api/tags/:id/update |
| **标签** | 删除标签 | POST | /api/tags/:id/delete |

---

## 启动和部署说明

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
编辑 `.env` 文件：
```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/blog
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

### 3. 启动开发服务器
```bash
npm run dev
```

### 4. 生产环境构建
```bash
npm start
```

### 5. MongoDB 要求
- 确保 MongoDB 已安装并运行
- 默认连接地址: `mongodb://localhost:27017/blog`