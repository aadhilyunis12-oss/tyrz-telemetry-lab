const express = require("express");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const User     = require("../models/User");

const router = express.Router();

/* ──────────────────────────────────────────────────────────────────────────
   Helper: set a secure HttpOnly JWT cookie
────────────────────────────────────────────────────────────────────────── */
function setLoginCookie(res, token) {
    res.cookie("token", token, {
        httpOnly: true,                                     // JS cannot read it
        secure: process.env.NODE_ENV === "production",      // HTTPS only in prod
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000                        // 1 day
    });
}

/* ──────────────────────────────────────────────────────────────────────────
   POST /api/auth/register
   Body: { name, username?, email, password }
   Saves hashed password in MongoDB; never stores plain text.
────────────────────────────────────────────────────────────────────────── */
router.post("/register", async (req, res) => {
    try {
        const { name, username, email, password } = req.body || {};

        const effectiveName = (name && name.trim()) || (username && username.trim()) || (email && email.split('@')[0]) || "Pilot";
        if (
            typeof email    !== "string" || !email.trim()    ||
            typeof password !== "string" || !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter your email and password."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters."
            });
        }

        // bcrypt has a 72-byte input limit
        if (Buffer.byteLength(password, "utf8") > 72) {
            return res.status(400).json({
                success: false,
                message: "Password must not exceed 72 bytes."
            });
        }

        // ── Duplicate check ───────────────────────────────────────────────
        const existingUser = await User.findOne({ email: normalizedEmail }).select("_id");
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with that email already exists. Please log in."
            });
        }

        // ── Hash & save ───────────────────────────────────────────────────
        const passwordHash = await bcrypt.hash(password, 12);

        await User.create({
            name:     effectiveName,
            username: username ? username.trim().toLowerCase() : undefined,
            email:    normalizedEmail,
            passwordHash
        });

        return res.status(201).json({
            success: true,
            message: "Account created successfully. Please log in."
        });

    } catch (error) {
        // Duplicate key from MongoDB (race condition)
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "An account with that email already exists. Please log in."
            });
        }
        console.error("Registration error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to create account. Please try again."
        });
    }
});

/* ──────────────────────────────────────────────────────────────────────────
   POST /api/auth/login
   Body: { email | username, password }
   Looks up the account, compares bcrypt hash, issues a JWT cookie.
────────────────────────────────────────────────────────────────────────── */
router.post("/login", async (req, res) => {
    try {
        const { email, username, password } = req.body || {};

        // Accept either email or username field from frontend
        const identifier = (email || username || "").trim();

        if (!identifier || typeof password !== "string" || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter your email/username and password."
            });
        }

        const normalizedIdentifier = identifier.toLowerCase();

        // ── Find account by email OR username ─────────────────────────────
        const user = await User.findOne({
            $or: [
                { email:    normalizedIdentifier },
                { username: normalizedIdentifier }
            ]
        }).select("+passwordHash");  // passwordHash is hidden by default — request it explicitly

        // ── Reject unknown accounts & wrong passwords in one path ─────────
        // (timing-safe: bcrypt.compare is always called even if user not found)
        const dummyHash = "$2a$12$invalidhashusedtopreventimingtattacks00000000000000000";
        const isMatch = user
            ? await bcrypt.compare(password, user.passwordHash || dummyHash)
            : await bcrypt.compare(password, dummyHash);

        if (!user || !isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // ── Issue JWT ─────────────────────────────────────────────────────
        const token = jwt.sign(
            { sub: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        setLoginCookie(res, token);

        return res.json({
            success: true,
            message: "Login successful.",
            user: {
                id:       user._id,
                name:     user.name,
                username: user.username,
                email:    user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to log in. Please try again."
        });
    }
});

/* ──────────────────────────────────────────────────────────────────────────
   GET /api/auth/me
   Reads the JWT cookie and returns the logged-in user.
   Call this when any page loads to check if the user is authenticated.
────────────────────────────────────────────────────────────────────────── */
router.get("/me", async (req, res) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({ success: false, message: "Please log in." });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user    = await User.findById(payload.sub).select("_id name username email");

        if (!user) {
            return res.status(401).json({ success: false, message: "Please log in." });
        }

        return res.json({
            success: true,
            user: {
                id:       user._id,
                name:     user.name,
                username: user.username,
                email:    user.email
            }
        });

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Your session has expired. Please log in again."
        });
    }
});

/* ──────────────────────────────────────────────────────────────────────────
   POST /api/auth/logout
   Clears the JWT cookie.
────────────────────────────────────────────────────────────────────────── */
router.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure:   process.env.NODE_ENV === "production",
        sameSite: "lax"
    });
    return res.json({ success: true, message: "Logged out successfully." });
});

module.exports = router;
