import e from 'express';
import Product from '../models/Product.js';

class ProductService {
  // 业务：商品注册
  async addProduct(productData) {
    const { name, price, discount = 1, stock, description = '' } = productData;
    
    // 验证必填字段
    if (!name || !price || stock === undefined) {
      throw new Error('商品名称、价格和库存是必填项');
    }
    
    // 检查数据库中是否已存在同名商品
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      throw new Error('商品名称已存在');
    }
    
    // 创建新商品
    const newProduct = new Product({
      name,
      price,
      discount,
      stock,
      description
    });
    
    // 保存到数据库
    return await newProduct.save();
  }

  // 业务：商品查询（分页）
  async getProducts(page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;
    
    const products = await Product.find()
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 });
    
    const total = await Product.countDocuments();
    
    return {
      products,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }

  // 业务：根据ID查询商品
  async getProductById(id) {
    const product = await Product.findOne({ id: parseInt(id) });
    if (!product) {
      throw new Error('商品不存在');
    }
    return product;
  }

  // 业务：更新商品
  async updateProduct(id, productData) {
    const { name, price, discount, stock, description } = productData;
    
    // 检查商品是否存在
    const product = await Product.findOne({ id: parseInt(id) });
    if (!product) {
      throw new Error('商品不存在');
    }
    
    // 如果更新商品名称，检查是否与其他商品重复
    if (name && name !== product.name) {
      const existingProduct = await Product.findOne({ name });
      if (existingProduct) {
        throw new Error('商品名称已存在');
      }
    }
    
    // 更新商品信息
    const updatedProduct = await Product.findOneAndUpdate(
      { id: parseInt(id) },
      {
        $set: {
          name: name || product.name,
          price: price !== undefined ? price : product.price,
          discount: discount !== undefined ? discount : product.discount,
          stock: stock !== undefined ? stock : product.stock,
          description: description !== undefined ? description : product.description
        }
      },
      { new: true }
    );
    
    return updatedProduct;
  }

  // 业务：删除商品
  async deleteProduct(id) {
    // 检查商品是否存在
    const product = await Product.findOne({ id: parseInt(id) });
    if (!product) {
      throw new Error('商品不存在');
    }
    
    // 删除商品
    await Product.findOneAndDelete({ id: parseInt(id) });
    return { message: '商品删除成功' };
  }
}

// 导出实例
const productService = new ProductService();
export default productService;
