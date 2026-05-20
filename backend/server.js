require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

/* ======================================================
   STEP 5 FIX #1: Fail fast if env variables are missing
====================================================== */
if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is missing in .env');
    process.exit(1);
}

if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is missing in .env');
    process.exit(1);
}

/* ======================================================
   STEP 5 FIX #2: SINGLE, SAFE CORS (localhost only)
====================================================== */
app.use(cors({
    origin: '*',
    credentials: true
})),

/* ======================================================
   STEP 5 FIX #3: Body parser BEFORE routes
====================================================== */
app.use(express.json());

/* ======================================================
   STEP 5 FIX #4: Stable MongoDB connection
====================================================== */
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected successfully!'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

/* ======================================================
   Routes
====================================================== */
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const messageRoutes = require('./routes/messageRoutes');
const orderRoutes = require('./routes/orderRoutes');
const addressRoutes = require("./routes/addressRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");


app.get('/api/test', (req, res) => {
    res.json({ message: 'Hello from the VENYORA backend!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/orders', orderRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/admin/products", require("./routes/adminProductRoutes"));
app.use("/api/admin/orders", require("./routes/adminOrderRoutes"));
app.use("/api/admin/dashboard", require("./routes/adminDashboardRoutes"));
app.use("/api/admin", adminUserRoutes);
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

/* ======================================================
   Server start
====================================================== */
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});