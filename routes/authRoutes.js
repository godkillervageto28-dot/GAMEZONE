const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "gamezone_super_secret_jwt_key_2026";
const JWT_EXPIRES_IN = "7d";

// Helper to generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

// ================================
// REGISTER (SIGN UP)
// POST /api/auth/register
// ================================
router.post("/register", async (req, res) => {
    try {
        const { username, email, password, avatar } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide username, email, and password."
            });
        }

        // Check if user or email exists
        const existingUsername = await User.findOne({ username: username.trim() });
        if (existingUsername) {
            return res.status(400).json({
                success: false,
                message: "Username is already taken. Please choose another."
            });
        }

        const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: "Email is already registered. Please sign in instead."
            });
        }

        // Available avatar emojis
        const avatars = ["🎮", "👾", "⚡", "🚀", "🛡️", "⚔️", "🏆", "🔥"];
        const selectedAvatar = avatar && avatars.includes(avatar) ? avatar : avatars[Math.floor(Math.random() * avatars.length)];

        // Create new user
        const newUser = new User({
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password: password,
            avatar: selectedAvatar
        });

        await newUser.save();

        const token = generateToken(newUser);

        res.status(201).json({
            success: true,
            message: "Account created successfully! Welcome to GameZone!",
            token,
            user: newUser
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to create account."
        });
    }
});

// ================================
// LOGIN (SIGN IN)
// POST /api/auth/login
// ================================
router.post("/login", async (req, res) => {
    try {
        const { login, password } = req.body;

        if (!login || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide your username/email and password."
            });
        }

        // Find user by username OR email
        const user = await User.findOne({
            $or: [
                { email: login.toLowerCase().trim() },
                { username: login.trim() }
            ]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials. User not found."
            });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials. Incorrect password."
            });
        }

        const token = generateToken(user);

        res.json({
            success: true,
            message: `Welcome back, ${user.username}!`,
            token,
            user: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Sign in failed due to server error."
        });
    }
});

// ================================
// GET CURRENT USER PROFILE
// GET /api/auth/me
// ================================
router.get("/me", authMiddleware, async (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

// ================================
// LOGOUT
// POST /api/auth/logout
// ================================
router.post("/logout", (req, res) => {
    res.json({
        success: true,
        message: "Logged out successfully."
    });
});

module.exports = router;
