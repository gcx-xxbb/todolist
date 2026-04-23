const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Article = require('../src/models/Article');
const Category = require('../src/models/Category');
const Tag = require('../src/models/Tag');
const Comment = require('../src/models/Comment');

let authToken;
let testUserId;
let testArticleId;
let testCategoryId;

beforeAll(async () => {
  jest.setTimeout(30000);
  const testDbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog_test';
  await mongoose.connect(testDbUri);
}, 30000);

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

beforeEach(async () => {
  await User.deleteMany({});
  await Article.deleteMany({});
  await Category.deleteMany({});
  await Tag.deleteMany({});
  await Comment.deleteMany({});
});

describe('用户接口测试', () => {
  test('POST /api/users/register - 注册新用户', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ username: 'testuser', email: 'test@example.com', password: '123456' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.user.username).toBe('testuser');
    testUserId = res.body.data.user._id;
  });

  test('POST /api/users/register - 邮箱已存在应返回400', async () => {
    await request(app)
      .post('/api/users/register')
      .send({ username: 'user1', email: 'test@example.com', password: '123456' });

    const res = await request(app)
      .post('/api/users/register')
      .send({ username: 'user2', email: 'test@example.com', password: '123456' });

    expect(res.status).toBe(400);
  });

  test('POST /api/users/login - 登录成功', async () => {
    await request(app)
      .post('/api/users/register')
      .send({ username: 'testuser', email: 'test@example.com', password: '123456' });

    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'test@example.com', password: '123456' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    authToken = res.body.data.token;
  });

  test('POST /api/users/login - 密码错误应返回401', async () => {
    await request(app)
      .post('/api/users/register')
      .send({ username: 'testuser', email: 'test@example.com', password: '123456' });

    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  test('GET /api/users/me - 获取当前用户信息', async () => {
    await request(app)
      .post('/api/users/register')
      .send({ username: 'testuser', email: 'test@example.com', password: '123456' });

    const loginRes = await request(app)
      .post('/api/users/login')
      .send({ email: 'test@example.com', password: '123456' });

    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${loginRes.body.data.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.username).toBe('testuser');
  });

  test('GET /api/users/me - 无token应返回401', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });
});

describe('文章接口测试', () => {
  beforeEach(async () => {
    const registerRes = await request(app)
      .post('/api/users/register')
      .send({ username: 'testuser', email: 'test@example.com', password: '123456' });

    authToken = registerRes.body.data.token;
  });

  test('POST /api/articles - 创建文章', async () => {
    const res = await request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: '测试文章', content: '测试内容', status: 'published' });

    expect(res.status).toBe(201);
    expect(res.body.data.article.title).toBe('测试文章');
    testArticleId = res.body.data.article._id;
  });

  test('POST /api/articles - 未授权应返回401', async () => {
    const res = await request(app)
      .post('/api/articles')
      .send({ title: '测试文章', content: '内容' });

    expect(res.status).toBe(401);
  });

  test('GET /api/articles - 获取文章列表', async () => {
    await request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: '文章1', content: '内容1', status: 'published' });

    const res = await request(app).get('/api/articles');

    expect(res.status).toBe(200);
    expect(res.body.data.articles.length).toBe(1);
  });

  test('GET /api/articles/:id - 获取文章详情', async () => {
    const createRes = await request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: '测试文章', content: '测试内容', status: 'published' });

    const res = await request(app).get(`/api/articles/${createRes.body.data.article._id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.article.title).toBe('测试文章');
  });

  test('POST /api/articles/:id/like - 点赞文章', async () => {
    const createRes = await request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: '测试文章', content: '测试内容', status: 'published' });

    const res = await request(app)
      .post(`/api/articles/${createRes.body.data.article._id}/like`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.likeCount).toBe(1);
  });
});

describe('评论接口测试', () => {
  beforeEach(async () => {
    const registerRes = await request(app)
      .post('/api/users/register')
      .send({ username: 'testuser', email: 'test@example.com', password: '123456' });

    authToken = registerRes.body.data.token;

    const articleRes = await request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: '测试文章', content: '测试内容', status: 'published' });

    testArticleId = articleRes.body.data.article._id;
  });

  test('POST /api/comments - 添加评论', async () => {
    const res = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ content: '测试评论', article: testArticleId });

    expect(res.status).toBe(201);
    expect(res.body.data.comment.content).toBe('测试评论');
  });

  test('GET /api/comments/article/:articleId - 获取文章评论', async () => {
    await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ content: '评论', article: testArticleId });

    const res = await request(app).get(`/api/comments/article/${testArticleId}`);

    expect(res.status).toBe(200);
    expect(res.body.data.comments.length).toBe(1);
  });
});

describe('分类接口测试', () => {
  beforeEach(async () => {
    const registerRes = await request(app)
      .post('/api/users/register')
      .send({ username: 'admin', email: 'admin@example.com', password: 'admin123' });

    const user = await User.findById(registerRes.body.data.user._id);
    user.role = 'admin';
    await user.save();

    authToken = registerRes.body.data.token;
  });

  test('POST /api/categories - 创建分类', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: '技术', description: '技术文章' });

    expect(res.status).toBe(201);
    expect(res.body.data.category.name).toBe('技术');
    testCategoryId = res.body.data.category._id;
  });

  test('GET /api/categories - 获取分类列表', async () => {
    await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: '技术' });

    const res = await request(app).get('/api/categories');

    expect(res.status).toBe(200);
    expect(res.body.data.categories.length).toBe(1);
  });
});

describe('标签接口测试', () => {
  beforeEach(async () => {
    const registerRes = await request(app)
      .post('/api/users/register')
      .send({ username: 'admin', email: 'admin@example.com', password: 'admin123' });

    const user = await User.findById(registerRes.body.data.user._id);
    user.role = 'admin';
    await user.save();

    authToken = registerRes.body.data.token;
  });

  test('POST /api/tags - 创建标签', async () => {
    const res = await request(app)
      .post('/api/tags')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'JavaScript' });

    expect(res.status).toBe(201);
    expect(res.body.data.tag.name).toBe('JavaScript');
  });

  test('GET /api/tags - 获取标签列表', async () => {
    await request(app)
      .post('/api/tags')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'JavaScript' });

    const res = await request(app).get('/api/tags');

    expect(res.status).toBe(200);
    expect(res.body.data.tags.length).toBe(1);
  });
});