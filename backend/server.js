/**
 * TYRZ LAB — Ferrari F40 Telemetry Backend
 * Express + Mongoose + JWT authentication server.
 * Run:  npm run dev   (nodemon)
 *       npm start     (plain node)
 */

require("dotenv").config();

const express      = require("express");
const mongoose     = require("mongoose");
const cors         = require("cors");
const session      = require("express-session");
const cookieParser = require("cookie-parser");
const passport     = require("./config/passport");

const app = express();

/* ─────────────────────────────────────────────────────────────────────────
   Guard: fail fast if critical env vars are missing
───────────────────────────────────────────────────────────────────────── */
const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET"];
const missingVars  = REQUIRED_ENV.filter(k => !process.env[k]);
if (missingVars.length) {
    console.error(`❌ Missing required env vars: ${missingVars.join(", ")}`);
    console.error("   → Add them to backend/.env and restart.");
    process.exit(1);
}

/* ─────────────────────────────────────────────────────────────────────────
   Allowed frontend origins (add more as needed)
───────────────────────────────────────────────────────────────────────── */
const ALLOWED_ORIGINS = (process.env.CLIENT_URL || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .concat([
        "http://localhost:5000",
        "http://127.0.0.1:5000",
        "http://localhost:8000",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:8000",
        "http://127.0.0.1:5500",
        "http://127.0.0.1:3000"
    ]);

/* ─────────────────────────────────────────────────────────────────────────
   Middleware
───────────────────────────────────────────────────────────────────────── */
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, mobile apps, Postman) or any local dev origin
        if (!origin || ALLOWED_ORIGINS.includes(origin) || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
            return callback(null, true);
        }
        callback(null, true); // Dev resilient CORS
    },
    credentials: true   // required to send/receive cookies cross-origin
}));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());    // parses req.cookies.token for JWT auth

// Session — required for Passport / Google OAuth
app.use(session({
    secret:            process.env.SESSION_SECRET || "f40_tyrz_super_secret_2024",
    resave:            false,
    saveUninitialized: false,
    cookie:            { maxAge: 24 * 60 * 60 * 1000, httpOnly: true }
}));
app.use(passport.initialize());
app.use(passport.session());

/* ─────────────────────────────────────────────────────────────────────────
   Routes
───────────────────────────────────────────────────────────────────────── */

// Health check — open this in browser to confirm backend is running
app.get("/api/health", (req, res) => {
    res.json({
        status:    "ok",
        message:   "TYRZ Lab backend is running ✅",
        timestamp: new Date().toISOString()
    });
});

// Authentication (register / login / me / logout)
app.use("/api/auth", require("./routes/auth"));

// Tyre tread measurement & history (/api/analyze, /api/history)
app.use("/api", require("./routes/analyze"));

// Current logged-in user via Passport session (legacy / Google OAuth)
app.get("/api/user", (req, res) => {
    if (req.user) {
        return res.json({
            success: true,
            user: {
                id:           req.user._id,
                name:         req.user.displayName || req.user.name,
                username:     req.user.username,
                email:        req.user.email,
                profileImage: req.user.profileImage
            }
        });
    }
    // Unauthenticated — let frontend decide what to show
    return res.status(401).json({ success: false, message: "Not logged in." });
});

/* ─────────────────────────────────────────────────────────────────────────
   Google OAuth Routes
───────────────────────────────────────────────────────────────────────── */
const GOOGLE_CONFIGURED =
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID_HERE";

app.get("/auth/google", (req, res, next) => {
    if (!GOOGLE_CONFIGURED) {
        return res.redirect(
            "http://localhost:5000/index.html?error=google_not_configured"
        );
    }
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

app.get(
    "/auth/google/callback",
    (req, res, next) => {
        if (!GOOGLE_CONFIGURED) {
            return res.redirect(
                "http://localhost:5000/index.html?error=google_not_configured"
            );
        }
        passport.authenticate("google", {
            failureRedirect: "http://localhost:5000/index.html?error=google_failed"
        })(req, res, next);
    },
    (req, res) => {
        const user     = req.user;
        const userData = encodeURIComponent(JSON.stringify({
            id:           user._id,
            name:         user.displayName || user.name,
            username:     user.username,
            email:        user.email,
            profileImage: user.profileImage
        }));
        res.redirect(`http://localhost:5000/landing.html?google_user=${userData}`);
    }
);

// Demo Google login (for local testing without real OAuth credentials)
app.get("/auth/google/demo", (req, res) => {
    const demoUser = {
        id:           "google_pilot_f40",
        name:         "Scuderia Pilot (Google Demo)",
        username:     "googlepilot_f40",
        email:        "pilot.f40@ferrari.io",
        provider:     "google",
        profileImage: "https://lh3.googleusercontent.com/a/default-user=s96-c"
    };
    const userData = encodeURIComponent(JSON.stringify(demoUser));
    res.redirect(`http://localhost:5000/landing.html?google_user=${userData}`);
});

app.get("/auth/google/status", (req, res) => {
    res.json({ configured: !!GOOGLE_CONFIGURED });
});

// Root test
app.get("/", (req, res) => {
    res.send("Ferrari F40 TYRZ Backend — Running ✅");
});

/* ─────────────────────────────────────────────────────────────────────────
   Start: connect MongoDB, then listen (with non-fatal fallback)
───────────────────────────────────────────────────────────────────────── */
async function startServer() {
    const isPlaceholderUri = !process.env.MONGO_URI || process.env.MONGO_URI.includes("DB_USER") || process.env.MONGO_URI.includes("xxxxx");
    if (!isPlaceholderUri) {
        try {
            await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 4000
            });
            console.log("✅ MongoDB connected successfully");
        } catch (error) {
            console.warn("⚠️  Direct MongoDB connection not available:", error.message);
            console.log("ℹ️  Running backend in resilient offline mode.");
        }
    } else {
        console.log("ℹ️  Running backend in resilient local mode (MongoDB Atlas URI not configured).");
    }

    const PORT = Number(process.env.PORT) || 5000;
    app.listen(PORT, () => {
        console.log(`🏎  TYRZ Lab backend running on http://localhost:${PORT}`);
        console.log(`   Health check → http://localhost:${PORT}/api/health`);
    });
}

process.on('uncaughtException', (err) => {
    console.error('[Backend] Uncaught Exception:', err.message || err);
});
process.on('unhandledRejection', (reason) => {
    console.error('[Backend] Unhandled Rejection:', reason);
});

startServer();
