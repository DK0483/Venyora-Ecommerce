require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // CORS module is essential

const app = express();
const PORT = process.env.PORT || 5000;

// Define the origins allowed to access your API
const allowedOrigins = [
    'https://venyoraa.netlify.app', // Your live Netlify frontend URL (CRUCIAL)
    'http://localhost:5500',        // Local testing URL (often used by Live Server)
    'http://127.0.0.1:5500',        // Another common local testing URL
];

// Configure CORS Middleware to trust specific origins
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
        if (!origin) return callback(null, true);
        
        // Check if the request origin is in the allowed list
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            // Log the blocked origin for debugging purposes
            console.warn(`CORS Error: Origin ${origin} not allowed by policy.`);
            callback(new Error('Not allowed by CORS policy'), false);
        }
    }
}));

app.use(express.json()); // Body parser middleware

// Connect to MongoDB using the environment variable
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
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
    console.log(`Access API live via RENDER_EXTERNAL_URL environment variable.`);
});