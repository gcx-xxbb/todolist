import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/blog').then(() => {
  console.log('数据库连接成功');
});

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 100,
  },
  content: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 5000,
  },
  author: String,
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published',
  },
  date: Date,
});

const CommentSchema = new mongoose.Schema({
  content: String,
  author: String,
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
  },
});

const Article = mongoose.model('Article', articleSchema);

const Comment = mongoose.model('Comment', CommentSchema);

Article.create({
  title: '测试新文章',
  content: '文章内容123412451234',
  author: 'admin',
  tags: ['uat', 'test'],
  status: 'published',
  date: new Date(),
});

const article = await Article.findOne({ title: '测试新文章' });

if (article) {
  console.log(article);
}

Comment.create({
  content: '这是一条评论',
  author: 'admin',
  article: article._id,
}).then(comment => {
  console.log(comment);
});

console.log(article);
