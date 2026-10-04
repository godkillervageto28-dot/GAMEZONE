const express = require("express");
const router = express.Router();
const Game = require("../models/Game");

// Helper to filter allowed fields
const filterGameData = (body) => {
    const allowedFields = [
        "title",
        "category",
        "genre",
        "rating",
        "description",
        "thumbnail",
        "platform",
        "gameUrl"
    ];
    const filtered = {};
    allowedFields.forEach((field) => {
        if (body[field] !== undefined) {
            filtered[field] = body[field];
        }
    });
    return filtered;
};

const defaultGames = [
    {
        title: "Coin Catcher",
        category: "Arcade",
        genre: "Arcade / Action",
        rating: 4.9,
        description: "Catch falling golden coins before they hit the ground! Test your agility and reflexes in this fast-paced arcade game.",
        thumbnail: "coin-catcher.jpg",
        platform: "Web / PC",
        gameUrl: "/games/coin-catcher/"
    },
    {
        title: "Grand Theft Auto V",
        category: "Action",
        genre: "Open World Action",
        rating: 4.8,
        description: "Explore the vast world of Los Santos and Blaine County in the ultimate open-world action experience.",
        thumbnail: "gta.jpg",
        platform: "PC / Console",
        gameUrl: ""
    },
    {
        title: "Minecraft",
        category: "Survival",
        genre: "Sandbox / Survival",
        rating: 4.9,
        description: "Build, craft, and explore endless procedurally generated blocky worlds.",
        thumbnail: "minecraft.jpg",
        platform: "PC / Mobile / Console",
        gameUrl: ""
    },
    {
        title: "Valorant",
        category: "FPS",
        genre: "Tactical Shooter",
        rating: 4.7,
        description: "A 5v5 character-based tactical shooter where precise gunplay meets agent abilities.",
        thumbnail: "valorant.jpg",
        platform: "PC",
        gameUrl: ""
    },
    {
        title: "PUBG: Battlegrounds",
        category: "Action",
        genre: "Battle Royale",
        rating: 4.5,
        description: "Parachute onto a remote island and fight to be the last survivor standing.",
        thumbnail: "pubg.jpg",
        platform: "PC / Console / Mobile",
        gameUrl: ""
    },
    {
        title: "Forza Horizon 5",
        category: "Racing",
        genre: "Open World Racing",
        rating: 4.8,
        description: "Drive hundreds of the world's greatest cars across vibrant open-world Mexico landscapes.",
        thumbnail: "forza.jpg",
        platform: "PC / Xbox",
        gameUrl: ""
    }
];

// ================================
// GET ALL GAMES
// GET /api/games
// ================================
router.get("/", async (req, res) => {
    try {
        let games = await Game.find().sort({ createdAt: -1 });

        // Auto-seed default catalog if database is empty or has fewer than 2 games
        if (games.length < 2) {
            for (const item of defaultGames) {
                const exists = await Game.findOne({ title: item.title });
                if (!exists) {
                    await Game.create(item);
                } else if (item.title === "Coin Catcher") {
                    await Game.updateOne({ title: item.title }, { $set: { gameUrl: "/games/coin-catcher/", thumbnail: "coin-catcher.jpg" } });
                }
            }
            games = await Game.find().sort({ createdAt: -1 });
        }

        res.json({
            success: true,
            count: games.length,
            games: games
        });
    } catch (error) {
        console.warn("Database query warning, serving fallback catalog:", error.message);
        res.json({
            success: true,
            count: defaultGames.length,
            games: defaultGames
        });
    }
});

// ================================
// GET ONE GAME
// GET /api/games/:id
// ================================
router.get("/:id", async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).json({
                success: false,
                message: "Game not found"
            });
        }
        res.json({
            success: true,
            game: game
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Invalid game ID"
        });
    }
});

// ================================
// POST NEW GAME
// POST /api/games
// ================================
router.post("/", async (req, res) => {
    try {
        const sanitizedData = filterGameData(req.body);
        const game = new Game(sanitizedData);
        const savedGame = await game.save();
        res.status(201).json({
            success: true,
            message: "Game added successfully",
            game: savedGame
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// ================================
// UPDATE GAME
// PUT /api/games/:id
// ================================
router.put("/:id", async (req, res) => {
    try {
        const sanitizedData = filterGameData(req.body);
        const game = await Game.findByIdAndUpdate(
            req.params.id,
            sanitizedData,
            {
                new: true,
                runValidators: true
            }
        );
        if (!game) {
            return res.status(404).json({
                success: false,
                message: "Game not found"
            });
        }
        res.json({
            success: true,
            message: "Game updated successfully",
            game: game
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// ================================
// DELETE GAME
// DELETE /api/games/:id
// ================================
router.delete("/:id", async (req, res) => {
    try {
        const game = await Game.findByIdAndDelete(req.params.id);
        if (!game) {
            return res.status(404).json({
                success: false,
                message: "Game not found"
            });
        }
        res.json({
            success: true,
            message: "Game deleted successfully",
            game: game
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Invalid game ID"
        });
    }
});

module.exports = router;
