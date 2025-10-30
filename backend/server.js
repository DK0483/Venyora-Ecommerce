require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));


// Import all route files here
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Define a test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Hello from the VENYORA backend!' });
});

// Use the imported routes here
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/messages', messageRoutes);


// ----------------------------------------------------

// Start the server
// New code:
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
    console.log(`Access API live via RENDER_EXTERNAL_URL environment variable.`);
});