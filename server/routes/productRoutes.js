import express from 'express';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @desc    Fetch all products
// @route   GET /api/products
router.get('/', async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

// @desc    Fetch single product
// @route   GET /api/products/:id
router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  const { name, price, description, images, category, stock } = req.body;

  const product = new Product({
    name,
    price,
    description,
    images,
    category,
    stock
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

export default router;
