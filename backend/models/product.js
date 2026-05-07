const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    imageUrl: { type: String, required: true },
    category: { type: String },
    stock: { type: Number,},
});

// ✅ Safe export pattern
module.exports =
  mongoose.models.Product ||
  mongoose.model("Product", productSchema);