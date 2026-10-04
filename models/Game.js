const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    genre: {
        type: String,
        trim: true
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
    },
    description: {
        type: String,
        trim: true
    },
    thumbnail: {
        type: String,
        trim: true
    },
    platform: {
        type: String,
        default: "PC",
        trim: true
    },
    gameUrl: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;
