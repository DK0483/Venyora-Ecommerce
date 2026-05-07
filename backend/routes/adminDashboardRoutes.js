const express = require("express");
const router = express.Router();

const Order = require("../models/order");
const User = require("../models/user");
const Product = require("../models/product");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalRevenue = await Order.aggregate([
  { 
    $match: { 
      status: { $in: ["Confirmed", "Shipped", "Delivered"] } 
    } 
  },
  { 
    $group: { 
      _id: null, 
      total: { $sum: "$totalAmount" } 
    } 
  }
]);

    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();

    // 🔥 THIS FIXES YOUR ISSUE
    const pendingOrders = await Order.countDocuments({
      status: "Pending"
    });

    const lowStockProducts = await Product.countDocuments({
      stock: { $lte: 5 }
    });

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      totalOrders,
      totalUsers,
      pendingOrders,
      lowStockProducts
    });

  } catch (err) {
    res.status(500).json({ message: "Dashboard error" });
  }
});

module.exports = router;