import mongoose from 'mongoose';

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

const Product = mongoose.model('Product', productSchema);

export default Product;
