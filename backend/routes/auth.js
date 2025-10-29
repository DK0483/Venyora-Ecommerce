const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authMiddleware = require('../middleware/authMiddleware'); // Import the new middleware

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
    try {
        // 1. Get user data from the request body
        const { name, email, password } = req.body;

        // 2. Check if all fields are provided
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        // 3. Check if the user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // 4. Create a new user instance
        user = new User({
            name,
            email,
            password,
        });

        // 5. Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // 6. Save the user to the database
        await user.save();

        // 7. Send a success response
        res.status(201).json({ message: 'User registered successfully!' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   POST /api/auth/login
// @desc    Authenticate a user and return a token
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        // 2. Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 3. Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 4. If credentials are correct, create a JSON Web Token (JWT)
        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            "my_jwt_secret_key_12345", // This should be in your .env file
            { expiresIn: 3600 }, // Token expires in 1 hour
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   GET /api/auth/user
// @desc    Get logged-in user data
// @access  Private
router.get('/user', authMiddleware, async (req, res) => {
    try {
        // The middleware has already verified the token and added the user ID to the request
        // We find the user by that ID but exclude the password from the data we send back
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;