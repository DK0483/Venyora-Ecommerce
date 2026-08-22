const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const User = require("../models/user");
const Product = require("../models/product");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const paidStatuses = ["Confirmed", "Shipped", "Delivered"];

router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [revenueResult, totalOrders, totalUsers, pendingOrders, lowStockProducts, weekOrders, recentOrders, lowStockItems, statusBreakdown, topProducts] = await Promise.all([
      Order.aggregate([{ $match: { status: { $in: paidStatuses } } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
      Order.countDocuments(),
      User.countDocuments(),
      Order.countDocuments({ status: "Pending" }),
      Product.countDocuments({ stock: { $lte: 5 } }),
      Order.find({ status: { $in: paidStatuses }, createdAt: { $gte: sevenDaysAgo } }).select("totalAmount createdAt"),
      Order.find().sort({ createdAt: -1 }).limit(6).populate("user", "name email").select("totalAmount status createdAt paymentMethod user"),
      Product.find({ stock: { $lte: 5 } }).sort({ stock: 1 }).limit(6).select("name stock imageUrl category"),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Order.aggregate([{ $match: { status: { $in: paidStatuses } } }, { $unwind: "$items" }, { $group: { _id: { product: "$items.product", name: "$items.name" }, units: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } } } }, { $sort: { revenue: -1 } }, { $limit: 5 }])
    ]);

    const dailyRevenue = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + index);
      const key = date.toISOString().slice(0, 10);
      return { label: date.toLocaleDateString("en-IN", { weekday: "short" }), key, revenue: 0 };
    });
    weekOrders.forEach(order => {
      const day = dailyRevenue.find(item => item.key === new Date(order.createdAt).toISOString().slice(0, 10));
      if (day) day.revenue += order.totalAmount || 0;
    });

    const weekRevenue = dailyRevenue.reduce((sum, day) => sum + day.revenue, 0);
    const confirmedOrders = statusBreakdown.find(item => item._id === "Confirmed")?.count || 0;
    res.json({
      totalRevenue: revenueResult[0]?.total || 0,
      totalOrders, totalUsers, pendingOrders, lowStockProducts,
      weekRevenue, averageOrderValue: totalOrders ? Math.round((revenueResult[0]?.total || 0) / totalOrders) : 0,
      confirmedOrders, dailyRevenue, recentOrders, lowStockItems,
      topProducts: topProducts.map(item => ({ name: item._id.name || "Product", units: item.units, revenue: item.revenue })),
      statusBreakdown: statusBreakdown.reduce((result, item) => ({ ...result, [item._id || "Unknown"]: item.count }), {})
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);
    res.status(500).json({ message: "Dashboard data could not be loaded" });
  }
});

module.exports = router;
