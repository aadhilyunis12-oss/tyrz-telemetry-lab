const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        // ── Core identity ──────────────────────────────────────────
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 80
        },

        username: {
            type: String,
            trim: true,
            lowercase: true,
            sparse: true   // allows multiple null values (Google-only users)
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },

        // ── Local auth ────────────────────────────────────────────
        // select:false → never returned in queries unless explicitly requested
        passwordHash: {
            type: String,
            select: false
        },

        // ── Google OAuth ──────────────────────────────────────────
        googleId: {
            type: String,
            sparse: true
        },

        profileImage: { type: String },
        displayName:  { type: String }
    },
    { timestamps: true }   // adds createdAt + updatedAt automatically
);

module.exports = mongoose.model("User", userSchema);


