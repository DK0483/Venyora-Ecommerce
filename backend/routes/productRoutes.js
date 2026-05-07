const express = require("express");
const Product = require("../models/product");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

/* ================= GET ALL PRODUCTS ================= */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/* ================= GET SINGLE PRODUCT ================= */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/* ================= CREATE PRODUCT (ADMIN) ================= */
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, price, stock, imageUrl, description, category } = req.body;

    if (!name || !price || !imageUrl) {
      return res.status(400).json({ message: "Name, price, and imageUrl are required" });
    }

    const product = new Product({
      name,
      price,
      stock,
      imageUrl,
      description,
      category
    });

    await product.save();
    res.json(product);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating product" });
  }
});

/* ================= UPDATE PRODUCT (ADMIN) ================= */
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, price, stock, imageUrl, description, category } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });

    product.name        = name        ?? product.name;
    product.price       = price       ?? product.price;
    product.stock       = stock       ?? product.stock;
    product.imageUrl    = imageUrl    ?? product.imageUrl;
    product.description = description ?? product.description;
    product.category    = category    ?? product.category;
 

    await product.save();

    res.json(product);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating product" });
  }
});

/* ================= DELETE PRODUCT (ADMIN) ================= */
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product" });
  }
});

module.exports = router;