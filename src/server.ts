import express from "express";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes";
import userRoutes from "./routes/userRoutes";
import pool from "./config/database";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging for debugging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// API Routes
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/users", userRoutes);

console.log("✅ Routes registered:");
console.log("   - /api/v1/products");
console.log("   - /api/v1/users");

// API info endpoint
app.get("/api/v1", (req, res) => {
    res.json({
        message: "E-commerce API v1",
        version: "1.0.0",
        status: "active",
        timestamp: new Date().toISOString(),
        availableEndpoints: [
            "POST /api/v1/users/register - Register new user",
            "POST /api/v1/users/login - User login",
            "GET /api/v1/users/profile - Get user profile (Auth required)",
            "GET /api/v1/products - Browse all products",
            "GET /api/v1/products/:id - View product details"
        ],
        developer: "Blessed Samuel",
        contact: "samuelalisigwe22@gmail.com"
    });
});

// Health check endpoint
app.get("/api/v1/health", async (req, res) => {
    try {
        const conn = await pool.getConnection();
        conn.release();

        res.json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: "connected",
            version: "1.0.0"
        });
    } catch (error) {
        res.status(503).json({
            status: "unhealthy",
            timestamp: new Date().toISOString(),
            database: "disconnected",
            error: "Database connection failed"
        });
    }
});

// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({
        message: "Route not found",
        requestedUrl: req.originalUrl,
        suggestion: "Visit /api/v1 for available endpoints"
    });
});

// Test DB connection and start server
(async () => {
    try {
        const connectoin = await pool.getConnection();
        console.log("✅ Database connected successfully");
        connectoin.release();
    } catch (err) {
        console.error("❌ Database connection failed:", err);
    }
})();

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 API Info: http://localhost:${PORT}/api/v1`);
    console.log(`\nTry these endpoints:`);
    console.log(`POST http://localhost:${PORT}/api/v1/users/register`);
    console.log(`POST http://localhost:${PORT}/api/v1/users/login`);
});
