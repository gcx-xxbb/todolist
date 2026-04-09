import mongoose from 'mongoose';

//链接数据库
mongoose
  .connect('mongodb://localhost:27017/bookStore')
  .then(() => {
    console.log('数据库连接成功');
  })
  .catch(() => {
    console.log('数据库连接失败');
  });

//定义Schema
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    min: 0,
  },
  publishDate: {
    type: Date,
    default: Date.now,
  },
  tags: [String],
});

//创建model模型
//mongoose.model('集合名(单数形式)', schema对象);
const Book = mongoose.model('Book', bookSchema);

//增删改查操作
async function run() {
  try {
    console.log('---1.新增数据---');
    const existBook = await Book.findOne({ title: '三体' });
    if (!existBook) {
      //创建一个实例
      const newBook = new Book({
        title: '三体',
        author: '刘慈欣',
        price: 89.9,
        tags: ['科幻', '小说'],
      });
      //保存到数据库
      const savedBook = await newBook.save();
      console.log('插入成功', savedBook);
    } else {
      console.log('已存在');
    }

    console.log('\n--- 2. 查询数据 (Read) ---');
    //查询所有书
    const allBooks = await Book.find();
    console.log('所有书:', allBooks);

    //条件查询
    const liuBooks = await Book.find({ author: '刘慈欣' });
    console.log('作者为刘慈欣的书:', liuBooks);
    console.log('\n--- 3. 更新数据 (Update) ---');
    //找到标题为"《三体》"的图书，并更新价格为30
    const updateBook = await Book.updateOne({ title: '三体' }, { $set: { price: 30 } });
    console.log('更新结果:', updateBook);
    console.log('\n--- 4. 删除数据 (Delete) ---');
    const deleteBook = await Book.deleteOne({ title: '三体' });
    console.log('删除结果:', deleteBook);
  } catch (err) {
    console.log(err);
  } finally {
    mongoose.connection.close();
    console.log('数据库已关闭');
  }
}

run();
