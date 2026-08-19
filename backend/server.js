require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:4173", "http://127.0.0.1:4173"].filter(Boolean);

if (!process.env.JWT_SECRET || !process.env.MONGO_URI) throw new Error("JWT_SECRET and MONGO_URI are required");
app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin(origin, callback) { if (!origin || allowedOrigins.includes(origin)) return callback(null, true); return callback(new Error("Origin is not allowed by CORS")); }, methods: ["GET", "POST", "PUT", "DELETE"], allowedHeaders: ["Content-Type", "Authorization"], credentials: false }));
app.use(express.json({ limit: "50kb" }));

app.get("/api/test", (req, res) => res.json({ message: "VENYORA API is running" }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/address", require("./routes/addressRoutes"));
app.use("/api/admin/products", require("./routes/adminProductRoutes"));
app.use("/api/admin/orders", require("./routes/adminOrderRoutes"));
app.use("/api/admin/dashboard", require("./routes/adminDashboardRoutes"));
app.use("/api/admin", require("./routes/adminUserRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));

app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((error, req, res, next) => { console.error("API ERROR:", error.message); const status = error.status || (error.type === "entity.too.large" ? 413 : 500); res.status(status).json({ message: status === 500 ? "Something went wrong" : error.message }); });

mongoose.connect(process.env.MONGO_URI).then(() => app.listen(PORT, () => console.log(`Server running on ${PORT}`))).catch(error => { console.error("MongoDB connection failed:", error.message); process.exit(1); });
