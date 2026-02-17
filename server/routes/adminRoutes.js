import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Banner from '../models/Banner.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
router.get('/stats', protect, admin, async (req, res) => {
  const totalRevenue = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);
  
  const totalCustomers = await User.countDocuments({ role: 'USER' });
  const totalOrders = await Order.countDocuments({});
  const deliveredOrders = await Order.countDocuments({ status: 'delivered' });

  res.json({
    totalRevenue: totalRevenue[0]?.total || 0,
    totalCustomers,
    totalOrders,
    deliveredOrders
  });
});

// @desc    Get all orders
// @route   GET /api/admin/orders
router.get('/orders', protect, admin, async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id fullName email');
  res.json(orders);
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
router.put('/orders/:id/status', protect, admin, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.status = req.body.status || order.status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
});

// @desc    Get all products (admin view)
// @route   GET /api/admin/products
router.get('/products', protect, admin, async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

// @desc    Add a banner
// @route   POST /api/admin/banners
router.post('/banners', protect, admin, async (req, res) => {
  const { title, imageUrl, link } = req.body;
  const banner = new Banner({ title, imageUrl, link });
  const createdBanner = await banner.save();
  res.status(201).json(createdBanner);
});

// @desc    Delete a banner
// @route   DELETE /api/admin/banners/:id
router.delete('/banners/:id', protect, admin, async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (banner) {
    await banner.deleteOne();
    res.json({ message: 'Banner removed' });
  } else {
    res.status(404).json({ message: 'Banner not found' });
  }
});

export default router;
