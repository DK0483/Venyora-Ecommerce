const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const authMiddleware = require("../middleware/authMiddleware");
const Order = require("../models/order");
const Cart = require("../models/cart");
const Product = require("../models/product");
 
const router = express.Router();
 
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});
 
/* ======================================================
   STEP 1: Create Razorpay Order
   Called when user clicks Pay — creates a Razorpay order
   and returns order_id to frontend
====================================================== */
router.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees from frontend
 
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }
 
    const options = {
      amount: Math.round(amount * 100), // Razorpay needs paise (₹1 = 100 paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };
 
    const razorpayOrder = await razorpay.orders.create(options);
    res.json({ orderId: razorpayOrder.id, amount: options.amount });
 
  } catch (err) {
    console.error("RAZORPAY CREATE ORDER ERROR:", err);
    res.status(500).json({ message: "Could not create payment order" });
  }
});
 
/* ======================================================
   STEP 2: Verify Payment + Place Order
   Called after Razorpay payment is completed
   Verifies signature, then places the actual order
====================================================== */
router.post("/verify", authMiddleware, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingInfo
    } = req.body;
 
    // ✅ Verify Razorpay signature (security check)
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");
 
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }
 
    // ✅ Payment verified — now place the order
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId });
 
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
 
    // Check stock
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product "${item.name}" not found` });
      }
      if (product.stock !== undefined && product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for "${item.name}". Available: ${product.stock}`
        });
      }
    }
 
    let totalAmount = 0;
    const orderItems = cart.items.map(item => {
      totalAmount += item.price * item.quantity;
      return {
        product:  item.product,
        name:     item.name,
        price:    item.price,
        quantity: item.quantity,
        size:     item.size
      };
    });
 
    const order = new Order({
      user:             userId,
      items:            orderItems,
      shippingInfo,
      paymentMethod:    "online",
      paymentId:        razorpay_payment_id,   // store payment ID
      razorpayOrderId:  razorpay_order_id,
      totalAmount,
      status:           "Confirmed"            // paid = confirmed immediately
    });
 
    await order.save();
 
    // Decrement stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }
 
    // Clear cart
    cart.items = [];
    await cart.save();
 
    res.status(201).json({ message: "Payment successful", orderId: order._id });
 
  } catch (err) {
    console.error("VERIFY PAYMENT ERROR:", err);
    res.status(500).json({ message: "Server error during payment verification" });
  }
});
 
module.exports = router;