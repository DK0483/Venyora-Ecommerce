const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  fullName: { type: String, required: true },
  mobile: { type: String, required: true },

  houseNumber: { type: String, required: true },
  area: { type: String, required: true },
  landmark: String,

  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },

  addressType: {
    type: String,
    enum: ["Home", "Office"],
    required: true
  },

  isDefault: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }

}, { timestamps: true });

module.exports = mongoose.model("Address", addressSchema);