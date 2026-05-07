const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    // 🔥 REQUIRED FOR SIZE-BASED CART
    size: {
      type: String,
      required: true,
      trim: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },

    // ✅ Snapshot fields (best practice)
    price: {
      type: Number,
      required: true
    },

    name: {
      type: String,
      required: true
    },

    imageUrl: {
      type: String,
      required: true
    }
  },
  { _id: false } // prevents unnecessary sub-document IDs
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    items: {
      type: [cartItemSchema],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);