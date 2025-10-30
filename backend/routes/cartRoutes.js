const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Cart = require('../models/cart');
const Product = require('../models/product');
const mongoose = require('mongoose'); 

const router = express.Router();

// Helper function to convert string userId from JWT to ObjectId
const toObjectId = (id) => new mongoose.Types.ObjectId(id);

router.post('/', authMiddleware, async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    try {
        // FIX 2: Use explicit conversion when finding the cart
        let cart = await Cart.findOne({ user: toObjectId(userId) });
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (cart) {
            // Cart exists for user, check if product exists
            const itemIndex = cart.items.findIndex(p => p.productId.toString() === productId);

            if (itemIndex > -1) {
                // Product exists in the cart, update quantity
                let productItem = cart.items[itemIndex];
                productItem.quantity += quantity;
            } else {
                // Product does not exist in cart, add new item
                cart.items.push({ 
                    productId, 
                    name: product.name, 
                    price: product.price, 
                    quantity,
                    imageUrl: product.imageUrl
                });
            }
            cart = await cart.save();
            return res.status(200).json(cart);
        } else {
            // No cart for user, create new cart
            const newCart = await Cart.create({
                user: userId,
                items: [{ 
                    productId, 
                    name: product.name, 
                    price: product.price, 
                    quantity,
                    imageUrl: product.imageUrl
                }]
            });
            return res.status(201).json(newCart);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/user-cart', authMiddleware, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: toObjectId(req.user.id) });
        
        if (!cart) {
            return res.json({ items: [] }); 
        }
        
        res.json(cart);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.delete('/item/:productId', authMiddleware, async (req, res) => {
    try {
        // FIX 4: Explicit conversion for the DELETE route
        let cart = await Cart.findOne({ user: toObjectId(req.user.id) });
        
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Filter out the item to be removed
        cart.items = cart.items.filter(item => item.productId.toString() !== req.params.productId);
        
        cart = await cart.save();
        res.json({ message: 'Item removed from cart', cart });
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
module.exports = router;