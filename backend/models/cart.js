const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Links this to the User model
        required: true,
        unique: true // Each user can only have one cart
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product', // Links to the Product model
                required: true
            },
            name: String,
            price: Number,
            quantity: {
                type: Number,
                required: true,
                min: 1,
                default: 1
            },
            imageUrl: String
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema);