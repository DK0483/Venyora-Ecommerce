const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Cart = require("../models/cart");
const Product = require("../models/product");

const router = express.Router();

/* ======================================================
   ADD TO CART (product + size unique)
   ====================================================== */
router.post("/", authMiddleware, async (req, res) => {
  const { productId, quantity = 1, size } = req.body;
  const userId = req.user.id;

  if (!productId || !size) {
    return res.status(400).json({ message: "Product and size are required" });
  }

  try {
    // 🔥 STEP 1: Fetch product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 🔥 STEP 2: Find or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // 🔥 STEP 3: Check product + size
    const itemIndex = cart.items.findIndex(
      item =>
        item.product.toString() === productId &&
        item.size === size
    );

    if (itemIndex > -1) {
      // 🔥 STEP 4: Increase quantity
      cart.items[itemIndex].quantity += quantity;
    } else {
      // 🔥 STEP 5: PUSH SNAPSHOT DATA (THIS WAS MISSING)
      cart.items.push({
        product: product._id,
        size,
        quantity,
        price: product.price,
        name: product.name,
        imageUrl: product.imageUrl
      });
    }

    // 🔥 STEP 6: Save cart
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).send("Server Error");
  }
});

/* ======================================================
   GET USER CART (POPULATED)
   ====================================================== */
router.get("/user-cart", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product");

    if (!cart) {
      return res.json({ items: [] });
    }

    res.json(cart);
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================================================
   UPDATE QUANTITY (product + size)
   ====================================================== */
router.put("/item", authMiddleware, async (req, res) => {
  const { productId, size, quantity } = req.body;

  if (!productId || !size) {
    return res.status(400).json({ message: "Product and size required" });
  }

  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      item =>
        item.product.toString() === productId &&
        item.size === size
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error("Update quantity error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================================================
   REMOVE ITEM (product + size)
   ====================================================== */
router.delete("/item", authMiddleware, async (req, res) => {
  const { productId, size } = req.body;

  if (!productId || !size) {
    return res.status(400).json({ message: "Product and size required" });
  }

  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      item =>
        !(
          item.product.toString() === productId &&
          item.size === size
        )
    );

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error("Remove item error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;