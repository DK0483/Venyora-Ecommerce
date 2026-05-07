const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// ADD PRODUCT
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.json(product);
});

// UPDATE PRODUCT
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const updated = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
});

// DELETE PRODUCT
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
});

// GET ALL PRODUCTS
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

module.exports = router;