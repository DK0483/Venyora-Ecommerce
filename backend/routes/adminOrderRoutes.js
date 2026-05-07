const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// VIEW ALL ORDERS
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  const orders = await Order.find().populate("user");
  res.json(orders);
});

// UPDATE STATUS
router.put("/status/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const { status } = req.body;

  const updated = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  res.json(updated);
});

module.exports = router;