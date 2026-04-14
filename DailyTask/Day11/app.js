import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/productStore').then(() => {
  console.log('数据库连接成功');
});

const productSchema = new mongoose.Schema(
  {
    id: Number,
    name: String,
    price: Number,
    discount: Number,
    stock: Number,
    description: String,
  },
  {
    timestamps: true,
  },
);

productSchema.pre('find', function () {
  this.where({ id: { $mod: [2, 0] } });
});

productSchema.post('find', function (docs) {
  docs.forEach(doc => {
    doc.stock = 100;
  });
});

const Product = mongoose.model('Product', productSchema);

const products = Product.find().then(results => {
  console.log(results);
});


export default Product;
