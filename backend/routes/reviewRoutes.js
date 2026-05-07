const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Review  = require("../models/review");
const User = require("../models/user");
const router = express.Router();

/* ================= GET REVIEWS FOR A PRODUCT ================= */
router.get("/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .sort({ createdAt: -1 });

    const avgRating = reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({ reviews, avgRating: Number(avgRating), total: reviews.length });
  } catch (err) {
    console.error("GET REVIEWS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= ADD REVIEW ================= */
router.post("/:productId", authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params;

    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Check if already reviewed
    const existing = await Review.findOne({ product: productId, user: req.user.id });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    // Fetch real name from DB (works even if token is old and missing name)
    const dbUser = await User.findById(req.user.id).select("name");
    const userName = dbUser ? dbUser.name : (req.user.name || "User");

    const review = new Review({
      product:  productId,
      user:     req.user.id,
      userName,
      rating:   Number(rating),
      comment
    });

    await review.save();
    res.status(201).json(review);

  } catch (err) {
    console.error("REVIEW POST ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= DELETE OWN REVIEW ================= */
router.delete("/:reviewId", authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await review.deleteOne();
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;