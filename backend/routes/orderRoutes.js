const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Order = require("../models/order");
const Cart = require("../models/cart");

const router = express.Router();

/* ======================================================
   CREATE ORDER
====================================================== */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { shippingInfo, paymentMethod } = req.body;
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalAmount = 0;

    const orderItems = cart.items.map(item => {
      totalAmount += item.price * item.quantity;

      return {
        product: item.product,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size
      };
    });

    const order = new Order({
      user: userId,
      items: orderItems,
      shippingInfo,
      paymentMethod,
      totalAmount,
      status: "Pending"   // 👈 IMPORTANT
    });

    await order.save();

    // Clear cart
    cart.items = [];
    await cart.save();

    // RETURN FULL ORDER
    res.status(201).json(order);

  } catch (err) {
    console.error("ORDER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================================================
   CANCEL ORDER
====================================================== */
router.put("/cancel/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Ensure user owns the order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Allow cancel only before Shipped
    if (order.status === "Shipped" || order.status === "Delivered") {
      return res.status(400).json({ 
        message: "Order cannot be cancelled after shipping" 
      });
    }

    order.status = "Cancelled";
    await order.save();

    res.json({ message: "Order cancelled successfully" });

  } catch (err) {
    console.error("CANCEL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;