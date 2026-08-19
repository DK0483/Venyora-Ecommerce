const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const audit = require("../utils/audit");

// ADD PRODUCT
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  await audit(req, "ADMIN_PRODUCT_CREATED", "Product", product._id);
  res.json(product);
});

// UPDATE PRODUCT
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const updated = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (!updated) return res.status(404).json({ message: "Product not found" });
  await audit(req, "ADMIN_PRODUCT_UPDATED", "Product", updated._id);
  res.json(updated);
});

// DELETE PRODUCT
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const deleted = await Product.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Product not found" });
  await audit(req, "ADMIN_PRODUCT_DELETED", "Product", deleted._id);
  res.json({ message: "Product deleted" });
});

// GET ALL PRODUCTS
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

module.exports = router;
