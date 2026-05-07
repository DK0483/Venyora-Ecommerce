const mongoose = require("mongoose");
 
const orderSchema = new mongoose.Schema({
 
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
 
  items: [
    {
      product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name:     String,
      price:    Number,
      quantity: Number,
      size:     String
    }
  ],
 
  shippingInfo: {
    fullName: String,
    address:  String,
    city:     String,
    state:    String,
    zip:      String,
    phone:    String
  },
 
  paymentMethod:   String,
  paymentId:       String,   // ✅ Razorpay payment_id
  razorpayOrderId: String,   // ✅ Razorpay order_id
  totalAmount:     Number,
 
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
    default: "Pending"
  },
 
  createdAt: { type: Date, default: Date.now }
 
});
 
module.exports = mongoose.model("Order", orderSchema);