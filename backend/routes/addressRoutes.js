const express = require("express");
const router = express.Router();
const Address = require("../models/address");
const authMiddleware = require("../middleware/authMiddleware");

// Add address
router.post("/", authMiddleware, async (req, res) => {
  try {

    const { fullName, mobile, houseNumber, area, city, state, pincode, addressType, isDefault } = req.body;

    // If setting default → remove previous default
    if (isDefault) {
      await Address.updateMany(
        { user: req.user.id },
        { $set: { isDefault: false } }
      );
    }

    const newAddress = new Address({
      user: req.user.id,
      fullName,
      mobile,
      houseNumber,
      area,
      city,
      state,
      pincode,
      addressType,
      isDefault: isDefault || false
    });

    await newAddress.save();

    res.json({ message: "Address saved successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// Get user addresses
router.get("/", authMiddleware, async (req, res) => {
  const addresses = await Address.find({
    user: req.user.id,
    isActive: true
  }).sort({ isDefault: -1, createdAt: -1 });

  res.json(addresses);
});

// Soft delete
router.delete("/:id", authMiddleware, async (req, res) => {
  await Address.findByIdAndUpdate(req.params.id, {
    isActive: false
  });

  res.json({ message: "Address removed" });
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {

    if (req.body.isDefault) {
      await Address.updateMany(
        { user: req.user.id },
        { $set: { isDefault: false } }
      );
    }

    const updated = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.json(updated);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;