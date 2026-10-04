const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const gameRoutes = require("./routes/gameroute");
const authRoutes = require("./routes/authRoutes");

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;

// ================================
// MIDDLEWARE
// ================================
app.use(express.json());

// Static Files
app.use(express.static(path.join(__dirname, "public")));

// ================================
// API ROUTES
// ================================
app.get("/api", (req, res) => {
    res.json({
        success: true,
        message: "GameZone API is working!"
    });
});

app.use("/api/games", gameRoutes);
app.use("/api/auth", authRoutes);

// ================================
// FRONTEND ROUTING
// ================================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ================================
// MONGODB CONNECTION
// ================================
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/gamezone";

mongoose
    .connect(mongoUri)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });

// ================================
// START SERVER WITH EADDRINUSE FALLBACK
// ================================
const startServer = (port) => {
    const server = app.listen(port, () => {
        console.log("GameZone server started");
        console.log(`http://localhost:${port}`);
    });

    server.on("error", (error) => {
        if (error.code === "EADDRINUSE") {
            console.warn(`[Port Warning] Port ${port} is already in use. Automatically trying port ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error("Server startup error:", error.message);
        }
    });
};

startServer(DEFAULT_PORT);